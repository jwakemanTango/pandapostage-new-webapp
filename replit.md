# PandaPostage - Shipping Rate Calculator

## Overview
PandaPostage is a professional shipping rate comparison and label purchasing application. Its primary purpose is to allow users to calculate and compare shipping rates across major carriers (USPS, UPS, FedEx, DHL), and subsequently purchase shipping labels efficiently. The project aims for a clean, business-oriented design, prioritizing efficiency, data accuracy, and a user experience similar to professional tools like Linear or Notion.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend
- **Technology Stack**: React 18 (TypeScript), Vite, Wouter (routing), TanStack Query (server state), React Hook Form with Zod (form validation).
- **UI Framework**: Shadcn UI (built on Radix UI), Tailwind CSS with custom design tokens, CSS variables for theming (light/dark mode), and a "New York" style design system.
- **Design Philosophy**: Professional, business-application aesthetic, functional UI focused on efficiency, progressive disclosure, visual hierarchy through spacing/typography, and monospace fonts for data.
- **Form Architecture**:
    - DEBUG button in top-right corner toggles visibility of development controls (3-Step Flow, 4-Step Flow, Combine Address Forms, Show Sidebar Summary, Show Banner Summary, Show Label Preview).
    - Default view: 3-Step Flow (can be changed to 4-Step Flow via DEBUG panel).
    - `ShipmentForm-FourStep`: Multi-step guided workflow with progressive disclosure.
    - `ShipmentForm-ThreeStep`: Single-page compact workflow optimized for experienced users (default), featuring:
        - Three distinct views (Form, Summary, Label) with clear step labels ("Shipment Details", "Select Rate", "Print Label")
        - Mobile-optimized layout with vertical field stacking, hidden summary on mobile, and fixed bottom navigation
        - BannerLiveSummary component: full-width, sticky-top collapsible banner with centered step progress indicators (Truck, DollarSign, Printer icons), company name display (with city/state fallback), and package count. No corner radius for seamless full-width design.
        - CompactLiveSummary component: sidebar summary with step-specific icons, completion checkmarks, validation error highlighting, and automatic tab switching
        - Stacked field labels for weight and dimensions in CompactPackageForm for cleaner, more compact presentation
        - Consistent font sizing (text-sm labels, h-9 text-sm controls) for comfortable readability
        - Mobile-first responsive breakpoints with proper spacing (pb-20 for fixed button clearance)
    - **Custom Packages Preset System**: Quick-fill buttons for common package configurations (both flows):
        - Small Box: FedEx, parcel, 1lb, 8x6x4
        - Medium Box: FedEx, parcel, 5lb, 12x10x8
        - Large Box: FedEx, large_box, 10lb, 18x14x12
        - USPS-Letter: USPS, letter envelope, 0lb 1oz, 12x12x1
        - UPS Parcel: UPS, parcel, 1lb, 8x8x4
        - Visual separator (border) between Custom Packages and Package Details fields
    - Shared validation patterns and schemas, component composition, and constants for reusability.
    - All package dimension fields (length, width, height) are required with numeric validation.
- **State Management**: TanStack Query for server state, React Hook Form for form state, React hooks for local UI state.

### Backend
- **Server Framework**: Express.js with TypeScript, ESM, custom error handling, and request/response logging.
- **API Design**: RESTful API (`/api` prefix) with a storage abstraction layer (IStorage), currently using in-memory storage, planned migration to PostgreSQL.
- **Data Storage (Planned)**: PostgreSQL with Drizzle ORM. Schema-first approach with tables for accounts, users, addresses, shipments, packages, labels, and rates, supporting multi-tenancy. Uses Neon Database for serverless PostgreSQL.
- **Authentication/Authorization (Planned)**: Role-based access control (Superadmin, Admin, User) with account-based multi-tenancy and session-based authentication using a PostgreSQL session store.

## External Dependencies

### Shipping Carrier Integrations
- Planned integration with USPS, UPS, FedEx, DHL for rate comparison and label purchasing. (Currently uses mock data).

### Third-Party Libraries
- **@radix-ui**: Headless UI components.
- **react-icons**: Carrier logos.
- **date-fns**: Date manipulation.
- **nanoid**: Unique ID generation.
- **class-variance-authority**: Variant-based styling.
- **cmdk**: Command palette.
- **drizzle-kit**: Database migration and schema management.
- **esbuild**: Fast server bundling.
- **Google Fonts**: Inter, Roboto Mono.