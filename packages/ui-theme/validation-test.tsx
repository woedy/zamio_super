import React, { useState } from 'react';
import { ThemeProvider } from './src/providers/ThemeProvider';
import { Button } from './src/components/Button';
import { Card } from './src/components/Card';
import { ValidatedForm } from './src/components/ValidatedForm';
import { EmailFormField } from './src/components/EmailFormField';
import { NumericFormField } from './src/components/NumericFormField';
import { FormField } from './src/components/FormField';
import { createValidationSchema, validators } from './src/utils/validation';

function ValidationTest() {
  const [results, setResults] = useState<string[]>([]);

  const addResult = (message: string) => {
    setResults(prev => [...prev, message]);
  };

  // Test individual validators
  const testValidators = () => {
    addResult('=== Testing Individual Validators ===');
    
    // Email validation tests
    addResult(`Email 'test@example.com': ${validators.email('test@example.com') ? 'PASS' : 'FAIL'}`);
    addResult(`Email 'invalid-email': ${validators.email('invalid-email') ? 'FAIL' : 'PASS'}`);
    addResult(`Email empty string: ${validators.email('') ? 'PASS' : 'FAIL'} (should pass for optional)`);
    
    // Numeric validation tests
    addResult(`Numeric '123': ${validators.numeric('123') ? 'PASS' : 'FAIL'}`);
    addResult(`Numeric '123.45': ${validators.numeric('123.45') ? 'PASS' : 'FAIL'}`);
    addResult(`Numeric 'abc': ${validators.numeric('abc') ? 'FAIL' : 'PASS'}`);
    
    // Required validation tests
    addResult(`Required 'test': ${validators.required('test') ? 'PASS' : 'FAIL'}`);
    addResult(`Required '': ${validators.required('') ? 'FAIL' : 'PASS'}`);
    addResult(`Required '   ': ${validators.required('   ') ? 'FAIL' : 'PASS'}`);
    
    // Min/Max length tests
    const minLength3 = validators.minLength(3);
    addResult(`MinLength(3) 'test': ${minLength3('test') ? 'PASS' : 'FAIL'}`);
    addResult(`MinLength(3) 'ab': ${minLength3('ab') ? 'FAIL' : 'PASS'}`);
    
    // Min/Max value tests
    const minValue10 = validators.minValue(10);
    addResult(`MinValue(10) '15': ${minValue10('15') ? 'PASS' : 'FAIL'}`);
    addResult(`MinValue(10) '5': ${minValue10('5') ? 'FAIL' : 'PASS'}`);
  };

  // Test validation schemas
  const testSchemas = () => {
    addResult('=== Testing Validation Schemas ===');
    
    const emailSchema = createValidationSchema.email(true);
    const numericSchema = createValidationSchema.numeric(true, 0, 100);
    const textSchema = createValidationSchema.text(true, 2, 50);
    
    addResult(`Email schema created: ${emailSchema ? 'PASS' : 'FAIL'}`);
    addResult(`Numeric schema created: ${numericSchema ? 'PASS' : 'FAIL'}`);
    addResult(`Text schema created: ${textSchema ? 'PASS' : 'FAIL'}`);
  };

  const validationSchema = {
    email: createValidationSchema.email(true),
    amount: createValidationSchema.numeric(true, 0, 1000),
    name: createValidationSchema.text(true, 2, 50),
  };

  const handleFormSubmit = (values: Record<string, any>, isValid: boolean) => {
    addResult('=== Form Submission Test ===');
    addResult(`Form valid: ${isValid ? 'PASS' : 'FAIL'}`);
    addResult(`Values: ${JSON.stringify(values)}`);
  };

  const runAllTests = () => {
    setResults([]);
    testValidators();
    testSchemas();
    addResult('=== All tests completed ===');
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card className="p-6">
          <h1 className="text-2xl font-bold text-text mb-4">Input Validation Framework Test</h1>
          
          <div className="space-y-4">
            <Button onClick={runAllTests} variant="primary">
              Run Validation Tests
            </Button>
            
            {results.length > 0 && (
              <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded">
                <h3 className="font-bold mb-2">Test Results:</h3>
                <div className="space-y-1 text-sm font-mono">
                  {results.map((result, index) => (
                    <div key={index} className={
                      result.includes('PASS') ? 'text-green-600' :
                      result.includes('FAIL') ? 'text-red-600' :
                      result.includes('===') ? 'text-blue-600 font-bold' :
                      'text-gray-600'
                    }>
                      {result}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-bold text-text mb-4">Interactive Form Test</h2>
          
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
              max={1000}
              allowDecimals
              decimalPlaces={2}
              placeholder="Enter amount (0-1000)"
            />
            
            <Button type="submit" className="w-full">
              Test Form Submission
            </Button>
          </ValidatedForm>
        </Card>
      </div>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <ValidationTest />
    </ThemeProvider>
  );
}

export default App;