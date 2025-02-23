import React from 'react';
import { AdminLayout } from '@/components/admin/Layout';
import { getSubscriptionTiers, getCurrentSubscription } from '@/lib/subscription';
import { SubscriptionCard } from '@/components/subscription/SubscriptionCard';
import { Plus, Users, Package, Calendar } from 'lucide-react';

export function AdminSubscriptions() {
  const [tiers, setTiers] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [stats, setStats] = React.useState({
    totalSubscribers: 0,
    activeSubscriptions: 0,
    revenue: 0
  });

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const tiersData = await getSubscriptionTiers();
        setTiers(tiersData);

        // Fetch subscription stats
        const { data: statsData } = await supabase
          .from('seller_subscriptions')
          .select('*')
          .eq('is_active', true);

        if (statsData) {
          setStats({
            totalSubscribers: statsData.length,
            activeSubscriptions: statsData.filter(s => s.is_active).length,
            revenue: statsData.reduce((sum, s) => sum + (s.tier?.price || 0), 0)
          });
        }
      } catch (error) {
        console.error('Error fetching subscription data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Управление подписками</h1>
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-all">
            <Plus size={20} />
            Добавить тариф
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                <Users size={24} />
              </div>
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Всего подписчиков</div>
                <div className="text-2xl font-bold">{stats.totalSubscribers}</div>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400">
                <Package size={24} />
              </div>
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Активные подписки</div>
                <div className="text-2xl font-bold">{stats.activeSubscriptions}</div>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
                <Calendar size={24} />
              </div>
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Доход</div>
                <div className="text-2xl font-bold">{stats.revenue.toLocaleString()} ₸</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {loading ? (
            [1, 2, 3].map((n) => (
              <div key={n} className="bg-white dark:bg-slate-800 rounded-2xl p-6 animate-pulse">
                <div className="h-6 bg-gray-200 dark:bg-slate-700 rounded w-1/2 mb-4" />
                <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-3/4 mb-2" />
                <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-1/2 mb-2" />
                <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-2/3" />
              </div>
            ))
          ) : (
            tiers.map((tier) => (
              <SubscriptionCard
                key={tier.id}
                tier={tier}
                onSubscribe={() => {}}
              />
            ))
          )}
        </div>
      </div>
    </AdminLayout>
  );
}