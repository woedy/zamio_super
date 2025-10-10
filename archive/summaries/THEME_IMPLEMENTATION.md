# ZamIO Theme Implementation Guide

## Overview

This document describes the theme consistency implementation across all ZamIO frontend applications. The theme system provides consistent colors, typography, and dark/light mode support across all applications.

## Implementation Details

### Docker-Compatible Solution

Due to Docker environment constraints, the theme system is implemented directly in each application rather than as a shared package. This ensures compatibility with the existing Docker build process.

### Applications Updated

1. **zamio_frontend** - Artist Portal
2. **zamio_admin** - Admin Dashboard  
3. **zamio_stations** - Station Portal
4. **zamio_publisher** - Publisher Portal

## Theme System Components

### 1. CSS Variables (`src/css/style.css`)

Each application includes consistent CSS custom properties for theming:

```css
:root {
  /* Light mode colors */
  --color-primary: #14002C;
  --color-secondary: #80CAEE;
  --color-background: #FFFFFF;
  --color-surface: #F8FAFC;
  --color-text: #1C2434;
  --color-text-secondary: #64748B;
  --color-border: #E2E8F0;
  --color-error: #D34053;
  --color-warning: #FFA70B;
  --color-success: #219653;
  --color-info: #259AE6;
}

.dark {
  /* Dark mode colors */
  --color-primary: #AA00BA;
  --color-secondary: #80CAEE;
  --color-background: #0b1220;
  --color-surface: #1A222C;
  --color-text: #FFFFFF;
  --color-text-secondary: #AEB7C0;
  --color-border: #2E3A47;
  --color-error: #FF6766;
  --color-warning: #FFBA00;
  --color-success: #10B981;
  --color-info: #259AE6;
}
```

### 2. Theme Context (`src/contexts/ThemeContext.tsx`)

Each application includes a React context for theme management:

- **ThemeProvider**: Wraps the entire application
- **useTheme**: Hook for accessing theme state and controls
- **Theme persistence**: Automatically saves theme preference to localStorage
- **System preference detection**: Respects user's OS theme preference

### 3. Tailwind Configuration

Updated Tailwind configs use the shared preset and CSS variables:

```javascript
module.exports = {
  content: [
    './index.html', 
    './src/**/*.{js,ts,jsx,tsx}',
    '../packages/ui-theme/src/**/*.{js,ts,jsx,tsx}'
  ],
  presets: [require('../packages/ui-theme/tailwind.preset.cjs')],
  theme: {
    extend: {
      // Application-specific extensions
    },
  },
  plugins: [],
}
```

## Usage Examples

### Using Theme Colors in Components

```tsx
// Using CSS custom properties directly
<div className="bg-surface border border-border text-text">
  <h1 className="text-primary">Title</h1>
  <p className="text-text-secondary">Description</p>
</div>

// Using theme context
import { useTheme } from '../contexts/ThemeContext';

function MyComponent() {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <div>
      <p>Current theme: {theme}</p>
      <button onClick={toggleTheme}>Toggle Theme</button>
    </div>
  );
}
```

### Theme Toggle Component

A reusable theme toggle component is available:

```tsx
import { ThemeToggle } from '../components/ThemeToggle';

function Header() {
  return (
    <header className="flex justify-between items-center">
      <h1>ZamIO</h1>
      <ThemeToggle />
    </header>
  );
}
```

## Color Palette

### Light Mode
- **Primary**: #14002C (Dark Purple)
- **Secondary**: #80CAEE (Light Blue)
- **Background**: #FFFFFF (White)
- **Surface**: #F8FAFC (Light Gray)
- **Text**: #1C2434 (Dark Gray)
- **Text Secondary**: #64748B (Medium Gray)

### Dark Mode
- **Primary**: #AA00BA (Bright Purple)
- **Secondary**: #80CAEE (Light Blue)
- **Background**: #0b1220 (Dark Blue)
- **Surface**: #1A222C (Dark Gray)
- **Text**: #FFFFFF (White)
- **Text Secondary**: #AEB7C0 (Light Gray)

## Benefits

1. **Consistent Design**: All applications share the same color palette and design tokens
2. **Dark/Light Mode**: Automatic theme switching with user preference persistence
3. **Docker Compatible**: Works seamlessly in containerized environments
4. **Developer Friendly**: Easy to use CSS variables and React hooks
5. **Accessible**: Proper contrast ratios and semantic color usage
6. **Maintainable**: Centralized theme definitions that can be updated across all apps

## Future Improvements

When the Docker environment supports workspace dependencies, the theme system can be migrated back to the shared `@zamio/ui-theme` package for even better maintainability.

## Requirements Satisfied

- ✅ 5.1: Consistent color palette across all applications
- ✅ 5.2: Dark/light mode support with proper contrast
- ✅ 5.3: Theme persistence and system preference detection
- ✅ 5.4: Shared typography and spacing using Tailwind preset
- ✅ 5.5: Unified component styling approach