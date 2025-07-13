import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { auth } from '../config/firebase';

/**
 * UserSignIn Component
 * 
 * Handles user authentication using Firebase phone number verification.
 * Provides a two-step process: phone number verification and OTP confirmation.
 * After successful verification, redirects user to the main landing page.
 */
export default function UserSignIn() {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Get the API base URL from environment variables
  const BASE_URL = `${import.meta.env.VITE_BASE_URL}/api`;

  /**
   * Validates phone number format
   * Ensures the phone number is in the correct format for Firebase authentication
   */
  const validatePhoneNumber = (phoneNumber) => {
    const cleanedPhone = phoneNumber.replace(/\D/g, ''); // Remove non-digits
    
    if (cleanedPhone.length === 10) {
      return '+91' + cleanedPhone; // Add India country code
    } else if (cleanedPhone.length === 12 && cleanedPhone.startsWith('91')) {
      return '+' + cleanedPhone; // Already has country code
    } else if (cleanedPhone.length === 13 && cleanedPhone.startsWith('91')) {
      return '+' + cleanedPhone.substring(1); // Remove extra digit
    }
    
    return phoneNumber; // Return as is if already in correct format
  };

  /**
   * Sends OTP to the provided phone number using Firebase authentication
   */
  const sendOtp = async () => {
    setError('');
    setLoading(true);
    
    try {
      // Validate phone number format
      const formattedPhone = validatePhoneNumber(phone);
      
      if (!formattedPhone.startsWith('+91') || formattedPhone.length !== 13) {
        setError('Please enter a valid Indian phone number (+91XXXXXXXXXX)');
        setLoading(false);
        return;
      }

      // Setup reCAPTCHA verifier
      if (!window.recaptchaVerifier) {
        window.recaptchaVerifier = new RecaptchaVerifier(
          auth,
          'recaptcha-container',
          { 
            size: 'invisible',
            callback: () => {
              console.log('reCAPTCHA solved');
            },
            'expired-callback': () => {
              console.log('reCAPTCHA expired');
            }
          }
        );
      }

      const appVerifier = window.recaptchaVerifier;
      const result = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
      
      setConfirmationResult(result);
      setPhone(formattedPhone); // Store the formatted phone number
      setStep(2);
      
    } catch (err) {
      console.error('OTP sending error:', err);
      setError('Failed to send OTP. Please check your phone number and try again.');
      
      // Reset reCAPTCHA on error
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }
    } finally {
      setLoading(false);
    }
  };

  /**
   * Verifies the OTP entered by the user and authenticates with backend
   */
  const verifyOtp = async () => {
    setError('');
    setLoading(true);
    
    try {
      if (!confirmationResult) {
        throw new Error('No confirmation result found. Please try sending OTP again.');
      }

      // Verify OTP with Firebase
      const result = await confirmationResult.confirm(otp);
      const idToken = await result.user.getIdToken();
      
      // Call backend to verify and register user
      const response = await fetch(`${BASE_URL}/user/signin`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ 
          idToken: idToken, 
          phoneNumber: phone 
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          error: `HTTP error: ${response.status} ${response.statusText}`
        }));
        throw new Error(errorData.error || 'Sign-in failed');
      }

      const data = await response.json();
      
      if (data.success) {
        // Store user info in localStorage for future use
        localStorage.setItem('userPhone', phone);
        localStorage.setItem('userSignedIn', 'true');
        
        // Redirect based on user type
        if (data.isNewUser) {
          // New user - show product registration success page
          navigate('/user-detail');
        } else {
          // Existing user - redirect to landing page
          navigate('/');
        }
      } else {
        throw new Error(data.error || 'Sign-in failed');
      }
      
    } catch (err) {
      console.error('OTP verification error:', err);
      setError(err.message || 'Invalid OTP or sign-in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handles phone number input changes
   */
  const handlePhoneChange = (e) => {
    const value = e.target.value;
    // Allow only digits, +, and spaces
    const cleanedValue = value.replace(/[^\d+\s]/g, '');
    setPhone(cleanedValue);
  };

  /**
   * Handles OTP input changes
   */
  const handleOtpChange = (e) => {
    const value = e.target.value;
    // Allow only digits and limit to 6 characters
    const cleanedValue = value.replace(/\D/g, '').slice(0, 6);
    setOtp(cleanedValue);
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-center text-[#3a5a78]">Sign In with OTP</h2>
      
      {step === 1 && (
        <div className="space-y-4">
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
            </label>
            <input
              id="phone"
              type="tel"
              placeholder="Enter phone number (+91XXXXXXXXXX)"
              value={phone}
              onChange={handlePhoneChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3a5a78] focus:border-transparent"
              disabled={loading}
            />
            <p className="text-xs text-gray-500 mt-1">
              Enter your 10-digit mobile number
            </p>
          </div>
          
          <button 
            onClick={sendOtp} 
            disabled={loading || !phone.trim()} 
            className="w-full bg-[#3a5a78] text-white px-4 py-2 rounded-md hover:bg-[#2d4660] disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Sending OTP...' : 'Send OTP'}
          </button>
          
          <div id="recaptcha-container" />
        </div>
      )}
      
      {step === 2 && (
        <div className="space-y-4">
          <div>
            <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
              Enter OTP
            </label>
            <input
              id="otp"
              type="text"
              placeholder="Enter 6-digit OTP"
              value={otp}
              onChange={handleOtpChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3a5a78] focus:border-transparent text-center text-lg tracking-widest"
              disabled={loading}
              maxLength="6"
            />
            <p className="text-xs text-gray-500 mt-1">
              Enter the 6-digit OTP sent to {phone}
            </p>
          </div>
          
          <button 
            onClick={verifyOtp} 
            disabled={loading || otp.length !== 6} 
            className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Verifying...' : 'Verify OTP'}
          </button>
          
          <button 
            onClick={() => {
              setStep(1);
              setOtp('');
              setError('');
            }} 
            className="w-full bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors"
            disabled={loading}
          >
            Back to Phone Number
          </button>
        </div>
      )}
      
      {error && (
        <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
          {error}
        </div>
      )}
    </div>
  );
} 