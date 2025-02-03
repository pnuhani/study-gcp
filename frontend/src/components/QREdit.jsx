import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Layout from './Layout';
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
      <Layout title="Verify Your Identity">
        <div className="max-w-md mx-auto">
          <p className="mb-4 text-lg text-[#3a5a78]">
            Please enter your password to edit your information.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <input
                type="password"
                {...register('password')}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3a5a78] focus:border-transparent"
                placeholder="Enter your password"
              />
              {errors.password && (
                <p className="mt-1 text-red-600 text-sm">{errors.password.message}</p>
              )}
              {serverError && (
                <p className="mt-1 text-red-600 text-sm">{serverError}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#3a5a78] text-white py-3 px-6 text-lg rounded-md hover:bg-[#2d4860] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
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
      </Layout>
    );
  }

  return <QRForm isEdit={true} defaultValues={qrData}/>;
}