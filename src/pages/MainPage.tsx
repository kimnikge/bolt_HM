import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, Phone, Star } from 'lucide-react';
import { motion } from 'framer-motion';

const banners = [
  {
    title: "Фермерские продукты",
    description: "Скидки до 50% на сезонные овощи",
    color: "bg-gradient-to-r from-green-400 to-emerald-500"
  },
  {
    title: "Оптовые цены",
    description: "Специальные предложения для бизнеса",
    color: "bg-gradient-to-r from-blue-400 to-indigo-500"
  },
  {
    title: "Быстрая доставка",
    description: "Бесплатно при заказе от 50000 ₸",
    color: "bg-gradient-to-r from-purple-400 to-pink-500"
  }
];

const categories = [
  { id: '1', name: "Овощи и зелень", icon: "🥬" },
  { id: '2', name: "Фрукты и ягоды", icon: "🍎" },
  { id: '3', name: "Мясо и птица", icon: "🥩" },
  { id: '4', name: "Молочные продукты", icon: "🥛" },
  { id: '5', name: "Бакалея", icon: "🥫" },
  { id: '6', name: "Морепродукты", icon: "🦐" },
  { id: '7', name: "Напитки", icon: "🥤" },
  { id: '8', name: "Кондитерские изделия", icon: "🍰" }
];

export function MainPage() {
  const [currentSlide, setCurrentSlide] = React.useState(0);
  const navigate = useNavigate();

  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen pb-20">
      <main className="container mx-auto px-4 py-6 space-y-8">
        {/* Banners */}
        <div className="relative rounded-3xl overflow-hidden h-48">
          <motion.div
            animate={{ x: `-${currentSlide * 100}%` }}
            transition={{ type: "tween", ease: "easeInOut" }}
            className="flex"
          >
            {banners.map((banner, index) => (
              <div
                key={index}
                className={`${banner.color} w-full h-48 shrink-0 p-8 flex flex-col justify-center text-white`}
              >
                <h2 className="text-3xl font-bold mb-2">{banner.title}</h2>
                <p className="text-lg opacity-90">{banner.description}</p>
              </div>
            ))}
          </motion.div>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  currentSlide === index ? 'bg-white w-6' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Categories */}
        <div className="overflow-x-auto pb-4 -mx-4 px-4">
          <div className="flex gap-4">
            {categories.map((category) => (
              <motion.button
                key={category.id}
                onClick={() => navigate(`/category/${category.id}`)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex flex-col items-center p-4 rounded-2xl bg-white dark:bg-slate-800 shadow-sm hover:shadow-md transition-all min-w-[100px]"
              >
                <span className="text-2xl mb-2">{category.icon}</span>
                <span className="text-sm font-medium whitespace-nowrap">{category.name}</span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Top Suppliers */}
        <section>
          <h2 className="text-xl font-bold mb-4">Топ поставщиков</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((supplier) => (
              <motion.div
                key={supplier}
                onClick={() => navigate(`/seller/${supplier}`)}
                whileHover={{ y: -4 }}
                className="p-4 rounded-2xl bg-white dark:bg-slate-800 shadow-sm cursor-pointer"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-bold">ЭкоФерма {supplier}</h3>
                    <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                      <Star size={16} className="fill-yellow-400 text-yellow-400" />
                      <span>4.{8 + supplier}</span>
                      <span className="inline-flex ml-2 px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400 text-xs">
                        Онлайн
                      </span>
                    </div>
                  </div>
                  <span className="text-sm text-gray-500">Алматы</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  156 товаров
                </p>
                <div className="flex gap-2">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(`https://wa.me/7${supplier}00000000`, '_blank');
                    }}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium text-sm hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-all"
                  >
                    <MessageCircle size={18} />
                    Написать
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      window.location.href = `tel:+7${supplier}00000000`;
                    }}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 font-medium text-sm hover:bg-green-100 dark:hover:bg-green-900/50 transition-all"
                  >
                    <Phone size={18} />
                    Позвонить
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* New Products */}
        <section>
          <h2 className="text-xl font-bold mb-4">Новые товары</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((product) => (
              <motion.div
                key={product}
                onClick={() => navigate(`/product/${product}`)}
                whileHover={{ y: -4 }}
                className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm overflow-hidden cursor-pointer"
              >
                <div className="aspect-video bg-gray-100 dark:bg-slate-700" />
                <div className="p-4">
                  <h3 className="font-bold mb-1">Яблоки Голден</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Свежие яблоки высшего сорта
                  </p>
                  <div className="flex justify-between items-center mb-3">
                    <div>
                      <div className="text-lg font-bold">850 ₸/кг</div>
                      <div className="text-sm text-gray-500">Мин. заказ: 10 кг</div>
                    </div>
                    <div className="text-right">
                      <div 
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/seller/${product}`);
                        }}
                        className="font-medium text-sm hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer"
                      >
                        ЭкоФерма
                      </div>
                      <div className="text-sm text-gray-500">Алматы</div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(`https://wa.me/7${product}00000000`, '_blank');
                      }}
                      className="flex-1 py-2 rounded-xl bg-blue-600 text-white font-medium text-sm hover:bg-blue-700 transition-all"
                    >
                      Связаться
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}