import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, User, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useStore } from '@/lib/store';
import { supabase } from '@/lib/supabase';

interface FormData {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
}

interface FormErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
  name?: string;
  general?: string;
}

export function RegisterPage() {
  const { darkMode } = useStore();
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(false);
  const [formData, setFormData] = React.useState<FormData>({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
  });
  const [errors, setErrors] = React.useState<FormErrors>({});

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Имя обязательно';
    }

    if (!formData.email) {
      newErrors.email = 'Email обязателен';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Некорректный email';
    }

    if (!formData.password) {
      newErrors.password = 'Пароль обязателен';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Пароль должен быть не менее 6 символов';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Подтвердите пароль';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Пароли не совпадают';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      const { error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            name: formData.name,
          },
        },
      });

      if (signUpError) throw signUpError;

      navigate('/'); // Redirect to home page on success
    } catch (error: any) {
      setErrors({
        general: error.message || 'Произошла ошибка при регистрации'
      });
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
        <h2 className="text-3xl font-bold text-center dark:text-white">Регистрация</h2>
        <p className="text-center text-gray-500 dark:text-gray-400 mt-2">Создайте новый аккаунт</p>
        
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          {errors.general && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-xl bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 flex items-center gap-2"
            >
              <AlertCircle size={20} />
              <span>{errors.general}</span>
            </motion.div>
          )}

          {/* Name field */}
          <div className="space-y-2">
            <div className="relative">
              <User size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500" />
              <input 
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Ваше имя" 
                className={`w-full p-4 pl-12 rounded-xl dark:bg-slate-700 dark:text-white focus:ring-2 transition
                  ${errors.name 
                    ? 'border-red-500 focus:ring-red-500' 
                    : 'border-gray-200 dark:border-gray-600 focus:ring-blue-500'
                  }`}
                disabled={loading}
              />
            </div>
            {errors.name && (
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm text-red-500 dark:text-red-400 ml-1"
              >
                {errors.name}
              </motion.p>
            )}
          </div>

          {/* Email field */}
          <div className="space-y-2">
            <div className="relative">
              <Mail size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500" />
              <input 
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email" 
                className={`w-full p-4 pl-12 rounded-xl dark:bg-slate-700 dark:text-white focus:ring-2 transition
                  ${errors.email 
                    ? 'border-red-500 focus:ring-red-500' 
                    : 'border-gray-200 dark:border-gray-600 focus:ring-blue-500'
                  }`}
                disabled={loading}
              />
            </div>
            {errors.email && (
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm text-red-500 dark:text-red-400 ml-1"
              >
                {errors.email}
              </motion.p>
            )}
          </div>

          {/* Password field */}
          <div className="space-y-2">
            <div className="relative">
              <Lock size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500" />
              <input 
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Пароль" 
                className={`w-full p-4 pl-12 rounded-xl dark:bg-slate-700 dark:text-white focus:ring-2 transition
                  ${errors.password 
                    ? 'border-red-500 focus:ring-red-500' 
                    : 'border-gray-200 dark:border-gray-600 focus:ring-blue-500'
                  }`}
                disabled={loading}
              />
            </div>
            {errors.password && (
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm text-red-500 dark:text-red-400 ml-1"
              >
                {errors.password}
              </motion.p>
            )}
          </div>

          {/* Confirm Password field */}
          <div className="space-y-2">
            <div className="relative">
              <Lock size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500" />
              <input 
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Подтвердите пароль" 
                className={`w-full p-4 pl-12 rounded-xl dark:bg-slate-700 dark:text-white focus:ring-2 transition
                  ${errors.confirmPassword 
                    ? 'border-red-500 focus:ring-red-500' 
                    : 'border-gray-200 dark:border-gray-600 focus:ring-blue-500'
                  }`}
                disabled={loading}
              />
            </div>
            {errors.confirmPassword && (
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm text-red-500 dark:text-red-400 ml-1"
              >
                {errors.confirmPassword}
              </motion.p>
            )}
          </div>

          {/* Submit button */}
          <motion.button 
            type="submit"
            disabled={loading}
            whileHover={{ scale: loading ? 1 : 1.02 }} 
            whileTap={{ scale: loading ? 1 : 0.98 }}
            className={`w-full bg-gradient-to-r from-blue-500 to-blue-700 text-white p-4 rounded-xl font-semibold 
              shadow-lg transition-all ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:opacity-90'}`}
          >
            {loading ? 'Регистрация...' : 'Зарегистрироваться'}
          </motion.button>

          {/* Login link */}
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-300">
              Уже есть аккаунт?{' '}
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
              >
                Войти
              </button>
            </p>
          </div>
        </form>
      </motion.div>
    </div>
  );
}