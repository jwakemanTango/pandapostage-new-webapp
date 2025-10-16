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
- **ShipmentForm** - Multi-step shipment creation workflow with progressive validation
  - Step-by-step wizard interface with collapsible sections
  - Live summary component that updates as users fill forms
  - Navigation between steps with validation at each stage
- **ShipmentForm-Full** - Single-page compact shipment creation view
  - All form sections displayed on one page for faster data entry
  - Compact layout with side-by-side address inputs
  - Grid-based responsive design for efficiency
  - Same functionality as multi-step form but optimized for experienced users
- Separated concerns: AddressForm, PackageForm, RatesSelection, AdditionalServices
- Reusable form components with consistent validation patterns
- Field arrays for handling multiple packages in a single shipment

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