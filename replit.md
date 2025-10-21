# PandaPostage - Shipping Rate Calculator

## Overview
PandaPostage is a professional application for comparing shipping rates across major carriers (USPS, UPS, FedEx, DHL) and purchasing shipping labels. The project aims for a clean, business-oriented design, prioritizing efficiency, data accuracy, and a user experience similar to professional tools like Linear or Notion. Its core purpose is to streamline the shipping process for users.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend
- **Technology Stack**: React 18 (TypeScript), Vite, Wouter (routing), TanStack Query (server state), React Hook Form with Zod (form validation).
- **UI Framework**: Shadcn UI (built on Radix UI), Tailwind CSS with custom design tokens, CSS variables for theming (light/dark mode), and a "New York" style design system.
- **Design Philosophy**: Professional, business-application aesthetic, functional UI focused on efficiency, progressive disclosure, visual hierarchy through spacing/typography, and monospace fonts for data.
- **Form Architecture**:
    - Supports both a multi-step guided workflow (`ShipmentForm-FourStep`) and a compact single-page workflow (`ShipmentForm-ThreeStep`) optimized for experienced users, with a default to the 4-step flow.
    - Features auto-opening invalid form tabs and `onChange` validation for immediate feedback.
    - Includes a collapsible, sticky `BannerLiveSummary` for progress tracking and a `CompactLiveSummary` sidebar for detailed summaries and validation error highlighting.
    - Implements a Custom Packages Preset System for quick-filling common package configurations.
    - Rates are automatically sorted by price (low to high).
    - Label download triggers the browser's native print dialog, supporting PDF, PNG, and ZPL formats.
- **State Management**: TanStack Query for server state, React Hook Form for form state, React hooks for local UI state.

### Backend
- **Server Framework**: Express.js with TypeScript, ESM, custom error handling, and request/response logging.
- **API Design**: RESTful API (`/api` prefix) with a storage abstraction layer.
- **Data Storage (Planned)**: PostgreSQL with Drizzle ORM, supporting multi-tenancy.
- **Authentication/Authorization (Planned)**: Role-based access control (Superadmin, Admin, User) with account-based multi-tenancy and session-based authentication.

## External Dependencies

### Shipping Carrier Integrations
- **External Shipping API**: Integrated with a unified shipping API for multi-carrier rate quotes and label purchasing (USPS, UPS, FedEx, DHL).
  - Configurable via `API_BASE_URL` environment variable or directly from the frontend in debug mode.
  - Supports rate quotes, label purchasing, and tracking.

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

## Example Components

**Location**: `client/src/pages/examples/`

### LabelSummary Example
**Route**: `/examples/label-summary`

Demonstrates the LabelSummary component with real EasyPost API response data, showing:
- Purchased label display with carrier, service, and pricing details
- Tracking number from actual API response (USPS format)
- Label preview using real S3-hosted label URL
- Delivery time estimation (4 business days)
- Both "with preview" and "without preview" variations
- Raw API response data for reference (rate selection and purchase responses)