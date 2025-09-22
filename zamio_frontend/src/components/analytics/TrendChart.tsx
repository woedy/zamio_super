import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  AreaChart,
  Area,
} from 'recharts';
import { useTheme } from '../../contexts/ThemeContext';
import { getRechartsTheme } from '../charts/ChartContainer';

interface TrendChartProps {
  data: Array<{
    date: string;
    [key: string]: string | number;
  }>;
  lines: Array<{
    key: string;
    name: string;
    color?: string;
  }>;
  type?: 'line' | 'area';
  height?: number;
  loading?: boolean;
}

export const TrendChart: React.FC<TrendChartProps> = ({
  data,
  lines,
  type = 'line',
  height = 300,
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

  if (type === 'area') {
    return (
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} />
          <XAxis 
            dataKey="date" 
            stroke={chartTheme.textSecondary}
            fontSize={12}
          />
          <YAxis 
            stroke={chartTheme.textSecondary}
            fontSize={12}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          {lines.map((line, index) => (
            <Area
              key={line.key}
              type="monotone"
              dataKey={line.key}
              name={line.name}
              stroke={line.color || chartTheme.colors[index % chartTheme.colors.length]}
              fill={line.color || chartTheme.colors[index % chartTheme.colors.length]}
              fillOpacity={0.3}
              strokeWidth={2}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} />
        <XAxis 
          dataKey="date" 
          stroke={chartTheme.textSecondary}
          fontSize={12}
        />
        <YAxis 
          stroke={chartTheme.textSecondary}
          fontSize={12}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        {lines.map((line, index) => (
          <Line
            key={line.key}
            type="monotone"
            dataKey={line.key}
            name={line.name}
            stroke={line.color || chartTheme.colors[index % chartTheme.colors.length]}
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
};