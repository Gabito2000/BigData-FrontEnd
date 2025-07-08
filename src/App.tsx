
import { SidebarNav } from '@/components/screens/main-layout/sidebar-nav';
import LoginPage from '@/components/screens/main-layout/LoginPage';
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

function App() {
  const isAuthenticated = !!localStorage.getItem('token');
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/*"
          element={isAuthenticated ? <SidebarNav /> : <Navigate to="/login" replace />}
        />
      </Routes>
    </Router>
  );
}

export default App;
