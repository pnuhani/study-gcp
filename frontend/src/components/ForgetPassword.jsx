import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import Layout from "./layout"
import api from "../api/api"
import LockIcon from "@mui/icons-material/Lock"

export default function ForgotPassword() {
  const { id } = useParams(); // Get the QR ID from URL
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [otpSent, setOtpSent] = useState(false)
  const [otpVerified, setOtpVerified] = useState(false)
  const [serverError, setServerError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const [sendingOtp, setSendingOtp] = useState(false)  // New state for sending OTP
  const [verifyingOtp, setVerifyingOtp] = useState(false)  // New state for verifying OTP
  const [resettingPassword, setResettingPassword] = useState(false)  // New state for password reset
  const navigate = useNavigate()

  const resetState = () => {
    setOtpSent(false);
    setOtpVerified(false);
    setSendingOtp(false);
    setVerifyingOtp(false);
    setResettingPassword(false);
    setOtp("");
    sessionStorage.removeItem('sessionId');
    sessionStorage.removeItem('resetEmail');
  };

  useEffect(() => {
    // Clear any existing session storage when component mounts
    resetState();
  }, []);

  const handleGenerateOtp = async () => {
    setSendingOtp(true);
    setServerError("");
    try {
      const result = await api.generateOtp(email, true, id); // Added id parameter
      if (result.success) {
        setOtpSent(true);
        sessionStorage.setItem('sessionId', result.sessionId);
        sessionStorage.setItem('resetEmail', email);
        setServerError(result.message);
      } else {
        setServerError(result.message || "Failed to send OTP");
      }
    } catch (error) {
      console.error("Error sending OTP:", error);
      setServerError("Failed to send OTP. Please try again.");
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    setVerifyingOtp(true);
    setServerError("");
    try {
      const storedSessionId = sessionStorage.getItem('sessionId');
      if (!storedSessionId) {
        setServerError('Session expired. Please try again.');
        resetState();
        return;
      }
      const result = await api.verifyOtp(otp, storedSessionId);
      if (result.valid) {
        setOtpVerified(true);
        setServerError("OTP verified successfully");
      } else {
        setServerError(result.message || "Invalid OTP");
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
      setServerError("Failed to verify OTP. Please try again.");
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleResetPassword = async () => {
    if (newPassword !== confirmPassword) {
      setServerError('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setServerError('Password must be at least 6 characters long');
      return;
    }

    setResettingPassword(true);
    setServerError('');
    const storedEmail = sessionStorage.getItem('resetEmail');
    if (!storedEmail) {
      setServerError('Session expired. Please try again.');
      resetState();
      return;
    }
    try {
      const result = await api.resetPassword(storedEmail, newPassword, id);
      if (result.success) {
        setSuccessMessage('Password reset successfully');
        resetState();
        // Navigate back to the edit page with the QR ID
        setTimeout(() => navigate(`/qr/${id}/edit`), 2000);
      } else {
        setServerError(result.message || 'Failed to reset password');
      }
    } catch (error) {
      setServerError(error.message || 'Failed to reset password');
    } finally {
      setResettingPassword(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Reset your password
            </h2>
          </div>

          {serverError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
              <span className="block sm:inline">{serverError}</span>
            </div>
          )}

          {successMessage && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
              <span className="block sm:inline">{successMessage}</span>
            </div>
          )}

          <div className="mt-8 space-y-6">
            {!otpSent && (
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email address
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <button
                  onClick={handleGenerateOtp}
                  disabled={sendingOtp}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mt-4"
                >
                  {sendingOtp ? "Sending..." : "Send OTP"}
                </button>
              </div>
            )}

            {otpSent && !otpVerified && (
              <div>
                <label htmlFor="otp" className="block text-sm font-medium text-gray-700">
                  Enter OTP
                </label>
                <div className="mt-1">
                  <input
                    id="otp"
                    name="otp"
                    type="text"
                    required
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                  />
                </div>
                <div className="flex justify-between items-center mt-4">
                  <button
                    onClick={handleVerifyOtp}
                    disabled={verifyingOtp}
                    className="flex-1 mr-2 justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    {verifyingOtp ? "Verifying..." : "Verify OTP"}
                  </button>
                  <button
                    onClick={() => {
                      resetState();
                      handleGenerateOtp();
                    }}
                    disabled={sendingOtp}
                    className="flex-1 ml-2 justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Resend OTP
                  </button>
                </div>
              </div>
            )}

            {otpVerified && (
              <div className="space-y-4">
                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                    New Password
                  </label>
                  <div className="mt-1">
                    <input
                      id="newPassword"
                      name="newPassword"
                      type="password"
                      required
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                    Confirm Password
                  </label>
                  <div className="mt-1">
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      required
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>
                </div>

                <button
                  onClick={handleResetPassword}
                  disabled={resettingPassword}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  {resettingPassword ? "Resetting..." : "Reset Password"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}
