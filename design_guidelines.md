# Design Guidelines: Shipping Form Application

## Design Approach

**Selected Approach: Design System - Professional Business Application**

This is a utility-focused shipping tool where efficiency, clarity, and data accuracy are paramount. The design follows a clean, business-oriented approach similar to modern SaaS dashboards (Linear, Notion, Stripe) with emphasis on form usability and data presentation.

**Core Principles:**
- Clarity over creativity - every element serves a functional purpose
- Progressive disclosure - show complexity only when needed
- Visual hierarchy through spacing and typography, not color
- Trust signals through professional, consistent design

---

## Color Palette

### Light Mode (Primary)
- **Background Primary**: 0 0% 100% (pure white)
- **Background Secondary**: 0 0% 98% (subtle gray for cards)
- **Background Tertiary**: 0 0% 96% (input fields, hover states)
- **Primary Brand**: 217 91% 60% (professional blue - for primary actions)
- **Primary Brand Dark**: 217 91% 50% (hover state)
- **Text Primary**: 0 0% 10% (near black for headings)
- **Text Secondary**: 0 0% 40% (medium gray for labels)
- **Text Tertiary**: 0 0% 60% (light gray for helper text)
- **Border**: 0 0% 90% (subtle borders for inputs, cards)
- **Success**: 142 71% 45% (green for rates, confirmations)
- **Destructive**: 0 84% 60% (red for retail prices, errors)
- **Warning**: 38 92% 50% (amber for warnings)

### Dark Mode
- **Background Primary**: 0 0% 9%
- **Background Secondary**: 0 0% 12%
- **Background Tertiary**: 0 0% 15%
- **Primary Brand**: 217 91% 65%
- **Text Primary**: 0 0% 95%
- **Text Secondary**: 0 0% 70%
- **Text Tertiary**: 0 0% 50%
- **Border**: 0 0% 25%

---

## Typography

**Font Families:**
- Primary: Inter (via Google Fonts) - for UI, forms, labels
- Monospace: 'Roboto Mono' - for tracking numbers, prices, data

**Type Scale:**
- Heading Large (H1): 2rem (32px), font-weight 700, tracking tight
- Heading Medium (H2): 1.5rem (24px), font-weight 600
- Heading Small (H3): 1.25rem (20px), font-weight 600
- Body Large: 1rem (16px), font-weight 400
- Body Regular: 0.875rem (14px), font-weight 400
- Body Small: 0.75rem (12px), font-weight 400
- Label: 0.875rem (14px), font-weight 500, letter-spacing 0.01em

**Usage:**
- Form section headers: Heading Small
- Input labels: Label style
- Input values: Body Regular
- Helper text: Body Small, Text Tertiary
- Prices/Data: Monospace, Body Large

---

## Layout System

**Spacing Primitives:** Use Tailwind units of 2, 4, 6, 8, 12, 16, 24 (as in p-2, gap-4, mt-8)

**Container Structure:**
- Max width: 1200px (max-w-6xl)
- Form content: 800px max width (max-w-3xl) for optimal readability
- Padding: px-6 on mobile, px-12 on desktop
- Section spacing: py-8 to py-12

**Grid Patterns:**
- Address forms: 2-column grid on desktop (md:grid-cols-2), single column mobile
- Package dimensions: 3-column grid (L/W/H)
- Rates table: Full width with fixed column proportions

---

## Component Library

### Form Elements
**Input Fields:**
- Height: h-10 (40px)
- Border: 1px solid Border color
- Border radius: rounded-md (6px)
- Focus state: ring-2 ring-Primary Brand, border-Primary Brand
- Padding: px-3
- Background: Background Tertiary
- Error state: border-Destructive, text-Destructive

**Select Dropdowns:**
- Match input field styling
- Dropdown menu: Background Secondary with subtle shadow
- Selected option: Background Tertiary

**Checkboxes:**
- Size: 20px × 20px
- Border radius: rounded-sm (4px)
- Checked state: Background Primary Brand with white checkmark
- Label alignment: Flex row with gap-3

### Accordion Sections
- Section headers: py-4, px-6, border-b
- Trigger: Flex between with chevron indicator
- Content: p-6, smooth expand/collapse animation
- Active section: border-l-4 border-Primary Brand
- Validation error: border-l-4 border-Destructive

### Cards
- Background: Background Secondary
- Border: 1px solid Border
- Border radius: rounded-lg (8px)
- Padding: p-6
- Shadow: subtle on hover (hover:shadow-md)

### Buttons
**Primary (Process Label, Get Rates):**
- Background: Primary Brand
- Text: white, font-weight 500
- Height: h-10
- Padding: px-6
- Border radius: rounded-md
- Hover: Primary Brand Dark, slight shadow

**Secondary (Add Package, Edit):**
- Border: 1px solid Border
- Background: Background Primary
- Text: Text Primary
- Hover: Background Tertiary

**Icon Buttons:**
- Size: 36px × 36px, rounded-md
- Ghost variant on hover: Background Tertiary

### Rates Table
**Structure:**
- Full width, responsive with horizontal scroll on mobile
- Column widths: Service (50%), Retail (15%), Your Price (15%), Action (20%)
- Row height: py-3 for comfortable touch targets
- Hover state: Background Tertiary on entire row
- Carrier logos: 24px size, color-coded per carrier

**Visual Treatment:**
- Retail price: Text Destructive, line-through on hover
- Your price: Success color, font-weight 600
- Savings badge: Success background with white text
- Delivery estimate: Text Tertiary, Body Small

### Package Display
**Single Package Mode:**
- Standard form layout with clear labels
- Weight split: Two inputs side-by-side (lbs | oz)
- Dimension grid: 3 equal columns

**Multi-Package Mode:**
- Table view with alternating row backgrounds
- Package number badge: Primary Brand background, white text
- Edit icon: appears on row hover
- Delete action: Destructive color, requires confirmation

---

## Interaction Patterns

### Form Flow
1. **Shipment Details** (always expanded initially)
   - From/To addresses with saved address dropdown
   - Package details (expandable to multi-package)
   - Clear visual completion indicators

2. **Get Rates Button**
   - Disabled until all required fields complete
   - Loading state with spinner
   - Success transitions to Rates section

3. **Rates Selection** (revealed after successful rate fetch)
   - Auto-scroll to rates section
   - Highlight selected rate with Primary Brand background
   - Process Label triggers final submission

### Validation
- Inline validation on blur
- Error messages: Body Small, Destructive color, appear below input
- Section-level error indicators in accordion headers
- Form-wide validation before submission

### Loading States
- Skeleton loaders for rate fetching (4 placeholder rows)
- Button loading: spinner icon + "Loading..." text
- Disable form during submission

---

## Visual Enhancements

### Carrier Branding
- USPS: Blue-600 logo
- UPS: Amber-700 logo  
- FedEx: Indigo-600 logo
- DHL: Yellow-500 logo
- Icons via react-icons library

### Status Indicators
- Success: Green checkmark icon
- Error: Red X icon
- Warning: Amber triangle icon
- Info: Blue info circle icon

### Empty States
- Centered message with icon
- Text Secondary color
- Clear call-to-action

### Microinteractions
- Input focus: smooth border color transition
- Accordion expand: 200ms ease animation
- Button hover: subtle scale (scale-[1.02])
- Table row hover: background transition

---

## Accessibility

- All form inputs have associated labels (visible or aria-label)
- Error messages linked with aria-describedby
- Keyboard navigation: tab order follows visual flow
- Focus indicators: visible ring on all interactive elements
- Color contrast: AAA for text, AA for interactive elements
- Screen reader announcements for loading states and validation errors