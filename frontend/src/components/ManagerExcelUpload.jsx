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
      backgroundColor: "rgba(30, 41, 59, 0.4)",
      padding: "24px",
      borderRadius: "12px",
      border: "1px solid rgba(255,255,255,0.06)",
      textAlign: "center"
    }}>
      <h4 style={{ margin: "0 0 12px 0", color: "#f8fafc", fontSize: "1.1rem" }}>
        📁 Manual Forecast Excel Upload 
      </h4>
      <p style={{ color: "#94a3b8", fontSize: "13px", marginBottom: "16px", maxWidth: "400px", margin: "0 auto 16px auto" }}>
        If an employee forgot to log a call, the manager can upload an updated CSV file here to insert it directly into PostgreSQL.
      </p>

      <label style={{
        display: "inline-block",
        padding: "10px 20px",
        backgroundColor: uploading ? "rgba(255,255,255,0.05)" : "#38bdf8",
        color: uploading ? "#64748b" : "#0f172a",
        borderRadius: "8px",
        fontWeight: "bold",
        cursor: uploading ? "not-allowed" : "pointer",
        transition: "background-color 0.2s"
      }}>
        {uploading ? "⏳ Pandas library is analyzing file..." : "📥 Select CSV File to Upload Live"}
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
