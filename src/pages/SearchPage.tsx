import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search as SearchIcon, Filter, X, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/lib/store';
import { supabase } from '@/lib/supabase';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  seller: {
    id: string;
    name: string;
  };
}

interface FilterState {
  category: string;
  minPrice: string;
  maxPrice: string;
  sortBy: 'newest' | 'price_asc' | 'price_desc' | 'rating';
}

const categories = [
  { id: '1', name: "Овощи и зелень" },
  { id: '2', name: "Фрукты и ягоды" },
  { id: '3', name: "Мясо и птица" },
  { id: '4', name: "Молочные продукты" },
  { id: '5', name: "Бакалея" },
  { id: '6', name: "Морепродукты" },
  { id: '7', name: "Напитки" },
  { id: '8', name: "Кондитерские изделия" }
];

export function SearchPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { searchHistory, addSearchTerm, favorites, toggleProductFavorite } = useStore();
  
  const [searchTerm, setSearchTerm] = React.useState(searchParams.get('q') || '');
  const [showSearchHistory, setShowSearchHistory] = React.useState(false);
  const [showFilters, setShowFilters] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [products, setProducts] = React.useState<Product[]>([]);
  
  const [filters, setFilters] = React.useState<FilterState>({
    category: searchParams.get('category') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    sortBy: (searchParams.get('sortBy') as FilterState['sortBy']) || 'newest'
  });

  React.useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        let query = supabase
          .from('products')
          .select('*, seller:sellers(id, name)');

        // Apply search term
        if (searchTerm) {
          query = query.ilike('name', `%${searchTerm}%`);
        }

        // Apply filters
        if (filters.category) {
          query = query.eq('category_id', filters.category);
        }
        if (filters.minPrice) {
          query = query.gte('price', filters.minPrice);
        }
        if (filters.maxPrice) {
          query = query.lte('price', filters.maxPrice);
        }

        // Apply sorting
        switch (filters.sortBy) {
          case 'price_asc':
            query = query.order('price', { ascending: true });
            break;
          case 'price_desc':
            query = query.order('price', { ascending: false });
            break;
          case 'rating':
            query = query.order('rating', { ascending: false });
            break;
          default:
            query = query.order('created_at', { ascending: false });
        }

        const { data, error } = await query;

        if (error) throw error;
        setProducts(data);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [searchTerm, filters]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      addSearchTerm(searchTerm.trim());
      setShowSearchHistory(false);
      setSearchParams({ q: searchTerm, ...filters });
    }
  };

  const handleFilterChange = (newFilters: Partial<FilterState>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    setSearchParams({
      q: searchTerm,
      ...updatedFilters
    });
  };

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Search Form */}
      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setShowSearchHistory(true);
              }}
              onFocus={() => setShowSearchHistory(true)}
              placeholder="Поиск товаров"
              className="w-full px-4 py-3 pl-12 rounded-2xl bg-white dark:bg-slate-800 border-none focus:ring-2 focus:ring-blue-500"
            />
            <SearchIcon className="absolute left-4 top-3.5 text-gray-400" size={20} />
            {searchTerm && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setShowSearchHistory(false);
                }}
                className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            )}
            
            {/* Search History Dropdown */}
            <AnimatePresence>
              {showSearchHistory && searchHistory.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 rounded-2xl shadow-lg z-10"
                >
                  <div className="p-2">
                    {searchHistory.map((term) => (
                      <button
                        key={term}
                        onClick={() => {
                          setSearchTerm(term);
                          setShowSearchHistory(false);
                          setSearchParams({ q: term, ...filters });
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-700 text-left"
                      >
                        <SearchIcon size={16} className="text-gray-400" />
                        {term}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
          >
            <Filter size={20} />
            <span className="font-medium">Фильтры</span>
          </button>
        </div>
      </form>

      {/* Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 overflow-hidden"
          >
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Категория</label>
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange({ category: e.target.value })}
                  className="w-full p-3 rounded-xl bg-gray-100 dark:bg-slate-700 border-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Все категории</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Цена</label>
                <div className="flex gap-4">
                  <input
                    type="number"
                    value={filters.minPrice}
                    onChange={(e) => handleFilterChange({ minPrice: e.target.value })}
                    placeholder="От"
                    className="flex-1 p-3 rounded-xl bg-gray-100 dark:bg-slate-700 border-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="number"
                    value={filters.maxPrice}
                    onChange={(e) => handleFilterChange({ maxPrice: e.target.value })}
                    placeholder="До"
                    className="flex-1 p-3 rounded-xl bg-gray-100 dark:bg-slate-700 border-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Сортировка</label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange({ 
                    sortBy: e.target.value as FilterState['sortBy']
                  })}
                  className="w-full p-3 rounded-xl bg-gray-100 dark:bg-slate-700 border-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="newest">Сначала новые</option>
                  <option value="price_asc">Сначала дешевле</option>
                  <option value="price_desc">Сначала дороже</option>
                  <option value="rating">По рейтингу</option>
                </select>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <div key={n} className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden animate-pulse">
              <div className="aspect-video bg-gray-200 dark:bg-slate-700" />
              <div className="p-4 space-y-3">
                <div className="h-6 bg-gray-200 dark:bg-slate-700 rounded-lg" />
                <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded-lg w-2/3" />
                <div className="h-8 bg-gray-200 dark:bg-slate-700 rounded-lg w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <motion.div
              key={product.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              <div
                onClick={() => navigate(`/product/${product.id}`)}
                className="cursor-pointer"
              >
                <div className="aspect-video bg-gray-100 dark:bg-slate-700 relative overflow-hidden">
                  {product.images[0] && (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleProductFavorite(product.id);
                    }}
                    className={`absolute top-2 right-2 p-2 rounded-full bg-white/80 backdrop-blur-sm
                      ${favorites.products.includes(product.id)
                        ? 'text-red-500'
                        : 'text-gray-500 hover:text-red-500'
                      }`}
                  >
                    <Heart
                      size={20}
                      className={favorites.products.includes(product.id) ? 'fill-current' : ''}
                    />
                  </button>
                </div>
                <div className="p-4">
                  <h3 className="font-bold mb-1 line-clamp-2">{product.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                    {product.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="text-lg font-bold">
                      {product.price.toLocaleString()} ₸
                    </div>
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/seller/${product.seller.id}`);
                      }}
                      className="text-sm text-gray-500 hover:text-blue-600 cursor-pointer"
                    >
                      {product.seller.name}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-2xl font-bold mb-2">Ничего не найдено</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Попробуйте изменить параметры поиска
          </p>
        </div>
      )}
    </div>
  );
}