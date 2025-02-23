import { handleTelegramLogin } from '@/lib/telegramAuth';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useStore } from '@/lib/store';
import { login } from '@/lib/auth';

declare global {
  interface Window {
    TelegramLoginWidget: {
      dataOnauth: (user: any) => void;
    };
  }
}

export function LoginPage() {
  const { darkMode } = useStore();
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [formData, setFormData] = React.useState({
    email: '',
    password: '',
    rememberMe: false
  });

  React.useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://telegram.org/js/telegram-widget.js?22';
    script.async = true;
    script.setAttribute('data-telegram-login', 'HubMarketKZBot');
    script.setAttribute('data-size', 'large');
    script.setAttribute('data-radius', '10');
    script.setAttribute('data-request-access', 'write');
    script.setAttribute('data-userpic', 'false');
    script.setAttribute('data-lang', 'ru');
    
    script.onload = () => {
      window.TelegramLoginWidget = {
        dataOnauth: async (user) => {
          setLoading(true);
          setError(null);
          try {
            await handleTelegramLogin(user);
            navigate('/');
          } catch (err: any) {
            console.error('Ошибка Telegram авторизации:', err);
            setError(err.message || 'Ошибка авторизации через Telegram');
          } finally {
            setLoading(false);
          }
        }
      };
    };

    document.getElementById('telegram-login-container')?.appendChild(script);
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await login({
        email: formData.email,
        password: formData.password,
        rememberMe: formData.rememberMe
      });
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Ошибка входа');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'dark bg-slate-900' : 'bg-gray-50'}`}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }} 
        animate={{ opacity: 1, scale: 1 }} 
        transition={{ duration: 0.5 }}
        className="bg-white dark:bg-slate-800 p-10 rounded-3xl shadow-2xl w-96 border dark:border-gray-700"
      >
        <h2 className="text-3xl font-bold text-center dark:text-white">Добро пожаловать</h2>
        <p className="text-center text-gray-500 dark:text-gray-400 mt-2">Войдите в свой аккаунт</p>
        
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 mt-6 rounded-xl bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 flex items-center gap-2"
          >
            <AlertCircle size={20} />
            <span>{error}</span>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="space-y-2">
            <div className="relative">
              <Mail size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500" />
              <input 
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Email" 
                className="w-full p-4 pl-12 rounded-xl dark:bg-slate-700 dark:text-white focus:ring-2 transition"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="relative">
              <Lock size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500" />
              <input 
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Пароль" 
                className="w-full p-4 pl-12 rounded-xl dark:bg-slate-700 dark:text-white focus:ring-2 transition"
                required
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.rememberMe}
                onChange={(e) => setFormData({ ...formData, rememberMe: e.target.checked })}
                className="rounded dark:bg-slate-700"
              />
              <span className="text-sm">Запомнить меня</span>
            </label>
            <button
              type="button"
              onClick={() => navigate('/reset-password')}
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              Забыли пароль?
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white p-4 rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Вход...' : 'Войти'}
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t dark:border-gray-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white dark:bg-slate-800 text-gray-500">или</span>
            </div>
          </div>

          {/* Контейнер для Telegram-кнопки */}
          <div id="telegram-login-container" className="flex justify-center mt-4"></div>

          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-300">
              Нет аккаунта?{' '}
              <button
                type="button"
                onClick={() => navigate('/register')}
                className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
              >
                Зарегистрироваться
              </button>
            </p>
          </div>
        </form>
      </motion.div>
    </div>
  );
}