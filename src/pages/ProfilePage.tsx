import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Heart, 
  Clock, 
  Bell, 
  Settings, 
  MapPin, 
  Plus,
  Package,
  Edit,
  Trash,
  X,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/lib/store';
import { supabase } from '@/lib/supabase';

interface Address {
  id: string;
  title: string;
  address: string;
  is_default: boolean;
}

interface Order {
  id: string;
  created_at: string;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  total: number;
  items: {
    product: {
      id: string;
      name: string;
      image: string;
    };
    quantity: number;
    price: number;
  }[];
}

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
}

export function ProfilePage() {
  const navigate = useNavigate();
  const { session, preferences, updatePreferences } = useStore();
  const [activeTab, setActiveTab] = React.useState<'profile' | 'orders' | 'addresses' | 'favorites' | 'notifications' | 'settings'>('profile');
  const [loading, setLoading] = React.useState(true);
  const [addresses, setAddresses] = React.useState<Address[]>([]);
  const [orders, setOrders] = React.useState<Order[]>([]);
  const [notifications, setNotifications] = React.useState<Notification[]>([]);
  const [showAddressModal, setShowAddressModal] = React.useState(false);
  const [newAddress, setNewAddress] = React.useState({
    title: '',
    address: '',
    is_default: false
  });

  React.useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Fetch addresses
        const { data: addressesData, error: addressesError } = await supabase
          .from('user_addresses')
          .select('*')
          .eq('user_id', session?.user.id)
          .order('is_default', { ascending: false });

        if (addressesError) throw addressesError;
        setAddresses(addressesData);

        // Fetch orders
        const { data: ordersData, error: ordersError } = await supabase
          .from('orders')
          .select(`
            *,
            items:order_items(
              quantity,
              price,
              product:products(
                id,
                name,
                images
              )
            )
          `)
          .eq('user_id', session?.user.id)
          .order('created_at', { ascending: false });

        if (ordersError) throw ordersError;
        setOrders(ordersData);

        // Fetch notifications
        const { data: notificationsData, error: notificationsError } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', session?.user.id)
          .order('created_at', { ascending: false });

        if (notificationsError) throw notificationsError;
        setNotifications(notificationsData);
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      fetchUserData();
    }
  }, [session]);

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) return;

    try {
      const { error } = await supabase
        .from('user_addresses')
        .insert([
          {
            user_id: session.user.id,
            ...newAddress
          }
        ]);

      if (error) throw error;

      // Refresh addresses
      const { data: newAddresses, error: fetchError } = await supabase
        .from('user_addresses')
        .select('*')
        .eq('user_id', session.user.id)
        .order('is_default', { ascending: false });

      if (fetchError) throw fetchError;
      setAddresses(newAddresses);
      setShowAddressModal(false);
      setNewAddress({ title: '', address: '', is_default: false });
    } catch (error) {
      console.error('Error adding address:', error);
    }
  };

  const handleDeleteAddress = async (id: string) => {
    try {
      const { error } = await supabase
        .from('user_addresses')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setAddresses(addresses.filter(addr => addr.id !== id));
    } catch (error) {
      console.error('Error deleting address:', error);
    }
  };

  const handleSetDefaultAddress = async (id: string) => {
    try {
      const { error } = await supabase
        .from('user_addresses')
        .update({ is_default: true })
        .eq('id', id);

      if (error) throw error;

      setAddresses(addresses.map(addr => ({
        ...addr,
        is_default: addr.id === id
      })));
    } catch (error) {
      console.error('Error setting default address:', error);
    }
  };

  const handleMarkNotificationAsRead = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', id);

      if (error) throw error;

      setNotifications(notifications.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      ));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleUpdatePreferences = (key: keyof typeof preferences, value: any) => {
    updatePreferences({ [key]: value });
  };

  if (!session) {
    navigate('/login');
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 space-y-6">
            <div className="flex flex-col items-center">
              <div className="w-24 h-24 rounded-full bg-gray-100 dark:bg-slate-700 mb-4" />
              <h2 className="text-xl font-bold">{session.user.email}</h2>
              <p className="text-gray-500">Участник с {new Date(session.user.created_at).toLocaleDateString()}</p>
            </div>

            <nav className="space-y-2">
              <button
                onClick={() => setActiveTab('profile')}
                className={`w-full flex items-center gap-3 px-4 py-2 rounded-xl transition-colors ${
                  activeTab === 'profile'
                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                    : 'hover:bg-gray-100 dark:hover:bg-slate-700'
                }`}
              >
                <User size={20} />
                Профиль
              </button>
              <button
                onClick={() => setActiveTab('orders')}
                className={`w-full flex items-center gap-3 px-4 py-2 rounded-xl transition-colors ${
                  activeTab === 'orders'
                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                    : 'hover:bg-gray-100 dark:hover:bg-slate-700'
                }`}
              >
                <Package size={20} />
                Заказы
              </button>
              <button
                onClick={() => setActiveTab('addresses')}
                className={`w-full flex items-center gap-3 px-4 py-2 rounded-xl transition-colors ${
                  activeTab === 'addresses'
                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                    : 'hover:bg-gray-100 dark:hover:bg-slate-700'
                }`}
              >
                <MapPin size={20} />
                Адреса
              </button>
              <button
                onClick={() => setActiveTab('favorites')}
                className={`w-full flex items-center gap-3 px-4 py-2 rounded-xl transition-colors ${
                  activeTab === 'favorites'
                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                    : 'hover:bg-gray-100 dark:hover:bg-slate-700'
                }`}
              >
                <Heart size={20} />
                Избранное
              </button>
              <button
                onClick={() => setActiveTab('notifications')}
                className={`w-full flex items-center gap-3 px-4 py-2 rounded-xl transition-colors ${
                  activeTab === 'notifications'
                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                    : 'hover:bg-gray-100 dark:hover:bg-slate-700'
                }`}
              >
                <Bell size={20} />
                Уведомления
                {notifications.filter(n => !n.read).length > 0 && (
                  <span className="ml-auto px-2 py-0.5 text-xs rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400">
                    {notifications.filter(n => !n.read).length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`w-full flex items-center gap-3 px-4 py-2 rounded-xl transition-colors ${
                  activeTab === 'settings'
                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                    : 'hover:bg-gray-100 dark:hover:bg-slate-700'
                }`}
              >
                <Settings size={20} />
                Настройки
              </button>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6">
              <h2 className="text-xl font-bold mb-6">Личные данные</h2>
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <input
                    type="email"
                    value={session.user.email}
                    disabled
                    className="w-full px-4 py-2 rounded-xl bg-gray-100 dark:bg-slate-700 border-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Имя</label>
                  <input
                    type="text"
                    placeholder="Ваше имя"
                    className="w-full px-4 py-2 rounded-xl bg-gray-100 dark:bg-slate-700 border-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Телефон</label>
                  <input
                    type="tel"
                    placeholder="Ваш телефон"
                    className="w-full px-4 py-2 rounded-xl bg-gray-100 dark:bg-slate-700 border-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                >
                  Сохранить
                </button>
              </form>
            </div>
          )}

          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.id} className="bg-white dark:bg-slate-800 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="text-sm text-gray-500">Заказ от {new Date(order.created_at).toLocaleDateString()}</div>
                      <div className="font-medium">#{order.id.slice(0, 8)}</div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                      order.status === 'completed'
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                        : order.status === 'cancelled'
                        ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                        : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400'
                    }`}>
                      {order.status === 'completed' ? 'Выполнен' :
                       order.status === 'cancelled' ? 'Отменен' :
                       order.status === 'processing' ? 'В обработке' : 'Ожидает'}
                    </div>
                  </div>
                  <div className="space-y-4">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-lg bg-gray-100 dark:bg-slate-700 overflow-hidden">
                          {item.product.image && (
                            <img
                              src={item.product.image}
                              alt={item.product.name}
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">{item.product.name}</div>
                          <div className="text-sm text-gray-500">
                            {item.quantity} шт. × {item.price.toLocaleString()} ₸
                          </div>
                        </div>
                        <div className="font-medium">
                          {(item.quantity * item.price).toLocaleString()} ₸
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t dark:border-gray-700 flex justify-between items-center">
                    <div className="text-sm text-gray-500">Итого</div>
                    <div className="text-xl font-bold">{order.total.toLocaleString()} ₸</div>
                  </div>
                </div>
              ))}
              {orders.length === 0 && (
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 text-center">
                  <Package size={48} className="mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-medium mb-2">У вас пока нет заказов</h3>
                  <p className="text-gray-500">Самое время что-нибудь купить!</p>
                </div>
              )}
            </div>
          )}

          {/* Addresses Tab */}
          {activeTab === 'addresses' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Адреса доставки</h2>
                <button
                  onClick={() => setShowAddressModal(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                >
                  <Plus size={20} />
                  Добавить адрес
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {addresses.map((address) => (
                  <div key={address.id} className="bg-white dark:bg-slate-800 rounded-2xl p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-medium">{address.title}</h3>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                          {address.address}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleDeleteAddress(address.id)}
                          className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 text-red-600"
                        >
                          <Trash size={20} />
                        </button>
                        <button
                          onClick={() => handleSetDefaultAddress(address.id)}
                          className={`p-2 rounded-lg ${
                            address.is_default
                              ? 'bg-green-50 dark:bg-green-900/30 text-green-600'
                              : 'hover:bg-gray-100 dark:hover:bg-slate-700'
                          }`}
                        >
                          <Check size={20} />
                        </button>
                      </div>
                    </div>
                    {address.is_default && (
                      <div className="text-sm text-green-600 dark:text-green-400">
                        Основной адрес
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {addresses.length === 0 && (
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 text-center">
                  <MapPin size={48} className="mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-medium mb-2">У вас пока нет сохраненных адресов</h3>
                  <p className="text-gray-500">Добавьте адрес для быстрого оформления заказов</p>
                </div>
              )}
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="space-y-4">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`bg-white dark:bg-slate-800 rounded-2xl p-6 ${
                    !notification.read ? 'ring-2 ring-blue-500' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium">{notification.title}</h3>
                      <p className="text-gray-600 dark:text-gray-400 mt-1">
                        {notification.message}
                      </p>
                      <div className="text-sm text-gray-500 mt-2">
                        {new Date(notification.created_at).toLocaleString()}
                      </div>
                    </div>
                    {!notification.read && (
                      <button
                        onClick={() => handleMarkNotificationAsRead(notification.id)}
                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700"
                      >
                        <Check size={20} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {notifications.length === 0 && (
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 text-center">
                  <Bell size={48} className="mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-medium mb-2">Нет уведомлений</h3>
                  <p className="text-gray-500">У вас пока нет новых уведомлений</p>
                </div>
              )}
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6">
              <h2 className="text-xl font-bold mb-6">Настройки</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="font-medium mb-4">Уведомления</h3>
                  <div className="space-y-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={preferences.notifications}
                        onChange={(e) => handleUpdatePreferences('notifications', e.target.checked)}
                        className="rounded-lg"
                      />
                      <span>Push-уведомления</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={preferences.emailUpdates}
                        onChange={(e) => handleUpdatePreferences('emailUpdates', e.target.checked)}
                        className="rounded-lg"
                      />
                      <span>Email-рассылка</span>
                    </label>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-4">Язык</h3>
                  <select
                    value={preferences.language}
                    onChange={(e) => handleUpdatePreferences('language', e.target.value)}
                    className="w-full px-4 py-2 rounded-xl bg-gray-100 dark:bg-slate-700 border-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="ru">Русский</option>
                    <option value="kz">Қазақша</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Address Modal */}
      <AnimatePresence>
        {showAddressModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-md w-full mx-4"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold">Добавить адрес</h3>
                <button
                  onClick={() => setShowAddressModal(false)}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700"
                >
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleAddAddress} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Название</label>
                  <input
                    type="text"
                    value={newAddress.title}
                    onChange={(e) => setNewAddress({ ...newAddress, title: e.target.value })}
                    placeholder="Например: Дом, Работа"
                    className="w-full px-4 py-2 rounded-xl bg-gray-100 dark:bg-slate-700 border-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Адрес</label>
                  <textarea
                    value={newAddress.address}
                    onChange={(e) => setNewAddress({ ...newAddress, address: e.target.value })}
                    placeholder="Полный адрес"
                    className="w-full px-4 py-2 rounded-xl bg-gray-100 dark:bg-slate-700 border-none focus:ring-2 focus:ring-blue-500 resize-none"
                    rows={3}
                    required
                  />
                </div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={newAddress.is_default}
                    onChange={(e) => setNewAddress({ ...newAddress, is_default: e.target.checked })}
                    className="rounded-lg"
                  />
                  <span>Сделать основным адресом</span>
                </label>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setShowAddressModal(false)}
                    className="flex-1 px-6 py-2 bg-gray-100 dark:bg-slate-700 rounded-xl hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
                  >
                    Отмена
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                  >
                    Добавить
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}