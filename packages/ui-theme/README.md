# ZamIO UI Theme Package

A comprehensive UI theme package providing consistent design components and theming across all ZamIO applications.

## Features

- 🎨 **Consistent Design System**: Unified color palette, typography, and spacing
- 🌓 **Dark/Light Mode**: Built-in theme switching with persistence
- 🧩 **Component Library**: Pre-built, accessible React components
- ✅ **Input Validation Framework**: Comprehensive form validation with real-time feedback
- 🎯 **TypeScript Support**: Full type safety and IntelliSense
- 📱 **Responsive Design**: Mobile-first approach with TailwindCSS
- ♿ **Accessibility**: WCAG compliant components with proper ARIA support

## Installation

```bash
npm install @zamio/ui-theme
```

## Setup

### 1. Install the package in your application

```bash
npm install @zamio/ui-theme
```

### 2. Configure TailwindCSS

In your `tailwind.config.cjs`, extend the preset:

```javascript
const uiThemePreset = require('@zamio/ui-theme/tailwind.preset.cjs');

module.exports = {
  presets: [uiThemePreset],
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
    './node_modules/@zamio/ui-theme/dist/**/*.{js,ts,jsx,tsx}',
  ],
  // ... your other config
};
```

### 3. Wrap your app with ThemeProvider

```tsx
import { ThemeProvider } from '@zamio/ui-theme';

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="zamio-theme">
      {/* Your app content */}
    </ThemeProvider>
  );
}
```

## Usage

### Theme Management

```tsx
import { useTheme } from '@zamio/ui-theme';

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <button onClick={toggleTheme}>
      Current theme: {theme}
    </button>
  );
}
```

### Components

```tsx
import {
  Button,
  Card,
  Input,
  Select,
  Alert,
  Modal,
  Badge,
} from '@zamio/ui-theme';

function MyComponent() {
  return (
    <Card>
      <Alert variant="success" title="Success!">
        Your changes have been saved.
      </Alert>
      
      <Input
        label="Email"
        type="email"
        placeholder="Enter your email"
      />
      
      <Select
        label="Country"
        options={[
          { value: 'us', label: 'United States' },
          { value: 'ca', label: 'Canada' },
        ]}
      />
      
      <Button variant="primary" size="lg">
        Save Changes
      </Button>
    </Card>
  );
}
```

### Input Validation

```tsx
import {
  ValidatedForm,
  EmailFormField,
  NumericFormField,
  FormField,
  createValidationSchema,
} from '@zamio/ui-theme';

function MyForm() {
  const validationSchema = {
    email: createValidationSchema.email(true),
    amount: createValidationSchema.numeric(true, 0, 1000),
    name: createValidationSchema.text(true, 2, 50)
  };

  const handleSubmit = (values, isValid) => {
    if (isValid) {
      console.log('Form data:', values);
    }
  };

  return (
    <ValidatedForm
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
    >
      <EmailFormField
        name="email"
        label="Email Address"
        required
      />
      
      <FormField
        name="name"
        label="Full Name"
        validationSchema={createValidationSchema.text(true, 2, 50)}
      />
      
      <NumericFormField
        name="amount"
        label="Amount"
        required
        min={0}
        max={1000}
      />
      
      <Button type="submit">Submit</Button>
    </ValidatedForm>
  );
}
```

## Components

### Form Components
- **Button**: Primary, secondary, outline, ghost, and danger variants
- **Input**: Text inputs with icons, validation, and helper text
- **Select**: Dropdown selects with validation
- **Textarea**: Multi-line text inputs
- **Checkbox**: Checkboxes with labels and descriptions
- **Radio**: Radio buttons with labels
- **Switch**: Toggle switches

### Validation Components
- **ValidatedInput**: Generic input with validation schema
- **EmailInput**: Email input with built-in email validation
- **NumericInput**: Numeric input with number validation and formatting
- **ValidatedForm**: Form wrapper with validation context
- **FormField**: Form field that integrates with ValidatedForm
- **EmailFormField**: Email form field for use within ValidatedForm
- **NumericFormField**: Numeric form field for use within ValidatedForm

### Layout Components
- **Card**: Content containers with headers, content, and footers
- **Modal**: Overlay dialogs with different sizes
- **Alert**: Status messages with different variants

### Feedback Components
- **Badge**: Status indicators and labels
- **Spinner**: Loading indicators
- **Tooltip**: Contextual help text

## Theme Colors

The theme provides CSS variables that automatically switch between light and dark modes:

```css
/* Available CSS variables */
--color-primary
--color-secondary
--color-background
--color-surface
--color-text
--color-text-secondary
--color-border
--color-error
--color-warning
--color-success
--color-info
```

## Typography

Consistent typography scale with Satoshi font family:

- Title sizes: `title-xxl`, `title-xl`, `title-lg`, `title-md`, `title-sm`, `title-xsm`
- Body sizes: `xs`, `sm`, `base`, `lg`, `xl`, `2xl`, `3xl`, `4xl`, `5xl`, `6xl`
- Font weights: `light`, `normal`, `medium`, `semibold`, `bold`, `extrabold`

## Spacing

Extended spacing scale for consistent layouts:

```tsx
// Available spacing utilities
className="p-4 m-6 gap-8"
// Includes custom spacing values like 4.5, 5.5, 6.5, etc.
```

## Development

### Building the package

```bash
npm run build
```

### Development mode

```bash
npm run dev
```

### Type checking

```bash
npm run type-check
```

## Validation Framework

The package includes a comprehensive input validation framework. See [VALIDATION_GUIDE.md](./VALIDATION_GUIDE.md) for detailed documentation on:

- Available validators (email, numeric, required, length, etc.)
- Validation schemas and rules
- Form-level validation with context
- Real-time validation feedback
- Custom validation rules
- Server-side validation integration

## Contributing

1. Follow the existing component patterns
2. Ensure accessibility compliance
3. Add proper TypeScript types
4. Test in both light and dark modes
5. Update documentation for new components
6. Test validation components with various input scenarios

## License

MIT License - see LICENSE file for details.