import { supabase } from './supabase';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_API_URL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;

export async function sendTelegramMessage(chatId: string, message: string) {
  try {
    const response = await fetch(`${TELEGRAM_API_URL}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML'
      })
    });

    if (!response.ok) {
      throw new Error('Failed to send Telegram message');
    }

    return await response.json();
  } catch (error) {
    console.error('Error sending Telegram message:', error);
    throw error;
  }
}

export async function notifySubscriptionExpiry(sellerId: string) {
  try {
    const { data: seller } = await supabase
      .from('sellers')
      .select('telegram_chat_id, name, subscription_status')
      .eq('id', sellerId)
      .single();

    if (!seller?.telegram_chat_id) return;

    const message = `
🔔 <b>Уведомление о подписке</b>

Уважаемый ${seller.name},

Ваша подписка "${seller.subscription_status}" скоро истекает. Чтобы продолжить пользоваться всеми преимуществами, пожалуйста, продлите подписку.

<i>Это автоматическое уведомление. Не отвечайте на него.</i>
    `.trim();

    await sendTelegramMessage(seller.telegram_chat_id, message);
  } catch (error) {
    console.error('Error sending subscription notification:', error);
  }
}

export async function notifyNewMessage(userId: string, message: string) {
  try {
    const { data: user } = await supabase
      .from('telegram_users')
      .select('telegram_id')
      .eq('user_id', userId)
      .single();

    if (!user?.telegram_id) return;

    await sendTelegramMessage(user.telegram_id, message);
  } catch (error) {
    console.error('Error sending message notification:', error);
  }
}