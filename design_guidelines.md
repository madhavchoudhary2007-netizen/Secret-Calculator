# Secret Calculator Mobile App - Design Guidelines

## Authentication & User Management
**No authentication required.** This is a single-user utility app with local data storage. All notes are stored locally using AsyncStorage on the device.

## Navigation Architecture

**Stack-Only Navigation**
- Two primary screens: Calculator (default) and Secret Notes
- Calculator → Secret Notes: Triggered by secret code (69/67=)
- Secret Notes → Calculator: Triggered by pressing any digit (0-9)
- Both transitions should be **instant** with no animation to maintain the secret/stealth nature
- No visible navigation UI elements (no back buttons, no tab bar)

## Screen Specifications

### 1. Calculator Screen
**Purpose:** Primary interface that appears as a normal calculator

**Layout:**
- **Header:** None (maximizes screen space for calculator aesthetic)
- **Safe Area Insets:** 
  - Top: `insets.top + Spacing.lg`
  - Bottom: `insets.bottom + Spacing.lg`
- **Main Content Area:** Non-scrollable fixed layout divided into:
  - History section (top 25% of screen, internally scrollable)
  - Display screen (15% of screen)
  - Button grid (remaining 60% of screen)

**Components:**
- **History List:** Scrollable FlatList showing last 10 calculations in reverse chronological order
  - Each item format: `"5 * 5 = 25"`
  - Font: Regular, medium size, subdued text color
  - Scroll direction: Vertical
  - Shows "No history yet" placeholder when empty
- **Display Screen:** 
  - Large, bold text showing current input/result
  - Right-aligned text
  - Background: Subtle contrast from main background
  - Height: Fixed at 15% of screen height
- **Calculator Grid:**
  - 4 columns × 5 rows of touchable buttons
  - Buttons: 0-9, +, -, *, /, =, C, DEL, decimal point
  - Equal spacing between all buttons (use Spacing.md)
  - Buttons should fill available space proportionally

**Interaction Design:**
- All buttons provide haptic feedback on press (subtle vibration)
- Visual press state: Slight opacity reduction (0.7) and scale (0.95)
- Secret sequence (69/67=) should feel like normal calculator input
- When secret code triggered, instant screen transition with no visible feedback

### 2. Secret Notes Screen
**Purpose:** Hidden vault for creating and managing private notes

**Layout:**
- **Header:** Custom header with transparent background
  - Title: "My Notes" (centered, bold)
  - Right button: "+" icon for creating new note
  - No left button (return via digit press is intentional UX mystery)
- **Safe Area Insets:**
  - Top: `headerHeight + Spacing.xl`
  - Bottom: `insets.bottom + Spacing.xl`
- **Main Content Area:** Scrollable FlatList of notes

**Components:**
- **Note Cards:** Each note as a touchable card with:
  - Note preview text (first 2 lines, truncated with ellipsis)
  - Timestamp (last edited date/time)
  - Delete button (trash icon, right side)
  - Card elevation with subtle shadow (see floating button specs in design system)
  - Spacing between cards: `Spacing.lg`
- **Empty State:** 
  - Illustration: `empty-notes.png` (centered, depicting a locked notepad or safe)
  - Text: "No secret notes yet"
  - Subtext: "Tap + to create your first note"
- **Floating Action Button (FAB):** Alternative to header button
  - Position: Bottom-right corner
  - Offset: `Spacing.xl` from right and bottom (including safe area)
  - Icon: "+" or "edit" icon
  - Shadow specs: shadowOffset {width: 0, height: 2}, shadowOpacity: 0.10, shadowRadius: 2

### 3. Edit Note Modal Screen
**Purpose:** Create new note or edit existing note

**Layout:**
- **Presentation:** Full-screen modal
- **Header:** Standard navigation header (non-transparent)
  - Title: "New Note" or "Edit Note"
  - Left button: "Cancel" text button
  - Right button: "Save" text button (primary color, bold)
- **Safe Area Insets:**
  - Top: `Spacing.xl` (header is non-transparent)
  - Bottom: `insets.bottom + Spacing.xl`
- **Main Content Area:** Scrollable form

**Components:**
- **Multi-line Text Input:**
  - Placeholder: "Type your secret note..."
  - Min height: 200px
  - Auto-focus on mount
  - Border: Subtle, 1px solid
  - Padding: `Spacing.lg`
- **Delete Button (edit mode only):**
  - Position: Below text input
  - Style: Destructive (red text)
  - Confirmation alert: "Delete this note? This cannot be undone."

## Design System

### Color Palette
**Professional Calculator Aesthetic** (should not draw attention)
- **Primary Color:** `#4A90E2` (trustworthy blue, used for operators and accents)
- **Background:** `#F5F5F7` (light neutral, iOS-inspired)
- **Surface:** `#FFFFFF` (cards, display screen)
- **Text Primary:** `#1C1C1E` (high contrast)
- **Text Secondary:** `#8E8E93` (history, timestamps)
- **Accent:** `#34C759` (equals button, save actions)
- **Destructive:** `#FF3B30` (delete button)
- **Number Buttons:** `#E5E5EA` (neutral gray)
- **Operator Buttons:** `#FF9500` (warm orange, standard calculator style)

### Typography
**System Font (SF Pro for iOS / Roboto for Android)**
- **Display Numbers:** 48pt, Medium weight
- **Button Labels:** 24pt, Regular weight
- **Screen Title:** 20pt, Bold weight
- **Note Preview:** 16pt, Regular weight
- **Timestamp:** 14pt, Regular weight
- **Body Text:** 16pt, Regular weight

### Button Specifications
**Calculator Buttons:**
- Shape: Rounded rectangles with borderRadius: 12
- Press state: opacity: 0.7, scale: 0.95
- Number buttons (0-9, decimal): Background `#E5E5EA`, Text `#1C1C1E`
- Operator buttons (+, -, *, /): Background `#FF9500`, Text `#FFFFFF`
- Equals button (=): Background `#34C759`, Text `#FFFFFF`
- Function buttons (C, DEL): Background `#8E8E93`, Text `#FFFFFF`

**Note Cards:**
- Background: `#FFFFFF`
- Border radius: 12
- Padding: `Spacing.lg`
- Shadow: shadowOffset {width: 0, height: 2}, shadowOpacity: 0.10, shadowRadius: 2
- Press state: opacity: 0.9, scale: 0.98

### Icons
**Use Feather icons from @expo/vector-icons:**
- Add note: `plus`
- Delete note: `trash-2`
- Edit note: `edit-2`
- Back/cancel: `x`

### Spacing Scale
- `xs`: 4px
- `sm`: 8px
- `md`: 12px
- `lg`: 16px
- `xl`: 24px
- `xxl`: 32px

## Generated Assets

### Required Assets:
1. **App Icon** (`icon.png`)
   - A calculator icon with a subtle keyhole or lock detail (hints at secret feature)
   - Colors: Blue and white with gray accents
   - Style: Flat, modern, professional

2. **Splash Icon** (`splash-icon.png`)
   - Simplified version of app icon
   - Used during app launch

3. **Empty Notes Illustration** (`empty-notes.png`)
   - Depicts a closed notebook or safe with a subtle lock
   - Colors: Match primary palette (blues, grays)
   - Style: Minimalist line art
   - Size: 200×200px
   - Used on Secret Notes screen when no notes exist

## Accessibility & UX Notes
- All touchable elements minimum size: 44×44 points
- Sufficient color contrast (WCAG AA minimum)
- Haptic feedback confirms button presses
- Secret return mechanism (digit press) is intentionally obscure for privacy
- No tutorial or onboarding (maintains stealth appearance)
- Calculator must function identically to system calculator to avoid suspicion