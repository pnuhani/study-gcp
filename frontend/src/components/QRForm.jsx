import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import PropTypes from 'prop-types';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import HomeIcon from '@mui/icons-material/Home';
import PhoneIcon from '@mui/icons-material/Phone';
import LockIcon from '@mui/icons-material/Lock';
import Layout from './Layout';
import api from '../api/api';
import { useNavigate, useParams } from 'react-router-dom';

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  address: z.string().min(1, 'Address is required'),
  phoneNumber: z.string().min(1, 'Phone number is required'),
  password: z.string()
    .min(6, 'Password must be at least 6 characters')
    .max(50, 'Password is too long'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});


export default function QRForm({ isEdit, defaultValues }) {
  const {id} = useParams();
  const [serverError, setServerError] = useState('');
  const navigate = useNavigate();
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: defaultValues || {
      name: '',
      email: '',
      address: '',
      phoneNumber: ''
    }
  });

  const onSubmit = async (data) => {
    try {
      if (isEdit) {
        const result = await api.updateQRInfo(id, data);
        if (result.success) {
          navigate(`/qr/${id}`);
        }
      } else {
        const result = await api.submitQRForm(id, data);
        if (result.success) {
          navigate(`/qr/${id}`);
        }
      }
    } catch (error) {
      console.error('Error:', error);
      setServerError('An error occurred. Please try again.');
    }
  };

  return (
    <Layout title={isEdit ? "Update Information" : "Register Your QR Code"}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {serverError && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
            <p className="text-red-700">{serverError}</p>
          </div>
        )}

        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <PersonIcon className="h-5 w-5 text-[#3a5a78]" />
          </div>
          <input
            type="text"
            {...register('name')}
            placeholder="Your Name"
            className={`w-full pl-10 pr-3 py-2 bg-[#f0f4f8] border rounded-md focus:outline-none focus:ring-2 focus:ring-[#3a5a78] ${
              errors.name ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>

        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <EmailIcon className="h-5 w-5 text-[#3a5a78]" />
          </div>
          <input
            type="email"
            {...register('email')}
            placeholder="Your Email"
            className={`w-full pl-10 pr-3 py-2 bg-[#f0f4f8] border rounded-md focus:outline-none focus:ring-2 focus:ring-[#3a5a78] ${
              errors.email ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <HomeIcon className="h-5 w-5 text-[#3a5a78]" />
          </div>
          <input
            type="text"
            {...register('address')}
            placeholder="Your Address"
            className={`w-full pl-10 pr-3 py-2 bg-[#f0f4f8] border rounded-md focus:outline-none focus:ring-2 focus:ring-[#3a5a78] ${
              errors.address ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.address && (
            <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>
          )}
        </div>

        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <PhoneIcon className="h-5 w-5 text-[#3a5a78]" />
          </div>
          <input
            type="tel"
            {...register('phoneNumber')}
            placeholder="Your Phone Number"
            className={`w-full pl-10 pr-3 py-2 bg-[#f0f4f8] border rounded-md focus:outline-none focus:ring-2 focus:ring-[#3a5a78] ${
              errors.phoneNumber ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.phoneNumber && (
            <p className="mt-1 text-sm text-red-600">{errors.phoneNumber.message}</p>
          )}
        </div>

        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <LockIcon className="h-5 w-5 text-[#3a5a78]" />
          </div>
          <input
            type="password"
            {...register('password')}
            placeholder="Set Password"
            className={`w-full pl-10 pr-3 py-2 bg-[#f0f4f8] border rounded-md focus:outline-none focus:ring-2 focus:ring-[#3a5a78] ${
              errors.password ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.password && (
            <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
          )}
        </div>

        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <LockIcon className="h-5 w-5 text-[#3a5a78]" />
          </div>
          <input
            type="password"
            {...register('confirmPassword')}
            placeholder="Confirm Password"
            className={`w-full pl-10 pr-3 py-2 bg-[#f0f4f8] border rounded-md focus:outline-none focus:ring-2 focus:ring-[#3a5a78] ${
              errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.confirmPassword && (
            <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-[#3a5a78] text-white py-3 px-6 rounded-md text-lg hover:bg-[#2d4860] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {isEdit ? 'Updating...' : 'Registering...'}
            </div>
          ) : (
            isEdit ? 'Update Information' : 'Register'
          )}
        </button>
      </form>
    </Layout>
  );
}

QRForm.propTypes = {
  isEdit: PropTypes.bool,
  defaultValues: PropTypes.object
};