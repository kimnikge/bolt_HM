import { supabase } from './supabase';

export interface Banner {
  id: string;
  seller_id: string;
  image_url: string;
  link_url?: string;
  starts_at: string;
  ends_at: string;
  is_active: boolean;
  placement: string;
}

export async function createBanner(banner: Omit<Banner, 'id'>) {
  const { data, error } = await supabase
    .from('banners')
    .insert([banner])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateBanner(id: string, updates: Partial<Banner>) {
  const { data, error } = await supabase
    .from('banners')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteBanner(id: string) {
  const { error } = await supabase
    .from('banners')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function getActiveBanners(placement?: string) {
  let query = supabase
    .from('banners')
    .select('*, seller:sellers(name)')
    .eq('is_active', true)
    .lte('starts_at', new Date().toISOString())
    .gte('ends_at', new Date().toISOString());

  if (placement) {
    query = query.eq('placement', placement);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}