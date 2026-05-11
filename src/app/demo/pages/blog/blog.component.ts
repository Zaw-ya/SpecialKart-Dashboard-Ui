import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
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
    isPublished: true
  };
  selectedFile: File | null = null;
  imagePreview: string | null = null;

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
      isPublished: true
    };
    this.selectedFile = null;
    this.imagePreview = null;
    this.showForm = true;
  }

  editPost(post: BlogPost): void {
    this.editingPost = post;
    this.postData = {
      title: post.title,
      content: post.content,
      author: post.author,
      isPublished: post.isPublished
    };
    this.selectedFile = null;
    this.imagePreview = post.imageUrl;
    this.showForm = true;
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
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
    
    const formData = new FormData();
    formData.append('Title', this.postData.title);
    formData.append('Content', this.postData.content);
    formData.append('Author', this.postData.author);
    formData.append('IsPublished', this.postData.isPublished.toString());

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
}
