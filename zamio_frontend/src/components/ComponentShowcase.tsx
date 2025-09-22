import React, { useState } from 'react';
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Badge,
  Alert,
  AlertTitle,
  AlertDescription,
  Icon,
  EnhancedInput,
  Textarea,
  EnhancedSelect,
  Checkbox,
  RadioGroup,
  LineChart,
  BarChart,
  PieChart,
  DoughnutChart,
  generateChartData,
  chartColors,
  Loading,
  Spinner,
  Skeleton,
  LoadingOverlay,
  Progress,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ConfirmModal,
  useToastHelpers,
} from './ui';
import { useTheme } from '../contexts/ThemeContext';

const ComponentShowcase: React.FC = () => {
  const { mode, toggleTheme } = useTheme();
  const toast = useToastHelpers();
  
  // State for interactive components
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(45);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
    category: '',
    notifications: false,
    theme: 'light',
  });

  // Sample chart data
  const lineChartData = generateChartData(
    ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    [
      { label: 'Royalties', data: [1200, 1900, 3000, 5000, 2000, 3000] },
      { label: 'Plays', data: [800, 1200, 2000, 3200, 1500, 2200] },
    ]
  );

  const barChartData = generateChartData(
    ['Rock', 'Pop', 'Hip Hop', 'Jazz', 'Electronic'],
    [{ label: 'Plays by Genre', data: [65, 59, 80, 81, 56] }]
  );

  const pieChartData = {
    labels: ['Direct', 'Publisher', 'PRO', 'Other'],
    datasets: [{
      data: [45, 30, 20, 5],
      backgroundColor: chartColors.primary.slice(0, 4),
    }],
  };

  const selectOptions = [
    { value: 'music', label: 'Music' },
    { value: 'royalties', label: 'Royalties' },
    { value: 'technical', label: 'Technical Support' },
    { value: 'billing', label: 'Billing' },
  ];

  const radioOptions = [
    { value: 'light', label: 'Light Theme', description: 'Clean and bright interface' },
    { value: 'dark', label: 'Dark Theme', description: 'Easy on the eyes' },
    { value: 'auto', label: 'Auto', description: 'Follow system preference' },
  ];

  const handleLoadingDemo = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 3000);
  };

  const handleProgressDemo = () => {
    setProgress(0);
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  return (
    <div className="min-h-screen bg-background dark:bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-text dark:text-text">
            ZamIO Component Library
          </h1>
          <p className="text-lg text-text-secondary dark:text-text-secondary">
            Comprehensive UI components with theme support and accessibility
          </p>
          <div className="flex items-center justify-center space-x-4">
            <Button onClick={toggleTheme} leftIcon={<Icon name={mode === 'light' ? 'hide' : 'view'} />}>
              Switch to {mode === 'light' ? 'Dark' : 'Light'} Mode
            </Button>
            <Badge variant={mode === 'light' ? 'default' : 'secondary'}>
              Current: {mode} mode
            </Badge>
          </div>
        </div>

        {/* Buttons Section */}
        <Card>
          <CardHeader>
            <CardTitle>Buttons & Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-3">
              <Button variant="default">Default</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="success">Success</Button>
              <Button variant="warning">Warning</Button>
              <Button variant="destructive">Destructive</Button>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <Button size="sm" leftIcon={<Icon name="plus" />}>Small</Button>
              <Button size="default" leftIcon={<Icon name="edit" />}>Default</Button>
              <Button size="lg" rightIcon={<Icon name="arrow-right" />}>Large</Button>
              <Button size="xl" leftIcon={<Icon name="upload" />}>Extra Large</Button>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button loading>Loading</Button>
              <Button disabled>Disabled</Button>
              <Button variant="outline" leftIcon={<Icon name="download" />}>
                With Icon
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Icons Section */}
        <Card>
          <CardHeader>
            <CardTitle>Icon System</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-8 gap-4">
              {[
                'home', 'user', 'settings', 'bell', 'search', 'plus', 'edit', 'delete',
                'play', 'pause', 'music', 'radio', 'dollar', 'chart-bar', 'email', 'phone',
                'success', 'error', 'warning', 'info', 'users', 'lock', 'calendar', 'globe'
              ].map((iconName) => (
                <div key={iconName} className="flex flex-col items-center space-y-2 p-3 rounded-lg border border-border dark:border-border">
                  <Icon name={iconName as any} size="lg" />
                  <span className="text-xs text-text-secondary dark:text-text-secondary">{iconName}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Forms Section */}
        <Card>
          <CardHeader>
            <CardTitle>Form Components</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <EnhancedInput
                  label="Full Name"
                  placeholder="Enter your name"
                  leftIcon="user"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
                
                <EnhancedInput
                  label="Email Address"
                  type="email"
                  placeholder="Enter your email"
                  leftIcon="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  helperText="We'll never share your email"
                />
                
                <EnhancedInput
                  label="Password"
                  type="password"
                  placeholder="Enter password"
                  leftIcon="lock"
                />
              </div>
              
              <div className="space-y-4">
                <EnhancedSelect
                  label="Category"
                  placeholder="Select a category"
                  options={selectOptions}
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                />
                
                <Textarea
                  label="Message"
                  placeholder="Enter your message"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  helperText="Maximum 500 characters"
                />
                
                <Checkbox
                  label="Email Notifications"
                  description="Receive updates about your account"
                  checked={formData.notifications}
                  onChange={(e) => setFormData({ ...formData, notifications: e.target.checked })}
                />
              </div>
            </div>
            
            <RadioGroup
              name="theme-preference"
              label="Theme Preference"
              options={radioOptions}
              value={formData.theme}
              onChange={(value) => setFormData({ ...formData, theme: value })}
            />
          </CardContent>
        </Card>

        {/* Charts Section */}
        <Card>
          <CardHeader>
            <CardTitle>Data Visualization</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-medium mb-4 text-text dark:text-text">Revenue Trends</h3>
                <LineChart data={lineChartData} height={250} />
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-4 text-text dark:text-text">Plays by Genre</h3>
                <BarChart data={barChartData} height={250} />
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-4 text-text dark:text-text">Revenue Sources</h3>
                <PieChart data={pieChartData} height={250} />
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-4 text-text dark:text-text">Distribution</h3>
                <DoughnutChart 
                  data={pieChartData} 
                  height={250} 
                  centerText="Total: 100%"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Loading & Progress Section */}
        <Card>
          <CardHeader>
            <CardTitle>Loading & Progress</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-4">
                <h4 className="font-medium text-text dark:text-text">Spinners</h4>
                <div className="flex items-center space-x-4">
                  <Spinner size="sm" />
                  <Spinner size="md" />
                  <Spinner size="lg" />
                  <Spinner size="xl" />
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-medium text-text dark:text-text">Loading States</h4>
                <LoadingOverlay loading={loading}>
                  <div className="h-24 bg-surface dark:bg-surface rounded-lg flex items-center justify-center">
                    <p className="text-text-secondary dark:text-text-secondary">Content Area</p>
                  </div>
                </LoadingOverlay>
                <Button onClick={handleLoadingDemo} size="sm">
                  Demo Loading
                </Button>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-medium text-text dark:text-text">Progress</h4>
                <Progress value={progress} showLabel />
                <Button onClick={handleProgressDemo} size="sm">
                  Demo Progress
                </Button>
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-medium text-text dark:text-text">Skeleton Loading</h4>
              <div className="space-y-3">
                <Skeleton width="60%" height="1.5rem" />
                <Skeleton lines={3} />
                <div className="flex items-center space-x-3">
                  <Skeleton width="3rem" height="3rem" rounded />
                  <div className="flex-1">
                    <Skeleton width="40%" height="1rem" />
                    <Skeleton width="60%" height="0.875rem" className="mt-2" />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Alerts & Badges Section */}
        <Card>
          <CardHeader>
            <CardTitle>Alerts & Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Alert variant="default">
                <AlertTitle>Information</AlertTitle>
                <AlertDescription>
                  This is a general information alert.
                </AlertDescription>
              </Alert>
              
              <Alert variant="success">
                <AlertTitle>Success</AlertTitle>
                <AlertDescription>
                  Your action was completed successfully.
                </AlertDescription>
              </Alert>
              
              <Alert variant="warning">
                <AlertTitle>Warning</AlertTitle>
                <AlertDescription>
                  Please review this information carefully.
                </AlertDescription>
              </Alert>
              
              <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                  Something went wrong. Please try again.
                </AlertDescription>
              </Alert>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium text-text dark:text-text">Badges</h4>
              <div className="flex flex-wrap gap-2">
                <Badge variant="default">Default</Badge>
                <Badge variant="secondary">Secondary</Badge>
                <Badge variant="outline">Outline</Badge>
                <Badge variant="success">Success</Badge>
                <Badge variant="warning">Warning</Badge>
                <Badge variant="destructive">Error</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Modals & Toasts Section */}
        <Card>
          <CardHeader>
            <CardTitle>Modals & Notifications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-3">
              <Button onClick={() => setModalOpen(true)}>
                Open Modal
              </Button>
              <Button onClick={() => setConfirmModalOpen(true)} variant="destructive">
                Confirm Action
              </Button>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium text-text dark:text-text">Toast Notifications</h4>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" onClick={() => toast.success('Success message!')}>
                  Success Toast
                </Button>
                <Button size="sm" onClick={() => toast.error('Error message!')}>
                  Error Toast
                </Button>
                <Button size="sm" onClick={() => toast.warning('Warning message!')}>
                  Warning Toast
                </Button>
                <Button size="sm" onClick={() => toast.info('Info message!')}>
                  Info Toast
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Modals */}
        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title="Example Modal"
          description="This is a demonstration of the modal component"
          size="lg"
        >
          <div className="space-y-4">
            <p className="text-text dark:text-text">
              This modal demonstrates the component's capabilities including proper focus management,
              keyboard navigation, and theme support.
            </p>
            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setModalOpen(false)}>
                Confirm
              </Button>
            </div>
          </div>
        </Modal>

        <ConfirmModal
          isOpen={confirmModalOpen}
          onClose={() => setConfirmModalOpen(false)}
          onConfirm={() => {
            toast.success('Action confirmed!');
            setConfirmModalOpen(false);
          }}
          title="Confirm Deletion"
          message="Are you sure you want to delete this item? This action cannot be undone."
          variant="destructive"
          confirmText="Delete"
        />
      </div>
    </div>
  );
};

export default ComponentShowcase;