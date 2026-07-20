// src/components/ManagerExcelUpload.jsx
import React, { useState } from "react";

export const ManagerExcelUpload = ({ onUploadSuccess }) => {
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];

    const formData = new FormData();
    formData.append("file", file);

    try {
      setUploading(true);

      const response = await fetch("http://localhost:8000/upload-predictions/", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        alert("🎉 Custom forecast file uploaded and processed by Pandas successfully!");
        if (onUploadSuccess) {
          onUploadSuccess();
        }
      } else {
        alert("❌ File upload failed. Ensure the file is valid and FastAPI server is running.");
      }
    } catch (error) {
      console.error("Error uploading file to Python backend:", error);
      alert("❌ API Connection failed. The backend server is currently offline.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{
      backgroundColor: "#ffffff",
      padding: "20px 24px",
      borderRadius: "8px",
      border: "1px solid #e2e8f0",
      boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
      textAlign: "center",
      fontFamily: "Arial, sans-serif"
    }}>
      <h4 style={{ margin: "0 0 8px 0", color: "#1e293b", fontSize: "1.1rem", fontWeight: "bold" }}>
        📁 Manual Forecast CSV Upload
      </h4>
      <p style={{ color: "#64748b", fontSize: "14px", marginBottom: "16px", maxWidth: "550px", margin: "0 auto 16px auto", lineHeight: "1.4" }}>
        If an employee forgot to log a call, the manager can upload an updated CSV file here to insert it directly into PostgreSQL.
      </p>

      <label style={{
        display: "inline-block",
        padding: "10px 20px",
        backgroundColor: uploading ? "#cbd5e1" : "#007bff",
        color: uploading ? "#475569" : "#ffffff",
        borderRadius: "6px",
        fontWeight: "bold",
        fontSize: "14px",
        cursor: uploading ? "not-allowed" : "pointer",
        transition: "all 0.2s ease"
      }}>
        {uploading ? "⏳ Analyzing file..." : "📥 Select CSV File to Upload Live"}
        <input 
          type="file" 
          accept=".csv" 
          onChange={handleFileChange} 
          style={{ display: "none" }} 
          disabled={uploading} 
        />
      </label>
    </div>
  );
};

export default ManagerExcelUpload;