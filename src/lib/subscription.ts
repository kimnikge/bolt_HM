import { supabase } from './supabase';

export interface SubscriptionTier {
  id: string;
  name: string;
  price: number;
  max_products: number;
  max_contact_methods: number;
  max_banners: number;
  features: Record<string, any>;
}

export interface SellerSubscription {
  id: string;
  seller_id: string;
  tier_id: string;
  starts_at: string;
  ends_at: string;
  is_active: boolean;
  payment_status: string;
}

export async function getSubscriptionTiers() {
  const { data, error } = await supabase
    .from('subscription_tiers')
    .select('*')
    .order('price');

  if (error) throw error;
  return data;
}

export async function getCurrentSubscription(sellerId: string) {
  const { data, error } = await supabase
    .from('seller_subscriptions')
    .select(`
      *,
      tier:subscription_tiers(*)
    `)
    .eq('seller_id', sellerId)
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

export async function subscribeToTier(sellerId: string, tierId: string, months: number = 1) {
  const starts_at = new Date();
  const ends_at = new Date();
  ends_at.setMonth(ends_at.getMonth() + months);

  const { data, error } = await supabase
    .from('seller_subscriptions')
    .insert({
      seller_id: sellerId,
      tier_id: tierId,
      starts_at: starts_at.toISOString(),
      ends_at: ends_at.toISOString(),
      is_active: true,
      payment_status: 'pending'
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function cancelSubscription(subscriptionId: string) {
  const { error } = await supabase
    .from('seller_subscriptions')
    .update({ is_active: false })
    .eq('id', subscriptionId);

  if (error) throw error;
}

export async function updateSubscriptionPaymentStatus(subscriptionId: string, status: string) {
  const { error } = await supabase
    .from('seller_subscriptions')
    .update({ payment_status: status })
    .eq('id', subscriptionId);

  if (error) throw error;
}