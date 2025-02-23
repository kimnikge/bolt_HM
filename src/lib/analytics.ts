import { supabase } from './supabase';

export interface AnalyticsEvent {
  event_type: string;
  user_id?: string;
  seller_id?: string;
  product_id?: string;
  metadata?: Record<string, any>;
}

export async function trackEvent(event: AnalyticsEvent) {
  const { error } = await supabase
    .from('analytics_events')
    .insert([event]);

  if (error) {
    console.error('Error tracking event:', error);
  }
}

export async function getAnalytics(params: {
  startDate?: Date;
  endDate?: Date;
  sellerId?: string;
  eventType?: string;
}) {
  let query = supabase
    .from('analytics_events')
    .select('*');

  if (params.startDate) {
    query = query.gte('created_at', params.startDate.toISOString());
  }
  if (params.endDate) {
    query = query.lte('created_at', params.endDate.toISOString());
  }
  if (params.sellerId) {
    query = query.eq('seller_id', params.sellerId);
  }
  if (params.eventType) {
    query = query.eq('event_type', params.eventType);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}