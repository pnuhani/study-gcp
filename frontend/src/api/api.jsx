import { jsPDF } from "jspdf";
import { renderToString } from "react-dom/server";
import { QRCodeSVG } from "qrcode.react";

const BASE_URL = "http://localhost:8080/api";

const defaultOptions = {
    credentials: "include",
    headers: {
        "Content-Type": "application/json",
    },
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
            console.log("Attempting login with:", username);
            const response = await fetch(`${BASE_URL}/admin/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ username, password }),
            });
            if (!response.ok) {
                console.error("Login failed with status:", response.status);
                const errorData = await response.json().catch(() => ({}));
                return {
                    success: false,
                    message: errorData.message || `Login failed (${response.status})`,
                };
            }
            return await response.json();
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
                    Authorization: `Bearer ${token}`,
                },
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
                Authorization: `Bearer ${token}`,
            },
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
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || "Failed to generate OTP");
            }
            return data;
        } catch (error) {
            console.error("Error generating OTP:", error);
            throw error;
        }
    },

    verifyOtp: async (otp, sessionId) => {
        try {
            const response = await fetch(`${BASE_URL}/qr/verify-otp`, {  
                ...defaultOptions,
                method: "POST",
                body: JSON.stringify({ otp, sessionId }),
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || "Failed to verify OTP");
            }
            return data;
        } catch (error) {
            console.error("Error verifying OTP:", error);
            throw error;
        }
    },

    resetPassword: async (email, newPassword, qrId) => {
        try {
            const response = await fetch(`${BASE_URL}/qr/reset`, {  
                ...defaultOptions,
                method: "POST",
                body: JSON.stringify({ 
                    email,
                    newPassword,
                    qrId
                }),
            });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({
                    message: `HTTP error: ${response.status} ${response.statusText}`,
                }));
                throw new Error(errorData.message || "Failed to reset password");
            }
            return await response.json();
        } catch (error) {
            console.error("Error resetting password:", error);
            throw error;
        }
    },
};

export default api;
