import React from 'react';
import { AdminLayout } from '@/components/admin/Layout';
import { Plus, FolderTree, MoreVertical } from 'lucide-react';

export function AdminCategories() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Управление категориями</h1>
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-all">
            <Plus size={20} />
            Добавить категорию
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((category) => (
            <div key={category} className="bg-white dark:bg-slate-800 rounded-2xl p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                    <FolderTree size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold">Категория {category}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      156 товаров
                    </p>
                  </div>
                </div>
                <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700">
                  <MoreVertical size={20} />
                </button>
              </div>
              <div className="space-y-2">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Подкатегории:
                </div>
                <div className="flex flex-wrap gap-2">
                  {[1, 2, 3].map((sub) => (
                    <span
                      key={sub}
                      className="px-2 py-1 text-sm rounded-lg bg-gray-100 dark:bg-slate-700"
                    >
                      Подкатегория {sub}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}