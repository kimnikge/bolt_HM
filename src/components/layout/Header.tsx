import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Moon, Sun, Search, LogOut } from 'lucide-react';
import { useStore } from '@/lib/store';
import { supabase } from '@/lib/supabase';

export function Header() {
  const { darkMode, setDarkMode, language, setLanguage, session } = useStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 backdrop-blur-lg bg-white/70 dark:bg-slate-900/70 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text text-transparent">
            HubMarket
          </Link>

          <div className="flex-1 max-w-lg mx-6">
            <div className="relative">
              <input
                type="text"
                placeholder="Поиск товаров или продавцов"
                className="w-full px-4 py-2.5 rounded-2xl bg-gray-100 dark:bg-slate-800 border-none focus:ring-2 focus:ring-blue-500 transition-all"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    const target = e.target as HTMLInputElement;
                    navigate(`/search?q=${encodeURIComponent(target.value)}`);
                  }
                }}
              />
              <Search className="absolute right-3 top-3 text-gray-400" size={20} />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 transition-all"
            >
              {darkMode ? <Sun size={22} /> : <Moon size={22} />}
            </button>
            <select 
              value={language}
              onChange={(e) => setLanguage(e.target.value as 'ru' | 'kz')}
              className="bg-transparent border-none focus:ring-0 text-sm font-medium"
            >
              <option value="ru">RU</option>
              <option value="kz">KZ</option>
            </select>
            {session && (
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 transition-all"
              >
                <LogOut size={20} />
                <span className="text-sm font-medium">Выйти</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}