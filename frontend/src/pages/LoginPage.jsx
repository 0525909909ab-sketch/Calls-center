// src/pages/LoginPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../services/api';

export const LoginPage = () => {
  const [employeeId, setEmployeeId] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!employeeId || !password) {
      setErrorMessage('נא להזין מזהה עובד וסיסמה.');
      return;
    }

    try {
      setLoading(true);
      // קריאה לשרת להתחברות והזרקת ה-Cookie
      const user = await loginUser(employeeId, password);

      if (user) {
        // שמירת פרטי המשתמש בפרונטנד
        localStorage.setItem('user', JSON.stringify(user));

        // ניתוב מבוסס תפקיד (Role-Based Routing)
        if (user.role === 'Manager') {
          navigate('/');
        } else {
          navigate('/employee');
        }
      } else {
        setErrorMessage('מזהה עובד או סיסמה שגויים');
      }
    } catch (err) {
      console.error('Login error:', err);
      setErrorMessage('שגיאת התחברות, וודא שהשרת פעיל.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '80vh',
      backgroundColor: '#f8f9fa',
      fontFamily: 'Arial, sans-serif',
      direction: 'rtl'
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        padding: '40px',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        width: '100%',
        maxWidth: '400px',
        border: '1px solid #e2e8f0'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1 style={{ margin: '0 0 8px 0', fontSize: '24px', color: '#1e293b' }}>
            Workforce Management
          </h1>
          <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
            כניסה למערכת ניהול כוח אדם
          </p>
        </div>

        {errorMessage && (
          <div style={{
            padding: '12px',
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#dc2626',
            borderRadius: '6px',
            fontSize: '14px',
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', color: '#475569', marginBottom: '6px' }}>
              מזהה עובד (Employee ID)
            </label>
            <input
              type="number"
              placeholder="לדוגמה: 1"
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                boxSizing: 'border-box',
                fontSize: '15px'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', color: '#475569', marginBottom: '6px' }}>
              סיסמה
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                boxSizing: 'border-box',
                fontSize: '15px'
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: loading ? '#94a3b8' : '#007bff',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.2s',
              marginTop: '10px'
            }}
          >
            {loading ? 'מתחבר...' : 'התחבר למערכת'}
          </button>
        </form>

        <div style={{ marginTop: '25px', padding: '12px', backgroundColor: '#f1f5f9', borderRadius: '6px', fontSize: '12px', color: '#64748b', textAlign: 'center' }}>
          💡 <strong>פרטי התחברות לבדיקה:</strong><br />
          סיסמה לכל המשתמשים: <code>password123</code>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;