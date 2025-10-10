import React, { useState } from 'react';
import {
  ThemeProvider,
  useTheme,
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
  Input,
  Select,
  Textarea,
  Checkbox,
  Switch,
  Badge,
  Alert,
  Modal,
  Spinner,
} from './src';

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <Button onClick={toggleTheme} variant="outline">
      {theme === 'light' ? '🌙' : '☀️'} Toggle Theme
    </Button>
  );
}

function ExampleForm() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    country: '',
    message: '',
    newsletter: false,
    notifications: true,
  });

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-title-lg font-bold">ZamIO UI Theme Example</h1>
        <ThemeToggle />
      </div>

      <Alert variant="info" title="Welcome!">
        This is an example of the ZamIO UI theme package components.
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>User Profile Form</CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <Input
            label="Full Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Enter your full name"
          />

          <Input
            label="Email Address"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="Enter your email"
            helperText="We'll never share your email with anyone else."
          />

          <Select
            label="Country"
            value={formData.country}
            onChange={(e) => setFormData({ ...formData, country: e.target.value })}
            options={[
              { value: '', label: 'Select a country' },
              { value: 'us', label: 'United States' },
              { value: 'ca', label: 'Canada' },
              { value: 'uk', label: 'United Kingdom' },
              { value: 'au', label: 'Australia' },
            ]}
          />

          <Textarea
            label="Message"
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            placeholder="Tell us about yourself..."
            rows={4}
          />

          <div className="space-y-3">
            <Checkbox
              label="Subscribe to newsletter"
              description="Get updates about new features and releases"
              checked={formData.newsletter}
              onChange={(e) => setFormData({ ...formData, newsletter: e.target.checked })}
            />

            <Switch
              label="Push notifications"
              description="Receive notifications on your device"
              checked={formData.notifications}
              onChange={(e) => setFormData({ ...formData, notifications: e.target.checked })}
            />
          </div>
        </CardContent>

        <CardFooter className="space-x-3">
          <Button variant="outline" onClick={() => setIsModalOpen(true)}>
            Preview
          </Button>
          <Button variant="primary">
            Save Profile
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Component Showcase</CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div>
            <h3 className="text-title-xsm font-medium mb-2">Badges</h3>
            <div className="flex flex-wrap gap-2">
              <Badge variant="primary">Primary</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="success">Success</Badge>
              <Badge variant="warning">Warning</Badge>
              <Badge variant="error">Error</Badge>
              <Badge variant="info">Info</Badge>
            </div>
          </div>

          <div>
            <h3 className="text-title-xsm font-medium mb-2">Buttons</h3>
            <div className="flex flex-wrap gap-2">
              <Button variant="primary" size="sm">Primary</Button>
              <Button variant="secondary" size="md">Secondary</Button>
              <Button variant="outline" size="lg">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="danger">Danger</Button>
              <Button loading>Loading</Button>
            </div>
          </div>

          <div>
            <h3 className="text-title-xsm font-medium mb-2">Spinners</h3>
            <div className="flex items-center gap-4">
              <Spinner size="sm" />
              <Spinner size="md" />
              <Spinner size="lg" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Profile Preview"
        size="md"
      >
        <div className="space-y-3">
          <p><strong>Name:</strong> {formData.name || 'Not provided'}</p>
          <p><strong>Email:</strong> {formData.email || 'Not provided'}</p>
          <p><strong>Country:</strong> {formData.country || 'Not selected'}</p>
          <p><strong>Message:</strong> {formData.message || 'No message'}</p>
          <p><strong>Newsletter:</strong> {formData.newsletter ? 'Yes' : 'No'}</p>
          <p><strong>Notifications:</strong> {formData.notifications ? 'Enabled' : 'Disabled'}</p>
        </div>
        
        <div className="flex justify-end space-x-3 mt-6">
          <Button variant="outline" onClick={() => setIsModalOpen(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={() => setIsModalOpen(false)}>
            Confirm
          </Button>
        </div>
      </Modal>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="zamio-theme-example">
      <div className="min-h-screen bg-background text-text">
        <ExampleForm />
      </div>
    </ThemeProvider>
  );
}

export default App;