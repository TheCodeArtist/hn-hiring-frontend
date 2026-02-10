# Theme System Documentation

## Overview

The HN Hiring Scanner application features a comprehensive theming system with support for both light and dark modes, ensuring proper color contrast and accessibility compliance (WCAG AA standards).

## Features

### 1. Light and Dark Mode Support
- **Light Mode**: Clean, professional design with high contrast for optimal readability
- **Dark Mode**: Eye-friendly dark theme optimized for low-light environments
- **System Preference Detection**: Automatically detects and applies user's system theme preference on first load
- **Persistent Selection**: Theme choice is saved to localStorage and persists across sessions
- **Smooth Transitions**: All theme changes include smooth CSS transitions (0.3s ease)

### 2. Theme Toggle
- Located in the top-right corner of the header next to the comparison button
- Icon changes dynamically:
  - Moon icon (`dark_mode`) in light mode
  - Sun icon (`light_mode`) in dark mode
- Tooltip shows "Switch to light mode" or "Switch to dark mode" based on current state

### 3. Color System

The theme uses CSS Custom Properties (CSS variables) for consistent color management across the application.

#### Light Mode Colors

**Backgrounds:**
- Primary: `#ffffff` (white)
- Secondary: `#f8f9fa` (light gray)
- Tertiary: `#e9ecef` (medium light gray)
- Hover: `#f1f3f5` (subtle hover state)

**Text:**
- Primary: `#212529` (near black, high contrast)
- Secondary: `#495057` (dark gray)
- Tertiary: `#6c757d` (medium gray)
- Disabled: `#adb5bd` (light gray)

**Primary Color:**
- Base: `#1565c0` (darker blue for better contrast)
- Light: `#e3f2fd` (very light blue)
- Dark: `#0d47a1` (very dark blue)
- Contrast: `#ffffff` (white)

**Semantic Colors:**
- **Success (Remote)**: `#2e7d32` on `#e8f5e9` background
- **Warning (Hybrid)**: `#d84315` on `#fff3e0` background
- **Error (Onsite)**: `#c2185b` on `#fce4ec` background
- **Info (Global)**: `#0277bd` on `#e1f5fe` background

**Chips/Badges:**
- Primary: `#90caf9` background with `#0d47a1` text
- Secondary: `#bbdefb` background with `#0d47a1` text
- Neutral: `#dee2e6` background with `#495057` text

**Comparison Highlights:**
- Common: `#e0f2f1` background, `#00695c` text, `#4db6ac` border
- Difference: `#fff9e6` background, `#e65100` text, `#ff9800` border

#### Dark Mode Colors

**Backgrounds:**
- Primary: `#1a1a1a` (dark charcoal)
- Secondary: `#2d2d2d` (lighter dark)
- Tertiary: `#3a3a3a` (medium dark)
- Hover: `#404040` (hover state)

**Text:**
- Primary: `#f8f9fa` (near white)
- Secondary: `#dee2e6` (light gray)
- Tertiary: `#adb5bd` (medium light gray)
- Disabled: `#6c757d` (medium gray)

**Primary Color:**
- Base: `#64b5f6` (lighter blue for dark backgrounds)
- Light: `#1e3a5f` (dark blue background)
- Dark: `#90caf9` (very light blue)
- Contrast: `#000000` (black)

**Semantic Colors:**
- **Success**: `#66bb6a` on `#1b3a1e` background
- **Warning**: `#ffa726` on `#4a2c1a` background
- **Error**: `#f06292` on `#3d1e2e` background
- **Info**: `#4fc3f7` on `#1a3d4f` background

**Chips/Badges:**
- Primary: `#1976d2` background with `#ffffff` text
- Secondary: `#1e3a5f` background with `#90caf9` text
- Neutral: `#495057` background with `#dee2e6` text

**Comparison Highlights:**
- Common: `#1a3d3a` background, `#4db6ac` text, `#26a69a` border
- Difference: `#3d2e1a` background, `#ffb74d` text, `#ff9800` border

## Implementation Details

### Architecture

#### Theme Service (`src/app/services/theme.service.ts`)

The `ThemeService` is a singleton Angular service that manages the theme state:

```typescript
@Injectable({ providedIn: 'root' })
export class ThemeService {
  isDarkMode = signal(false);
  
  constructor() {
    this.initializeTheme();
  }
  
  private initializeTheme(): void {
    // Loads from localStorage or system preference
  }
  
  toggleTheme(): void {
    // Toggles theme and saves to localStorage
  }
  
  private applyTheme(): void {
    // Applies data-theme attribute to document element
  }
}
```

**Key Features:**
- Uses Angular signals for reactive state management
- Checks localStorage for saved preference first
- Falls back to system preference (`prefers-color-scheme` media query)
- Listens for system theme changes in real-time
- Applies theme by setting/removing `data-theme="dark"` attribute on document root
- Persists user selection to localStorage

#### Global Styles (`src/styles.scss`)

All theme variables are defined in `styles.scss`:
- CSS custom properties in `:root` for light theme
- Overrides in `[data-theme='dark']` for dark theme
- Material Design component overrides for dark mode
- Smooth transitions for theme changes
- Custom scrollbar styling that respects theme

#### Component Integration

Components use the `ThemeService` for theme control:

```typescript
constructor(public themeService: ThemeService) {}

toggleTheme() {
  this.themeService.toggleTheme();
}
```

Components use CSS custom properties for styling:

```scss
.header {
  background-color: var(--bg-secondary);
  color: var(--text-primary);
  border-bottom: 1px solid var(--border-color);
}
```

#### Badge System (`src/app/styles/_badges.scss`)

Shared badge styles using SCSS mixins:
- `@mixin badge-base`: Base badge styling
- `@mixin remote-badge-variants`: Remote policy badge colors
- `@mixin visa-badge-variants`: Visa sponsorship badge colors
- Exported classes: `.remote-badge`, `.visa-badge`

Used in multiple components (`job-list`, `job-detail-dialog`, `comparison-view`).

### File Structure

```
src/
├── styles.scss                          # Global theme variables and Material overrides
├── app/
│   ├── services/
│   │   └── theme.service.ts            # Theme management service
│   ├── styles/
│   │   └── _badges.scss                # Shared badge styles with theme support
│   └── components/
│       ├── job-list/
│       │   ├── job-list.component.ts   # Injects ThemeService, provides toggle method
│       │   ├── job-list.component.html # Theme toggle button in header
│       │   └── job-list.component.scss # Uses CSS custom properties
│       ├── job-detail-dialog/
│       │   └── job-detail-dialog.component.scss  # Uses CSS custom properties
│       └── comparison-view/
│           └── comparison-view.component.scss    # Uses CSS custom properties
```

## Accessibility

### WCAG AA Compliance

All text and background color combinations meet WCAG AA standards:
- Normal text: Minimum 4.5:1 contrast ratio
- Large text: Minimum 3:1 contrast ratio

### Key Improvements

1. **Primary Color**: Changed from `#1976d2` to `#1565c0` for better contrast (4.5:1 ratio)
2. **Position Badges**: High-contrast color combinations for remote/hybrid/onsite indicators
3. **Link Colors**: Darker blue for better visibility on white backgrounds
4. **Border Colors**: Stronger borders for better definition
5. **Focus States**: Maintained Material Design focus indicators
6. **Color Scheme**: Proper `color-scheme` CSS property for native UI elements (scrollbars, form controls)

## Browser Support

- Modern browsers with CSS custom properties support (all evergreen browsers)
- System dark mode detection via `prefers-color-scheme` media query
- Graceful fallback to light mode if CSS custom properties not supported
- Custom scrollbar styling (WebKit browsers)

## Material Design Integration

The theme includes comprehensive Material Design component overrides for dark mode:
- Tables (`mat-mdc-table`)
- Cards (`mat-mdc-card`)
- Dialogs (`mat-mdc-dialog-container`)
- Form fields (`mat-mdc-form-field`)
- Select dropdowns (`mat-mdc-select`)
- Options (`mat-mdc-option`)
- Chips (`mat-mdc-chip`)
- Paginator (`mat-mdc-paginator`)
- Icon buttons (`mat-mdc-icon-button`)
- Progress spinners (`mat-mdc-progress-spinner`)

### Special Features

- **Dialog Backdrop**: Blur effect with `backdrop-filter` for modern visual effect
- **Tech Stack Tooltips**: Custom tooltip styling with proper spacing and line-height
- **Scrollbars**: Custom styled scrollbars that match the theme

## Usage

### For Users

1. **Manual Toggle**: Click the moon/sun icon in the top-right corner of the header
2. **Automatic**: The app will automatically use your system's dark mode preference on first visit
3. **Persistence**: Your choice is remembered across sessions

### For Developers

#### Reading Current Theme

```typescript
import { ThemeService } from './services/theme.service';

constructor(public themeService: ThemeService) {}

ngOnInit() {
  // Get current theme state
  const isDark = this.themeService.isDarkMode();
  console.log('Dark mode:', isDark);
}
```

#### Using Theme Variables in SCSS

```scss
.my-component {
  background-color: var(--bg-primary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  
  &:hover {
    background-color: var(--bg-hover);
  }
}
```

#### Using Badge Styles

```scss
@use '../../styles/badges';

.my-badge {
  @include badges.badge-base;
  @include badges.remote-badge-variants;
}
```

#### Adding New Theme Colors

1. Add to `:root` in `styles.scss`:
```scss
:root {
  --my-new-color: #123456;
}
```

2. Add dark mode override:
```scss
[data-theme='dark'] {
  --my-new-color: #654321;
}
```

3. Use in components:
```scss
.my-element {
  color: var(--my-new-color);
}
```

## Testing

### Manual Testing Checklist

1. **Light Mode**: 
   - Click theme toggle to ensure light mode applies correctly
   - Verify all components render properly
   - Check badge colors and contrast

2. **Dark Mode**: 
   - Click toggle to verify dark mode styling
   - Test all Material Design components (dialogs, forms, tables)
   - Verify comparison view highlights

3. **Persistence**: 
   - Toggle theme
   - Reload page
   - Confirm theme preference is maintained

4. **System Preference**: 
   - Clear localStorage (`localStorage.clear()` in console)
   - Change OS theme settings
   - Open app in new tab
   - Verify it matches system preference

5. **Contrast**: 
   - Use browser DevTools or online tools
   - Verify contrast ratios meet WCAG AA standards
   - Test with screen readers if possible

6. **Transitions**: 
   - Toggle theme multiple times
   - Verify smooth transitions
   - Check for visual glitches

### Testing with DevTools

```javascript
// In browser console:

// Check current theme
document.documentElement.getAttribute('data-theme')

// Toggle theme programmatically
document.documentElement.setAttribute('data-theme', 'dark')
document.documentElement.removeAttribute('data-theme')

// Check localStorage
localStorage.getItem('theme')

// Clear saved preference
localStorage.removeItem('theme')

// Check system preference
window.matchMedia('(prefers-color-scheme: dark)').matches
```

## Future Enhancements

Possible improvements for future versions:

1. **Multiple Color Themes**: Blue (current), green, purple, orange theme variants
2. **Custom Accent Colors**: User-selectable accent color picker
3. **Contrast Adjustment**: Slider to adjust contrast ratios for accessibility
4. **High Contrast Mode**: Ultra-high contrast mode for visually impaired users
5. **Print-Friendly Theme**: Optimized styles for printing
6. **Color Blindness Modes**: Deuteranopia, protanopia, tritanopia-safe palettes
7. **Custom Font Sizes**: User-adjustable text size
8. **Reduced Motion**: Respect `prefers-reduced-motion` for animations/transitions

## Resources

- [WCAG Contrast Guidelines](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html)
- [Material Design Dark Theme](https://material.io/design/color/dark-theme.html)
- [CSS Custom Properties](https://developer.mozilla.org/en-US/docs/Web/CSS/--*)
- [prefers-color-scheme](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-color-scheme)
- [Angular Signals](https://angular.dev/guide/signals)
