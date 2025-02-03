const MOCK_DATA = {
  qr123: {
    isActive: true,
    name: "John Doe",
    email: "john@example.com",
    address: "123 Main St, City",
    phoneNumber: "+1234567890",
    password: "qr123pass"
  },
  qr456: {
    isActive: false,
    name: "",
    email: "",
    address: "",
    phoneNumber: "",
    password: ""
  }
};

export const api = {
  getQRInfo: (qrId) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(MOCK_DATA[qrId] || { isActive: false });
      }, 500);
    });
  },

  updateQRInfo: (id, data) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        MOCK_DATA[id] = {
          ...data,
          isActive: true,
        };
        resolve({ success: true });
      }, 500);
    });
  },

  verifyPassword: (qrId, password) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(MOCK_DATA[qrId]?.password === password);
      }, 500);
    });
  },

  submitQRForm: (id, data) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        MOCK_DATA[id] = {
          ...data,
          isActive: true
        };
        resolve({ 
          success: true, 
          qrId: id
        });
      }, 500);
    });
  },



};

export default api;