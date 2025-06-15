import { useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import api from "../api/api"
// import LockIcon from "@mui/icons-material/Lock"
import PhoneOtp from "./PhoneOtp"

export default function ForgotPassword() {
  const { id } = useParams(); // Get the QR ID from URL
  const [phoneNumber, setPhoneNumber] = useState("")
  const [phoneVerified, setPhoneVerified] = useState(false)
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [serverError, setServerError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const [resettingPassword, setResettingPassword] = useState(false)
  const navigate = useNavigate()

  const resetState = () => {
    setPhoneVerified(false);
    setResettingPassword(false);
    setPhoneNumber("");
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
    if (!phoneVerified) {
      setServerError('Please verify your phone number first');
      return;
    }
    try {
      const result = await api.resetPassword(phoneNumber, newPassword, id);
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
            {!phoneVerified && (
              <PhoneOtp
                onVerified={(phone) => {
                  setPhoneNumber(phone);
                  setPhoneVerified(true);
                }}
              />
            )}

            {phoneVerified && (
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
  )
}
