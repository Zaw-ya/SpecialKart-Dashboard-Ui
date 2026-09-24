# SPECIFICATION: Customer Support and Marketing Team Roles & Interface
**Document Version:** 1.0.0  
**Target Systems:** Order Management System (OMS) / SpecialKart Dashboard & Krooty API  
**Target Audience:** Product Managers, Software Engineers, UI/UX Designers, QA Engineers  
**Classification:** Requirements & Technical Architecture Specification  

---

## 1. Executive Summary

This specification defines the functional requirements, role definitions, security boundaries, and data access policies for the **Customer Support** and **Marketing** interfaces within the Order Management System (OMS). 

The primary architectural objective is to establish strict **Role-Based Access Control (RBAC)** and **Data Privacy by Design**, ensuring that team members have exactly the tools and data required to execute their operational responsibilities while restricting sensitive financial and system configurations to **System Administrators**.

---

## 2. Role Definitions & Core Objectives

### 2.1. Customer Support Role (`Role: CustomerSupport`)
* **Objective:** Deliver timely, accurate assistance to customers regarding order status, order verification, event details, and fulfillment updates.
* **Scope of Access:** Read-only access to all customer orders, demo requests, and contact inquiries across all channels. Operational write access is restricted to order lifecycle statuses and customer support notes.
* **Security Boundary:** Zero access to sensitive payment credentials, platform financial margins, system API keys, or infrastructure configuration.

### 2.2. Marketing Specialist Role (`Role: Marketer`)
* **Objective:** Drive customer acquisition, optimize conversion funnels, maintain digital creative assets (invitation cards/templates), and analyze campaign attribution data.
* **Scope of Access:** Inherits all viewing capabilities of Customer Support, plus write access to the design catalog (invitation cards), promotional assets, and read access to marketing attribution metadata (Meta Pixel/CAPI event logs, UTM tags, conversion channels).
* **Security Boundary:** Zero access to sensitive financial data, merchant gateway tokens, Meta API access tokens, supervisor user management, or system-level administrative settings.

### 2.3. System Administrator (`Role: Admin` — Reference Benchmark)
* **Objective:** Governance, platform security, financial audit, and system configuration.
* **Scope of Access:** Full CRUD access across all tables, including unmasked PII, revenue/margin reports, payment gateway configurations, Meta Conversion API tokens, user account provisioning, and database audit logs.

---

## 3. Detailed Role Capabilities & Features

### 3.1. Customer Support Capabilities

#### A. Order Viewing & Management
1. **Global Order Directory:**
   * View all incoming orders across all statuses (`Pending`, `Processing`, `Completed`, `Cancelled`).
   * Filter orders by type (Invitation Design Orders vs. Package Orders), date range, and status.
   * Search orders by `OrderNumber`, customer name, or phone number.
2. **Order Detail Screen:**
   * View order items, selected design preview/card template, package tier, guest count, and event type (e.g., Wedding, Birthday, Corporate).
   * View non-sensitive fulfillment information (customer name, communication phone/WhatsApp number, customer email, event date).
3. **Operational Actions:**
   * Transition order statuses: `Pending` -> `Processing` -> `Completed` / `Cancelled`.
   * Add internal operational fulfillment notes (e.g., "Customer confirmed wedding date change via WhatsApp").
   * Resend customer confirmation/receipt notifications via system-configured channels.

#### B. Demo Requests & Contact Messages
1. View and triage demo booking requests (`/demo-requests`) and general contact inquiries (`/contacts`).
2. Add follow-up status tags (e.g., "Contacted", "Follow-up Required", "Resolved").

---

### 3.2. Marketer Capabilities

#### A. All Customer Support Viewing Privileges
* Full visibility into order lists, demo requests, and contact submissions to monitor incoming lead volume and customer demand patterns in real time.

#### B. Design & Asset Management ("Add Designs")
1. **Invitation Card Catalog (`/invitation-cards`):**
   * **Create New Designs:** Upload new card design templates with title, preview image, category/event types, gender targeting, and public pricing.
   * **Edit Existing Designs:** Update card titles, replace creative assets, and reassign categories.
   * **Catalog Visibility Controls:** Toggle individual card visibility (`isVisible`), feature cards on the public homepage carousel (`inCarousel`), and assign quality ratings.
   * **Bulk Visibility Management:** Execute bulk visibility operations based on minimum rating thresholds (`triggerBulkVisibility`).
2. **Marketing Content Management:**
   * Manage promotional landing content, testimonials (`/testimonials`), and promotional blog posts (`/blog`).
   * Review package offerings (`/packages`) to ensure marketing alignment.

#### C. Marketing Metadata & Attribution Analytics
1. **Meta Conversion Tracking (`/meta-tracking`):**
   * View Meta Lead Events log: event timestamp, event name (`Lead`), source form (`ContactForm`, `OrderForm`, `DemoRequestForm`), unique `eventId`, and Facebook Trace ID (`fbTraceId`).
   * Monitor CAPI delivery status (`Sent` vs. `Failed`) and inspect API delivery error codes to diagnose dropped conversion tracking.
2. **Campaign & Traffic Metadata:**
   * View campaign attribution parameters associated with orders and leads: `utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `utm_content`.
   * View landing page referrer URLs and geographic distribution (Country/City aggregates).
3. **Marketing Performance Exports:**
   * Export anonymized attribution summaries and conversion reports (CSV/Excel) excluding sensitive customer PII.

---

## 4. Permissions Matrix & Data Boundaries

### 4.1. Entity Access Matrix

| Entity / Feature | Field / Action | Customer Support | Marketer | System Admin |
|---|---|:---:|:---:|:---:|
| **Orders** | View Order Summary (ID, Date, Status, Items) | `READ` | `READ` | `FULL` |
| | View Customer Basic Info (Name, Phone, Email) | `READ` | `READ` | `FULL` |
| | Update Order Status (`Pending`/`Processing`/etc.) | `UPDATE` | `NO` | `FULL` |
| | Add Support Notes | `CREATE/UPDATE` | `READ` | `FULL` |
| | Delete Order Record | `NO` | `NO` | `DELETE` |
| | View Total Order Price | `READ` | `READ` | `FULL` |
| | View Profit Margin / Unit Cost / Merchant Fee | `RESTRICTED` | `RESTRICTED` | `FULL` |
| **Payment Details** | Payment Gateway Transaction Token | `RESTRICTED` | `RESTRICTED` | `READ` |
| | Card Brand / Last 4 Digits | `READ` | `READ` | `FULL` |
| | Gateway API Keys / Webhook Secrets | `RESTRICTED` | `RESTRICTED` | `FULL` |
| **Designs (Cards)** | View Designs List | `READ` | `READ` | `FULL` |
| | Add New Design (`POST /InvitationCards`) | `NO` | `CREATE` | `FULL` |
| | Update Design / Image / Pricing | `NO` | `UPDATE` | `FULL` |
| | Toggle Carousel / Bulk Visibility | `NO` | `UPDATE` | `FULL` |
| | Delete Design | `NO` | `NO` (or Soft) | `FULL` |
| **Marketing Metadata** | Meta Lead Events Log (`/meta-tracking`) | `NO` | `READ` | `FULL` |
| | Inspect `eventId` / `fbTraceId` / Meta Status | `NO` | `READ` | `FULL` |
| | Inspect UTM Parameters (`source`, `campaign`, etc.) | `READ` | `READ` | `FULL` |
| | Re-trigger Meta CAPI Sync | `NO` | `EXECUTE` | `FULL` |
| | Meta Pixel Secret / CAPI System Token | `RESTRICTED` | `RESTRICTED` | `FULL` |
| **Leads & Contacts** | View Contact Submissions & Demo Requests | `READ` | `READ` | `FULL` |
| | Export Leads with Attribution Data | `NO` | `EXPORT` | `FULL` |
| **System Settings** | Supervisor / Staff Account Provisioning | `RESTRICTED` | `RESTRICTED` | `FULL` |
| | WhatsApp Sender / Twilio API Credentials | `RESTRICTED` | `RESTRICTED` | `FULL` |
| | Site General Settings (`/site-settings`) | `RESTRICTED` | `RESTRICTED` | `FULL` |

*Legend:*
* `FULL`: Create, Read, Update, Delete, Export.
* `READ`: View access only.
* `RESTRICTED`: Denied at API controller level (field stripped or 403 Forbidden).
* `NO`: UI hidden and API endpoint access blocked.

---

### 4.2. Sensitive Data Classification & Privacy Guardrails

To protect customer privacy and maintain regulatory compliance (GDPR, CCPA, PCI-DSS):

1. **Category A: Unrestricted Operational Data**
   * *Fields:* Order ID, Order Number, Creation Date, Event Date, Event Type, Card Template ID, Package ID, Order Status.
   * *Access:* Admin, Marketer, Customer Support.
2. **Category B: Standard Customer PII (Need-to-Know Basis)**
   * *Fields:* Full Name, Delivery Address, Phone/WhatsApp Number, Email Address.
   * *Access:* Customer Support (for delivery coordination and customer contact) and Admin. Marketers receive this data on individual order review for customer context, but bulk data exports must mask or hash PII.
3. **Category C: Marketing Attribution Metadata**
   * *Fields:* UTM parameters, `eventId`, `fbTraceId`, Event Source URL, Lead Form Source, CAPI Delivery Logs.
   * *Access:* Marketers and Admin. Blocked for standard Customer Support views to avoid visual clutter and reduce accidental data exposure.
4. **Category D: Strictly Sensitive Financial & Infrastructure Data (Admin Only)**
   * *Fields:* Profit margins, cost of goods, payment processor secret keys, Meta access tokens, database connection strings, supervisor password hashes.
   * *Access:* System Admin **ONLY**. Under no circumstances should backend endpoints return these fields to Customer Support or Marketer roles.

---

## 5. Tasks and Responsibilities Summary

### 5.1. Customer Support Workflow
* **Daily Triage:** Review incoming new orders on the `/orders` dashboard.
* **Customer Verification:** Verify customer event details and ensure assets provided by the customer match the selected package or card template.
* **Status Updates:** Update order lifecycle states as production progresses (e.g., from `Pending` to `Processing`, then to `Completed`).
* **Inquiry Handling:** Search by order number to immediately answer phone/WhatsApp inquiries regarding order status.
* **Lead Hand-off:** Check `/demo-requests` and `/contacts` daily, contacting prospective clients and recording notes.

### 5.2. Marketing Workflow
* **Catalog Refresh:** Upload and publish new invitation card designs (`/invitation-cards`) ahead of seasonal campaigns (e.g., wedding season, Eid, graduation).
* **Merchandising:** Curate the top-rated designs for the public landing page carousel and set promotional prices.
* **Attribution Audit:** Review `/meta-tracking` to ensure every conversion from `My-Invite-UI` generated a matched Meta Lead event via CAPI with proper `eventId` deduplication.
* **Drop-off Investigation:** Monitor failed conversion events (`sent = false`) and report attribution errors to development teams.
* **Content Promotion:** Author marketing blog entries (`/blog`) and feature client testimonials (`/testimonials`) to improve organic conversion.

---

## 6. Technical Implementation Blueprint

### 6.1. Backend Architecture (ASP.NET Core / Web API)

1. **Role Claims & Authorization Attributes:**
   * Utilize standard ASP.NET Identity role claims (`Role: CustomerSupport`, `Role: Marketer`, `Role: Admin`).
   * Enforce controller/action security:
     ```csharp
     // Shared Order Viewing
     [HttpGet]
     [Authorize(Roles = "Admin,Marketer,CustomerSupport")]
     public async Task<ActionResult<IEnumerable<OrderSummaryDto>>> GetOrders() { ... }

     // Order Status Updates (CS and Admin only)
     [HttpPatch("{id}/status")]
     [Authorize(Roles = "Admin,CustomerSupport")]
     public async Task<IActionResult> UpdateStatus(int id, [FromBody] UpdateStatusDto dto) { ... }

     // Design Creation (Marketer and Admin only)
     [HttpPost]
     [Authorize(Roles = "Admin,Marketer")]
     public async Task<ActionResult<InvitationCardDto>> CreateCard([FromForm] CreateCardDto dto) { ... }

     // Meta Lead Tracking Logs (Marketer and Admin only)
     [HttpGet("meta/lead-events")]
     [Authorize(Roles = "Admin,Marketer")]
     public async Task<ActionResult<MetaLeadEventsPage>> GetMetaEvents([FromQuery] MetaLeadEventsQuery q) { ... }
     ```

2. **Data Transfer Object (DTO) Segregation:**
   * Return specialized DTOs per role level. Never return internal database entity models directly.
   * `OrderAdminDto`: Includes financial margins, internal payment gateway response tokens, and audit logs.
   * `OrderSummaryDto`: Includes operational fulfillment data, customer contact info, and order status (no gateway secrets or financial margins).

3. **Audit Logging:**
   * Implement audit middleware recording: `UserId`, `UserRole`, `Action`, `Timestamp`, and `TargetEntityId` for all customer data exports and status modifications.

---

### 6.2. Frontend Architecture (Angular Dashboard)

1. **Route Guards (`RoleGuard`):**
   * Extend the Angular router with a declarative `RoleGuard`:
     ```typescript
     {
       path: 'invitation-cards',
       canActivate: [AuthGuard, RoleGuard],
       data: { expectedRoles: ['Admin', 'Marketer'] },
       loadComponent: () => import('./demo/pages/invitation-cards/invitation-cards.component')
     },
     {
       path: 'meta-tracking',
       canActivate: [AuthGuard, RoleGuard],
       data: { expectedRoles: ['Admin', 'Marketer'] },
       loadComponent: () => import('./demo/pages/meta-tracking/meta-tracking.component')
     },
     {
       path: 'site-settings',
       canActivate: [AuthGuard, RoleGuard],
       data: { expectedRoles: ['Admin'] },
       loadComponent: () => import('./demo/pages/site-settings/site-settings.component')
     }
     ```

2. **Navigation Menu Filtering:**
   * Dynamically filter sidebar navigation items based on the active user's decoded JWT role payload.
   * Customer Support view displays: *Orders, Demo Requests, Contacts*.
   * Marketer view displays: *Orders, Demo Requests, Contacts, Invitation Cards, Packages, Meta Tracking, Testimonials, Blog*.
   * Admin view displays: *All navigation items, including Supervisors, Site Settings, and Financial Reports*.

3. **UI Element Visibility Directive (`*hasRole`):**
   * Use structural directives to selectively render UI controls:
     * Hide "Add New Design" button from Customer Support on catalog screens.
     * Hide "Update Order Status" dropdowns from Marketers to prevent accidental status modifications.

---

## 7. Acceptance Criteria (QA / Validation Checklist)

| Test ID | Condition | Expected Result |
|---|---|---|
| **AC-01** | User logged in as `CustomerSupport` navigates to `/orders` | Can view all orders, search, and update order status. |
| **AC-02** | User logged in as `CustomerSupport` navigates to `/meta-tracking` or `/site-settings` | Router redirects to `/dashboard/default` with an "Access Denied" toast alert. |
| **AC-03** | User logged in as `CustomerSupport` calls `POST /api/InvitationCards` via API client | Server returns `403 Forbidden`. |
| **AC-04** | User logged in as `Marketer` navigates to `/invitation-cards` | Can view list, upload new card design with image, and toggle carousel flags. |
| **AC-05** | User logged in as `Marketer` navigates to `/meta-tracking` | Can view Meta CAPI delivery statuses, `eventId`, and error logs. |
| **AC-06** | User logged in as `Marketer` navigates to `/orders` | Can view all orders and customer info; cannot modify order status. |
| **AC-07** | Either `CustomerSupport` or `Marketer` inspects network responses on order endpoints | Response JSON contains no payment gateway tokens, secret keys, or internal margin data. |
| **AC-08** | User logged in as `Admin` | Full unhindered access to all configuration, user management, and order operations. |
