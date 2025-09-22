import React from 'react';
import { CheckIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { useTheme } from '../../contexts/ThemeContext';

interface ProgressItem {
  id: string;
  label: string;
  isCompleted: boolean;
  isRequired: boolean;
  hasError?: boolean;
  errorMessage?: string;
}

interface ProgressIndicatorProps {
  items: ProgressItem[];
  title?: string;
  className?: string;
}

const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  items,
  title = "Profile Completion",
  className = "",
}) => {
  const { theme } = useTheme();
  
  const completedCount = items.filter(item => item.isCompleted).length;
  const totalCount = items.length;
  const progressPercentage = (completedCount / totalCount) * 100;

  return (
    <div className={`p-6 rounded-lg border ${className}`} 
         style={{ 
           backgroundColor: theme.colors.surface, 
           borderColor: theme.colors.border 
         }}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold" style={{ color: theme.colors.text }}>
          {title}
        </h3>
        <span className="text-sm font-medium" style={{ color: theme.colors.textSecondary }}>
          {completedCount}/{totalCount} completed
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
        <div
          className="h-2 rounded-full transition-all duration-300"
          style={{ 
            backgroundColor: theme.colors.primary,
            width: `${progressPercentage}%`
          }}
        />
      </div>

      {/* Progress Items */}
      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.id} className="flex items-start space-x-3">
            <div className="flex-shrink-0 mt-0.5">
              {item.isCompleted ? (
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: theme.colors.success }}
                >
                  <CheckIcon className="w-3 h-3 text-white" />
                </div>
              ) : item.hasError ? (
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: theme.colors.error }}
                >
                  <ExclamationTriangleIcon className="w-3 h-3 text-white" />
                </div>
              ) : (
                <div
                  className="w-5 h-5 rounded-full border-2"
                  style={{ borderColor: theme.colors.border }}
                />
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <p
                  className={`text-sm font-medium ${
                    item.isCompleted ? '' : 'opacity-70'
                  }`}
                  style={{ color: theme.colors.text }}
                >
                  {item.label}
                </p>
                {item.isRequired && !item.isCompleted && (
                  <span
                    className="text-xs px-2 py-0.5 rounded-full"
                    style={{ 
                      backgroundColor: theme.colors.error + '20',
                      color: theme.colors.error 
                    }}
                  >
                    Required
                  </span>
                )}
              </div>
              
              {item.hasError && item.errorMessage && (
                <p className="text-xs mt-1" style={{ color: theme.colors.error }}>
                  {item.errorMessage}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Completion Status */}
      {completedCount === totalCount && (
        <div
          className="mt-4 p-3 rounded-lg flex items-center space-x-2"
          style={{ backgroundColor: theme.colors.success + '20' }}
        >
          <CheckIcon className="w-5 h-5" style={{ color: theme.colors.success }} />
          <span className="text-sm font-medium" style={{ color: theme.colors.success }}>
            Profile setup complete! You're ready to start using ZamIO.
          </span>
        </div>
      )}
    </div>
  );
};

export default ProgressIndicator;