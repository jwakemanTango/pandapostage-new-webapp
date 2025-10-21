# PandaPostage - Shipping Rate Calculator

## Overview
PandaPostage is a professional shipping rate comparison and label purchasing application. Its primary purpose is to allow users to calculate and compare shipping rates across major carriers (USPS, UPS, FedEx, DHL), and subsequently purchase shipping labels efficiently. The project aims for a clean, business-oriented design, prioritizing efficiency, data accuracy, and a user experience similar to professional tools like Linear or Notion.

## User Preferences
Preferred communication style: Simple, everyday language.

## Recent Changes

### External API Integration (October 21, 2025)
- **Shipping API Integration**: Connected the application to an external unified shipping API for real-time rate quotes and label purchases
  - Added `API_BASE_URL` environment variable configuration for specifying the external API endpoint
  - Created `server/api-client.ts` utility module for communicating with the external shipping API
  - Implemented backend proxy routes:
    - `POST /api/shipments/rates` - Get shipping rate quotes from external API
    - `POST /api/shipments/buy` - Purchase shipping labels from external API
  - Updated Rate schema to include API-specific fields: `provider`, `shipmentId`, `rateId`, `currency`, `estimatedDelivery`, `carrierAccountId`, `billingType`, `listRate`, `accountRate`
  - Transformed data between frontend format and API format (addresses, packages, weights, additional services)
  - Replaced mock data with real API calls using TanStack Query mutations
  - Added error handling and user feedback for API failures
  - API supports all form fields including company, phone, and all additional service options

### Earlier Changes (October 17, 2025)
### UI and Navigation Improvements
- **Ship To Icon Update**: Changed Ship To tab icon from `Package` to `MapPinned` in both 3-step and 4-step flows to avoid visual conflict with package details section. MapPinned better represents the destination concept.
- **Banner Summary Sticky Positioning**: Increased z-index from z-20 to z-50 to ensure banner properly pins to top of viewport when scrolling and stays above all content (except modals/dialogs).
- **Banner Default State**: Banner summary now defaults to collapsed state for cleaner initial view. Users can click to expand/view details.
- **Banner Spacing**: Added consistent 1rem spacing (mb-4) between banner summary and content below in all views and both workflows for better visual separation.
- **Dynamic Banner Steps**: Banner summary now displays workflow-specific steps. 3-step workflow shows "Shipment → Rate → Print", while 4-step workflow shows "Addresses → Packages → Rates → Label" with appropriate icons (Truck, MapPin, Package, DollarSign, Printer).
- **Default Workflow**: Changed default workflow to 4-Step Flow. Application now loads with the guided 4-step workflow by default. DEBUG toggle renamed to "Compact 3-step flow" for clarity.
- **Streamlined Page Layout**: Removed "Create Shipment" page title and subtitle for cleaner demo experience. DEBUG button remains visible in top-right corner for toggling development controls.
- **Package Section Auto-scroll**: In 3-step flow, when addresses are valid but package details have validation errors, the form automatically scrolls to the package section to guide user attention.
- **Start Over Button**: Added RotateCcw icon-based "Start Over" button to both workflows:
  - **3-Step Flow**: Button appears in all three views (Shipment Details, Select Rate, Print Label) in section headers. Uses ghost variant on first two steps, outline variant on final step. Text hidden on mobile except label view for space efficiency.
  - **4-Step Flow**: Button appears in all four steps (Addresses, Packages, Rates, Label) in section headers. Uses ghost variant on steps 1-3, outline variant on final step. Text hidden on mobile except label step.
  - **Functionality**: Completely resets form state (form.reset()), returns to initial view/step, clears purchased labels, resets completed steps indicator, clears validation errors, and reopens initial collapsibles.
- **BannerLiveSummary Mobile Visibility**: Fixed banner visibility on mobile devices. Removed `lg:block` class from wrapper divs in both workflows so banner is now visible and sticky on all screen sizes. Banner properly sticks to top of viewport with z-50 positioning on mobile and desktop.
- **Banner Content Spacing**: Added pt-4 (1rem) padding to all form containers in both workflows to create consistent visual gap between sticky BannerLiveSummary and form content below. Ensures banner doesn't overlap content when scrolling.
- **Auto-scroll on Navigation**: Implemented automatic scroll-to-top behavior when navigating between steps/views in both workflows. Page scrolls to top on forward/backward navigation for improved UX. Affects 3-step (form→summary→label) and 4-step (step 1→2→3→4) transitions.
- **Address Form Layout Enhancement**: Updated 4-step AddressFormCombined to display City/State/Zip fields side-by-side on desktop (grid-cols-3) and stacked vertically on mobile (grid-cols-1), matching the existing pattern in AddressForm component for consistent responsive layout.

### Form Validation Improvements
- **Auto-open Invalid Tab Fix**: Both 3-step and 4-step forms now properly auto-switch to the address tab containing validation errors. When Ship From is valid but Ship To has errors, the form automatically switches to the Ship To tab. Uses explicit formState property access (errors?.fromAddress, errors?.toAddress, errorCount) to ensure React Hook Form reactivity.
- **Clear Errors on Change**: Forms now use `mode: "onChange"` and `reValidateMode: "onChange"` so validation errors clear immediately when fields are corrected. After initial validation attempt, typing in any field re-validates instantly and clears the error when valid.
- **Clear Errors on Saved Address Selection**: Selecting a saved address from the dropdown now immediately clears all validation errors for that address section (Ship From or Ship To) in both 3-step and 4-step flows.
- **Clear Errors on Custom Package Selection**: Clicking any custom package preset button (Small Box, Medium Box, Large Box, USPS-Letter, UPS Parcel) now immediately clears all package validation errors in both workflows, similar to saved address behavior.
- **Phone Validation**: Requires at least 10 digits. Valid formats: "(555) 123-4567", "555-123-4567", "5551234567".
- **Package Validation Error Indicators**: All summary components (CompactLiveSummary, BannerLiveSummary, LiveSummary) now display validation error indicators for package details, matching the existing address error pattern:
  - Red border-left-2 indicator on package section when errors exist
  - Package icon and section title turn destructive red
  - Shows "Invalid or incomplete" message when package data is invalid or missing
  - Error detection checks for any package with validation errors in the packages array
  - Errors clear immediately when valid package data is entered

## System Architecture

### Frontend
- **Technology Stack**: React 18 (TypeScript), Vite, Wouter (routing), TanStack Query (server state), React Hook Form with Zod (form validation).
- **UI Framework**: Shadcn UI (built on Radix UI), Tailwind CSS with custom design tokens, CSS variables for theming (light/dark mode), and a "New York" style design system.
- **Design Philosophy**: Professional, business-application aesthetic, functional UI focused on efficiency, progressive disclosure, visual hierarchy through spacing/typography, and monospace fonts for data.
- **Form Architecture**:
    - DEBUG button in top-right corner toggles visibility of development controls (4-Step Flow, Compact 3-step flow, Combine Address Forms, Show Sidebar Summary, Show Banner Summary, Show Label Preview).
    - Default view: 4-Step Flow (can be changed to Compact 3-step flow via DEBUG panel).
    - Banner summary defaults to visible (showBannerSummary = true) on both mobile and desktop, can be toggled off via DEBUG panel.
    - `ShipmentForm-FourStep`: Multi-step guided workflow with progressive disclosure. Features auto-open invalid address tab that dynamically switches to show validation errors, and onChange validation mode that clears field errors immediately when corrected.
    - `ShipmentForm-ThreeStep`: Single-page compact workflow optimized for experienced users (default), featuring:
        - Three distinct views (Form, Summary, Label) with consistent layout: step titles positioned above content grid on all three steps for uniform visual hierarchy
        - Mobile-optimized layout with vertical field stacking, hidden summary on mobile, and fixed bottom navigation
        - BannerLiveSummary component: full-width, sticky-top collapsible banner visible by default on mobile and desktop, controllable via DEBUG toggle. Features centered step progress indicators that dynamically adapt to workflow (3-step: Shipment/Rate/Print with Truck/DollarSign/Printer icons; 4-step: Addresses/Packages/Rates/Label with MapPin/Package/DollarSign/Printer icons), company name display (with city/state fallback), and package count. No corner radius for seamless full-width design.
        - CompactLiveSummary component: sidebar summary with step-specific icons, completion checkmarks, validation error highlighting, sticky positioning (aligns with form initially, pins to top when scrolling)
        - CompactAddressFormCombined: Auto-opens invalid address tab (Ship From/Ship To) when validation errors detected. Dynamically switches tabs as user fixes errors with onChange validation providing immediate feedback.
        - Stacked field labels for weight and dimensions in CompactPackageForm for cleaner, more compact presentation
        - Consistent font sizing (text-sm labels, h-9 text-sm controls) for comfortable readability
        - Mobile-first responsive breakpoints with proper spacing (pb-20 for fixed button clearance)
    - **Custom Packages Preset System**: Quick-fill buttons for common package configurations (both flows):
        - Small Box: Any Carrier, parcel, 1lb, 8x6x4 (Box icon)
        - Medium Box: Any Carrier, parcel, 5lb, 12x10x8 (Box icon)
        - Large Box: Any Carrier, large_box, 10lb, 18x14x12 (Box icon)
        - USPS-Letter: USPS, letter envelope, 0lb 1oz, 12x12x1 (USPS icon)
        - UPS Parcel: UPS, parcel, 1lb, 8x8x4 (UPS icon)
        - Visual separator (border) between Custom Packages and Package Details fields
        - Additional visual separator between Carrier/Package Type fields and Weight/Dimension fields for improved visual hierarchy
        - Buttons use flex-wrap layout to stay within container boundaries
        - Carrier-specific icons from react-icons/si (SiUsps, SiUps, SiFedex)
    - Shared validation patterns and schemas, component composition, and constants for reusability.
    - All package dimension fields (length, width, height) are required with numeric validation.
    - **Rate Sorting**: Rates are automatically sorted by price (low to high) using numeric parsing to extract values from formatted strings like "$5.20".
    - **Label Download**: Download Label button opens the label in a new window and triggers the browser's native print dialog for easy printing. Supports PDF, PNG, and ZPL label formats.
    - **Placeholder Buttons**: "Email Label" and "View Receipt" buttons display "TODO: NOT IMPLEMENTED" alert as placeholders for future functionality.
- **State Management**: TanStack Query for server state, React Hook Form for form state, React hooks for local UI state.

### Backend
- **Server Framework**: Express.js with TypeScript, ESM, custom error handling, and request/response logging.
- **API Design**: RESTful API (`/api` prefix) with a storage abstraction layer (IStorage), currently using in-memory storage, planned migration to PostgreSQL.
- **Data Storage (Planned)**: PostgreSQL with Drizzle ORM. Schema-first approach with tables for accounts, users, addresses, shipments, packages, labels, and rates, supporting multi-tenancy. Uses Neon Database for serverless PostgreSQL.
- **Authentication/Authorization (Planned)**: Role-based access control (Superadmin, Admin, User) with account-based multi-tenancy and session-based authentication using a PostgreSQL session store.

## External Dependencies

### Shipping Carrier Integrations
- **External Shipping API**: Integrated with unified shipping API for multi-carrier rate quotes and label purchasing (USPS, UPS, FedEx, DHL)
  - Configuration via `API_BASE_URL` environment variable
  - Supports rate quotes, label purchasing, and tracking
  - Currently unauthenticated (authentication to be added later)

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