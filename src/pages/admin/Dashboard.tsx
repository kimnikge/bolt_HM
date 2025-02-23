import React from 'react';
import { Users, Package, TrendingUp, AlertCircle } from 'lucide-react';
import { AdminLayout } from '@/components/admin/Layout';
import { StatCard } from '@/components/admin/StatCard';
import { LineChart } from '@/components/admin/LineChart';
import { PieChart } from '@/components/admin/PieChart';

export function AdminDashboard() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Панель управления</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Всего продавцов"
            value="1,234"
            icon={Users}
            trend="+12%"
            trendUp={true}
          />
          <StatCard
            title="Активные продавцы"
            value="892"
            icon={Users}
            trend="+5%"
            trendUp={true}
          />
          <StatCard
            title="Всего товаров"
            value="15,678"
            icon={Package}
            trend="+8%"
            trendUp={true}
          />
          <StatCard
            title="Новые регистрации"
            value="45"
            icon={TrendingUp}
            trend="+15%"
            trendUp={true}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6">
            <h2 className="text-lg font-bold mb-4">Активность продавцов</h2>
            <LineChart />
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6">
            <h2 className="text-lg font-bold mb-4">Распределение по категориям</h2>
            <PieChart />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">Требуют внимания</h2>
            <span className="px-2 py-1 text-sm rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400">
              12 новых
            </span>
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 dark:bg-slate-700/50"
              >
                <div className="p-2 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400">
                  <AlertCircle size={20} />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">Жалоба на продавца</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Пользователь сообщает о недостоверной информации
                  </p>
                </div>
                <button className="px-3 py-1 text-sm rounded-lg bg-white dark:bg-slate-700 shadow-sm">
                  Проверить
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}