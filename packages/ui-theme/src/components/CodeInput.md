# CodeInput Component

A reusable 4-digit code input component for email verification, password reset, and other verification flows across ZamIO applications.

## Features

- **4-digit input**: Displays 4 separate input fields for each digit
- **Auto-advance**: Automatically moves to the next field when typing
- **Auto-submit**: Automatically calls `onCodeComplete` when all 4 digits are entered
- **Keyboard navigation**: Supports arrow keys and backspace navigation
- **Paste support**: Handles pasting 4-digit codes from clipboard
- **Error handling**: Clears inputs and shows error messages
- **Loading state**: Disables inputs and shows loading indicator
- **Accessibility**: Full keyboard navigation and screen reader support
- **Numeric only**: Only accepts numeric input (0-9)

## Usage

```tsx
import { CodeInput } from '@zamio/ui-theme';

function VerificationForm() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCodeComplete = async (code: string) => {
    setLoading(true);
    try {
      await verifyCode(code);
      // Handle success
    } catch (err) {
      setError('Invalid code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <CodeInput
      label="Verification Code"
      helperText="Enter the 4-digit code from your email"
      onCodeComplete={handleCodeComplete}
      error={error}
      loading={loading}
      autoFocus={true}
    />
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `onCodeComplete` | `(code: string) => void` | - | **Required.** Called when all 4 digits are entered |
| `onCodeChange` | `(code: string) => void` | - | Called whenever the code changes |
| `error` | `string` | - | Error message to display. When set, clears all inputs |
| `loading` | `boolean` | `false` | Shows loading state and disables inputs |
| `autoFocus` | `boolean` | `true` | Auto-focus first input on mount |
| `disabled` | `boolean` | `false` | Disables all inputs |
| `label` | `string` | - | Label for the input group |
| `helperText` | `string` | - | Helper text shown below inputs |
| `className` | `string` | - | Additional CSS classes |

## Keyboard Interactions

| Key | Action |
|-----|--------|
| `0-9` | Enter digit in current field and advance to next |
| `Backspace` | Clear current field or move to previous field if empty |
| `ArrowLeft` | Move to previous field |
| `ArrowRight` | Move to next field |
| `Enter` | Submit code if all 4 digits are filled |
| `Ctrl+V` / `Cmd+V` | Paste 4-digit code |

## Accessibility Features

- **ARIA labels**: Each input has descriptive `aria-label`
- **Error announcements**: Errors are announced to screen readers with `role="alert"`
- **Keyboard navigation**: Full keyboard accessibility
- **Focus management**: Proper focus handling between fields
- **Input mode**: Uses `inputMode="numeric"` for mobile keyboards

## Styling

The component uses Tailwind CSS classes and follows the ZamIO design system:

- **Input size**: 48px × 48px (12 × 12 in Tailwind units)
- **Font**: Large, semibold text for better readability
- **Colors**: Uses theme colors for borders, focus states, and errors
- **Spacing**: 8px gap between inputs
- **Border radius**: Rounded corners matching other form elements

## Error Handling

When an error occurs:
1. All input fields are automatically cleared
2. Focus returns to the first input
3. Error message is displayed below the inputs
4. Error styling is applied to all inputs

## Loading State

When `loading={true}`:
1. All inputs are disabled
2. "Verifying..." text is shown
3. Cursor changes to indicate loading

## Examples

### Basic Usage
```tsx
<CodeInput
  onCodeComplete={(code) => console.log('Code:', code)}
/>
```

### With Error Handling
```tsx
<CodeInput
  onCodeComplete={handleVerification}
  error={error}
  loading={isVerifying}
/>
```

### With Label and Helper Text
```tsx
<CodeInput
  label="Email Verification"
  helperText="Check your email for the 4-digit code"
  onCodeComplete={handleVerification}
/>
```

### Password Reset Flow
```tsx
<CodeInput
  label="Reset Code"
  helperText="Enter the code from your password reset email"
  onCodeComplete={handlePasswordReset}
  error={resetError}
  loading={isResetting}
/>
```

## Integration with ZamIO Applications

This component is designed to be used across all ZamIO applications:

- **zamio_frontend**: Artist email verification and password reset
- **zamio_admin**: Admin user verification flows
- **zamio_stations**: Station user verification
- **zamio_publisher**: Publisher user verification
- **zamio_app**: Mobile app verification flows

## Testing

The component includes comprehensive tests covering:
- Rendering and basic functionality
- Keyboard navigation and interactions
- Auto-advance and auto-submit behavior
- Error handling and state management
- Accessibility features
- Paste functionality

Run tests with:
```bash
npm test CodeInput
```

## Browser Support

- Modern browsers with ES2015+ support
- Mobile browsers with touch input
- Screen readers and assistive technologies
- Keyboard-only navigation