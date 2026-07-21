// src/App.jsx
import React from 'react';
import { createBrowserRouter, RouterProvider, Navigate, Outlet, Link, useNavigate } from 'react-router-dom';
import DashboardPage from './pages/DashboardPage';
import { EmployeePage } from './pages/EmployeePage';
import { LoginPage } from './pages/LoginPage';
import { logoutUser } from './services/api';

// 🛡️ רכיב הגנה - חוסם גישה לעמודי מנהל אם המשתמש הוא לא Manager
const ProtectedManagerRoute = () => {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (user.role !== "Manager") {
    alert("⛔ גישה מוגבלת: עמוד זה מיועד למנהלים בלבד!");
    return <Navigate to="/employee" replace />;
  }
  
  return <Outlet />;
};

// 🛡️ רכיב הגנה כללי - לוודא שהמשתמש מחובר
const ProtectedRoute = () => {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return <Outlet />;
};

const Layout = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const handleLogout = async () => {
    try {
      // 🔑 ביצוע Logout מול השרת למחיקת ה-Cookie המאובטח
      await logoutUser();
    } catch (e) {
      console.error("Logout error:", e);
    } finally {
      localStorage.removeItem("user");
      navigate("/login");
    }
  };

  return (
    <div>
      <nav style={{
        display: 'flex',
        gap: '20px',
        padding: '15px 30px',
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #dee2e6',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
        fontFamily: 'Arial, sans-serif',
        alignItems: 'center'
      }}>
        {/* 📊 מציג את הקישור ל-Dashboard רק אם המשתמש הוא Manager */}
        {user.role === "Manager" && (
          <Link to="/" style={{ color: '#007bff', textDecoration: 'none', fontWeight: 'bold' }}>
            📊 Manager Dashboard
          </Link>
        )}

        <Link to="/employee" style={{ color: '#007bff', textDecoration: 'none', fontWeight: 'bold' }}>
          🎧 Agent Portal
        </Link>

        {/* 👤 אזור פרופיל והתנתקות */}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '15px', alignItems: 'center' }}>
          <span style={{ fontSize: '14px', color: '#475569' }}>
            שלום, <strong>{user.name}</strong> <span style={{ fontSize: '12px', color: '#64748b' }}>({user.role})</span>
          </span>
          <button 
            onClick={handleLogout}
            style={{
              padding: '6px 12px',
              backgroundColor: '#ef4444',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 'bold'
            }}
          >
            התנתק
          </button>
        </div>
      </nav>
      <Outlet />
    </div>
  );
};

const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  {
    path: '/',
    element: <Layout />,
    children: [
      // 🛡️ נתיב מוגן למנהלים בלבד
      {
        element: <ProtectedManagerRoute />,
        children: [
          { path: '/', element: <DashboardPage /> }
        ]
      },
      // 🛡️ נתיב מוגן לכל העובדים (Agents + Managers)
      {
        element: <ProtectedRoute />,
        children: [
          { path: '/employee', element: <EmployeePage /> }
        ]
      }
    ]
  }
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;