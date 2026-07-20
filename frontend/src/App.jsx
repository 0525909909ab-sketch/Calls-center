// src/App.jsx
import React from 'react';
import { createBrowserRouter, RouterProvider, Link, Outlet } from 'react-router-dom';
import DashboardPage from './pages/DashboardPage';
import { SchedulePage } from './pages/SchedulePage';

// Light-themed navigation bar
const Layout = () => (
  <div>
    <nav style={{
      display: 'flex',
      gap: '20px',
      padding: '15px 30px',
      backgroundColor: '#ffffff',
      borderBottom: '1px solid #dee2e6',
      boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
      fontFamily: 'Arial, sans-serif'
    }}>
      <Link to="/" style={{ color: '#007bff', textDecoration: 'none', fontWeight: 'bold' }}>
        📊 Manager Dashboard
      </Link>
      <Link to="/schedule" style={{ color: '#007bff', textDecoration: 'none', fontWeight: 'bold' }}>
        📅 Shift Schedule
      </Link>
      <Link to="/employee" style={{ color: '#6c757d', textDecoration: 'none', fontWeight: 'bold' }}>
        🎧 Employee Page
      </Link>
    </nav>
    <Outlet />
  </div>
);

// Temporary placeholder for the Employee Page
const EmployeePage = () => (
  <div style={{ padding: '30px', color: '#333', backgroundColor: '#f8f9fa', minHeight: '100vh', fontFamily: 'Arial, sans-serif' }}>
    <h2>🎧 Employee Page (Under Construction)</h2>
  </div>
);

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { path: '/', element: <DashboardPage /> },
      { path: '/schedule', element: <SchedulePage /> },
      { path: '/employee', element: <EmployeePage /> },
    ]
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;