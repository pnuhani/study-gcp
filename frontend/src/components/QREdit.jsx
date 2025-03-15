import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import LockIcon from '@mui/icons-material/Lock';
import Layout from './layout';
import QRForm from './QRForm';
import api from '../api/api';

const verificationSchema = z.object({
  password: z.string().min(1, 'Password is required'),
});

export default function QREdit() {
  const { id } = useParams();
  const [verified, setVerified] = useState(false);
  const [serverError, setServerError] = useState('');
  const [qrData, setQRData] = useState(null);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(verificationSchema),
    defaultValues: {
      password: '',
    }
  });

  const handleUpdateSuccess = () => {
    navigate(`/qr/${id}`); 
  };

  const onSubmit = async (data) => {
    setServerError('');
    try {
      const isValid = await api.verifyPassword(id, data.password);
      if (isValid) {
        const existingData = await api.getQRInfo(id);
        setQRData(existingData);
        setVerified(true);
      } else {
        setServerError('Incorrect password. Please try again.');
      }
    } catch (error) {
      console.error('Error:', error);
      setServerError('An error occurred. Please try again.');
    }
  };

  if (!verified) {
    return (
      <Layout>
        <div className="container max-w-md mx-auto px-4 py-8">
          <div className="bg-white rounded-lg overflow-hidden shadow-lg border border-gray-200">
            <div className="p-6">
              <h2 className="text-2xl font-semibold text-red-500 mb-4 text-center">Verify Your Identity</h2>
              
              <p className="mb-6 text-gray-700 text-center">
                Please enter your password to edit your information.
              </p>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <div className="bg-gray-100 p-2 rounded-full">
                      <LockIcon className="h-5 w-5 text-red-500" />
                    </div>
                  </div>
                  <input
                    type="password"
                    {...register('password')}
                    className={`w-full pl-14 pr-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 ${
                      errors.password ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter your password"
                  />
                  {errors.password && (
                    <p className="mt-2 text-red-600 text-sm">{errors.password.message}</p>
                  )}
                  {serverError && (
                    <p className="mt-2 text-red-600 text-sm">{serverError}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-red-500 text-white py-3 px-6 text-lg rounded-md hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Verifying...
                    </div>
                  ) : (
                    'Verify'
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return <QRForm isEdit={true} defaultValues={qrData} onUpdateSuccess={handleUpdateSuccess} />;
}
