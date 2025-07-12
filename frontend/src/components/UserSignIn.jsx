import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { auth } from '../config/firebase';

export default function UserSignIn() {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const sendOtp = async () => {
    setError('');
    setLoading(true);
    try {
      if (!window.recaptchaVerifier) {
        window.recaptchaVerifier = new RecaptchaVerifier('recaptcha-container', { size: 'invisible' }, auth);
      }
      const appVerifier = window.recaptchaVerifier;
      const result = await signInWithPhoneNumber(auth, phone, appVerifier);
      setConfirmationResult(result);
      setStep(2);
    } catch (err) {
      setError('Failed to send OTP: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    setError('');
    setLoading(true);
    try {
      const result = await confirmationResult.confirm(otp);
      const idToken = await result.user.getIdToken();
      // Call backend to verify
      const response = await fetch('/api/user/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken, phoneNumber: phone })
      });
      const data = await response.json();
      if (data.success) {
        navigate('/user-detail');
      } else {
        setError(data.error || 'Sign-in failed');
      }
    } catch (err) {
      setError('Invalid OTP or sign-in failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Sign In with OTP</h2>
      {step === 1 && (
        <>
          <input
            type="tel"
            placeholder="Enter phone number (+91...)"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            className="border p-2 w-full mb-4"
          />
          <button onClick={sendOtp} disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded w-full">
            {loading ? 'Sending OTP...' : 'Send OTP'}
          </button>
          <div id="recaptcha-container" />
        </>
      )}
      {step === 2 && (
        <>
          <input
            type="text"
            placeholder="Enter OTP"
            value={otp}
            onChange={e => setOtp(e.target.value)}
            className="border p-2 w-full mb-4"
          />
          <button onClick={verifyOtp} disabled={loading} className="bg-green-600 text-white px-4 py-2 rounded w-full">
            {loading ? 'Verifying...' : 'Verify OTP'}
          </button>
        </>
      )}
      {error && <div className="text-red-600 mt-2">{error}</div>}
    </div>
  );
} 