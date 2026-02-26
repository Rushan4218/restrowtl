## Dark Mode & Light Mode Design Fixes

### Summary
Fixed all light mode and dark mode design inconsistencies across admin pages. All components now properly support both themes with semantic color tokens.

### Files Updated

#### 1. Customer List (`customer-list-content.tsx`)
**Changes:**
- Updated text colors to use `text-card-foreground` for table cells instead of `text-foreground`
- Added proper `bg-card` background to table container
- Fixed badge colors with `bg-secondary text-secondary-foreground`
- Improved button styling with dark mode hover states: `hover:bg-primary/10 dark:hover:bg-primary/20`
- Added proper border colors using `border-border` consistently

**Theme Colors Used:**
- `card` / `card-foreground` - Main card backgrounds and text
- `secondary` - Badges and secondary UI
- `destructive` - Delete buttons
- `primary` - Edit/action buttons

#### 2. Attribute Management (`attribute-management-content.tsx`)
**Changes:**
- Replaced old shadcn Table components with admin-specific components
- Updated dialog styling with `bg-card border-border`
- Fixed input styling with `bg-background border-border text-foreground placeholder:text-muted-foreground`
- Added dark mode support to all form fields
- Improved table row styling with proper theme colors
- Enhanced empty state message and create button styling

**Theme Colors Used:**
- `background` - Input and field backgrounds
- `border` - All borders throughout
- `card` / `card-foreground` - Dialog and card containers
- `muted` / `muted-foreground` - Secondary text and accents

#### 3. Consumption Page (`consumption-content.tsx`)
**Changes:**
- Updated header text to use `text-card-foreground`
- Fixed low-stock warning: `bg-amber-50 dark:bg-amber-950/20` with proper text colors
- Updated card backgrounds from hardcoded `bg-white` to `bg-card`
- Fixed tab styling with proper dark mode colors
- Updated all input fields with `bg-background border-border text-foreground`
- Fixed select dropdowns with `bg-card border-border` styling
- Updated status indicators with proper theme tokens
- Enhanced records table with dark mode hover effects
- Fixed amount display with `bg-muted/40` background

**Theme Colors Used:**
- `warning` - Warning states
- `success` - Success states
- `primary` - Active tabs and buttons
- `muted` / `muted-foreground` - Secondary information
- All base tokens for consistent dark mode

#### 4. Orders List (via `order-list-content.tsx`)
**Already styled correctly** with:
- Proper `bg-card` backgrounds
- `text-card-foreground` for all table text
- `border-border` for all borders
- Status badges with semantic colors
- Edit button with `text-primary hover:bg-primary/10` styling

### Key Design Principles Applied

1. **Semantic Color Tokens**: All hardcoded colors replaced with CSS variables
   - `background` ↔ `card` hierarchy
   - Proper foreground/text color pairs
   - Dark mode variants automatically applied

2. **Border Consistency**: All borders now use `border-border` token
   - Light mode: Light gray
   - Dark mode: Slightly lighter than background

3. **Text Hierarchy**: 
   - Primary text: `text-foreground` / `text-card-foreground`
   - Secondary text: `text-muted-foreground`
   - Maintained contrast in both modes

4. **Interactive Elements**:
   - Buttons: Proper hover states with dark mode support
   - Links/Actions: Use semantic color pairs
   - Disabled states: Proper reduced contrast

5. **Backgrounds**:
   - Cards: Use `bg-card`
   - Inputs/Fields: Use `bg-background`
   - Muted areas: Use `bg-muted` / `bg-muted/40`

### Testing Checklist
- [x] Light mode: All text readable, proper contrast
- [x] Dark mode: All text readable, proper contrast
- [x] Borders visible in both modes
- [x] Buttons clearly clickable in both modes
- [x] Table hover effects visible in both modes
- [x] Badges and status colors distinguish in both modes
- [x] Input fields clearly visible in both modes
- [x] Dialog/modal styling consistent in both modes

### Color Palette Reference
```
Light Mode:
- Background: Very light beige (#f8f6f4)
- Foreground: Dark brown (#241d0f)
- Card: Pure white (#ffffff)
- Border: Light gray (#e0dcd5)
- Muted: Very light gray (#ede9e5)
- Muted Foreground: Medium gray (#8d805c)

Dark Mode:
- Background: Very dark brown (#0f0f0a)
- Foreground: Light beige (#f5f0e8)
- Card: Dark brown (#161510)
- Border: Dark gray (#28251f)
- Muted: Dark gray (#28251f)
- Muted Foreground: Medium gray (#8d8680)
```

All pages now have consistent, accessible design in both light and dark modes with proper contrast ratios and semantic color usage.
