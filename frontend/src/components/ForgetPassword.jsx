import { useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import PhoneIcon from "@mui/icons-material/Phone"
import VerifiedIcon from "@mui/icons-material/Verified"
import PhoneOtp from "./PhoneOtp"

export default function ForgotPassword() {
  const { id } = useParams(); // Get the QR ID from URL
  const [phoneNumber, setPhoneNumber] = useState("")
  const [phoneVerified, setPhoneVerified] = useState(false)
  const [serverError, setServerError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const [verifying, setVerifying] = useState(false)
  const navigate = useNavigate()

  const handlePhoneVerified = async (phone, _user, idToken) => {
    setPhoneNumber(phone);
    setPhoneVerified(true);
    setVerifying(true);
    setServerError('');

    try {
      // Store the Firebase ID token for authentication
      localStorage.setItem("firebaseIdToken", idToken);
      
      // Since we're using phone-only authentication, verification is complete
      setSuccessMessage('Phone number verified successfully! Redirecting to edit page...');
      
      // Navigate back to the edit page with the QR ID after a short delay
      setTimeout(() => {
        navigate(`/qr/${id}/edit`);
      }, 2000);
    } catch (error) {
      setServerError(error.message || 'Verification failed. Please try again.');
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-blue-100 p-3 rounded-full">
              <PhoneIcon className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Verify Your Identity
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Verify your phone number to access your device information
          </p>
        </div>

        {/* Error Message */}
        {serverError && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-red-700">{serverError}</p>
              </div>
            </div>
          </div>
        )}

        {/* Success Message */}
        {successMessage && (
          <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
            <div className="flex">
              <div className="flex-shrink-0">
                <VerifiedIcon className="h-5 w-5 text-green-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-700">{successMessage}</p>
              </div>
            </div>
          </div>
        )}

        {/* Phone Verification Section */}
        <div className="mt-8 space-y-6">
          {!phoneVerified ? (
            <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
              <div className="text-center mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Phone Verification Required
                </h3>
                <p className="text-sm text-gray-600">
                  Please verify your phone number to proceed with updating your device information
                </p>
              </div>
              <PhoneOtp onVerified={handlePhoneVerified} />
            </div>
          ) : (
            <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="bg-green-100 p-3 rounded-full">
                    <VerifiedIcon className="h-8 w-8 text-green-600" />
                  </div>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Verification Complete!
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Your phone number has been verified successfully.
                </p>
                <p className="text-xs text-gray-500">
                  Verified Number: {phoneNumber}
                </p>
                
                {verifying && (
                  <div className="mt-4 flex justify-center">
                    <div className="animate-spin h-5 w-5 border-2 border-gray-300 border-t-blue-600 rounded-full"></div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Back to Login Link */}
        <div className="text-center">
          <button
            onClick={() => navigate(`/qr/${id}`)}
            className="text-sm text-blue-600 hover:text-blue-500 transition-colors"
          >
            ← Back to QR Information
          </button>
        </div>
      </div>
    </div>
  )
}
