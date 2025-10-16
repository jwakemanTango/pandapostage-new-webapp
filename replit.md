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
    - Centralized toggle system for "4-Step View" / "3-Step View", "Compact Addresses", "Show Summary", and "Show Label Preview".
    - `ShipmentForm-FourStep`: Multi-step guided workflow with progressive disclosure.
    - `ShipmentForm-ThreeStep`: Single-page compact workflow optimized for experienced users, featuring a persistent summary sidebar and three distinct views (Form, Summary, Label).
    - Shared validation patterns and schemas, component composition, and constants for reusability.
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