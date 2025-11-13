# Design Guidelines: Scuttle - Privacy-Preserving NFT Marketplace & Token Platform

## Design Approach
**Premium NFT Marketplace Aesthetic**: Inspired by Magic Eden and OpenSea, featuring bold purple/pink gradients, glassmorphism effects, and sophisticated dark theme. Combines Web3 marketplace polish with privacy-first fhEVM capabilities for both NFTs and tokens.

## Core Design Principles
1. **Visual Luxury**: High-end marketplace feel with gradients, depth, and premium visual effects
2. **Dark Theme First**: Optimized for dark mode with vibrant accent colors
3. **Privacy as a Feature**: Encryption indicators as badges of exclusivity, not warnings
4. **NFT-Centric**: Large imagery, collection showcases, interactive previews
5. **Trust & Security**: Professional aesthetic befitting high-value digital assets

---

## Color System

### Primary Palette (Purple-Pink Gradients)
**Main Brand Colors:**
- **Primary Purple**: `#8B5CF6` (violet-500) - buttons, links, highlights
- **Primary Pink**: `#EC4899` (pink-500) - accents, CTAs, badges
- **Gradient Hero**: `linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)`
- **Gradient Subtle**: `linear-gradient(135deg, #8B5CF620 0%, #EC489920 100%)`

### Dark Theme Foundation
- **Background Base**: `#0A0A0B` (near-black with slight warmth)
- **Surface Elevated**: `#141418` (cards, panels)
- **Surface Elevated+**: `#1C1C21` (hover states, selected items)
- **Border Subtle**: `#2A2A30` (dividers, outlines)
- **Border Strong**: `#3A3A42` (card borders, inputs)

### Text Hierarchy
- **Primary Text**: `#FAFAFA` (high contrast white)
- **Secondary Text**: `#A8A8B3` (medium contrast gray)
- **Tertiary Text**: `#6B6B78` (low contrast, metadata)
- **Link/Accent**: Gradient text with purple-pink

### Semantic Colors
- **Success**: `#10B981` (emerald-500) - sales, mints, confirmations
- **Warning**: `#F59E0B` (amber-500) - expiring listings, low bids
- **Error**: `#EF4444` (red-500) - failed transactions, errors
- **Info**: `#3B82F6` (blue-500) - notifications, tips

---

## Typography System

### Font Families
- **Primary UI**: Inter (clean, modern for UI and body)
- **Display/Headlines**: Space Grotesk (bold, tech-forward for hero sections)
- **Monospace**: JetBrains Mono (addresses, token IDs, transaction hashes)
- **Numbers/Stats**: JetBrains Mono (prices, quantities, volumes)

### Type Scale
- **Hero Display**: text-6xl to text-7xl, font-bold, gradient text
- **Collection Titles**: text-4xl to text-5xl, font-bold
- **Page Headers**: text-3xl, font-semibold
- **Section Titles**: text-2xl, font-semibold
- **Card Titles**: text-xl, font-medium
- **NFT Names**: text-lg, font-semibold
- **Body Text**: text-base, font-normal
- **Metadata/Labels**: text-sm, font-medium
- **Captions**: text-xs, font-normal
- **Prices**: text-2xl to text-3xl, monospace, gradient or colored

---

## Layout System

### NFT-Optimized Grids
- **Collection Grid**: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6`
- **Featured NFTs**: `grid-cols-1 lg:grid-cols-2 gap-8` (larger cards)
- **Activity Feed**: Single column, stacked with timestamps
- **Stats Dashboard**: `grid-cols-2 md:grid-cols-4 gap-4`

### Container Strategy
- **Full Bleed Sections**: Hero banners, featured collections
- **Constrained Content**: max-w-7xl mx-auto px-6 for main content
- **NFT Detail**: max-w-6xl with two-column split (image + details)
- **Forms/Mint**: max-w-2xl centered

### Spacing
- **Section Gaps**: py-12 to py-24 for vertical rhythm
- **Card Padding**: p-6 for NFT cards, p-8 for collection cards
- **Grid Gaps**: gap-4 (dense), gap-6 (standard), gap-8 (spacious)

---

## Component Library

### Navigation
**App Header** (Sticky, Glassmorphic)
- Height: h-16 to h-20
- Background: Blur with subtle gradient overlay
- Logo (left) + Nav links (Marketplace, Collections, Create, Tokens) + Wallet (right)
- Search bar (center) with icon and autocomplete
- Network indicator: Sepolia badge with colored dot

**Sidebar** (For Dashboard/Profile)
- Dark elevated background
- Purple gradient accent for active items
- Icons + labels for navigation
- Collapsible on mobile

### Hero Sections
**NFT Marketplace Hero**
- Full-width gradient background with animated subtle particles
- Headline: "Privacy-First NFT Marketplace"
- CTA buttons: "Explore Collections" (gradient), "Mint NFT" (outline)
- Featured collection carousel below hero
- Stats bar: Total Volume, NFTs Listed, Active Collections

**Collection Hero**
- Banner image (full-width, aspect-ratio 5:1)
- Collection avatar (overlapping banner)
- Collection name, creator, verified badge
- Stats row: Floor price, volume, items, owners

### NFT Cards
**Grid Card** (Collection/Marketplace View)
- Aspect ratio: 1:1 for image
- Rounded: rounded-xl
- Border: subtle with gradient on hover
- Image: Object-fit cover with loading skeleton
- Overlay: Gradient fade at bottom for text
- Content: NFT name, collection badge, price (large, gradient text)
- Hover effect: Scale (1.02), shadow elevation, gradient border glow
- Privacy badge: Small lock icon if encrypted attributes

**Featured Card** (Larger, Detailed)
- Aspect ratio: 4:5 or 1:1
- More padding, larger text
- Bid/Sale status badges
- Action buttons visible on hover

### NFT Detail Page
**Layout**: Two-column (lg:)
- **Left**: Large NFT image/media (sticky)
  - Rounded-2xl container
  - Glassmorphic border
  - Zoom on hover option
  - Badge overlays (rarity, encrypted)
- **Right**: Details panel
  - Collection name + link
  - NFT name (large, gradient)
  - Current price (huge, monospace, gradient)
  - Owner/Creator info with avatars
  - Action buttons: Buy Now, Place Bid, Make Offer
  - Tabs: Details, Attributes, Activity, Bids
  - Attribute grid with rarity percentages
  - Encrypted attributes with decrypt button

### Mint NFT Page
**Layout**: Centered form with live preview
- **Left**: Upload zone (drag-drop, large, rounded)
  - Image preview
  - Upload progress bar
  - IPFS badge when uploaded
- **Right**: Metadata form
  - NFT name, description inputs
  - Collection selector (dropdown)
  - Attributes builder (add/remove trait pairs)
  - Privacy toggles: Encrypt rarity, Encrypt attributes
  - Price/listing options (optional)
  - Mint button: Large, gradient, with transaction preview

### Marketplace Filters
**Sidebar Filters** (Left of NFT grid)
- Sticky position
- Collapsible sections: Status, Price, Collections, Rarity, Attributes
- Price range slider with gradient track
- Checkbox groups with counts
- Apply/Clear buttons at bottom

### Profile Page
**Layout**: Header + Tabs + Grid
- **Header**: Banner, avatar, username, wallet address, verified badge
- **Stats**: Collected, Created, Favorited, Volume
- **Tabs**: Collected, Created, Activity, Offers
- **Grid**: NFT cards based on selected tab

### Activity Feed
**Timeline Layout**
- Chronological list
- Each item: Icon + Action + NFT thumbnail + Price + Time + Address
- Icons: Minted, Listed, Sold, Transferred, Bid Placed, Offer Accepted
- Hover: Highlight row, show transaction link

### Cards & Panels
**Glassmorphic Cards**
- Background: Subtle gradient with blur
- Border: 1px with gradient or glow
- Shadow: Elevated with colored glow (purple/pink)
- Padding: p-6 to p-8
- Rounded: rounded-xl to rounded-2xl

**Stats Cards**
- Dark elevated background
- Icon (gradient colored)
- Label (secondary text)
- Value (large, monospace, gradient)
- Trend indicator (optional)

### Buttons
**Primary (Gradient)**: 
- Background: Purple-pink gradient
- Text: White
- Padding: px-6 py-3
- Rounded: rounded-lg
- Hover: Brightness increase, scale 1.02

**Secondary (Outline)**: 
- Border: Gradient border
- Text: Gradient text
- Background: Transparent or subtle dark
- Hover: Background fills slightly

**Icon Buttons**: 
- Circular: w-10 h-10, rounded-full
- Background: Subtle with hover elevation
- Icon: Centered

**Wallet Connect**: 
- Pill shape: rounded-full
- Gradient or outline
- Show address when connected (truncated)

### Forms
**Input Fields**
- Height: h-12
- Background: Elevated dark with border
- Rounded: rounded-lg
- Focus: Purple/pink ring
- Labels: Above, text-sm, font-medium
- Icons: Leading icons for context (ETH icon for price)

**Text Areas**
- Min height: min-h-32
- Resize: vertical
- Otherwise same as inputs

**Dropdowns/Selects**
- Custom styled (avoid default browser)
- Dropdown panel: Glassmorphic with border
- Selected item: Highlighted with gradient accent

**Toggles/Switches**
- Privacy toggles: Purple when enabled
- Labels: Clear and descriptive
- Icon indicators (lock, eye)

### Modals
**Transaction Confirmation**
- Centered: max-w-md
- Glassmorphic background
- Header: Icon + Title
- Body: Transaction summary
- Footer: Cancel + Confirm buttons
- Loading: Spinner with "Waiting for wallet"
- Success: Checkmark animation + View on Explorer link

**Image/NFT Preview Modal**
- Full screen overlay with backdrop blur
- Large image centered
- Close button (X) top-right
- Navigation arrows for collections

### Badges
**Status Badges**: px-3 py-1, rounded-full, text-xs, font-semibold
- Live Auction: Gradient background
- Sold: Muted background
- Minted: Success green
- Encrypted: Purple with lock icon
- Verified: Blue with checkmark

**Rarity Badges**: 
- Common, Uncommon, Rare, Epic, Legendary
- Color-coded with gradient backgrounds
- Glow effect for higher rarities

---

## Visual Effects

### Glassmorphism
- Background: `rgba(255, 255, 255, 0.05)` with blur
- Backdrop filter: `blur(12px)`
- Border: `1px solid rgba(255, 255, 255, 0.1)`
- Use for: Navigation, modals, cards

### Gradients
**Text Gradients**: 
```css
background: linear-gradient(135deg, #8B5CF6, #EC4899);
-webkit-background-clip: text;
-webkit-text-fill-color: transparent;
```

**Border Gradients**: 
```css
border-image: linear-gradient(135deg, #8B5CF6, #EC4899) 1;
```

**Background Gradients**: 
- Hero sections: Full gradient
- Cards: Subtle gradient overlays
- Buttons: Primary actions

### Hover Effects
- **NFT Cards**: Scale 1.02, shadow glow, gradient border appears
- **Buttons**: Brightness 110%, scale 1.02
- **Links**: Color shift to lighter gradient
- **Stat Cards**: Subtle elevation, border glow

### Animations
- **Page Transitions**: Fade in content (200ms)
- **Modal Entry**: Fade + scale from 0.95 to 1
- **Skeleton Loading**: Shimmer effect on placeholders
- **Success States**: Checkmark draw animation
- **Hover Interactions**: Transform with transition-all duration-200
- **NO**: Auto-play videos, scroll-triggered animations

---

## NFT-Specific Patterns

### Collection Display
- **Collection Grid Card**: Square image, collection name, floor price, item count
- **Collection Header**: Banner + avatar + stats + description
- **Collection Activity**: Recent sales, listings, bids

### Rarity Display
- **Rarity Score**: Large number with colored badge
- **Rarity Rank**: #X of Y format
- **Attribute Rarity**: Percentage + bar visualization
- **Visual Indicators**: Glow effects for rare items

### Pricing Display
- **Current Price**: Large, monospace, gradient
- **Floor Price**: Secondary, with icon
- **Last Sale**: Gray, with time ago
- **Price History**: Line chart with gradient fill

### Auction/Bidding
- **Countdown Timer**: Large, segmented (Days:Hours:Mins:Secs)
- **Current Bid**: Monospace, highlighted
- **Bid History**: List with bidder + amount + time
- **Place Bid**: Input with min bid requirement shown

### Ownership/Provenance
- **Creator**: Avatar + name + verified badge
- **Current Owner**: Avatar + address (truncated)
- **Transfer History**: Timeline of ownership changes
- **Royalty Info**: Percentage to creator on sales

---

## Privacy/Encryption Visual Language

### Encrypted Data Indicators
- **Lock Icon**: Used consistently for encrypted fields
- **Purple Glow**: Subtle glow around encrypted items
- **Privacy Badge**: Small badge with "Encrypted" text
- **Decrypt Button**: Gradient outline button with key icon
- **Decrypted State**: Green checkmark, "Decrypted" badge

### Privacy Toggles
- **Visual State**: Clear on/off indication
- **Icons**: Lock (on), Unlock (off)
- **Color**: Purple when privacy enabled
- **Label**: "Encrypt [field]" with explanation tooltip

---

## Responsive Behavior
- **Mobile**: Single column, hamburger menu, bottom nav for main actions, full-width NFT cards
- **Tablet**: 2-column grid, sidebar toggleable, larger tap targets
- **Desktop**: 3-4 column grid, persistent sidebar, hover effects enabled

---

## Dark Mode (Primary Theme)
- All designs optimized for dark mode first
- Gradients pop against dark backgrounds
- Text contrast carefully managed (WCAG AA minimum)
- Light mode: Available but not primary focus

---

## Accessibility
- **Keyboard Navigation**: Full support for tab, enter, esc
- **Focus States**: Visible purple/pink ring on all interactive elements
- **Alt Text**: All NFT images have descriptive alt text
- **ARIA Labels**: Proper labels for buttons, forms, modals
- **Color Contrast**: Minimum WCAG AA for text
- **Screen Readers**: Meaningful content structure
- **Touch Targets**: Minimum 44px for mobile

---

## Special Web3 Patterns (Extended)
- **Wallet State**: Clear connected/disconnected UI
- **Network Indicator**: Sepolia badge always visible
- **Gas Estimates**: Show before every transaction
- **Transaction States**: Pending, Confirmed, Failed with appropriate feedback
- **IPFS Integration**: Badge indicators for decentralized storage
- **Blockchain Confirmations**: Progress indicator (X/12 confirmations)
- **Error Handling**: Friendly messages for MetaMask rejections, insufficient funds, etc.
