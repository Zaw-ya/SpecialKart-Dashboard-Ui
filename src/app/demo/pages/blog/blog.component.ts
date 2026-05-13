import { Component, OnInit, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { FormsModule } from '@angular/forms';
import { BlogService, BlogPost } from 'src/app/theme/shared/service/blog.service';
import { ToastService } from 'src/app/theme/shared/service/toast.service';

@Component({
  selector: 'app-blog',
  standalone: true,
  imports: [CommonModule, SharedModule, FormsModule],
  templateUrl: './blog.component.html',
  styleUrl: './blog.component.scss'
})
export class BlogComponent implements OnInit {
  posts: BlogPost[] = [];
  loading = true;
  error = '';

  showForm = false;
  submitting = false;
  editingPost: BlogPost | null = null;

  postData = {
    title: '',
    content: '',
    author: '',
    isPublished: true,
    slug: '',
    metaTitle: '',
    metaDescription: '',
    altText: '',
    category: '',
    tags: ''
  };

  selectedFile: File | null = null;
  imagePreview: string | null = null;

  // Rich editor state
  activeFormats: Set<string> = new Set();

  @ViewChild('richEditor') richEditor!: ElementRef<HTMLDivElement>;

  constructor(
    private blogService: BlogService,
    private toastService: ToastService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(silent = false): void {
    if (!silent) this.loading = true;
    this.blogService.getAll().subscribe({
      next: (res) => {
        this.posts = res;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading blog posts:', err);
        this.error = 'Failed to load blog posts';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  addPost(): void {
    this.editingPost = null;
    this.postData = {
      title: '',
      content: '',
      author: '',
      isPublished: true,
      slug: '',
      metaTitle: '',
      metaDescription: '',
      altText: '',
      category: '',
      tags: ''
    };
    this.selectedFile = null;
    this.imagePreview = null;
    this.showForm = true;
    setTimeout(() => this.syncEditorContent(), 100);
  }

  editPost(post: BlogPost): void {
    this.editingPost = post;
    this.postData = {
      title: post.title,
      content: post.content,
      author: post.author,
      isPublished: post.isPublished,
      slug: post.slug || '',
      metaTitle: post.metaTitle || '',
      metaDescription: post.metaDescription || '',
      altText: post.altText || '',
      category: post.category || '',
      tags: post.tags || ''
    };
    this.selectedFile = null;
    this.imagePreview = post.imageUrl || null;
    this.showForm = true;
    setTimeout(() => this.syncEditorContent(), 100);
  }

  syncEditorContent(): void {
    if (this.richEditor?.nativeElement) {
      this.richEditor.nativeElement.innerHTML = this.postData.content;
    }
  }

  onEditorInput(event: Event): void {
    const el = event.target as HTMLDivElement;
    this.postData.content = el.innerHTML;
    this.updateActiveFormats();
  }

  onEditorKeyup(): void {
    this.updateActiveFormats();
  }

  onEditorMouseup(): void {
    this.updateActiveFormats();
  }

  updateActiveFormats(): void {
    this.activeFormats = new Set();
    const cmds = ['bold', 'italic', 'underline', 'strikeThrough', 'insertUnorderedList', 'insertOrderedList'];
    cmds.forEach(cmd => {
      if (document.queryCommandState(cmd)) {
        this.activeFormats.add(cmd);
      }
    });
  }

  execCommand(command: string, value?: string): void {
    document.execCommand(command, false, value);
    this.richEditor?.nativeElement?.focus();
    const el = this.richEditor?.nativeElement;
    if (el) {
      this.postData.content = el.innerHTML;
    }
    this.updateActiveFormats();
  }

  isActive(cmd: string): boolean {
    return this.activeFormats.has(cmd);
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
        this.cdr.detectChanges();
      };
      reader.readAsDataURL(file);
    }
  }

  cancelForm(): void {
    this.showForm = false;
    this.editingPost = null;
    this.selectedFile = null;
    this.imagePreview = null;
  }

  savePost(): void {
    this.submitting = true;

    // Sync content from editor
    if (this.richEditor?.nativeElement) {
      this.postData.content = this.richEditor.nativeElement.innerHTML;
    }

    const formData = new FormData();
    formData.append('Title', this.postData.title);
    formData.append('Content', this.postData.content);
    formData.append('Author', this.postData.author);
    formData.append('IsPublished', this.postData.isPublished.toString());
    formData.append('Slug', this.postData.slug);
    formData.append('MetaTitle', this.postData.metaTitle);
    formData.append('MetaDescription', this.postData.metaDescription);
    formData.append('AltText', this.postData.altText);
    formData.append('Category', this.postData.category);
    formData.append('Tags', this.postData.tags);

    if (this.selectedFile) {
      formData.append('Image', this.selectedFile);
    }

    const request = this.editingPost
      ? this.blogService.update(this.editingPost.id, formData)
      : this.blogService.create(formData);

    request.subscribe({
      next: () => {
        this.submitting = false;
        this.cancelForm();
        this.toastService.success('Post saved successfully!');
        this.blogService.clearCache();
        this.loadData(true);
      },
      error: (err) => {
        this.submitting = false;
        const detail = err.error?.detail || err.error?.message || err.message || 'Unknown error';
        this.toastService.error(`Failed to save post: ${detail}`);
      }
    });
  }

  deletePost(id: number): void {
    if (confirm('Are you sure you want to delete this post?')) {
      this.blogService.delete(id).subscribe({
        next: () => {
          this.blogService.clearCache();
          this.posts = this.posts.filter((p) => p.id !== id);
          this.toastService.success('Post deleted successfully');
        },
        error: (err) => {
          console.error('Error deleting post:', err);
          this.toastService.error('Failed to delete post');
        }
      });
    }
  }

  togglePublish(post: BlogPost): void {
    const formData = new FormData();
    formData.append('Title', post.title);
    formData.append('Content', post.content);
    formData.append('Author', post.author);
    formData.append('IsPublished', (!post.isPublished).toString());
    formData.append('Slug', post.slug || '');
    formData.append('MetaTitle', post.metaTitle || '');
    formData.append('MetaDescription', post.metaDescription || '');
    formData.append('AltText', post.altText || '');
    formData.append('Category', post.category || '');
    formData.append('Tags', post.tags || '');

    this.blogService.update(post.id, formData).subscribe({
      next: () => {
        post.isPublished = !post.isPublished;
        this.blogService.clearCache();
        this.toastService.success(post.isPublished ? 'Post published!' : 'Post unpublished!');
      },
      error: (err) => {
        console.error('Error toggling publish state:', err);
        this.toastService.error('Failed to update post status');
      }
    });
  }

  stripHtml(html: string): string {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  }
}
