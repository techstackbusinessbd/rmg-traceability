import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import AdminConsolePage from './pages/AdminConsolePage';
import UserDetailsPage from './pages/UserDetailsPage';
import { useAuthStore } from './store/authStore';
import { useThemeStore } from './store/themeStore';

function ProtectedAdminRoute({ children }) {
  const { isAuthenticated } = useAuthStore();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function GuestOnlyRoute({ children }) {
  const { isAuthenticated } = useAuthStore();
  if (isAuthenticated) {
    return <Navigate to="/admin" replace />;
  }
  return children;
}

export default function App() {
  const { initTheme } = useThemeStore();

  React.useEffect(() => {
    initTheme();
  }, [initTheme]);

  return (
    <BrowserRouter>
      <Routes>
        <Route 
          path="/" 
          element={
            <GuestOnlyRoute>
              <HomePage />
            </GuestOnlyRoute>
          } 
        />
        <Route 
          path="/login" 
          element={
            <GuestOnlyRoute>
              <LoginPage />
            </GuestOnlyRoute>
          } 
        />
        <Route 
          path="/admin" 
          element={
            <ProtectedAdminRoute>
              <AdminConsolePage />
            </ProtectedAdminRoute>
          } 
        />
        <Route 
          path="/admin/users/:id" 
          element={
            <ProtectedAdminRoute>
              <UserDetailsPage />
            </ProtectedAdminRoute>
          } 
        />
        <Route 
          path="/admin/:subRoute" 
          element={
            <ProtectedAdminRoute>
              <AdminConsolePage />
            </ProtectedAdminRoute>
          } 
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
