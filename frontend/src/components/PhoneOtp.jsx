import { useState, useRef } from "react";
import PropTypes from "prop-types";
import { auth } from "../config/firebase";
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
} from "firebase/auth";
import PhoneInput from "./PhoneInput";

/**
 * PhoneOtp component
 * ------------------
 * A reusable component that handles full phone-number based OTP verification using
 * Firebase Authentication (Web SDK, modular v9+).
 *
 * Props
 * -----
 * - onVerified(phoneNumber, user, idToken): Callback triggered once the OTP is
 *   verified successfully.
 * - containerClassName: Optional tailwind/classes applied to the wrapping div.
 *
 * Internal workflow
 * -----------------
 * 1. Renders an input for the phone number and a "Send OTP" button.
 * 2. On send-click it creates (or re-uses) an invisible reCAPTCHA verifier via
 *    `RecaptchaVerifier` (size = "invisible").
 * 3. Calls `signInWithPhoneNumber` which triggers the SMS (subject to Firebase
 *    quota / throttling).
 * 4. On success stores the `confirmationResult` object and shows the code input
 *    & "Verify" button.
 * 5. Once the code is confirmed it invokes `onVerified` with the useful data.
 *
 * Notes
 * -----
 * • The component **does NOT** sign the user out automatically. The parent can
 *   decide whether to keep the Firebase session or call `auth.signOut()`.
 * • It also does not persist state between mounts – maintain at parent level if
 *   needed.
 */
export default function PhoneOtp({ onVerified, containerClassName = "" }) {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState(1); // 1 = enter phone, 2 = enter code, 3 = done
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const confirmationResultRef = useRef(null);
  const recaptchaVerifierRef = useRef(null);

  /**
   * Lazily initialises (or re-uses) a RecaptchaVerifier instance bound to the
   * window object so that Firebase can detect existing verifiers.
   */
  const getRecaptchaVerifier = () => {
    if (recaptchaVerifierRef.current) return recaptchaVerifierRef.current;

    /*
     * We create an invisible reCAPTCHA and attach it to a dummy <div> that is
     * rendered by this component. An explicit container is mandatory.
     */
    recaptchaVerifierRef.current = new RecaptchaVerifier(
      auth,
      "recaptcha-container",
      {
        size: "invisible",
        callback: (/* response */) => {
          // reCAPTCHA solved -> continue sending OTP.
        },
        "expired-callback": () => {
          // Optionally we could ask the user to retry. For now we just clear.
          recaptchaVerifierRef.current?.reset();
        },
      }
    );

    return recaptchaVerifierRef.current;
  };

  const handleSendOtp = async () => {
    setError("");
    if (!phoneNumber) {
      setError("Please enter a valid phone number.");
      return;
    }

    setLoading(true);
    try {
      const appVerifier = getRecaptchaVerifier();

      const confirmationResult = await signInWithPhoneNumber(
        auth,
        phoneNumber,
        appVerifier
      );

      confirmationResultRef.current = confirmationResult;
      setStep(2);
    } catch (err) {
      console.error("Failed to send OTP", err);
      setError(err.message || "Failed to send OTP – please try again later.");
      // Reset the recaptcha so user can retry.
      recaptchaVerifierRef.current?.reset();
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    setError("");
    if (!code) {
      setError("Please enter the verification code you received.");
      return;
    }

    setLoading(true);
    try {
      const result = await confirmationResultRef.current.confirm(code);
      const user = result.user;
      const idToken = await user.getIdToken();
      
      // Get the phone number from Firebase user object to ensure consistent formatting
      const firebasePhoneNumber = user.phoneNumber;
      
      setStep(3);
      if (onVerified) {
        // Pass the Firebase-normalized phone number instead of user input
        // Fallback to user input if Firebase phone number is not available
        onVerified(firebasePhoneNumber || phoneNumber, user, idToken);
      }
    } catch (err) {
      console.error("Failed to verify code", err);
      setError(err.message || "Invalid code – please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={containerClassName}>
      {error && (
        <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm rounded">
          {error}
        </div>
      )}

      {step === 1 && (
        <div className="space-y-4">
          <PhoneInput
            value={phoneNumber}
            onChange={setPhoneNumber}
            placeholder="Enter your phone number"
            showLabel={false}
            className="focus:ring-blue-500"
          />
          <button
            type="button"
            onClick={handleSendOtp}
            disabled={loading}
            className="w-full py-3 rounded bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
          >
            {loading ? "Sending..." : "Send OTP"}
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Enter verification code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full px-4 py-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="button"
            onClick={handleVerifyCode}
            disabled={loading}
            className="w-full py-3 rounded bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
          >
            {loading ? "Verifying..." : "Verify"}
          </button>
        </div>
      )}

      {step === 3 && (
        <p className="text-green-700 font-medium">Phone number verified successfully!</p>
      )}

      {/* Dummy container for invisible reCAPTCHA */}
      <div id="recaptcha-container" />
    </div>
  );
}

PhoneOtp.propTypes = {
  onVerified: PropTypes.func.isRequired,
  containerClassName: PropTypes.string,
}; 