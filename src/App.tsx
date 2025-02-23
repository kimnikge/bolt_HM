import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useStore } from '@/lib/store';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { PageTransition } from '@/components/layout/PageTransition';
import { LoginPage } from '@/pages/auth/LoginPage';
import { RegisterPage } from '@/pages/auth/RegisterPage';
import { MainPage } from '@/pages/MainPage';
import { CategoryPage } from '@/pages/CategoryPage';
import { ProductPage } from '@/pages/ProductPage';
import { SellerPage } from '@/pages/SellerPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { SearchPage } from '@/pages/SearchPage';
import { AdminDashboard } from '@/pages/admin/Dashboard';
import { AdminSellers } from '@/pages/admin/Sellers';
import { AdminProducts } from '@/pages/admin/Products';
import { AdminCategories } from '@/pages/admin/Categories';
import { AdminSubscriptions } from '@/pages/admin/Subscriptions';
import { AdminBanners } from '@/pages/admin/Banners';
import { AdminAnalytics } from '@/pages/admin/Analytics';

function App() {
  const { darkMode, session } = useStore();

  return (
    <Router>
      <div className={`min-h-screen ${darkMode ? 'dark bg-slate-900' : 'bg-gray-50'}`}>
        <Routes>
          {/* Auth Routes */}
          <Route 
            path="/login" 
            element={session ? <Navigate to="/" replace /> : <LoginPage />} 
          />
          <Route 
            path="/register" 
            element={session ? <Navigate to="/" replace /> : <RegisterPage />} 
          />
          
          {/* Admin Routes - Protected */}
          <Route 
            path="/admin" 
            element={!session ? <Navigate to="/login" replace /> : <AdminDashboard />} 
          />
          <Route 
            path="/admin/sellers" 
            element={!session ? <Navigate to="/login" replace /> : <AdminSellers />} 
          />
          <Route 
            path="/admin/products" 
            element={!session ? <Navigate to="/login" replace /> : <AdminProducts />} 
          />
          <Route 
            path="/admin/categories" 
            element={!session ? <Navigate to="/login" replace /> : <AdminCategories />} 
          />
          <Route 
            path="/admin/subscriptions" 
            element={!session ? <Navigate to="/login" replace /> : <AdminSubscriptions />} 
          />
          <Route 
            path="/admin/banners" 
            element={!session ? <Navigate to="/login" replace /> : <AdminBanners />} 
          />
          <Route 
            path="/admin/analytics" 
            element={!session ? <Navigate to="/login" replace /> : <AdminAnalytics />} 
          />
          
          {/* Public Routes */}
          <Route
            path="*"
            element={
              <>
                <Header />
                <PageTransition>
                  <Routes>
                    <Route path="/" element={<MainPage />} />
                    <Route path="/category/:id" element={<CategoryPage />} />
                    <Route path="/product/:id" element={<ProductPage />} />
                    <Route path="/seller/:id" element={<SellerPage />} />
                    <Route 
                      path="/profile" 
                      element={!session ? <Navigate to="/login" replace /> : <ProfilePage />} 
                    />
                    <Route path="/search" element={<SearchPage />} />
                  </Routes>
                </PageTransition>
                <BottomNav />
              </>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;