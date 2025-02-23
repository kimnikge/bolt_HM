import React from 'react';
import { useParams } from 'react-router-dom';
import { Filter, SortDesc } from 'lucide-react';

export function CategoryPage() {
  const { id } = useParams();

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Категория</h1>
        <div className="flex gap-4">
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-slate-800 shadow-sm">
            <Filter size={20} />
            Фильтры
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-slate-800 shadow-sm">
            <SortDesc size={20} />
            Сортировка
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {/* Products will be rendered here */}
      </div>
    </div>
  );
}