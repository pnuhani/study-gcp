import { jsPDF } from "jspdf";
import { renderToString } from 'react-dom/server';
import {QRCodeSVG} from 'qrcode.react';


const BASE_URL = 'http://localhost:8080/api';


const fetchWithErrorHandling = async (url, options = {}) => {
  try {
    const response = await fetch(url, options);
    
    // Handle HTTP errors
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        message: `HTTP error: ${response.status} ${response.statusText}`
      }));
      throw new Error(errorData.message || 'Something went wrong with the request');
    }
    
    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};


// // Mock data for demonstration
// const MOCK_DATA = {
//   qr123: {
//     id: "qr123",
//     isActive: true,
//     name: "John Doe",
//     email: "john@example.com",
//     address: "123 Main St, City",
//     phoneNumber: "+1234567890",
//     password: "qr123pass",
//     createdAt: new Date(2025, 0, 15).toISOString(),
//     activatedAt: new Date(2025, 1, 20).toISOString()
//   },
//   qr456: {
//     id: "qr456",
//     isActive: false,
//     name: "",
//     email: "",
//     address: "",
//     phoneNumber: "",
//     password: "",
//     createdAt: new Date(2025, 1, 10).toISOString(),
//     activatedAt: null
//   }
// };

// // Mock admin credentials
// const ADMIN_CREDENTIALS = {
//   username: "admin",
//   password: "admin123"
// };


const generateRandomId = (length = 8) => {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;

}

export const api = {

  // Customer QR functions

  getQRInfo: async (qrId) => {
    try {
      const response = await fetchWithErrorHandling(`${BASE_URL}/qr?id=${qrId}`);
      console.log("Raw QR API response:", response); // Debug logging
      
      // Normalize the active status
      if (response) {
        if (response.active !== undefined && response.isActive === undefined) {
          response.isActive = response.active;
        }
        
        // Convert string values to booleans if needed
        if (response.isActive === 'true') response.isActive = true;
        if (response.isActive === 'false') response.isActive = false;
      }
      
      return response;
    } catch (error) {
      console.error('Error getting QR info:', error);
      return { isActive: false };
    }
  },


  updateQRInfo: async (id, data) => {
    return fetchWithErrorHandling(`${BASE_URL}/qr/update`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: id,
        ...data,
      }),
    });
  },

  verifyPassword: async (qrId, password) => {
    try {
      const response = await fetchWithErrorHandling(`${BASE_URL}/qr/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: qrId,
          password: password
        }),
      });
      return response.valid;
    } catch (error) {
      return false;
    }
  },

  submitQRForm: async (id, data) => {
    return fetchWithErrorHandling(`${BASE_URL}/qr/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: id,
        ...data,
      }),
    });
  },

  // Admin functions
  adminLogin: async (username, password) => {
    try {
      console.log("Attempting login with:", username);
      const response = await fetch(`${BASE_URL}/admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });
      
      if (!response.ok) {
        console.error("Login failed with status:", response.status);
        // Try to get error message
        const errorData = await response.json().catch(() => ({}));
        return { 
          success: false, 
          message: errorData.message || `Login failed (${response.status})`
        };
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, message: "Login failed: " + error.message };
    }
  },

  verifyAdminToken: async () => {
    const token = localStorage.getItem("adminToken");
    if (!token) return { valid: false };
    
    try {
      const response = await fetchWithErrorHandling(`${BASE_URL}/admin/verify`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response;
    } catch (error) {
      return { valid: false };
    }
  },


  getQRBatch: async (page = 0, pageSize = 15) => {
    const token = localStorage.getItem("adminToken");
    return fetchWithErrorHandling(`${BASE_URL}/qr/all?page=${page}&size=${pageSize}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  },

  generateQRCodeBatch: async (quantity) => {
    const token = localStorage.getItem("adminToken");
    return fetchWithErrorHandling(`${BASE_URL}/qr/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ quantity }),
    });
  },

  generateQRCodePDF: async (qrIds) => {
    if (!qrIds || qrIds.length === 0) {
      throw new Error("No QR codes selected");
    }
    
    try {
      // First fetch QR data from backend
      const token = localStorage.getItem("adminToken");
      const qrData = await fetchWithErrorHandling(`${BASE_URL}/qr/batch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ids: qrIds }),
      });
      
      // Then generate PDF client-side
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      
      // PDF generation logic (you can keep your existing PDF generation code)
      const qrSize = 65;
      const margin = 20;
      const qrPerRow = 2;
      const textHeight = 30;
      const spacingY = 15;
      
      // Calculate spacing
      const effectiveWidth = pageWidth - (2 * margin);
      const spaceBetweenX = (effectiveWidth - (qrSize * qrPerRow)) / (qrPerRow - 1);
      const rowHeight = qrSize + textHeight + spacingY;
      const effectiveHeight = pageHeight - margin * 2 - 40;
      const qrPerCol = Math.floor(effectiveHeight / rowHeight);
      const itemsPerPage = qrPerRow * qrPerCol;
      
      // Add title
      doc.setFontSize(16);
      doc.text("QR Code Batch", margin, 20);
      doc.setFontSize(10);
      doc.text(`Generated on ${new Date().toLocaleDateString()}`, margin, 30);
      
      const startY = 50;
      let loadedCount = 0;
      const totalPages = Math.ceil(qrIds.length / itemsPerPage);
      
      // Add pages as needed
      for (let i = 1; i < totalPages; i++) {
        doc.addPage();
      }
      
      // Create an array of promises for image loading
      const imagePromises = qrIds.map((qrId, index) => {
        return new Promise((resolve, reject) => {
          const page = Math.floor(index / itemsPerPage);
          const positionOnPage = index % itemsPerPage;
          const row = Math.floor(positionOnPage / qrPerRow);
          const col = positionOnPage % qrPerRow;
          
          // Calculate position
          const xPos = margin + col * (qrSize + spaceBetweenX);
          const yPos = startY + row * rowHeight;
          
          const baseUrl = window.location.origin;
          const qrUrl = `${baseUrl}/qr/${qrId}`;
          const qrDataUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${qrSize*10}x${qrSize*10}&data=${encodeURIComponent(qrUrl)}&margin=0`;
          
          const img = new Image();
          
          img.onload = function() {
            resolve({img: this, page, xPos, yPos, qrId, qrUrl});
          };
          
          img.onerror = function() {
            reject(new Error("Failed to load QR code image"));
          };
          
          // Load image
          img.crossOrigin = "Anonymous";
          img.src = qrDataUrl;
        });
      });
      
      // Wait for all images to load
      Promise.all(imagePromises)
        .then(images => {
          // Add all images to PDF
          images.forEach(({img, page, xPos, yPos, qrId, qrUrl}) => {
            // Set the active page
            doc.setPage(page + 1);
            
            // Add background rectangle
            doc.setDrawColor(200, 200, 200);
            doc.setFillColor(250, 250, 250);
            doc.roundedRect(xPos - 2, yPos - 2, qrSize + 4, qrSize + textHeight + 4, 2, 2, 'FD');
            
            // Add QR image
            doc.addImage(img, 'PNG', xPos, yPos, qrSize, qrSize);
            
            // Add text
            doc.setFontSize(9);
            doc.setTextColor(0, 0, 0);
            doc.text(qrId, xPos, yPos + qrSize + 12);
            
            doc.setFontSize(8);
            doc.setTextColor(80, 80, 80);
            doc.text(qrUrl, xPos, yPos + qrSize + 22, { maxWidth: qrSize });
          });
          
          // Save PDF
          const pdfBlob = doc.output('blob');
          const pdfUrl = URL.createObjectURL(pdfBlob);
          
          const link = document.createElement('a');
          link.href = pdfUrl;
          link.download = `qrcodes-batch-${new Date().toISOString().slice(0,10)}.pdf`;
          document.body.appendChild(link);
          link.click();
          
          // Clean up
          setTimeout(() => {
            document.body.removeChild(link);
            URL.revokeObjectURL(pdfUrl);
          }, 100);
          
          return pdfUrl;
        })
        .catch(err => {
          console.error("Error in PDF generation:", err);
          throw err;
        });
    } catch (err) {
      console.error("Error in PDF generation:", err);
      throw err;
    }
  }
};

export default api;