import React from 'react';
import { AdminLayout } from '@/components/admin/Layout';
import { BarChart, LineChart, PieChart } from '@/components/admin/charts';
import { getAnalytics } from '@/lib/analytics';
import { Calendar, Filter } from 'lucide-react';

export function AdminAnalytics() {
  const [loading, setLoading] = React.useState(true);
  const [data, setData] = React.useState<any>(null);
  const [dateRange, setDateRange] = React.useState<{
    startDate: Date;
    endDate: Date;
  }>({
    startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)),
    endDate: new Date()
  });

  const fetchAnalytics = async () => {
    try {
      const analyticsData = await getAnalytics({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate
      });
      setData(analyticsData);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Аналитика</h1>
          <div className="flex gap-4">
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-slate-800">
              <Calendar size={20} />
              <span>Период</span>
            </button>
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-slate-800">
              <Filter size={20} />
              <span>Фильтры</span>
            </button>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white dark:bg-slate-800 rounded-2xl p-6 animate-pulse">
                <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-1/4 mb-4" />
                <div className="h-32 bg-gray-200 dark:bg-slate-700 rounded" />
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-6">
                <h2 className="text-lg font-bold mb-4">Просмотры товаров</h2>
                <LineChart data={data?.productViews} />
              </div>
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-6">
                <h2 className="text-lg font-bold mb-4">Активность продавцов</h2>
                <BarChart data={data?.sellerActivity} />
              </div>
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-6">
                <h2 className="text-lg font-bold mb-4">Категории</h2>
                <PieChart data={data?.categories} />
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6">
              <h2 className="text-lg font-bold mb-4">Последние события</h2>
              <div className="space-y-4">
                {data?.recentEvents?.map((event: any) => (
                  <div key={event.id} className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-slate-700/50">
                    <div>
                      <div className="font-medium">{event.event_type}</div>
                      <div className="text-sm text-gray-500">
                        {new Date(event.created_at).toLocaleString()}
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      {event.metadata?.description}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}