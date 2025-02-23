import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Package,
  FolderTree,
  ShieldCheck,
  UserCog,
  Settings,
  FileText,
  LogOut
} from 'lucide-react';

const menuItems = [
  { icon: LayoutDashboard, label: 'Дашборд', path: '/admin' },
  { icon: Users, label: 'Продавцы', path: '/admin/sellers' },
  { icon: Package, label: 'Товары', path: '/admin/products' },
  { icon: FolderTree, label: 'Категории', path: '/admin/categories' },
  { icon: ShieldCheck, label: 'Верификация', path: '/admin/verifications' },
  { icon: UserCog, label: 'Модераторы', path: '/admin/moderators' },
  { icon: Settings, label: 'Настройки', path: '/admin/settings' },
  { icon: FileText, label: 'Логи', path: '/admin/logs' },
];

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 w-64 h-screen bg-white dark:bg-slate-800 border-r border-gray-200 dark:border-slate-700">
        <div className="flex flex-col h-full">
          <div className="p-6">
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text text-transparent">
              HubMarket Admin
            </h1>
          </div>

          <nav className="flex-1 px-4 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all ${
                    isActive
                      ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                      : 'hover:bg-gray-100 dark:hover:bg-slate-700'
                  }`}
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="p-4 mt-auto">
            <button className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 transition-all">
              <LogOut size={20} />
              <span>Выйти</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="pl-64">
        <div className="container p-6">
          {children}
        </div>
      </main>
    </div>
  );
}