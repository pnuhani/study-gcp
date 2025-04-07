import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

export default function RegistrationSuccess() {
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    // Automatically redirect to QR display page after 5 seconds
    const timer = setTimeout(() => {
      navigate(`/qr/${id}`);
    }, 5000);

    return () => clearTimeout(timer);
  }, [id, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <div className="flex flex-col items-center">
          <CheckCircleIcon className="h-16 w-16 text-green-500 mb-4" />
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Registration Completed Successfully!
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Your QR code has been registered successfully. You will be redirected to your QR code page in a few seconds.
          </p>
          <button
            onClick={() => navigate(`/qr/${id}`)}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-500 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            View QR Code Now
          </button>
        </div>
      </div>
    </div>
  );
} 