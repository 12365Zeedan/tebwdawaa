import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { CartProvider } from "@/contexts/CartContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { lazy, Suspense } from "react";

// Only Index is eagerly loaded for fast initial paint
import Index from "./pages/Index";

// Lazy-loaded public pages
const Products = lazy(() => import("./pages/Products"));
const ProductDetail = lazy(() => import("./pages/ProductDetail"));
const Categories = lazy(() => import("./pages/Categories"));
const CategoryDetail = lazy(() => import("./pages/CategoryDetail"));
const Blog = lazy(() => import("./pages/Blog"));
const BlogPostPage = lazy(() => import("./pages/BlogPost"));
const Cart = lazy(() => import("./pages/Cart"));
const Checkout = lazy(() => import("./pages/Checkout"));
const OrderHistory = lazy(() => import("./pages/OrderHistory"));
const Profile = lazy(() => import("./pages/Profile"));
const Wishlist = lazy(() => import("./pages/Wishlist"));
const Compare = lazy(() => import("./pages/Compare"));
const About = lazy(() => import("./pages/About"));
const Auth = lazy(() => import("./pages/Auth"));
const NotFound = lazy(() => import("./pages/NotFound"));
const DocsPage = lazy(() => import("./pages/Docs"));
const ThemeUpdates = lazy(() => import("./pages/ThemeUpdates"));

// Lazy-loaded admin pages
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminProducts = lazy(() => import("./pages/admin/AdminProducts"));
const AdminCategories = lazy(() => import("./pages/admin/AdminCategories"));
const AdminOrders = lazy(() => import("./pages/admin/AdminOrders"));
const AdminCustomers = lazy(() => import("./pages/admin/AdminCustomers"));
const AdminBlog = lazy(() => import("./pages/admin/AdminBlog"));
const AdminBlogAnalytics = lazy(() => import("./pages/admin/AdminBlogAnalytics"));
const AdminBlogComments = lazy(() => import("./pages/admin/AdminBlogComments"));
const AdminNewsletter = lazy(() => import("./pages/admin/AdminNewsletter"));
const AdminSettings = lazy(() => import("./pages/admin/AdminSettings"));
const AdminDiscounts = lazy(() => import("./pages/admin/AdminDiscounts"));
const AdminTheme = lazy(() => import("./pages/admin/AdminTheme"));
const AdminShipping = lazy(() => import("./pages/admin/AdminShipping"));
const AdminCheckoutPayment = lazy(() => import("./pages/admin/AdminCheckoutPayment"));
const AdminPlugins = lazy(() => import("./pages/admin/AdminPlugins"));
const AdminSiteHealth = lazy(() => import("./pages/admin/AdminSiteHealth"));
const AdminBackups = lazy(() => import("./pages/admin/AdminBackups"));
const AdminTrends = lazy(() => import("./pages/admin/AdminTrends"));
const AdminChat = lazy(() => import("./pages/admin/AdminChat"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <AuthProvider>
        <ThemeProvider>
          <CartProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Suspense fallback={null}>
                  <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<Index />} />
                    <Route path="/products" element={<Products />} />
                    <Route path="/products/:slug" element={<ProductDetail />} />
                    <Route path="/categories" element={<Categories />} />
                    <Route path="/categories/:id" element={<CategoryDetail />} />
                    <Route path="/blog" element={<Blog />} />
                    <Route path="/blog/:slug" element={<BlogPostPage />} />
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/checkout" element={<Checkout />} />
                    <Route path="/orders" element={<OrderHistory />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/wishlist" element={<Wishlist />} />
                    <Route path="/compare" element={<Compare />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/auth" element={<Auth />} />
                    <Route path="/theme-updates" element={<ThemeUpdates />} />
                    <Route path="/docs" element={<DocsPage />} />
                    
                    {/* Admin Routes */}
                    <Route path="/admin" element={<AdminDashboard />} />
                    <Route path="/admin/products" element={<AdminProducts />} />
                    <Route path="/admin/categories" element={<AdminCategories />} />
                    <Route path="/admin/orders" element={<AdminOrders />} />
                    <Route path="/admin/customers" element={<AdminCustomers />} />
                    <Route path="/admin/blog" element={<AdminBlog />} />
                    <Route path="/admin/blog/analytics" element={<AdminBlogAnalytics />} />
                    <Route path="/admin/blog/comments" element={<AdminBlogComments />} />
                    <Route path="/admin/newsletter" element={<AdminNewsletter />} />
                    <Route path="/admin/discounts" element={<AdminDiscounts />} />
                    <Route path="/admin/shipping" element={<AdminShipping />} />
                    <Route path="/admin/checkout-payment" element={<AdminCheckoutPayment />} />
                    <Route path="/admin/theme" element={<AdminTheme />} />
                    <Route path="/admin/plugins" element={<AdminPlugins />} />
                    <Route path="/admin/site-health" element={<AdminSiteHealth />} />
                    <Route path="/admin/backups" element={<AdminBackups />} />
                    <Route path="/admin/trends" element={<AdminTrends />} />
                    <Route path="/admin/chat" element={<AdminChat />} />
                    <Route path="/admin/settings" element={<AdminSettings />} />
                    
                    {/* Catch-all */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
              </BrowserRouter>
            </TooltipProvider>
          </CartProvider>
        </ThemeProvider>
      </AuthProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
