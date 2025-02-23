import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Search, Heart, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { useStore } from '@/lib/store';

const navItems = [
  { icon: Home, label: 'Главная', path: '/' },
  { icon: Search, label: 'Поиск', path: '/search' },
  { icon: Heart, label: 'Избранное', path: '/profile?tab=favorites' },
  { icon: User, label: 'Кабинет', path: '/profile' },
];

export function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { session } = useStore();

  const handleNavigation = (path: string) => {
    if ((path === '/profile' || path.startsWith('/profile?')) && !session) {
      navigate('/login');
    } else {
      navigate(path);
    }
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 backdrop-blur-lg bg-white/70 dark:bg-slate-900/70 border-t border-gray-200 dark:border-slate-700 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-around">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            
            return (
              <motion.button
                key={item.path}
                onClick={() => handleNavigation(item.path)}
                whileTap={{ scale: 0.9 }}
                className={`flex flex-col items-center py-3 px-5 gap-1 relative group ${
                  isActive 
                    ? 'text-blue-600 dark:text-blue-400' 
                    : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                <div className={`
                  absolute -top-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full
                  ${isActive ? 'bg-blue-600 dark:bg-blue-400' : 'bg-transparent'}
                `} />
                <item.icon size={24} 
                  className={`transition-colors ${
                    isActive 
                      ? 'text-blue-600 dark:text-blue-400' 
                      : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300'
                  }`}
                />
                <span className="text-xs font-medium">{item.label}</span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}