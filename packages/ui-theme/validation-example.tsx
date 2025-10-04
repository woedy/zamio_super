import React, { useState } from 'react';
import { ThemeProvider } from './src/providers/ThemeProvider';
import { Button } from './src/components/Button';
import { Card } from './src/components/Card';
import { ValidatedForm } from './src/components/ValidatedForm';
import { EmailFormField } from './src/components/EmailFormField';
import { NumericFormField } from './src/components/NumericFormField';
import { FormField } from './src/components/FormField';
import { EmailInput } from './src/components/EmailInput';
import { NumericInput } from './src/components/NumericInput';
import { createValidationSchema } from './src/utils/validation';

function ValidationExample() {
  const [formData, setFormData] = useState<Record<string, any>>({});

  // Example validation schema for the form
  const validationSchema = {
    email: createValidationSchema.email(true),
    amount: createValidationSchema.numeric(true, 0, 10000),
    name: createValidationSchema.text(true, 2, 50),
    phone: createValidationSchema.phone(false)
  };

  const handleFormSubmit = (values: Record<string, any>, isValid: boolean) => {
    console.log('Form submitted:', { values, isValid });
    if (isValid) {
      setFormData(values);
      alert('Form is valid! Check console for values.');
    } else {
      alert('Form has validation errors. Please fix them.');
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Basic Input Examples */}
        <Card className="p-6">
          <h1 className="text-2xl font-bold text-text mb-4">Input Validation Framework</h1>
          
          <div className="space-y-4">
            <EmailInput
              label="Email Input (Standalone)"
              required
              placeholder="Enter your email"
            />
            
            <NumericInput
              label="Numeric Input (Standalone)"
              required
              min={0}
              max={100}
              placeholder="Enter a number (0-100)"
            />
          </div>
        </Card>

        {/* Validated Form Example */}
        <Card className="p-6">
          <h2 className="text-xl font-bold text-text mb-4">Validated Form Example</h2>
          
          <ValidatedForm
            validationSchema={validationSchema}
            onSubmit={handleFormSubmit}
            className="space-y-4"
          >
            <EmailFormField
              name="email"
              label="Email Address"
              required
              placeholder="Enter your email address"
            />
            
            <FormField
              name="name"
              label="Full Name"
              validationSchema={createValidationSchema.text(true, 2, 50)}
              placeholder="Enter your full name"
            />
            
            <NumericFormField
              name="amount"
              label="Amount"
              required
              min={0}
              max={10000}
              allowDecimals
              decimalPlaces={2}
              placeholder="Enter amount (0-10000)"
            />
            
            <FormField
              name="phone"
              label="Phone Number (Optional)"
              validationSchema={createValidationSchema.phone(false)}
              placeholder="Enter your phone number"
            />
            
            <Button type="submit" className="w-full">
              Submit Form
            </Button>
          </ValidatedForm>
        </Card>

        {/* Form Data Display */}
        {Object.keys(formData).length > 0 && (
          <Card className="p-6">
            <h3 className="text-lg font-bold text-text mb-4">Last Submitted Data:</h3>
            <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded text-sm overflow-auto">
              {JSON.stringify(formData, null, 2)}
            </pre>
          </Card>
        )}
      </div>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <ValidationExample />
    </ThemeProvider>
  );
}

export default App;