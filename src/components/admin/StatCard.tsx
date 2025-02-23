import React from 'react';
import { DivideIcon as LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  trend: string;
  trendUp: boolean;
}

export function StatCard({ title, value, icon: Icon, trend, trendUp }: StatCardProps) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6">
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
          <Icon size={24} />
        </div>
        <div>
          <h3 className="text-sm text-gray-600 dark:text-gray-400">{title}</h3>
          <div className="text-2xl font-bold">{value}</div>
        </div>
      </div>
      <div className={`mt-4 text-sm ${trendUp ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
        {trend} за последние 30 дней
      </div>
    </div>
  );
}