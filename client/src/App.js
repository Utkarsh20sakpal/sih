import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import AuthCallback from './pages/auth/AuthCallback';
import UserDashboard from './pages/user/UserDashboard';
import UserHistory from './pages/user/UserHistory';
import UserLeaderboard from './pages/user/UserLeaderboard';
import UserFeedback from './pages/user/UserFeedback';
import UserRewards from './pages/user/UserRewards';
import SupervisorDashboard from './pages/supervisor/SupervisorDashboard';
import SupervisorCollectors from './pages/supervisor/SupervisorCollectors';
import SupervisorBins from './pages/supervisor/SupervisorBins';
import SupervisorFeedback from './pages/supervisor/SupervisorFeedback';
import CollectorDashboard from './pages/collector/CollectorDashboard';
import CollectorMap from './pages/collector/CollectorMap';
import CollectorHistory from './pages/collector/CollectorHistory';
import CollectorWarnings from './pages/collector/CollectorWarnings';
import CustomerCare from './pages/CustomerCare';
import SafaiMaster from './pages/SafaiMaster';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';
import RoleDashboardRedirect from './components/auth/RoleDashboardRedirect';

function App() {
  const location = useLocation();
  return (
    <ThemeProvider>
      <AuthProvider>
        <div className="App d-flex flex-column min-vh-100">
          <Navbar />
          <main className="flex-grow-1">
            <div key={location.pathname} className="fade-in">
            <Routes future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              <Route path="/customer-care" element={<CustomerCare />} />
              <Route path="/safai-master" element={<SafaiMaster />} />
              
              {/* Profile Routes */}
              <Route path="/profile" element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } />
              <Route path="/settings" element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              } />
              
              {/* User Routes */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <RoleDashboardRedirect />
                </ProtectedRoute>
              } />
              <Route path="/user/dashboard" element={
                <ProtectedRoute userType="user">
                  <UserDashboard />
                </ProtectedRoute>
              } />
              <Route path="/user/history" element={
                <ProtectedRoute userType="user">
                  <UserHistory />
                </ProtectedRoute>
              } />
              <Route path="/user/leaderboard" element={
                <ProtectedRoute userType="user">
                  <UserLeaderboard />
                </ProtectedRoute>
              } />
              <Route path="/user/feedback" element={
                <ProtectedRoute userType="user">
                  <UserFeedback />
                </ProtectedRoute>
              } />
              <Route path="/user/rewards" element={
                <ProtectedRoute userType="user">
                  <UserRewards />
                </ProtectedRoute>
              } />
              
              {/* Supervisor Routes */}
              <Route path="/supervisor/dashboard" element={
                <ProtectedRoute userType="supervisor">
                  <SupervisorDashboard />
                </ProtectedRoute>
              } />
              <Route path="/supervisor/collectors" element={
                <ProtectedRoute userType="supervisor">
                  <SupervisorCollectors />
                </ProtectedRoute>
              } />
              <Route path="/supervisor/bins" element={
                <ProtectedRoute userType="supervisor">
                  <SupervisorBins />
                </ProtectedRoute>
              } />
              <Route path="/supervisor/feedback" element={
                <ProtectedRoute userType="supervisor">
                  <SupervisorFeedback />
                </ProtectedRoute>
              } />
              
              {/* Collector Routes */}
              <Route path="/collector/dashboard" element={
                <ProtectedRoute userType="collector">
                  <CollectorDashboard />
                </ProtectedRoute>
              } />
              <Route path="/collector/map" element={
                <ProtectedRoute userType="collector">
                  <CollectorMap />
                </ProtectedRoute>
              } />
              <Route path="/collector/history" element={
                <ProtectedRoute userType="collector">
                  <CollectorHistory />
                </ProtectedRoute>
              } />
              <Route path="/collector/warnings" element={
                <ProtectedRoute userType="collector">
                  <CollectorWarnings />
                </ProtectedRoute>
              } />
              
              {/* 404 Route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            </div>
          </main>
          <Footer />
        </div>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
