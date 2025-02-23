import React from 'react';
import { AdminLayout } from '@/components/admin/Layout';
import { Search, Filter, MoreVertical, CheckCircle, XCircle } from 'lucide-react';

export function AdminSellers() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Управление продавцами</h1>
          <div className="flex gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Поиск продавцов"
                className="pl-10 pr-4 py-2 rounded-xl bg-white dark:bg-slate-800 border-none focus:ring-2 focus:ring-blue-500"
              />
              <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
            </div>
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-slate-800">
              <Filter size={20} />
              Фильтры
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-slate-700">
                <th className="px-6 py-4 text-left font-medium text-gray-600 dark:text-gray-400">Продавец</th>
                <th className="px-6 py-4 text-left font-medium text-gray-600 dark:text-gray-400">Статус</th>
                <th className="px-6 py-4 text-left font-medium text-gray-600 dark:text-gray-400">Товары</th>
                <th className="px-6 py-4 text-left font-medium text-gray-600 dark:text-gray-400">Рейтинг</th>
                <th className="px-6 py-4 text-left font-medium text-gray-600 dark:text-gray-400">Действия</th>
              </tr>
            </thead>
            <tbody>
              {[1, 2, 3, 4, 5].map((seller) => (
                <tr key={seller} className="border-b border-gray-200 dark:border-slate-700">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-slate-700" />
                      <div>
                        <div className="font-medium">ЭкоФерма {seller}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">seller@example.com</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {seller % 2 === 0 ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-sm">
                        <CheckCircle size={14} />
                        Верифицирован
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 text-sm">
                        <XCircle size={14} />
                        На проверке
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">156</td>
                  <td className="px-6 py-4">4.8</td>
                  <td className="px-6 py-4">
                    <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700">
                      <MoreVertical size={20} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}