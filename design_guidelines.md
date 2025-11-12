# Design Guidelines: Scuttle Social - fhEVM Token & Presale dApp

## Design Approach
**Hybrid Approach**: Drawing from modern Web3 platforms (Uniswap, Aave) with Material Design principles for information-dense interfaces. Emphasis on trust, clarity, and technical sophistication appropriate for a privacy-preserving crypto application.

## Core Design Principles
1. **Clarity over Creativity**: Prioritize legibility and data comprehension
2. **Trust Signals**: Professional, secure aesthetic befitting financial operations
3. **Privacy-First Visual Language**: Subtle indicators of encryption/privacy features
4. **Efficiency**: Minimal clicks to complete token creation or presale participation

---

## Typography System

### Font Families
- **Primary**: Inter (UI, body text, data) - via Google Fonts
- **Display/Headers**: Space Grotesk (hero, section titles) - via Google Fonts
- **Monospace**: JetBrains Mono (addresses, token amounts, transaction hashes) - via Google Fonts

### Type Scale
- **Hero/Display**: text-4xl to text-6xl, font-bold
- **Page Titles**: text-3xl, font-semibold
- **Section Headers**: text-2xl, font-semibold
- **Card Titles**: text-xl, font-medium
- **Body Text**: text-base, font-normal
- **Labels/Metadata**: text-sm, font-medium
- **Captions/Helper**: text-xs, font-normal
- **Data/Numbers**: Use monospace, text-lg to text-2xl for prominence

---

## Layout System

### Spacing Primitives
**Core units**: Use Tailwind classes with 4, 6, 8, 12, 16, 24 for consistency
- Component padding: p-6, p-8
- Section spacing: py-12, py-16, py-24
- Card gaps: gap-6, gap-8
- Form field spacing: space-y-4, space-y-6

### Container Strategy
- **Full-width sections**: w-full with inner max-w-7xl mx-auto px-6
- **Content containers**: max-w-6xl for dashboard/app views
- **Forms**: max-w-2xl for optimal completion flow
- **Modals**: max-w-lg to max-w-2xl depending on complexity

### Grid Patterns
- **Dashboard cards**: grid-cols-1 md:grid-cols-2 lg:grid-cols-3, gap-6
- **Token list**: Single column, stacked with dividers
- **Presale stats**: grid-cols-2 md:grid-cols-4 for KPI metrics

---

## Component Library

### Navigation
**App Header**
- Full-width with max-w-7xl container
- Logo (left) + navigation links (center) + wallet connection (right)
- Height: h-16 to h-20
- Sticky positioning: sticky top-0 z-50
- Wallet button: Prominent with address truncation (0x1234...5678)
- Network indicator badge showing "Sepolia Testnet"

### Hero Section
**Not Applicable** - This is a utility dApp, not a marketing page. Launch directly into the application interface after connecting wallet.

### Dashboard Layout
**Main Application View**
- Sidebar navigation (left, w-64): Token Creation, Active Presales, My Tokens, My Contributions
- Main content area (flex-1): Dynamic based on selected section
- Stats overview bar (top): Total tokens created, active presales, total raised
- Use two-column layout on desktop (lg:grid-cols-2) for forms + preview

### Cards
**Token/Presale Cards**
- Rounded corners: rounded-xl
- Padding: p-6
- Border: border with subtle outline
- Shadow: shadow-md with hover:shadow-lg transition
- Header: Token name/symbol with privacy badge (encrypted icon)
- Body: Key metrics in grid layout
- Footer: Action buttons (View Details, Participate, etc.)

**Stat Cards** (for dashboard KPIs)
- Compact design: p-4 to p-6
- Icon + Label + Large number display
- Use monospace for numerical values
- Optional trend indicator (percentage change)

### Forms
**Token Creation Form**
- Clear step progression (Step 1/3 indicator at top)
- Grouped fields with section headers
- Input fields: h-12, rounded-lg, px-4
- Labels: text-sm, font-medium, mb-2
- Helper text: text-xs, mt-1
- Privacy toggle switches for encrypted fields
- Real-time preview panel showing token parameters
- Submit button: Large, full-width on mobile, w-auto on desktop

**Presale Participation**
- Contribution amount input (large, prominent)
- Max button for wallet balance
- Encrypted contribution checkbox
- Transaction preview box showing gas estimate
- Two-step confirmation (Approve + Participate)

### Buttons
**Primary Actions**: px-6, py-3, rounded-lg, font-medium, text-base
**Secondary Actions**: px-4, py-2, rounded-md, font-medium, text-sm
**Icon Buttons**: w-10, h-10, rounded-full
**Wallet Connect**: px-6, py-2.5, rounded-full (pill shape)

### Data Display
**Transaction/Address Display**
- Monospace font
- Truncation with copy-to-clipboard icon
- External link icon for Etherscan
- Format: 0x1234...5678 (show first 6 and last 4 characters)

**Token Parameters Table**
- Clean, striped rows for alternating background
- Label (left, font-medium) + Value (right, monospace for numbers)
- Privacy indicator icons for encrypted fields
- Dividers between rows: divide-y

**Presale Progress**
- Horizontal progress bar: h-3, rounded-full
- Current/Target amounts above bar
- Percentage indicator
- Time remaining countdown

### Modals/Overlays
**Transaction Confirmation Modal**
- Centered overlay with backdrop blur
- max-w-md, rounded-2xl
- Transaction details summary
- Loading state with spinner for pending transactions
- Success/error states with appropriate icons

**MetaMask Connection Flow**
- Modal prompt with "Connect Wallet" button
- Network switching instructions if wrong network
- Account selector if multiple available

### Status Indicators
**Badges**: px-3, py-1, rounded-full, text-xs, font-medium
- Active/Live presales
- Encrypted/Private data
- Network status
- Transaction status (Pending, Confirmed, Failed)

**Privacy Icons**
- Lock icon for encrypted fields
- Eye icon for decryption requests
- Shield icon for privacy features
- Use Heroicons for consistency

---

## Animations
**Minimal and Purposeful Only**
- Button hovers: Simple scale (hover:scale-105) or opacity change
- Card hovers: Subtle shadow elevation (transition-shadow duration-200)
- Modal entry/exit: Fade + scale (animate-in/animate-out)
- Loading states: Spinner or skeleton screens
- Transaction status: Checkmark animation on success
- NO scroll-triggered animations
- NO complex page transitions

---

## Accessibility
- All interactive elements: min-h-11 (44px touch target)
- Focus states: ring-2 with visible outline
- Form labels: Explicit for attributes matching input IDs
- Error states: Red indicators with descriptive text, not just color
- Loading states: aria-busy and loading text for screen readers
- Modals: Proper focus trap and ESC key handling

---

## Images
**Logo Placement**: Header (top-left), h-8 to h-10
**No Hero Image**: Utility app, direct to functionality
**Privacy Illustrations**: Optional small graphics for empty states (e.g., "No tokens created yet" with lock illustration)
**Icons**: Heroicons exclusively for UI elements (wallet, lock, shield, chart, check, x, external-link, clipboard, etc.)

---

## Responsive Behavior
- **Mobile (base)**: Single column, stacked navigation via hamburger menu, full-width cards
- **Tablet (md:)**: Two-column grids, visible sidebar navigation
- **Desktop (lg:)**: Three-column grids where appropriate, persistent sidebar, split-view forms

---

## Special Web3 Patterns
- **Wallet Connection State**: Clear distinction between connected/disconnected states throughout UI
- **Network Indicator**: Always visible in header, warns if wrong network
- **Transaction Feedback**: Toast notifications for tx submission, confirmation, and errors
- **Loading States**: Explicit "Waiting for confirmation" and "Processing on blockchain" states
- **Gas Estimation**: Show estimated gas before transaction submission
- **Address Verification**: Checksum validation indicators for addresses