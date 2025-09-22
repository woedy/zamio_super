import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { cn } from '../../utils/cn';

export interface ChartContainerProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  description?: string;
}

export const ChartContainer: React.FC<ChartContainerProps> = ({
  children,
  className,
  title,
  description,
}) => {
  const { theme } = useTheme();

  return (
    <div className={cn(
      'rounded-lg border border-border bg-surface p-6 shadow-sm dark:border-border dark:bg-surface',
      className
    )}>
      {(title || description) && (
        <div className="mb-4">
          {title && (
            <h3 className="text-lg font-semibold text-text dark:text-text">
              {title}
            </h3>
          )}
          {description && (
            <p className="text-sm text-text-secondary dark:text-text-secondary mt-1">
              {description}
            </p>
          )}
        </div>
      )}
      <div className="chart-container">
        {children}
      </div>
    </div>
  );
};

// Theme-aware chart colors
export const getChartColors = (mode: 'light' | 'dark') => {
  if (mode === 'dark') {
    return {
      primary: '#AA00BA',
      secondary: '#80CAEE',
      success: '#10B981',
      warning: '#FFBA00',
      error: '#FF6766',
      info: '#259AE6',
      text: '#FFFFFF',
      textSecondary: '#AEB7C0',
      background: '#0b1220',
      surface: '#1A222C',
      border: '#2E3A47',
      grid: '#2E3A47',
      series: [
        '#AA00BA',
        '#80CAEE',
        '#10B981',
        '#FFBA00',
        '#FF6766',
        '#259AE6',
        '#E30090',
        '#007256',
        '#F0EC04',
        '#310e0e66',
      ],
    };
  }

  return {
    primary: '#14002C',
    secondary: '#80CAEE',
    success: '#219653',
    warning: '#FFA70B',
    error: '#D34053',
    info: '#259AE6',
    text: '#1C2434',
    textSecondary: '#64748B',
    background: '#FFFFFF',
    surface: '#F8FAFC',
    border: '#E2E8F0',
    grid: '#E2E8F0',
    series: [
      '#14002C',
      '#80CAEE',
      '#219653',
      '#FFA70B',
      '#D34053',
      '#259AE6',
      '#E30090',
      '#007256',
      '#F0EC04',
      '#AA00BA',
    ],
  };
};

// ApexCharts theme configuration
export const getApexChartsTheme = (mode: 'light' | 'dark') => {
  const colors = getChartColors(mode);
  
  return {
    theme: {
      mode: mode,
      palette: 'palette1',
    },
    chart: {
      background: 'transparent',
      foreColor: colors.text,
      fontFamily: 'Satoshi, sans-serif',
      toolbar: {
        theme: mode,
      },
    },
    colors: colors.series,
    grid: {
      borderColor: colors.grid,
    },
    xaxis: {
      axisBorder: {
        color: colors.border,
      },
      axisTicks: {
        color: colors.border,
      },
      labels: {
        style: {
          colors: colors.textSecondary,
        },
      },
    },
    yaxis: {
      labels: {
        style: {
          colors: colors.textSecondary,
        },
      },
    },
    legend: {
      labels: {
        colors: colors.text,
      },
    },
    tooltip: {
      theme: mode,
    },
    dataLabels: {
      style: {
        colors: [colors.text],
      },
    },
  };
};

// Chart.js theme configuration
export const getChartJsTheme = (mode: 'light' | 'dark') => {
  const colors = getChartColors(mode);
  
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: colors.text,
          font: {
            family: 'Satoshi, sans-serif',
          },
        },
      },
      tooltip: {
        backgroundColor: colors.surface,
        titleColor: colors.text,
        bodyColor: colors.text,
        borderColor: colors.border,
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        grid: {
          color: colors.grid,
        },
        ticks: {
          color: colors.textSecondary,
          font: {
            family: 'Satoshi, sans-serif',
          },
        },
      },
      y: {
        grid: {
          color: colors.grid,
        },
        ticks: {
          color: colors.textSecondary,
          font: {
            family: 'Satoshi, sans-serif',
          },
        },
      },
    },
  };
};

// Recharts theme configuration
export const getRechartsTheme = (mode: 'light' | 'dark') => {
  const colors = getChartColors(mode);
  
  return {
    colors: colors.series,
    text: colors.text,
    textSecondary: colors.textSecondary,
    grid: colors.grid,
    background: colors.background,
    surface: colors.surface,
  };
};