import React from 'react';
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Icon,
  EnhancedInput,
  useToastHelpers,
} from './ui';

const ComponentTest: React.FC = () => {
  const toast = useToastHelpers();

  return (
    <div className="p-8 space-y-6 bg-background dark:bg-background min-h-screen">
      <Card>
        <CardHeader>
          <CardTitle>Component Library Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4">
            <Button onClick={() => toast.success('Success!')}>
              <Icon name="check" className="mr-2" />
              Test Success Toast
            </Button>
            <Button variant="destructive" onClick={() => toast.error('Error!')}>
              <Icon name="error" className="mr-2" />
              Test Error Toast
            </Button>
          </div>
          
          <EnhancedInput
            label="Test Input"
            placeholder="Enter some text"
            leftIcon="user"
            helperText="This is a test input with icon"
          />
          
          <div className="flex items-center space-x-2">
            <Icon name="music" size="lg" color="primary" />
            <Icon name="radio" size="lg" color="secondary" />
            <Icon name="chart-bar" size="lg" color="success" />
            <Icon name="dollar" size="lg" color="warning" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ComponentTest;