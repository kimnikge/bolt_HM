import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Star, 
  Phone, 
  MessageCircle, 
  Share2,
  Heart,
  ShoppingCart,
  Package,
  Truck,
  Shield,
  ThumbsUp,
  ThumbsDown,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/lib/store';
import { supabase } from '@/lib/supabase';

interface Review {
  id: string;
  user_id: string;
  product_id: string;
  rating: number;
  comment: string;
  created_at: string;
  user: {
    name: string;
  };
  helpful_count: number;
  not_helpful_count: number;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  seller_id: string;
  category_id: string;
  specifications: Record<string, string>;
  stock_status: 'in_stock' | 'low_stock' | 'out_of_stock';
  minimum_order: number;
  seller: {
    name: string;
    rating: number;
    location: string;
    phone: string;
  };
}

export function ProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { session, toggleProductFavorite, favorites, addRecentlyViewed } = useStore();
  const [loading, setLoading] = React.useState(true);
  const [product, setProduct] = React.useState<Product | null>(null);
  const [reviews, setReviews] = React.useState<Review[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = React.useState(0);
  const [showImageModal, setShowImageModal] = React.useState(false);
  const [selectedRating, setSelectedRating] = React.useState<number | null>(null);
  const [reviewComment, setReviewComment] = React.useState('');
  const [submittingReview, setSubmittingReview] = React.useState(false);

  const isFavorite = favorites.products.includes(id || '');

  React.useEffect(() => {
    const fetchProductData = async () => {
      try {
        // Fetch product data
        const { data: productData, error: productError } = await supabase
          .from('products')
          .select('*, seller:sellers(name, rating, location, phone)')
          .eq('id', id)
          .single();

        if (productError) throw productError;
        setProduct(productData);
        addRecentlyViewed(productData.id);

        // Fetch reviews
        const { data: reviewsData, error: reviewsError } = await supabase
          .from('reviews')
          .select('*, user:profiles(name)')
          .eq('product_id', id)
          .order('created_at', { ascending: false });

        if (reviewsError) throw reviewsError;
        setReviews(reviewsData);
      } catch (error) {
        console.error('Error fetching product data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProductData();
  }, [id]);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session || !selectedRating) return;

    setSubmittingReview(true);
    try {
      const { error } = await supabase
        .from('reviews')
        .insert([
          {
            product_id: id,
            user_id: session.user.id,
            rating: selectedRating,
            comment: reviewComment
          }
        ]);

      if (error) throw error;

      // Refresh reviews
      const { data: newReviews, error: reviewsError } = await supabase
        .from('reviews')
        .select('*, user:profiles(name)')
        .eq('product_id', id)
        .order('created_at', { ascending: false });

      if (reviewsError) throw reviewsError;
      setReviews(newReviews);

      // Reset form
      setSelectedRating(null);
      setReviewComment('');
    } catch (error) {
      console.error('Error submitting review:', error);
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product?.name,
        text: product?.description,
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

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold mb-4">Товар не найден</h2>
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
    <div className="container mx-auto px-4 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Product Gallery */}
        <div className="space-y-4">
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-white dark:bg-slate-800">
            <img
              src={product.images[currentImageIndex]}
              alt={product.name}
              className="w-full h-full object-cover cursor-pointer"
              onClick={() => setShowImageModal(true)}
            />
            {product.images.length > 1 && (
              <>
                <button
                  onClick={() => setCurrentImageIndex((prev) => 
                    prev === 0 ? product.images.length - 1 : prev - 1
                  )}
                  className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 text-gray-800 hover:bg-white"
                >
                  <ChevronLeft size={24} />
                </button>
                <button
                  onClick={() => setCurrentImageIndex((prev) => 
                    prev === product.images.length - 1 ? 0 : prev + 1
                  )}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 text-gray-800 hover:bg-white"
                >
                  <ChevronRight size={24} />
                </button>
              </>
            )}
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {product.images.map((image, index) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={`relative rounded-lg overflow-hidden flex-shrink-0 w-20 h-20 ${
                  currentImageIndex === index
                    ? 'ring-2 ring-blue-500'
                    : 'opacity-70 hover:opacity-100'
                }`}
              >
                <img
                  src={image}
                  alt={`${product.name} - изображение ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">{product.name}</h1>
            <div className="flex items-center gap-4 mt-2">
              <div className="flex items-center gap-2">
                <Star className="fill-yellow-400 text-yellow-400" />
                <span className="font-medium">{product.seller.rating}</span>
                <span className="text-gray-500">({reviews.length} отзывов)</span>
              </div>
              <button
                onClick={() => navigate(`/seller/${product.seller_id}`)}
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                {product.seller.name}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-3xl font-bold">{product.price.toLocaleString()} ₸</div>
            <div className="text-sm text-gray-500">
              Минимальный заказ: {product.minimum_order} шт.
            </div>
            {product.stock_status === 'low_stock' && (
              <div className="text-sm text-orange-600">
                Осталось мало
              </div>
            )}
            {product.stock_status === 'out_of_stock' && (
              <div className="text-sm text-red-600">
                Нет в наличии
              </div>
            )}
          </div>

          <div className="flex gap-4">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => window.open(`https://wa.me/${product.seller.phone}`, '_blank')}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-green-600 text-white font-medium hover:bg-green-700 transition-all"
            >
              <MessageCircle size={20} />
              Написать продавцу
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => window.location.href = `tel:${product.seller.phone}`}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition-all"
            >
              <Phone size={20} />
              Позвонить
            </motion.button>
          </div>

          <div className="flex gap-4">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => toggleProductFavorite(product.id)}
              className={`flex items-center justify-center gap-2 px-4 py-2 rounded-xl ${
                isFavorite
                  ? 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                  : 'bg-gray-100 dark:bg-slate-700'
              }`}
            >
              <Heart size={20} className={isFavorite ? 'fill-current' : ''} />
              {isFavorite ? 'В избранном' : 'В избранное'}
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleShare}
              className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-gray-100 dark:bg-slate-700"
            >
              <Share2 size={20} />
              Поделиться
            </motion.button>
          </div>

          <div className="space-y-4">
            <h2 className="font-bold text-lg">О товаре</h2>
            <p className="text-gray-600 dark:text-gray-400 whitespace-pre-line">
              {product.description}
            </p>
          </div>

          {Object.keys(product.specifications).length > 0 && (
            <div className="space-y-4">
              <h2 className="font-bold text-lg">Характеристики</h2>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(product.specifications).map(([key, value]) => (
                  <div key={key} className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">{key}</span>
                    <span className="font-medium">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-4 border-t dark:border-gray-700">
            <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
              <Package size={20} />
              <div className="text-sm">
                <div>Самовывоз</div>
                <div className="font-medium text-gray-900 dark:text-gray-200">Бесплатно</div>
              </div>
            </div>
            <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
              <Truck size={20} />
              <div className="text-sm">
                <div>Доставка</div>
                <div className="font-medium text-gray-900 dark:text-gray-200">от 1000 ₸</div>
              </div>
            </div>
            <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
              <Shield size={20} />
              <div className="text-sm">
                <div>Гарантия</div>
                <div className="font-medium text-gray-900 dark:text-gray-200">14 дней</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-6">Отзывы</h2>
        
        {session && (
          <form onSubmit={handleReviewSubmit} className="mb-8 bg-white dark:bg-slate-800 rounded-2xl p-6">
            <h3 className="text-lg font-bold mb-4">Оставить отзыв</h3>
            <div className="space-y-4">
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Оценка</div>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      type="button"
                      onClick={() => setSelectedRating(rating)}
                      className={`p-2 rounded-lg transition-colors ${
                        selectedRating === rating
                          ? 'bg-yellow-100 dark:bg-yellow-900/30'
                          : 'hover:bg-gray-100 dark:hover:bg-slate-700'
                      }`}
                    >
                      <Star
                        size={24}
                        className={`${
                          rating <= (selectedRating || 0)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300 dark:text-gray-600'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Комментарий</div>
                <textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Поделитесь своим мнением о товаре"
                  className="w-full p-4 rounded-xl bg-gray-100 dark:bg-slate-700 border-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={4}
                />
              </div>
              <motion.button
                type="submit"
                disabled={!selectedRating || submittingReview}
                whileTap={{ scale: 0.95 }}
                className={`px-6 py-2 rounded-xl bg-blue-600 text-white font-medium ${
                  (!selectedRating || submittingReview)
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:bg-blue-700'
                }`}
              >
                {submittingReview ? 'Отправка...' : 'Отправить отзыв'}
              </motion.button>
            </div>
          </form>
        )}

        <div className="space-y-6">
          {reviews.map((review) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-slate-800 rounded-2xl p-6"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-medium">{review.user.name}</div>
                  <div className="flex items-center gap-1 mt-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={16}
                        className={`${
                          star <= review.rating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300 dark:text-gray-600'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  {new Date(review.created_at).toLocaleDateString()}
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mt-4">
                {review.comment}
              </p>
              <div className="flex items-center gap-4 mt-4">
                <button className="flex items-center gap-1 text-gray-500 hover:text-blue-600">
                  <ThumbsUp size={16} />
                  <span className="text-sm">{review.helpful_count}</span>
                </button>
                <button className="flex items-center gap-1 text-gray-500 hover:text-red-600">
                  <ThumbsDown size={16} />
                  <span className="text-sm">{review.not_helpful_count}</span>
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Image Modal */}
      <AnimatePresence>
        {showImageModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowImageModal(false)}
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center"
          >
            <div className="relative w-full h-full flex items-center justify-center">
              <img
                src={product.images[currentImageIndex]}
                alt={product.name}
                className="max-w-full max-h-full object-contain"
              />
              {product.images.length > 1 && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentImageIndex((prev) => 
                        prev === 0 ? product.images.length - 1 : prev - 1
                      );
                    }}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-4 rounded-full bg-white/10 text-white hover:bg-white/20"
                  >
                    <ChevronLeft size={32} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentImageIndex((prev) => 
                        prev === product.images.length - 1 ? 0 : prev + 1
                      );
                    }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-4 rounded-full bg-white/10 text-white hover:bg-white/20"
                  >
                    <ChevronRight size={32} />
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}