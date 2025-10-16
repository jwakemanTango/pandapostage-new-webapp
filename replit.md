# PandaPostage - Shipping Rate Calculator

## Overview

PandaPostage is a professional shipping rate comparison and label purchasing application. It allows users to calculate shipping rates across multiple carriers (USPS, UPS, FedEx, DHL), compare prices, and purchase shipping labels. The application follows a clean, business-oriented design approach focused on efficiency and data accuracy.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Technology Stack:**
- React 18 with TypeScript for type-safe component development
- Vite as the build tool and development server
- Wouter for lightweight client-side routing
- TanStack Query (React Query) for server state management and data fetching
- React Hook Form with Zod for form validation and type-safe schemas

**UI Framework:**
- Shadcn UI components built on Radix UI primitives
- Tailwind CSS for utility-first styling with custom design tokens
- CSS variables for theme customization (light/dark mode support)
- Custom design system following "New York" style variant

**Design Philosophy:**
- Professional business application aesthetic (similar to Linear, Notion)
- Clarity over creativity - functional, efficiency-focused UI
- Progressive disclosure pattern - complexity shown only when needed
- Visual hierarchy through spacing and typography rather than color
- Monospace fonts (Roboto Mono) for data like tracking numbers and prices
- Inter font family for general UI and forms

**Form Architecture:**

**View Toggle System:**
- Main CreateShipment page (`/pages/CreateShipment.tsx`) features a toggle to switch between two form workflows
- Toggle located at top-right of page: "4-Step View" ↔ "3-Step View"
- Forms are completely independent with separate state (switching resets the other form)

**ShipmentForm-FourStep** (`/components/ShipmentForm-FourStep/`) - Multi-step guided workflow
  - Main component: `index.tsx` - orchestrates state and validation
  - Child components for step-by-step wizard interface:
    - `AddressForm.tsx` - Standard address input with saved address search/selection
    - `AddressFormCombined.tsx` - Combined address form with From/To toggle (see Compact Addresses feature)
    - `PackageForm.tsx` - Package dimensions and weight inputs
    - `AdditionalServices.tsx` - Optional shipping services
    - `RatesSelection.tsx` - Carrier rate comparison and selection
    - `LiveSummary.tsx` - Real-time summary sidebar showing shipment details
    - `LabelSummary.tsx` - Post-purchase label display with tracking and actions
  - Progressive disclosure pattern with collapsible sections
  - Navigation between steps with validation at each stage
  - **Compact Addresses Toggle**: Switch to display one combined address form instead of two separate forms
  
**ShipmentForm-ThreeStep** (`/components/ShipmentForm-ThreeStep/`) - Single-page compact workflow
  - Main component: `index.tsx` - orchestrates state management and view transitions
  - Extracted child components for better maintainability:
    - `CompactAddressForm.tsx` - Compact address fields for from/to addresses
    - `CompactAddressFormCombined.tsx` - Combined compact address form with From/To toggle
    - `CompactPackageForm.tsx` - Package details input with compact styling
    - `CompactAdditionalServices.tsx` - Service checkboxes with compact layout
    - `CompactLiveSummary.tsx` - Shows shipment summary in compact format
    - `LabelSummary.tsx` - Post-purchase label display with compact styling
  - Three-view workflow with state management:
    - **Form View**: Displays all form fields in 3-column grid (or 2-column with compact addresses) + "Get Rates" button
    - **Summary View**: Hides form, shows CompactLiveSummary + Rates side-by-side (2-column) + "Go Back" button
    - **Label View**: Shows only LabelSummary after purchase
  - View transitions:
    - "Get Rates" → Summary view (form data preserved)
    - "Purchase Label" → Label view
    - "Go Back" → Form view (data preserved)
    - "Create Another Shipment" → Form view (data reset)
  - Compact styling throughout: `text-xs` labels, `h-7` inputs/buttons, `h-3.5 w-3.5` icons
  - **Compact Addresses Toggle**: Switch to display one combined address form instead of two separate forms
  - Optimized for experienced users who want efficient data entry and rate comparison

**Compact Addresses Feature:**
- Both FourStep and ThreeStep forms include a "Compact Addresses" toggle
- When enabled, displays single `AddressFormCombined` component instead of two separate address forms
- Combined component includes internal From/To toggle to switch between addresses
- Reduces visual clutter and screen space for address entry
- Form validation and saved address functionality works identically in both modes
  
**Shared Components & Patterns:**
- Component composition pattern ensures code reusability and maintainability
- Both forms share validation patterns and schemas from `@shared/schema.ts`
- Both forms have dedicated LabelSummary components for consistent post-purchase display
- Shared constants (US_STATES, PACKAGE_TYPES, CARRIERS) centralized in `/client/src/lib/constants.ts`
- Field arrays support for handling multiple packages in a single shipment

**State Management Pattern:**
- Server state managed through TanStack Query with custom query client
- Form state handled by React Hook Form with Zod schema validation
- Local UI state (accordions, modals) managed via React hooks
- Shared schemas between client and server in `/shared` directory

### Backend Architecture

**Server Framework:**
- Express.js with TypeScript for type-safe server development
- ESM module system (type: "module" in package.json)
- Custom error handling middleware
- Request/response logging with duration tracking

**Development Setup:**
- Vite middleware integration for HMR in development
- Separate build process: Vite for client, esbuild for server
- Development mode uses tsx for TypeScript execution
- Production serves pre-built static assets

**API Design:**
- RESTful API structure with `/api` prefix for all endpoints
- Storage abstraction layer (IStorage interface) for data operations
- Currently uses in-memory storage (MemStorage) with plans for database migration
- Session management via connect-pg-simple (PostgreSQL session store)

**Routing Pattern:**
- Centralized route registration in `server/routes.ts`
- Modular storage operations through interface-based design
- Separation of concerns between routing and data access

### Data Storage Solutions

**Current Implementation:**
- In-memory storage (MemStorage class) for development/prototyping
- Storage interface (IStorage) provides abstraction for future database integration

**Planned Database Architecture (PostgreSQL with Drizzle ORM):**
- Drizzle ORM configured for PostgreSQL dialect
- Schema-first approach with TypeScript schemas in `/shared/schema.ts`
- Tables designed for multi-tenant architecture:
  - **accounts** - Tenant/organization records
  - **users** - User accounts with role-based access (superadmin/admin/user)
  - **addresses** - Saved shipping addresses with default flag
  - **shipments** - Core shipment records with carrier/service details
  - **packages** - Package dimensions and weights (one-to-many with shipments)
  - **labels** - Purchased shipping labels with tracking info
  - **rates** - Cached rate quotes for comparison

**Database Connection:**
- Neon Database serverless PostgreSQL (@neondatabase/serverless)
- Environment variable configuration (DATABASE_URL)
- Migration strategy using drizzle-kit with `/migrations` output directory

**Schema Validation:**
- Zod schemas generated from Drizzle tables using drizzle-zod
- Type-safe inserts and queries
- Shared validation between client and server
- Form schemas (shipmentAddressSchema, packageSchema, etc.) align with database models

### Authentication and Authorization

**Planned User System:**
- Role-based access control (RBAC) with three tiers:
  - **Superadmin** - System-wide access
  - **Admin** - Account-level administration
  - **User** - Standard shipping operations
- Account-based multi-tenancy (users belong to accounts)
- Session-based authentication using PostgreSQL session store
- Password-based authentication (hashed storage)

**Current State:**
- Storage interface includes user CRUD methods (getUser, getUserByUsername, createUser)
- No authentication middleware implemented yet
- Session infrastructure configured but not actively used

### External Dependencies

**Shipping Carrier Integrations:**
- Planned integration with multiple carriers (USPS, UPS, FedEx, DHL)
- Rate comparison API endpoints (not yet implemented)
- Label purchasing workflow (frontend ready, backend pending)
- Mock data currently used for development and testing

**Third-Party Libraries:**
- **@radix-ui** - Headless UI component primitives for accessibility
- **react-icons** - Carrier logo icons (FaFedex, SiUsps, SiUps, SiDhl)
- **date-fns** - Date manipulation and formatting
- **nanoid** - Unique ID generation
- **class-variance-authority** - Variant-based component styling
- **cmdk** - Command palette/search functionality

**Development Tools:**
- **@replit/vite-plugin-*** - Replit-specific development enhancements
- **drizzle-kit** - Database migration and schema management
- **esbuild** - Fast server bundling for production

**Design System Dependencies:**
- Google Fonts (Inter, Roboto Mono) loaded via CDN
- Tailwind CSS with PostCSS for processing
- Custom CSS variables for theming in `/client/src/index.css`

**API Client Pattern:**
- Custom `apiRequest` utility for fetch with error handling
- Automatic JSON serialization and credential inclusion
- Centralized error handling with status code checking
- Query functions configured for 401 handling strategies