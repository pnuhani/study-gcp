import { jsPDF } from "jspdf";
import { renderToString } from "react-dom/server";
import { QRCodeSVG } from "qrcode.react";

const BASE_URL = "http://localhost:8080/api";

const defaultOptions = {
    headers: {
        'Content-Type': 'application/json',
    },
    credentials: 'include',
    withCredentials: true,
};

const fetchWithErrorHandling = async (url, options = {}) => {
    try {
        const response = await fetch(url, options);
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({
                message: `HTTP error: ${response.status} ${response.statusText}`,
            }));
            throw new Error(errorData.message || "Something went wrong with the request");
        }
        return await response.json();
    } catch (error) {
        console.error("API request failed:", error);
        throw error;
    }
};

const api = {
    getQRInfo: async (qrId) => {
        try {
            const response = await fetchWithErrorHandling(`${BASE_URL}/qr?id=${qrId}`);
            console.log("Raw QR API response:", response);
            if (response) {
                // Normalize boolean strings
                if (response.isActive === "true") response.isActive = true;
                if (response.isActive === "false") response.isActive = false;
                return response;
            }
            return null;
        } catch (error) {
            console.error("Error getting QR info:", error);
            return { notFound: true, error: error.message };
        }
    },

    updateQRInfo: async (id, data) => {
        return fetchWithErrorHandling(`${BASE_URL}/qr/update`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ id, ...data }),
        });
    },

    verifyPassword: async (qrId, password) => {
        try {
            const response = await fetchWithErrorHandling(`${BASE_URL}/qr/verify`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ id: qrId, password }),
            });
            return response.valid;
        } catch (error) {
            return false;
        }
    },

    submitQRForm: async (id, data) => {
        return fetchWithErrorHandling(`${BASE_URL}/qr/add`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ id, ...data }),
        });
    },

    adminLogin: async (username, password) => {
        try {
            const response = await fetch(`${BASE_URL}/admin/login`, {
                ...defaultOptions,
                method: "POST",
                body: JSON.stringify({ username, password }),
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                return {
                    success: false,
                    message: errorData.error || `Login failed (${response.status})`,
                };
            }
            
            const data = await response.json();
            // Small delay to ensure cookie is set
            await new Promise(resolve => setTimeout(resolve, 100));
            return data; // Return the raw response data
        } catch (error) {
            console.error("Login error:", error);
            return { success: false, message: "Login failed: " + error.message };
        }
    },

    verifyAdminToken: async () => {
        try {
            const response = await fetch(`${BASE_URL}/admin/verify`, {
                ...defaultOptions,
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                return { valid: false, role: null };
            }
            return data;
        } catch (error) {
            return { valid: false, role: null };
        }
    },
    logout: async () => {
        try {
            await fetch(`${BASE_URL}/admin/logout`, {
                ...defaultOptions,
                method: 'POST',
            });
            return true;
        } catch (error) {
            console.error('Logout error:', error);
            return false;
        }
    },

    getQRBatch: async (page = 0, pageSize = 15) => {
        return fetchWithErrorHandling(`${BASE_URL}/qr/all?page=${page}&size=${pageSize}`, {
            ...defaultOptions,
        });
    },

    checkQRExists: async (qrId) => {
        try {
            const response = await fetchWithErrorHandling(`${BASE_URL}/qr?id=${qrId}`);
            return {
                exists: true,
                isActive: response &&
                    (response.isActive === true ||
                        response.active === true ||
                        response.isActive === "true" ||
                        response.active === "true"),
            };
        } catch (error) {
            console.error("Error checking QR existence:", error);
            return { exists: false, isActive: false };
        }
    },

    generateQRCodeBatch: async (quantity) => {
        const token = localStorage.getItem("adminToken");
        return fetchWithErrorHandling(`${BASE_URL}/qr/generate`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ quantity }),
        });
    },

    generateQRCodePDF: async (qrIds) => {
        if (!qrIds || qrIds.length === 0) {
            throw new Error("No QR codes selected");
        }
        try {
            const token = localStorage.getItem("adminToken");
            const qrData = await fetchWithErrorHandling(`${BASE_URL}/qr/batch`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ ids: qrIds }),
            });
            const doc = new jsPDF();
            const pageWidth = doc.internal.pageSize.getWidth();
            const pageHeight = doc.internal.pageSize.getHeight();
            const qrSize = 65;
            const margin = 20;
            const qrPerRow = 2;
            const textHeight = 30;
            const spacingY = 15;
            const effectiveWidth = pageWidth - 2 * margin;
            const spaceBetweenX = (effectiveWidth - qrSize * qrPerRow) / (qrPerRow - 1);
            const rowHeight = qrSize + textHeight + spacingY;
            const effectiveHeight = pageHeight - margin * 2 - 40;
            const qrPerCol = Math.floor(effectiveHeight / rowHeight);
            const itemsPerPage = qrPerRow * qrPerCol;
            doc.setFontSize(16);
            doc.text("QR Code Batch", margin, 20);
            doc.setFontSize(10);
            doc.text(`Generated on ${new Date().toLocaleDateString()}`, margin, 30);
            const startY = 50;
            const totalPages = Math.ceil(qrIds.length / itemsPerPage);
            for (let i = 1; i < totalPages; i++) {
                doc.addPage();
            }
            const imagePromises = qrIds.map((qrId, index) => {
                return new Promise((resolve, reject) => {
                    const page = Math.floor(index / itemsPerPage);
                    const positionOnPage = index % itemsPerPage;
                    const row = Math.floor(positionOnPage / qrPerRow);
                    const col = positionOnPage % qrPerRow;
                    const xPos = margin + col * (qrSize + spaceBetweenX);
                    const yPos = startY + row * rowHeight;
                    const baseUrl = window.location.origin;
                    const qrUrl = `${baseUrl}/qr/${qrId}`;
                    const qrDataUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${qrSize *
                        10}x${qrSize * 10}&data=${encodeURIComponent(qrUrl)}&margin=0`;
                    const img = new Image();
                    img.onload = function () {
                        resolve({ img: this, page, xPos, yPos, qrId, qrUrl });
                    };
                    img.onerror = function () {
                        reject(new Error("Failed to load QR code image"));
                    };
                    img.crossOrigin = "Anonymous";
                    img.src = qrDataUrl;
                });
            });
            Promise.all(imagePromises)
                .then((images) => {
                    images.forEach(({ img, page, xPos, yPos, qrId, qrUrl }) => {
                        doc.setPage(page + 1);
                        doc.setDrawColor(200, 200, 200);
                        doc.setFillColor(250, 250, 250);
                        doc.roundedRect(xPos - 2, yPos - 2, qrSize + 4, qrSize + textHeight + 4, 2, 2, "FD");
                        doc.addImage(img, "PNG", xPos, yPos, qrSize, qrSize);
                        doc.setFontSize(9);
                        doc.setTextColor(0, 0, 0);
                        doc.text(qrId, xPos, yPos + qrSize + 12);
                        doc.setFontSize(8);
                        doc.setTextColor(80, 80, 80);
                        doc.text(qrUrl, xPos, yPos + qrSize + 22, { maxWidth: qrSize });
                    });
                    const pdfBlob = doc.output("blob");
                    const pdfUrl = URL.createObjectURL(pdfBlob);
                    const link = document.createElement("a");
                    link.href = pdfUrl;
                    link.download = `qrcodes-batch-${new Date().toISOString().slice(0, 10)}.pdf`;
                    document.body.appendChild(link);
                    link.click();
                    setTimeout(() => {
                        document.body.removeChild(link);
                        URL.revokeObjectURL(pdfUrl);
                    }, 100);
                    return pdfUrl;
                })
                .catch((err) => {
                    console.error("Error in PDF generation:", err);
                    throw err;
                });
            return true;
        } catch (err) {
            console.error("Error in PDF generation:", err);
            throw err;
        }
    },

    generateOtp: async (email, isPasswordReset = false, qrId = null) => {
        try {
            const response = await fetch(`${BASE_URL}/qr/generate-otp`, {
                ...defaultOptions,
                method: "POST",
                body: JSON.stringify({ email, isPasswordReset, qrId }),
                credentials: 'include'
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || "Failed to generate OTP");
            }
            
            // Store sessionId for OTP verification
            if (data.sessionId) {
                sessionStorage.setItem('otpSessionId', data.sessionId);
            }
            
            return data;
        } catch (error) {
            console.error("Error generating OTP:", error);
            throw error;
        }
    },

    verifyOtp: async (otp) => {
        try {
            // Get the stored session ID
            const sessionId = sessionStorage.getItem('otpSessionId');
            console.log("Using session ID for verification:", sessionId);
            
            const response = await fetch(`${BASE_URL}/qr/verify-otp`, {  
                ...defaultOptions,
                method: "POST",
                body: JSON.stringify({ 
                    otp,
                    sessionId
                }),
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || "Failed to verify OTP");
            }
            
            // DON'T clear the sessionId here - need it for password reset
            // Store verification status
            if (data.valid) {
                sessionStorage.setItem('otpVerified', 'true');
            }
            
            return data;
        } catch (error) {
            console.error("Error verifying OTP:", error);
            throw error;
        }
    },

    resetPassword: async (email, newPassword, qrId) => {
        try {
            // Get session ID and verification status
            const sessionId = sessionStorage.getItem('otpSessionId');
            const otpVerified = sessionStorage.getItem('otpVerified');
            
            console.log("Using session ID for password reset:", sessionId);
            console.log("OTP verification status:", otpVerified);
            
            const response = await fetch(`${BASE_URL}/qr/reset`, {  
                ...defaultOptions,
                method: "POST",
                body: JSON.stringify({ 
                    email,
                    newPassword,
                    qrId,
                    sessionId, // Include the session ID
                    otpVerified: otpVerified === 'true' // Include verification status
                }),
            });
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({
                    message: `HTTP error: ${response.status} ${response.statusText}`,
                }));
                throw new Error(errorData.message || "Failed to reset password");
            }
            
            const result = await response.json();
            
            // Now we can clear the session data
            if (result.success) {
                sessionStorage.removeItem('otpSessionId');
                sessionStorage.removeItem('otpVerified');
            }
            
            return result;
        } catch (error) {
            console.error("Error resetting password:", error);
            throw error;
        }
    },

    // Get all admins (for superadmin)
    getAllAdmins: async () => {
        try {
            const response = await fetch(`${BASE_URL}/admin/superadmin/admins`, {
                ...defaultOptions,
                method: 'GET'
            });
            if (!response.ok) throw new Error('Failed to fetch admins');
            return await response.json();
        } catch (error) {
            console.error('Error fetching admins:', error);
            throw error;
        }
    },

    // Get single admin by ID
    getAdminById: async (id) => {
        try {
            const response = await fetch(`${BASE_URL}/admin/superadmin/admins/${id}`, {
                ...defaultOptions,
                method: 'GET'
            });
            if (!response.ok) throw new Error('Failed to fetch admin');
            return await response.json();
        } catch (error) {
            console.error('Error fetching admin:', error);
            throw error;
        }
    },

    // Create new admin
    createAdmin: async (adminData) => {
        try {
            const response = await fetch(`${BASE_URL}/admin/superadmin/create`, {
                ...defaultOptions,
                method: 'POST',
                body: JSON.stringify(adminData)
            });
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to create admin');
            }
            return await response.json();
        } catch (error) {
            console.error('Error creating admin:', error);
            throw error;
        }
    },

    // Update admin
    updateAdmin: async (id, adminData) => {
        try {
            const response = await fetch(`${BASE_URL}/admin/superadmin/admins/${id}`, {
                ...defaultOptions,
                method: 'PUT',
                body: JSON.stringify(adminData)
            });
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to update admin');
            }
            return await response.json();
        } catch (error) {
            console.error('Error updating admin:', error);
            throw error;
        }
    },

    // Delete admin
    deleteAdmin: async (id) => {
        try {
            const response = await fetch(`${BASE_URL}/admin/superadmin/admins/${id}`, {
                ...defaultOptions,
                method: 'DELETE'
            });
            if (!response.ok) throw new Error('Failed to delete admin');
            return true;
        } catch (error) {
            console.error('Error deleting admin:', error);
            throw error;
        }
    }
};

export default api;
