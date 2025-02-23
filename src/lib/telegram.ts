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

function generateUsername(user: TelegramUser): string {
  const base = user.username || 
    user.first_name.toLowerCase().replace(/[^a-z0-9]/g, '') || 
    'user';
  return `${base}_${user.id}`;
}

function verifyTelegramHash(data: Omit<TelegramUser, 'hash'>, hash: string): boolean {
  const TELEGRAM_BOT_TOKEN = import.meta.env.VITE_TELEGRAM_BOT_TOKEN;
  if (!TELEGRAM_BOT_TOKEN) {
    console.error('Telegram bot token not found');
    return false;
  }

  // Create data check string
  const dataCheckString = Object.entries(data)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');

  // Get secret key from bot token
  const secretKey = CryptoJS.SHA256(TELEGRAM_BOT_TOKEN);
  
  // Calculate HMAC-SHA256
  const calculatedHash = CryptoJS.HmacSHA256(dataCheckString, secretKey).toString(CryptoJS.enc.Hex);

  return calculatedHash === hash;
}

export async function handleTelegramLogin(user: TelegramUser) {
  try {
    const { hash, ...dataToVerify } = user;

    if (!verifyTelegramHash(dataToVerify, hash)) {
      throw new Error('Недействительные данные аутентификации Telegram');
    }

    const username = generateUsername(user);
    const email = `${user.id}@telegram.user`;

    // Try to sign in first
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password: user.id.toString() // Use Telegram ID as password
    });

    if (!signInError) {
      return signInData;
    }

    // If sign in failed, create new user
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password: user.id.toString(),
      options: {
        data: {
          telegram_id: user.id.toString(),
          full_name: `${user.first_name} ${user.last_name || ''}`.trim(),
          avatar_url: user.photo_url,
          username
        }
      }
    });

    if (signUpError) throw signUpError;

    // Create telegram user record
    if (signUpData.user) {
      await supabase.from('telegram_users').insert({
        user_id: signUpData.user.id,
        telegram_id: user.id.toString(),
        username: user.username || username,
        first_name: user.first_name,
        last_name: user.last_name,
        language_code: 'ru'
      });

      // Create initial profile
      await supabase.from('profiles').insert({
        id: signUpData.user.id,
        username,
        full_name: `${user.first_name} ${user.last_name || ''}`.trim(),
        avatar_url: user.photo_url
      });
    }

    return signUpData;
  } catch (error: any) {
    console.error('Telegram auth error:', error);
    throw new Error('Ошибка авторизации через Telegram');
  }
}