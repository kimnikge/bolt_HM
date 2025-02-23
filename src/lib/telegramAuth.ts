import { supabase } from './supabase';
import CryptoJS from 'crypto-js';

export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
}

// Функция генерации имени пользователя
function generateUsername(user: TelegramUser): string {
  const base = user.username ||
    user.first_name.toLowerCase().replace(/[^a-z0-9]/g, '') ||
    'user';
  return `${base}_${user.id}`;
}

// Проверка и логирование корректности данных
function verifyTelegramHash(data: Omit<TelegramUser, 'hash'>, hash: string): boolean {
  const TELEGRAM_BOT_TOKEN = import.meta.env.VITE_TELEGRAM_BOT_TOKEN;
  console.log('Verifying hash for data:', {
    ...data,
    token: TELEGRAM_BOT_TOKEN ? 'exists' : 'missing'
  });

  if (!TELEGRAM_BOT_TOKEN) {
    console.error('Telegram bot token не найден');
    return false;
  }

  const dataCheckString = Object.keys(data)
    .sort()
    .map(key => `${key}=${data[key as keyof typeof data]}`)
    .join('\n');

  const secretKey = CryptoJS.SHA256(TELEGRAM_BOT_TOKEN);
  const calculatedHash = CryptoJS.HmacSHA256(dataCheckString, secretKey).toString(CryptoJS.enc.Hex);
  
  console.log('Hash verification:', {
    calculated: calculatedHash,
    received: hash,
    matches: calculatedHash === hash
  });

  return calculatedHash === hash;
}

// Основная функция входа через Telegram
export async function handleTelegramLogin(user: TelegramUser) {
  try {
    console.log('Received Telegram user data:', user);

    if (!user || !user.id || !user.hash) {
      throw new Error('Неполные данные пользователя Telegram');
    }

    const { hash, ...dataToVerify } = user;

    // Проверка срока действия auth_date
    const authTimestamp = user.auth_date * 1000;
    const now = Date.now();
    const fiveMinutes = 5 * 60 * 1000;
    
    if (now - authTimestamp > fiveMinutes) {
      throw new Error('Срок действия авторизации истек');
    }

    if (!verifyTelegramHash(dataToVerify, hash)) {
      throw new Error('Недействительные данные аутентификации Telegram');
    }

    const username = generateUsername(user);
    console.log('Generated username:', username);

    // Проверяем, существует ли пользователь
    const { data: existingUser, error: checkError } = await supabase
      .from('telegram_users')
      .select('user_id')
      .eq('telegram_id', user.id.toString())
      .single();

    console.log('Existing user check:', { existingUser, error: checkError?.message });

    if (checkError && checkError.code !== 'PGRST116') {
      throw checkError;
    }

    if (existingUser) {
      // Вход для существующего пользователя
      const { data: authData, error: signInError } = await supabase.auth.signInWithOtp({
        email: `${user.id}@telegram.user`,
        options: {
          data: {
            telegram_id: user.id.toString(),
            full_name: `${user.first_name} ${user.last_name || ''}`.trim(),
            avatar_url: user.photo_url,
            username: username
          }
        }
      });

      if (signInError) {
        console.error('Sign in error:', signInError);
        throw signInError;
      }

      console.log('Existing user signed in successfully');
      return authData;
    } else {
      // Регистрация нового пользователя
      console.log('Creating new user...');
      const { data: authData, error: signUpError } = await supabase.auth.signInWithOtp({
        email: `${user.id}@telegram.user`,
        options: {
          data: {
            telegram_id: user.id.toString(),
            full_name: `${user.first_name} ${user.last_name || ''}`.trim(),
            avatar_url: user.photo_url,
            username: username
          }
        }
      });

      if (signUpError) {
        console.error('Sign up error:', signUpError);
        throw signUpError;
      }

      if (authData?.user) {
        try {
          // Создаем записи в telegram_users и profiles
          await Promise.all([
            supabase.from('telegram_users').insert({
              user_id: authData.user.id,
              telegram_id: user.id.toString(),
              username: user.username || username,
              first_name: user.first_name,
              last_name: user.last_name,
              language_code: 'ru'
            }),
            supabase.from('profiles').insert({
              id: authData.user.id,
              username: username,
              full_name: `${user.first_name} ${user.last_name || ''}`.trim(),
              avatar_url: user.photo_url
            })
          ]);
          
          console.log('New user created successfully');
        } catch (error) {
          console.error('Error creating user profiles:', error);
          throw new Error('Ошибка создания профиля пользователя');
        }
      }

      return authData;
    }
  } catch (error: any) {
    console.error('Detailed Telegram auth error:', {
      message: error.message,
      code: error.code,
      details: error.details
    });
    throw new Error(`Ошибка авторизации через Telegram: ${error.message}`);
  }
}