import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Star, 
  Phone, 
  MessageCircle, 
  Globe, 
  MapPin, 
  Clock,
  CreditCard,
  CheckCircle,
  Package,
  BarChart2,
  Users,
  ShoppingCart,
  Filter,
  ChevronDown,
  ThumbsUp,
  Heart,
  Share2
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useStore } from '@/lib/store';
import { supabase } from '@/lib/supabase';

export function SellerPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { session } = useStore();
  const [loading, setLoading] = React.useState(true);
  const [seller, setSeller] = React.useState<any>(null);
  const [products, setProducts] = React.useState<any[]>([]);
  const [reviews, setReviews] = React.useState<any[]>([]);
  const [isFavorite, setIsFavorite] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<'products' | 'reviews'>('products');
  const [sortBy, setSortBy] = React.useState('newest');

  React.useEffect(() => {
    const fetchSellerData = async () => {
      try {
        // Fetch seller data
        const { data: sellerData, error: sellerError } = await supabase
          .from('sellers')
          .select('*')
          .eq('id', id)
          .single();

        if (sellerError) throw sellerError;
        setSeller(sellerData);

        // Fetch seller's products
        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select('*')
          .eq('seller_id', id)
          .order('created_at', { ascending: false });

        if (productsError) throw productsError;
        setProducts(productsData);

        // Check if seller is in favorites
        if (session?.user) {
          const { data: favoriteData } = await supabase
            .from('favorites')
            .select('*')
            .eq('user_id', session.user.id)
            .eq('seller_id', id)
            .single();

          setIsFavorite(!!favoriteData);
        }
      } catch (error) {
        console.error('Error fetching seller data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSellerData();
  }, [id, session]);

  const toggleFavorite = async () => {
    if (!session) {
      navigate('/login');
      return;
    }

    try {
      if (isFavorite) {
        await supabase
          .from('favorites')
          .delete()
          .eq('user_id', session.user.id)
          .eq('seller_id', id);
      } else {
        await supabase
          .from('favorites')
          .insert([
            { user_id: session.user.id, seller_id: id }
          ]);
      }
      setIsFavorite(!isFavorite);
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: seller?.name,
        text: `Посмотрите профиль продавца ${seller?.name} на HubMarket`,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      // TODO: Show toast notification
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!seller) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold mb-4">Продавец не найден</h2>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
        >
          Вернуться на главную
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 p-6 shadow-md">
        <div className="container mx-auto">
          <div className="flex items-start gap-6">
            <div className="w-32 h-32 rounded-2xl bg-gray-100 dark:bg-slate-700 shrink-0 overflow-hidden">
              {seller.image ? (
                <img 
                  src={seller.image} 
                  alt={seller.name} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-4xl">
                  {seller.name[0]}
                </div>
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-2xl font-bold dark:text-white">{seller.name}</h1>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex items-center gap-1">
                      <Star size={18} className="fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">{seller.rating}</span>
                      <span className="text-gray-500">(128 отзывов)</span>
                    </div>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-sm">
                      <CheckCircle size={14} />
                      Онлайн
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={toggleFavorite}
                    className={`p-2 rounded-xl ${
                      isFavorite
                        ? 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                        : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    <Heart size={24} className={isFavorite ? 'fill-current' : ''} />
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={handleShare}
                    className="p-2 rounded-xl bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-400"
                  >
                    <Share2 size={24} />
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => window.open(`https://wa.me/${seller.contact_phone}`, '_blank')}
                    className="px-4 py-2 rounded-xl bg-green-600 text-white font-medium"
                  >
                    <MessageCircle size={24} />
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => window.location.href = `tel:${seller.contact_phone}`}
                    className="px-4 py-2 rounded-xl bg-blue-600 text-white font-medium"
                  >
                    <Phone size={24} />
                  </motion.button>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                  <Globe size={18} />
                  <span>{seller.website || 'Нет сайта'}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                  <MapPin size={18} />
                  <span>Алматы</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                  <Clock size={18} />
                  <span>9:00 - 18:00</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                  <Package size={18} />
                  <span>150 товаров</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="container mx-auto px-4 mt-6">
        <div className="flex gap-4 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('products')}
            className={`px-4 py-2 font-medium transition-colors relative ${
              activeTab === 'products'
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            Товары
            {activeTab === 'products' && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400"
              />
            )}
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`px-4 py-2 font-medium transition-colors relative ${
              activeTab === 'reviews'
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            Отзывы
            {activeTab === 'reviews' && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400"
              />
            )}
          </button>
        </div>

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div className="mt-6">
            <div className="flex justify-between items-center mb-4">
              <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 dark:bg-slate-800">
                <Filter size={20} />
                <span className="font-medium">Фильтры</span>
              </button>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-slate-800 border-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="newest">Сначала новые</option>
                <option value="popular">По популярности</option>
                <option value="price_asc">Сначала дешевле</option>
                <option value="price_desc">Сначала дороже</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map((product) => (
                <motion.div
                  key={product.id}
                  onClick={() => navigate(`/product/${product.id}`)}
                  whileHover={{ y: -4 }}
                  className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm overflow-hidden cursor-pointer"
                >
                  <div className="aspect-video bg-gray-100 dark:bg-slate-700">
                    {product.images?.[0] && (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold mb-1">{product.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {product.description}
                    </p>
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-lg font-bold">{product.price} ₸</div>
                        <div className="text-sm text-gray-500">Мин. заказ: 10 кг</div>
                      </div>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(`https://wa.me/${seller.contact_phone}`, '_blank');
                        }}
                        className="px-4 py-2 rounded-xl bg-blue-600 text-white font-medium text-sm hover:bg-blue-700 transition-colors"
                      >
                        Связаться
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Reviews Tab */}
        {activeTab === 'reviews' && (
          <div className="mt-6 space-y-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="text-3xl font-bold">{seller.rating}</div>
                  <div className="flex items-center gap-1 mt-1">
                    <Star size={18} className="fill-yellow-400 text-yellow-400" />
                    <Star size={18} className="fill-yellow-400 text-yellow-400" />
                    <Star size={18} className="fill-yellow-400 text-yellow-400" />
                    <Star size={18} className="fill-yellow-400 text-yellow-400" />
                    <Star size={18} className="fill-gray-200 text-gray-200" />
                  </div>
                  <div className="text-sm text-gray-500 mt-1">На основе 128 отзывов</div>
                </div>
                {session && (
                  <button className="px-6 py-2 rounded-xl bg-blue-600 text-white font-medium">
                    Оставить отзыв
                  </button>
                )}
              </div>

              <div className="space-y-4">
                {[1, 2, 3].map((review) => (
                  <div key={review} className="border-t dark:border-gray-700 pt-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-medium">Пользователь {review}</div>
                        <div className="flex items-center gap-1 mt-1">
                          <Star size={14} className="fill-yellow-400 text-yellow-400" />
                          <Star size={14} className="fill-yellow-400 text-yellow-400" />
                          <Star size={14} className="fill-yellow-400 text-yellow-400" />
                          <Star size={14} className="fill-yellow-400 text-yellow-400" />
                          <Star size={14} className="fill-yellow-400 text-yellow-400" />
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">2 дня назад</div>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 mt-2">
                      Отличный продавец! Товар соответствует описанию, быстрая доставка.
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}