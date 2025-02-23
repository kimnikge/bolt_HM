import React from 'react';
import { AdminLayout } from '@/components/admin/Layout';
import { Plus, Image as ImageIcon, Link, Calendar, Trash, Edit } from 'lucide-react';
import { motion } from 'framer-motion';
import { getActiveBanners, createBanner, updateBanner, deleteBanner } from '@/lib/banners';

export function AdminBanners() {
  const [banners, setBanners] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [showAddModal, setShowAddModal] = React.useState(false);
  const [selectedBanner, setSelectedBanner] = React.useState<any>(null);

  const fetchBanners = async () => {
    try {
      const data = await getActiveBanners();
      setBanners(data);
    } catch (error) {
      console.error('Error fetching banners:', error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchBanners();
  }, []);

  const handleAddBanner = async (formData: any) => {
    try {
      await createBanner(formData);
      await fetchBanners();
      setShowAddModal(false);
    } catch (error) {
      console.error('Error adding banner:', error);
    }
  };

  const handleUpdateBanner = async (id: string, updates: any) => {
    try {
      await updateBanner(id, updates);
      await fetchBanners();
      setSelectedBanner(null);
    } catch (error) {
      console.error('Error updating banner:', error);
    }
  };

  const handleDeleteBanner = async (id: string) => {
    if (window.confirm('Вы уверены, что хотите удалить этот баннер?')) {
      try {
        await deleteBanner(id);
        await fetchBanners();
      } catch (error) {
        console.error('Error deleting banner:', error);
      }
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Управление баннерами</h1>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-all"
          >
            <Plus size={20} />
            Добавить баннер
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white dark:bg-slate-800 rounded-2xl p-6 animate-pulse">
                <div className="h-40 bg-gray-200 dark:bg-slate-700 rounded-xl mb-4" />
                <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-3/4 mb-2" />
                <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {banners.map((banner) => (
              <motion.div
                key={banner.id}
                layout
                className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden"
              >
                <div className="aspect-video bg-gray-100 dark:bg-slate-700 relative">
                  <img
                    src={banner.image_url}
                    alt={`Banner for ${banner.seller.name}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      onClick={() => setSelectedBanner(banner)}
                      className="p-2 rounded-full bg-white/20 hover:bg-white/40 text-white transition-colors"
                    >
                      <Edit size={20} />
                    </button>
                    <button
                      onClick={() => handleDeleteBanner(banner.id)}
                      className="p-2 rounded-full bg-white/20 hover:bg-white/40 text-white transition-colors"
                    >
                      <Trash size={20} />
                    </button>
                  </div>
                </div>
                <div className="p-4">
                  <div className="font-medium mb-1">{banner.seller.name}</div>
                  <div className="text-sm text-gray-500">
                    {new Date(banner.starts_at).toLocaleDateString()} - {new Date(banner.ends_at).toLocaleDateString()}
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      banner.is_active
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                        : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-400'
                    }`}>
                      {banner.is_active ? 'Активен' : 'Неактивен'}
                    </span>
                    <span className="px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs">
                      {banner.placement}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Banner Modal */}
      {(showAddModal || selectedBanner) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4">
              {selectedBanner ? 'Редактировать баннер' : 'Добавить баннер'}
            </h2>
            {/* Banner form would go here */}
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setSelectedBanner(null);
                }}
                className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-slate-700"
              >
                Отмена
              </button>
              <button className="px-4 py-2 rounded-xl bg-blue-600 text-white">
                {selectedBanner ? 'Сохранить' : 'Добавить'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}