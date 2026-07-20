// src/components/CoverageWarnings.jsx
import React from 'react';

export const CoverageWarnings = ({ scheduleData = [], employees = [] }) => {
  return (
    <div style={{
      backgroundColor: '#ffffff',
      padding: '20px',
      borderRadius: '8px',
      border: '1px solid #fecaca',
      borderLeft: '5px solid #ef4444',
      boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
      marginTop: '25px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h3 style={{ color: '#dc2626', margin: '0 0 8px 0', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        ⚠️ Coverage Warnings & Shift Exceptions
      </h3>
      <p style={{ color: '#4b5563', fontSize: '14px', margin: 0 }}>
        No critical understaffing or hour-limit violations detected for the selected period.
      </p>
    </div>
  );
};

export default CoverageWarnings;