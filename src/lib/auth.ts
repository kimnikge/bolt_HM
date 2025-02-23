import { supabase } from './supabase';
import { handleTelegramLogin } from './telegram';
import type { Provider } from '@supabase/supabase-js';

interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

interface RegisterCredentials {
  email: string;
  password: string;
  name: string;
}

export async function login({ email, password, rememberMe = false }: LoginCredentials) {
  try {
    // Check rate limiting before attempting login
    const { data: attempts } = await supabase
      .from('auth_attempts')
      .select('*')
      .eq('ip_address', await getClientIP())
      .gte('attempt_date', new Date(Date.now() - 15 * 60 * 1000).toISOString())
      .eq('success', false);

    if (attempts && attempts.length >= 5) {
      throw new Error('Слишком много попыток входа. Пожалуйста, подождите 15 минут');
    }

    const { data: { user, session }, error } = await supabase.auth.signInWithPassword({
      email,
      password,
      options: {
        // Set session duration based on rememberMe
        expiresIn: rememberMe ? '30d' : '1d'
      }
    });

    if (error) throw error;

    // Track successful login attempt
    await supabase.from('auth_attempts').insert({
      user_id: user?.id,
      ip_address: await getClientIP(),
      success: true
    });

    // Store session if rememberMe is true
    if (rememberMe && session) {
      await supabase.from('auth_sessions').insert({
        user_id: user?.id,
        refresh_token: session.refresh_token,
        device_info: {
          userAgent: navigator.userAgent,
          platform: navigator.platform
        },
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
      });
    }

    return { user, session };
  } catch (error: any) {
    // Track failed login attempt
    await supabase.from('auth_attempts').insert({
      user_id: null, // We don't know the user id for failed attempts
      ip_address: await getClientIP(),
      success: false
    });

    // Provide user-friendly error messages
    if (error.message.includes('Invalid login credentials')) {
      throw new Error('Неверный email или пароль');
    } else if (error.message.includes('Email not confirmed')) {
      throw new Error('Пожалуйста, подтвердите ваш email');
    } else {
      throw new Error(error.message || 'Произошла ошибка при входе');
    }
  }
}

export async function register({ email, password, name }: RegisterCredentials) {
  try {
    const { data: { user }, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
          username: email.split('@')[0] // Generate initial username from email
        }
      }
    });

    if (error) throw error;

    // Create initial profile
    if (user) {
      await supabase.from('profiles').insert({
        id: user.id,
        username: email.split('@')[0],
        full_name: name,
        avatar_url: null
      });
    }

    return user;
  } catch (error: any) {
    if (error.message.includes('already registered')) {
      throw new Error('Этот email уже зарегистрирован');
    }
    throw error;
  }
}

export async function logout() {
  try {
    // Clear any stored sessions
    const session = await supabase.auth.getSession();
    if (session.data.session) {
      await supabase.from('auth_sessions')
        .delete()
        .eq('user_id', session.data.session.user.id);
    }

    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  } catch (error: any) {
    console.error('Logout error:', error);
    throw new Error('Ошибка при выходе из системы');
  }
}

export async function resetPassword(email: string) {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    });
    if (error) throw error;
  } catch (error: any) {
    throw new Error('Ошибка при отправке ссылки для сброса пароля');
  }
}

export async function updatePassword(newPassword: string) {
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });
    if (error) throw error;
  } catch (error: any) {
    throw new Error('Ошибка при обновлении пароля');
  }
}

// Helper function to get client IP
async function getClientIP(): Promise<string> {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch (error) {
    console.error('Error getting IP:', error);
    return 'unknown';
  }
}