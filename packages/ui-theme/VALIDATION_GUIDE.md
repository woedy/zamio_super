# Input Validation Framework Guide

The ZamIO UI Theme package includes a comprehensive input validation framework that provides real-time form validation with consistent error handling across all applications.

## Features

- ✅ Real-time validation on change and blur events
- ✅ Comprehensive validation rules (email, numeric, required, length, etc.)
- ✅ Pre-built validation components (EmailInput, NumericInput, etc.)
- ✅ Form-level validation with context management
- ✅ TypeScript support with full type safety
- ✅ Consistent error messaging
- ✅ Customizable validation schemas

## Core Components

### 1. Validation Utilities (`utils/validation.ts`)

#### Available Validators

```typescript
import { validators } from '@zamio/ui-theme';

// Email validation
validators.email('test@example.com') // true
validators.email('invalid-email') // false

// Numeric validation (integers and decimals)
validators.numeric('123.45') // true
validators.numeric('abc') // false

// Integer validation only
validators.integer('123') // true
validators.integer('123.45') // false

// Required field validation
validators.required('test') // true
validators.required('') // false
validators.required('   ') // false (trims whitespace)

// Length validation
validators.minLength(3)('test') // true
validators.maxLength(10)('test') // true

// Value validation for numbers
validators.minValue(0)('5') // true
validators.maxValue(100)('50') // true

// URL validation
validators.url('https://example.com') // true

// Phone validation (basic)
validators.phone('+1234567890') // true

// Custom pattern validation
validators.pattern(/^[A-Z]+$/)('HELLO') // true
```

#### Validation Schema Creation

```typescript
import { createValidationSchema } from '@zamio/ui-theme';

// Email field (required)
const emailSchema = createValidationSchema.email(true);

// Numeric field with min/max values
const amountSchema = createValidationSchema.numeric(true, 0, 1000);

// Text field with length constraints
const nameSchema = createValidationSchema.text(true, 2, 50);

// URL field (optional)
const websiteSchema = createValidationSchema.url(false);

// Phone field (optional)
const phoneSchema = createValidationSchema.phone(false);
```

### 2. Validation Hook (`hooks/useFormValidation.ts`)

```typescript
import { useFormValidation } from '@zamio/ui-theme';

function MyComponent() {
  const validation = useFormValidation({
    schema: {
      email: createValidationSchema.email(true),
      amount: createValidationSchema.numeric(true, 0, 1000)
    },
    validateOnChange: true,
    validateOnBlur: true
  });

  // Available methods:
  // validation.errors - Current validation errors
  // validation.isValid - Overall form validity
  // validation.validateField(name, value) - Validate single field
  // validation.validateForm(values) - Validate entire form
  // validation.clearErrors() - Clear all errors
  // validation.clearFieldError(name) - Clear specific field error
  // validation.setFieldError(name, error) - Set custom error
}
```

### 3. Standalone Input Components

#### EmailInput

```typescript
import { EmailInput } from '@zamio/ui-theme';

<EmailInput
  label="Email Address"
  required={true}
  showIcon={true}
  placeholder="Enter your email"
  onChange={(e) => console.log(e.target.value)}
/>
```

#### NumericInput

```typescript
import { NumericInput } from '@zamio/ui-theme';

<NumericInput
  label="Amount"
  required={true}
  min={0}
  max={1000}
  allowDecimals={true}
  decimalPlaces={2}
  placeholder="Enter amount"
/>
```

#### ValidatedInput (Generic)

```typescript
import { ValidatedInput, createValidationSchema } from '@zamio/ui-theme';

<ValidatedInput
  name="username"
  label="Username"
  validationSchema={createValidationSchema.text(true, 3, 20)}
  placeholder="Enter username"
/>
```

### 4. Form-Level Validation

#### ValidatedForm with FormField Components

```typescript
import { 
  ValidatedForm, 
  EmailFormField, 
  NumericFormField, 
  FormField,
  createValidationSchema 
} from '@zamio/ui-theme';

function MyForm() {
  const validationSchema = {
    email: createValidationSchema.email(true),
    amount: createValidationSchema.numeric(true, 0, 1000),
    name: createValidationSchema.text(true, 2, 50)
  };

  const handleSubmit = (values: Record<string, any>, isValid: boolean) => {
    if (isValid) {
      console.log('Form data:', values);
      // Submit to API
    } else {
      console.log('Form has errors');
    }
  };

  return (
    <ValidatedForm
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
      className="space-y-4"
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
        allowDecimals
        decimalPlaces={2}
      />
      
      <Button type="submit">Submit</Button>
    </ValidatedForm>
  );
}
```

#### Using Form Context

```typescript
import { useValidatedForm } from '@zamio/ui-theme';

function CustomFormField() {
  const { errors, validateField, clearFieldError } = useValidatedForm();
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    validateField(name, value);
  };

  return (
    <div>
      <input name="custom" onChange={handleChange} />
      {errors.custom && <span className="error">{errors.custom}</span>}
    </div>
  );
}
```

## Advanced Usage

### Custom Validation Rules

```typescript
import { ValidationRule, ValidationSchema } from '@zamio/ui-theme';

const customPasswordRule: ValidationRule = {
  validator: (value: string) => {
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(value);
  },
  message: 'Password must contain at least 8 characters, including uppercase, lowercase, number, and special character'
};

const passwordSchema: ValidationSchema[string] = {
  required: true,
  rules: [customPasswordRule]
};
```

### Conditional Validation

```typescript
const createConditionalSchema = (isRequired: boolean) => ({
  email: createValidationSchema.email(isRequired),
  phone: createValidationSchema.phone(!isRequired) // Phone required if email not required
});
```

### Server-Side Validation Integration

```typescript
function MyForm() {
  const validation = useFormValidation({ schema });

  const handleSubmit = async (values, isValid) => {
    if (!isValid) return;

    try {
      await submitToAPI(values);
    } catch (error) {
      // Handle server validation errors
      if (error.fieldErrors) {
        Object.entries(error.fieldErrors).forEach(([field, message]) => {
          validation.setFieldError(field, message);
        });
      }
    }
  };
}
```

## Best Practices

1. **Use Form-Level Validation**: Prefer `ValidatedForm` with `FormField` components for complex forms
2. **Standalone for Simple Cases**: Use standalone components like `EmailInput` for simple, isolated inputs
3. **Consistent Error Handling**: Always display validation errors to users
4. **Real-Time Feedback**: Enable `validateOnChange` and `validateOnBlur` for better UX
5. **Server Integration**: Use `setFieldError` to display server-side validation errors
6. **Type Safety**: Always use TypeScript interfaces for form data

## Requirements Satisfied

This implementation satisfies the following requirements from the platform improvements spec:

- ✅ **4.1**: Numeric fields only accept numeric input
- ✅ **4.2**: Email fields validate email format
- ✅ **4.3**: Required fields show validation errors when empty
- ✅ **4.4**: Invalid data shows specific error messages
- ✅ **4.5**: Form submission only allowed when validation passes

## Integration with ZamIO Applications

The validation framework is designed to be used across all ZamIO frontend applications:

- `zamio_frontend` - Artist portal forms
- `zamio_admin` - Admin dashboard forms  
- `zamio_stations` - Station management forms
- `zamio_publisher` - Publisher portal forms

Import the components and utilities from the shared ui-theme package:

```typescript
import { 
  ValidatedForm, 
  EmailFormField, 
  NumericFormField,
  createValidationSchema 
} from '@zamio/ui-theme';
```