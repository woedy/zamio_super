import React, { useState } from 'react';
import { ThemeProvider, CodeInput, Card, CardHeader, CardTitle, CardContent, Button, Alert } from './src';

function CodeInputDemo() {
  const [code, setCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleCodeComplete = async (enteredCode: string) => {
    setIsVerifying(true);
    setError('');
    
    // Simulate API call
    setTimeout(() => {
      if (enteredCode === '1234') {
        setSuccess(true);
        setError('');
      } else {
        setError('Invalid verification code. Please try again.');
        setSuccess(false);
      }
      setIsVerifying(false);
    }, 1500);
  };

  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
    setError('');
    setSuccess(false);
  };

  const resetDemo = () => {
    setCode('');
    setError('');
    setSuccess(false);
    setIsVerifying(false);
  };

  return (
    <div className="min-h-screen bg-background text-text p-6">
      <div className="max-w-md mx-auto space-y-6">
        <h1 className="text-title-lg font-bold text-center">CodeInput Component Demo</h1>
        
        <Alert variant="info" title="Demo Instructions">
          Enter "1234" to simulate successful verification, or any other 4-digit code to see error handling.
        </Alert>

        <Card>
          <CardHeader>
            <CardTitle>Email Verification</CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <p className="text-sm text-text-secondary text-center">
              Enter the 4-digit verification code sent to your email
            </p>
            
            <CodeInput
              label="Verification Code"
              helperText="Enter the 4-digit code from your email"
              onCodeComplete={handleCodeComplete}
              onCodeChange={handleCodeChange}
              error={error}
              loading={isVerifying}
              autoFocus={true}
            />

            {success && (
              <Alert variant="success" title="Success!">
                Email verified successfully!
              </Alert>
            )}

            <div className="text-center">
              <Button variant="outline" onClick={resetDemo}>
                Reset Demo
              </Button>
            </div>

            <div className="text-xs text-text-secondary space-y-1">
              <p><strong>Features demonstrated:</strong></p>
              <ul className="list-disc list-inside space-y-1">
                <li>Auto-focus on first input</li>
                <li>Auto-advance between fields</li>
                <li>Backspace navigation</li>
                <li>Arrow key navigation</li>
                <li>Paste support (try pasting "1234")</li>
                <li>Auto-submit when complete</li>
                <li>Error handling with field clearing</li>
                <li>Loading state</li>
                <li>Accessibility features</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="zamio-code-input-demo">
      <CodeInputDemo />
    </ThemeProvider>
  );
}

export default App;