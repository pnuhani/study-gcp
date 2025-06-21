import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PhoneIcon from '@mui/icons-material/Phone';
import QRForm from './QRForm';
import api from '../api/api';
import PhoneOtp from './PhoneOtp';

export default function QREdit() {
  const { id } = useParams();
  const [verified, setVerified] = useState(false);
  const [qrData, setQRData] = useState(null);
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleUpdateSuccess = () => {
    navigate(`/qr/${id}`); 
  };

  const handlePhoneVerified = async (phone, _user, idToken) => {
    setLoading(true);
    setServerError('');
    
    try {
      // Store the Firebase ID token for authentication
      localStorage.setItem("firebaseIdToken", idToken);
      
      // Get the existing QR data
      const existingData = await api.getQRInfo(id);
      
      // Verify the phone number matches the QR record
      if (existingData.phoneNumber !== phone) {
        setServerError('The verified phone number does not match the registered device phone number.');
        setLoading(false);
        return;
      }
      
      setQRData(existingData);
      setVerified(true);
    } catch (error) {
      console.error('Error:', error);
      setServerError('Failed to verify your identity. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!verified) {
    return (
      <div className="container max-w-lg mx-auto px-4 py-8">
        <div className="bg-white rounded-lg overflow-hidden shadow-lg border border-gray-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#3a5a78] to-[#2c3e50] px-6 py-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-white p-3 rounded-full">
                <PhoneIcon className="h-8 w-8 text-[#3a5a78]" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-white">
              Verify Your Identity
            </h2>
            <p className="mt-2 text-gray-200 text-sm">
              Verify your phone number to edit your device information
            </p>
          </div>

          {/* Content */}
          <div className="p-6">
            {serverError && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded">
                <p className="text-red-700 text-sm">{serverError}</p>
              </div>
            )}

            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Phone Verification Required
              </h3>
              <p className="text-sm text-gray-600">
                Please verify the phone number associated with this device to proceed with editing
              </p>
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin h-8 w-8 border-4 border-gray-300 border-t-[#3a5a78] rounded-full"></div>
              </div>
            ) : (
              <PhoneOtp onVerified={handlePhoneVerified} />
            )}

                        {/* Back to view */}
            <div className="mt-4 text-center">
              <button
                onClick={() => navigate(`/qr/${id}`)}
                className="text-gray-500 hover:text-gray-600 text-sm transition-colors"
              >
                ← Back to device information
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <QRForm isEdit={true} defaultValues={qrData} onUpdateSuccess={handleUpdateSuccess} />;
}
