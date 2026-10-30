import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Public Pages
import Home from './pages/Home';
import Packages from './pages/Packages';
import Gallery from './pages/Gallery';
import GalleryDetail from './pages/GalleryDetail';
import PrivateGallery from './pages/PrivateGallery';
import LivePhotoSharing from './pages/LivePhotoSharing';
import ScanQR from './pages/ScanQR';
import AboutUs from './pages/AboutUs';
import ContactUs from './pages/ContactUs';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import BookingForm from './pages/BookingForm';
import BookingSuccess from './pages/BookingSuccess';
import CustomerDashboard from './pages/CustomerDashboard';
import NotFound from './pages/NotFound';

// Admin Pages
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminBookings from './pages/admin/AdminBookings';
import AdminCalendar from './pages/admin/AdminCalendar';
import AdminPackages from './pages/admin/AdminPackages';
import AdminGalleries from './pages/admin/AdminGalleries';
import AdminLiveEvent from './pages/admin/AdminLiveEvent';
import AdminEnquiries from './pages/admin/AdminEnquiries';

// Layout wrapper to hide standard Navbar and Footer on admin dashboard routes
function AppContent() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className="flex flex-col min-h-screen">
      {!isAdminRoute && <Navbar />}
      <div className="flex-1">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/packages" element={<Packages />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/gallery/:id" element={<GalleryDetail />} />
          <Route path="/gallery/private/:token" element={<PrivateGallery />} />
          <Route path="/live" element={<LivePhotoSharing />} />
          <Route path="/scan" element={<ScanQR />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/contact" element={<ContactUs />} />

          {/* Authentication & Customer Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/book" element={<BookingForm />} />
          <Route path="/booking-success" element={<BookingSuccess />} />
          <Route path="/dashboard" element={<CustomerDashboard />} />

          {/* Protected Admin Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="bookings" element={<AdminBookings />} />
            <Route path="calendar" element={<AdminCalendar />} />
            <Route path="packages" element={<AdminPackages />} />
            <Route path="galleries" element={<AdminGalleries />} />
            <Route path="live" element={<AdminLiveEvent />} />
            <Route path="enquiries" element={<AdminEnquiries />} />
          </Route>

          {/* Fallback 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
      {!isAdminRoute && <Footer />}
    </div>
  );
}

import SplashIntro from './components/SplashIntro';

export default function App() {
  const [showSplash, setShowSplash] = React.useState(() => {
    // Run on startup when application starts
    return !sessionStorage.getItem('5star_splash_completed');
  });

  const handleSplashFinish = () => {
    sessionStorage.setItem('5star_splash_completed', 'true');
    setShowSplash(false);
  };

  return (
    <AuthProvider>
      <ToastProvider>
        {showSplash && <SplashIntro onFinish={handleSplashFinish} />}
        <Router>
          <AppContent />
        </Router>
      </ToastProvider>
    </AuthProvider>
  );
}
