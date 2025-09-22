import React from 'react';
import {
  ResponsiveContainer,
  BarChart as RBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { useTheme } from '../../contexts/ThemeContext';
import { getRechartsTheme } from '../charts/ChartContainer';

interface BarChartProps {
  data: Array<{
    name: string;
    [key: string]: string | number;
  }>;
  bars: Array<{
    key: string;
    name: string;
    color?: string;
  }>;
  height?: number;
  horizontal?: boolean;
  loading?: boolean;
}

export const BarChart: React.FC<BarChartProps> = ({
  data,
  bars,
  height = 300,
  horizontal = false,
  loading = false,
}) => {
  const { theme } = useTheme();
  const chartTheme = getRechartsTheme(theme);

  if (loading) {
    return (
      <div 
        className="flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse"
        style={{ height }}
      >
        <div className="text-gray-400 dark:text-gray-600">Loading chart...</div>
      </div>
    );
  }

  const formatTooltipValue = (value: any, name: string) => {
    if (typeof value === 'number') {
      if (name.toLowerCase().includes('revenue') || name.toLowerCase().includes('amount')) {
        return `GHS ${value.toLocaleString()}`;
      }
      return value.toLocaleString();
    }
    return value;
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-slate-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
          <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {formatTooltipValue(entry.value, entry.name)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RBarChart 
        data={data} 
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        layout={horizontal ? 'horizontal' : 'vertical'}
      >
        <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} />
        <XAxis 
          type={horizontal ? 'number' : 'category'}
          dataKey={horizontal ? undefined : 'name'}
          stroke={chartTheme.textSecondary}
          fontSize={12}
        />
        <YAxis 
          type={horizontal ? 'category' : 'number'}
          dataKey={horizontal ? 'name' : undefined}
          stroke={chartTheme.textSecondary}
          fontSize={12}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        {bars.map((bar, index) => (
          <Bar
            key={bar.key}
            dataKey={bar.key}
            name={bar.name}
            fill={bar.color || chartTheme.colors[index % chartTheme.colors.length]}
            radius={[2, 2, 0, 0]}
          />
        ))}
      </RBarChart>
    </ResponsiveContainer>
  );
};