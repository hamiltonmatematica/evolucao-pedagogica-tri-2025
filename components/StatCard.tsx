import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  icon?: React.ReactNode;
  color?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, subtitle, trend, trendValue, icon, color = 'bg-white' }) => {
  return (
    <div className={`${color} rounded-xl shadow-sm p-6 border border-gray-100 transition-all hover:shadow-md`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wider">{title}</h3>
        {icon && <div className="text-gray-400">{icon}</div>}
      </div>
      <div className="flex items-baseline">
        <span className="text-3xl font-bold text-gray-800">{value}</span>
        {trendValue && (
          <span className={`ml-2 text-sm font-medium ${trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-500'}`}>
            {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '–'} {trendValue}
          </span>
        )}
      </div>
      {subtitle && <p className="text-gray-400 text-xs mt-2">{subtitle}</p>}
    </div>
  );
};

export default StatCard;