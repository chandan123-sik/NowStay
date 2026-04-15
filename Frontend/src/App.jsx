import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { WalletProvider } from './context/WalletContext';

// Layouts
import UserLayout from './components/shared/UserLayout';
import AdminLayout from './components/shared/AdminLayout';

// User Pages
import Home from './modules/user/pages/Home';
import Rooms from './modules/user/pages/Rooms';
import Wallet from './modules/user/pages/Wallet';
import TransactionHistory from './modules/user/pages/TransactionHistory';
import About from './modules/user/pages/About';
import Gallery from './modules/user/pages/Gallery';
import Contact from './modules/user/pages/Contact';
import Login from './modules/user/pages/Login';
import Signup from './modules/user/pages/Signup';
import Profile from './modules/user/pages/Profile';
import MyBookings from './modules/user/pages/MyBookings';
import AccountDetails from './modules/user/pages/AccountDetails';
import BookingFlow from './modules/user/pages/BookingFlow';
import Stay from './modules/user/pages/Stay';
import Dine from './modules/user/pages/Dine';
import Dip from './modules/user/pages/Dip';
import Care from './modules/user/pages/Care';
import Terms from './modules/user/pages/Terms';
import Notifications from './modules/user/pages/Notifications';
import ForgotPassword from './modules/user/pages/ForgotPassword';

// Admin Pages
import Dashboard from './modules/admin/pages/Dashboard';
import AdminLogin from './modules/admin/pages/AdminLogin';
import RoomMgmt from './modules/admin/pages/RoomMgmt';
import VariantMgmt from './modules/admin/pages/VariantMgmt';
import PricingMgmt from './modules/admin/pages/PricingMgmt';
import Bookings from './modules/admin/pages/Bookings';
import Users from './modules/admin/pages/Users';
import Discounts from './modules/admin/pages/Discounts';
import Transactions from './modules/admin/pages/Transactions';
import MediaMgmt from './modules/admin/pages/MediaMgmt';
import ServiceMgmt from './modules/admin/pages/ServiceMgmt';
import Messages from './modules/admin/pages/Messages';
import AdminProfile from './modules/admin/pages/AdminProfile';

// Admin Inventory & Setup
import Availability from './modules/admin/pages/inventory/Availability';
import Rates from './modules/admin/pages/inventory/Rates';
import BulkUpdate from './modules/admin/pages/inventory/BulkUpdate';
import Taxes from './modules/admin/pages/setup/Taxes';
import Charges from './modules/admin/pages/setup/Charges';
import RatePlans from './modules/admin/pages/setup/RatePlans';
import Property from './modules/admin/pages/setup/Property';
import PaymentSettings from './modules/admin/pages/setup/PaymentSettings';
import TermsMgmt from './modules/admin/pages/setup/TermsMgmt';

// Route Guards
const AdminRoute = ({ children }) => {
  const { role, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  return role === 'admin' ? children : <Navigate to="/admin/login" />;
};

const UserRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  return user ? children : <Navigate to="/login" />;
};

import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <AuthProvider>
      <WalletProvider>
        <Router>
          <Toaster
            position="top-right"
            toastOptions={{
              className: 'text-[10px] font-black uppercase tracking-widest',
              duration: 4000,
              style: {
                background: '#1e293b',
                color: '#fff',
                borderRadius: '1rem',
                border: '1px solid rgba(255,255,255,0.1)'
              }
            }}
          />
          <Routes>
            {/* Public Routes - No UserLayout (Login/Signup usually don't need the main navbar) */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/terms" element={<Terms />} />

            {/* User Module - Combined Public and Protected */}
            <Route element={<UserLayout />}>
              <Route index element={<Home />} />
              <Route path="rooms" element={<Rooms />} />
              <Route path="about" element={<About />} />
              <Route path="gallery" element={<Gallery />} />
              <Route path="contact" element={<Contact />} />
              <Route path="stay" element={<Stay />} />
              <Route path="dine" element={<Dine />} />
              <Route path="dip" element={<Dip />} />
              <Route path="care" element={<Care />} />

              {/* Protected User Routes */}
              <Route path="wallet" element={<UserRoute><Wallet /></UserRoute>} />
              <Route path="wallet/history" element={<UserRoute><TransactionHistory /></UserRoute>} />
              <Route path="profile" element={<UserRoute><Profile /></UserRoute>} />
              <Route path="profile/wishlist" element={<UserRoute><Profile /></UserRoute>} />
              <Route path="profile/bookings" element={<UserRoute><MyBookings /></UserRoute>} />
              <Route path="profile/details" element={<UserRoute><AccountDetails /></UserRoute>} />
              <Route path="book" element={<UserRoute><BookingFlow /></UserRoute>} />
              <Route path="notifications" element={<UserRoute><Notifications /></UserRoute>} />
            </Route>

            {/* Admin Module */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminLayout />
                </AdminRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="rooms" element={<RoomMgmt />} />
              <Route path="rooms/variants" element={<VariantMgmt />} />
              <Route path="bookings" element={<Bookings />} />
              <Route path="users" element={<Users />} />
              <Route path="discounts" element={<Discounts />} />
              <Route path="wallet" element={<Transactions />} />
              <Route path="media" element={<MediaMgmt />} />
              <Route path="services" element={<ServiceMgmt />} />
              <Route path="messages" element={<Messages />} />
              <Route path="profile" element={<AdminProfile />} />

              {/* Inventory Management */}
              <Route path="inventory/availability" element={<Availability />} />
              <Route path="inventory/rates" element={<Rates />} />
              <Route path="inventory/bulk-update" element={<BulkUpdate />} />

              {/* System Setup */}
              <Route path="setup/pricing" element={<PricingMgmt />} />
              <Route path="setup/taxes" element={<Taxes />} />
              <Route path="setup/charges" element={<Charges />} />
              <Route path="setup/rate-plans" element={<RatePlans />} />
              <Route path="setup/property" element={<Property />} />
              <Route path="setup/payments" element={<PaymentSettings />} />
              <Route path="setup/terms" element={<TermsMgmt />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Router>
      </WalletProvider>
    </AuthProvider>
  );
}

export default App;

