import React from 'react';
import {
  ThemeProvider,
  Button,
  Card,
  Input,
  Badge,
  Alert,
  ThemeToggle,
  StandardIcon,
} from '@zamio/ui-theme';

const SharedPackageTest: React.FC = () => {
  return (
    <ThemeProvider>
      <div className="p-8 space-y-6">
        <h1 className="text-3xl font-bold mb-6">Shared Package Test - zamio_publisher</h1>
        
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Theme Components</h2>
          <div className="flex items-center gap-4 mb-4">
            <span>Theme Toggle:</span>
            <ThemeToggle />
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Button Components</h2>
          <div className="flex gap-4 flex-wrap">
            <Button variant="primary">Primary Button</Button>
            <Button variant="secondary">Secondary Button</Button>
            <Button variant="outline">Outline Button</Button>
            <Button variant="ghost">Ghost Button</Button>
            <Button variant="danger">Danger Button</Button>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Input Component</h2>
          <Input placeholder="Test input from shared package" />
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Badge Components</h2>
          <div className="flex gap-4 flex-wrap">
            <Badge variant="success">Success</Badge>
            <Badge variant="warning">Warning</Badge>
            <Badge variant="error">Error</Badge>
            <Badge variant="info">Info</Badge>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Alert Components</h2>
          <div className="space-y-4">
            <Alert variant="success">This is a success alert from @zamio/ui-theme</Alert>
            <Alert variant="warning">This is a warning alert from @zamio/ui-theme</Alert>
            <Alert variant="error">This is an error alert from @zamio/ui-theme</Alert>
            <Alert variant="info">This is an info alert from @zamio/ui-theme</Alert>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Icon Components</h2>
          <div className="flex gap-4 flex-wrap items-center">
            <StandardIcon name="dashboard" size={24} />
            <StandardIcon name="profile" size={24} />
            <StandardIcon name="settings" size={24} />
            <StandardIcon name="music" size={24} />
            <StandardIcon name="analytics" size={24} />
          </div>
        </Card>

        <div className="mt-8 p-4 bg-green-100 dark:bg-green-900 rounded-lg">
          <p className="text-green-800 dark:text-green-200 font-semibold">
            ✅ If you can see this page with all components rendered correctly, 
            the shared package @zamio/ui-theme is working properly!
          </p>
        </div>
      </div>
    </ThemeProvider>
  );
};

export default SharedPackageTest;
