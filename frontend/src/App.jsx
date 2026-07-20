// src/App.jsx
import React from 'react';
import { createBrowserRouter, RouterProvider, Link, Outlet } from 'react-router-dom';
import DashboardPage from './pages/DashboardPage';
import { EmployeePage } from './pages/EmployeePage'; 

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
      <Link to="/employee" style={{ color: '#007bff', textDecoration: 'none', fontWeight: 'bold' }}>
        🎧 Agent Portal
      </Link>
    </nav>
    <Outlet />
  </div>
);

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { path: '/', element: <DashboardPage /> },
      { path: '/employee', element: <EmployeePage /> },
    ]
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;