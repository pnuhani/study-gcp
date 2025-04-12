"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import PropTypes from "prop-types"
import PersonIcon from "@mui/icons-material/Person"
import EmailIcon from "@mui/icons-material/Email"
import HomeIcon from "@mui/icons-material/Home"
import PhoneIcon from "@mui/icons-material/Phone"
import LockIcon from "@mui/icons-material/Lock"
import QrCodeIcon from "@mui/icons-material/QrCode"
import Layout from "./layout"
import api from "../api/api"
import { useNavigate, useParams } from "react-router-dom"

const schema = z
  .object({
    name: z.string().min(1, "Name is required"),
    email: z.string()
      .min(1, "Email is required")
      .email("Please enter a valid email address (e.g., example@domain.com)")
      .regex(/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, "Please enter a valid email address"),
    address: z.string().min(1, "Address is required"),
    phoneNumber: z.string().min(1, "Phone number is required"),
    password: z.string().min(6, "Password must be at least 6 characters").max(50, "Password is too long").optional(),
    confirmPassword: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  })

export default function QRForm({ isEdit = false, defaultValues, onUpdateSuccess }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const [serverError, setServerError] = useState('')
  const [loading, setLoading] = useState(true)
  const [otpSent, setOtpSent] = useState(false)
  const [sendingOtp, setSendingOtp] = useState(false)
  const [otpVerified, setOtpVerified] = useState(false)
  const [otp, setOtp] = useState("")
  const [verifyingOtp, setVerifyingOtp] = useState(false)
  const [step, setStep] = useState(1)
  const [submitting, setSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: defaultValues || {
      name: "",
      email: "",
      address: "",
      phoneNumber: "",
    },
  })

  const email = watch("email")

  useEffect(() => {
    const checkQRExists = async () => {
      try {
        const qrExists = await api.checkQRExists(id)
        if (!qrExists.exists) {
          alert("This QR code does not exist in our system")
          navigate('/', { replace: true })
          return
        }
        if (qrExists.isActive && !isEdit) {
          navigate(`/qr/${id}`, { replace: true })
          return
        }
        setLoading(false)
      } catch (error) {
        alert("Error checking QR code. Please try again.")
        navigate('/', { replace: true })
      }
    }

    checkQRExists()
  }, [id, navigate, isEdit])

  const handleGenerateOtp = async () => {
    setSendingOtp(true);
    setServerError("");
    try {
      // Validate email before sending OTP
      const emailValue = watch("email");
      if (!emailValue || !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(emailValue)) {
        setServerError("Please enter a valid email address");
        setSendingOtp(false);
        return;
      }
      
      const result = await api.generateOtp(emailValue, false); // false for registration
      if (result.success) {
        setOtpSent(true);
        setServerError(result.message);
        setStep(2);
      } else {
        setServerError(result.message || "Failed to send OTP");
      }
    } catch (error) {
      // Set the exact error message from the backend
      setServerError(error.message || "Failed to send OTP. Please try again.");
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    setVerifyingOtp(true)
    setServerError("")
    try {
      const result = await api.verifyOtp(otp)
      if (result.valid) {
        setOtpVerified(true)
        setServerError("")
        setStep(3);
      } else {
        setServerError(result.message || "Invalid OTP")
      }
    } catch (error) {
      console.error("Error verifying OTP:", error)
      setServerError("Failed to verify OTP. Please try again.")
    } finally {
      setVerifyingOtp(false)
    }
  }

  const onSubmit = async (data) => {
    setSubmitting(true)
    try {
      if (isEdit) {
        const result = await api.updateQRInfo(id, data)
        if (onUpdateSuccess) {
          onUpdateSuccess()
        } else {
          navigate(`/qr/${id}`)
        }
      } else {
        if (!otpVerified) {
          setServerError("Please verify your email before submitting the form.")
          return
        }

        const qrExists = await api.checkQRExists(id)

        if (!qrExists.exists) {
          setServerError("Invalid QR code. This QR code does not exist in our system.")
          return
        }

        if (qrExists.isActive) {
          setServerError("This QR code is already registered.")
          return
        }

        const result = await api.submitQRForm(id, data)
        navigate(`/qr/${id}/success`)
      }
    } catch (error) {
      console.error("Error:", error)
      setServerError("An error occurred. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-gray-300 border-t-[#3a5a78] rounded-full"></div>
      </div>
    )
  }

  return (
    <div className="container max-w-md mx-auto px-4 py-4 sm:py-8">
      <div className="bg-white rounded-lg overflow-hidden shadow-lg border border-gray-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#3a5a78] to-[#2c3e50] px-4 sm:px-6 py-6 sm:py-8 text-center">
          <div className="flex justify-center mb-3 sm:mb-4">
            <div className="bg-white p-2 sm:p-3 rounded-full">
              <QrCodeIcon className="h-6 w-6 sm:h-8 sm:w-8 text-[#3a5a78]" />
            </div>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white">
            {isEdit ? "Update Device Information" : "Register Your Medical Device"}
          </h2>
          <p className="mt-2 text-gray-200 text-xs sm:text-sm">
            {isEdit 
              ? "Update your device information below" 
              : "Complete the registration process to activate your device"}
          </p>
        </div>

        {/* Progress Steps */}
        {!isEdit && (
          <div className="px-4 sm:px-6 py-3 sm:py-4 bg-gray-50 border-b border-gray-200">
            <div className="flex justify-between">
              <div className={`flex flex-col items-center ${step >= 1 ? 'text-[#3a5a78]' : 'text-gray-400'}`}>
                <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center mb-1 ${step >= 1 ? 'bg-[#3a5a78] text-white' : 'bg-gray-200 text-gray-500'}`}>
                  1
                </div>
                <span className="text-xs">Email</span>
              </div>
              <div className={`flex flex-col items-center ${step >= 2 ? 'text-[#3a5a78]' : 'text-gray-400'}`}>
                <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center mb-1 ${step >= 2 ? 'bg-[#3a5a78] text-white' : 'bg-gray-200 text-gray-500'}`}>
                  2
                </div>
                <span className="text-xs">Verify</span>
              </div>
              <div className={`flex flex-col items-center ${step >= 3 ? 'text-[#3a5a78]' : 'text-gray-400'}`}>
                <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center mb-1 ${step >= 3 ? 'bg-[#3a5a78] text-white' : 'bg-gray-200 text-gray-500'}`}>
                  3
                </div>
                <span className="text-xs">Details</span>
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        <div className="p-4 sm:p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
            {serverError && (
              <div className="bg-red-50 border-l-4 border-red-500 p-3 sm:p-4 mb-3 sm:mb-4 rounded">
                <p className="text-red-700 text-sm">{serverError}</p>
              </div>
            )}

            {/* Step 1: Email */}
            {(!isEdit && step === 1) && (
              <div className="space-y-4 sm:space-y-6">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <div className="bg-gray-100 p-1.5 sm:p-2 rounded-full">
                      <EmailIcon className="h-4 w-4 sm:h-5 sm:w-5 text-[#3a5a78]" />
                    </div>
                  </div>
                  <input
                    type="email"
                    {...register("email")}
                    placeholder="Your Email"
                    className={`w-full pl-12 sm:pl-14 pr-4 py-2.5 sm:py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#3a5a78] ${
                      errors.email ? "border-red-500" : "border-gray-300"
                    }`}
                    disabled={otpVerified}
                  />
                  {errors.email && <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-red-600">{errors.email.message}</p>}
                </div>
                <button
                  type="button"
                  onClick={handleGenerateOtp}
                  disabled={sendingOtp || otpVerified}
                  className="w-full bg-[#3a5a78] text-white py-2.5 sm:py-3 px-4 sm:px-6 rounded-md text-base sm:text-lg hover:bg-[#2c3e50] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  {sendingOtp ? "Sending OTP..." : "Send OTP"}
                </button>
              </div>
            )}

            {/* Step 2: OTP Verification */}
            {(!isEdit && step === 2) && (
              <div className="space-y-4 sm:space-y-6">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <div className="bg-gray-100 p-1.5 sm:p-2 rounded-full">
                      <LockIcon className="h-4 w-4 sm:h-5 sm:w-5 text-[#3a5a78]" />
                    </div>
                  </div>
                  <input
                    type="text"
                    placeholder="Enter OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full pl-12 sm:pl-14 pr-4 py-2.5 sm:py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#3a5a78] border-gray-300"
                  />
                </div>
                <div className="flex space-x-3 sm:space-x-4">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="w-1/2 bg-gray-200 text-gray-700 py-2.5 sm:py-3 px-4 sm:px-6 rounded-md text-base sm:text-lg hover:bg-gray-300 transition-colors duration-200"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleVerifyOtp}
                    disabled={verifyingOtp}
                    className="w-1/2 bg-[#3a5a78] text-white py-2.5 sm:py-3 px-4 sm:px-6 rounded-md text-base sm:text-lg hover:bg-[#2c3e50] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    {verifyingOtp ? "Verifying..." : "Verify OTP"}
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Complete Registration */}
            {((!isEdit && step === 3) || isEdit) && (
              <div className="space-y-4 sm:space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <div className="bg-gray-100 p-1.5 sm:p-2 rounded-full">
                        <PersonIcon className="h-4 w-4 sm:h-5 sm:w-5 text-[#3a5a78]" />
                      </div>
                    </div>
                    <input
                      type="text"
                      {...register("name")}
                      placeholder="Your Name"
                      className={`w-full pl-12 sm:pl-14 pr-4 py-2.5 sm:py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#3a5a78] ${
                        errors.name ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    {errors.name && <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-red-600">{errors.name.message}</p>}
                  </div>

                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <div className="bg-gray-100 p-1.5 sm:p-2 rounded-full">
                        <PhoneIcon className="h-4 w-4 sm:h-5 sm:w-5 text-[#3a5a78]" />
                      </div>
                    </div>
                    <input
                      type="tel"
                      {...register("phoneNumber")}
                      placeholder="Your Phone Number"
                      className={`w-full pl-12 sm:pl-14 pr-4 py-2.5 sm:py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#3a5a78] ${
                        errors.phoneNumber ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    {errors.phoneNumber && <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-red-600">{errors.phoneNumber.message}</p>}
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <div className="bg-gray-100 p-1.5 sm:p-2 rounded-full">
                      <HomeIcon className="h-4 w-4 sm:h-5 sm:w-5 text-[#3a5a78]" />
                    </div>
                  </div>
                  <input
                    type="text"
                    {...register("address")}
                    placeholder="Your Address"
                    className={`w-full pl-12 sm:pl-14 pr-4 py-2.5 sm:py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#3a5a78] ${
                      errors.address ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors.address && <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-red-600">{errors.address.message}</p>}
                </div>

                {/* Password fields for registration */}
                {!isEdit && otpVerified && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <div className="bg-gray-100 p-1.5 sm:p-2 rounded-full">
                          <LockIcon className="h-4 w-4 sm:h-5 sm:w-5 text-[#3a5a78]" />
                        </div>
                      </div>
                      <input
                        type="password"
                        {...register("password")}
                        placeholder="Set Password"
                        className={`w-full pl-12 sm:pl-14 pr-4 py-2.5 sm:py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#3a5a78] ${
                          errors.password ? "border-red-500" : "border-gray-300"
                        }`}
                      />
                      {errors.password && <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-red-600">{errors.password.message}</p>}
                    </div>

                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <div className="bg-gray-100 p-1.5 sm:p-2 rounded-full">
                          <LockIcon className="h-4 w-4 sm:h-5 sm:w-5 text-[#3a5a78]" />
                        </div>
                      </div>
                      <input
                        type="password"
                        {...register("confirmPassword")}
                        placeholder="Confirm Password"
                        className={`w-full pl-12 sm:pl-14 pr-4 py-2.5 sm:py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#3a5a78] ${
                          errors.confirmPassword ? "border-red-500" : "border-gray-300"
                        }`}
                      />
                      {errors.confirmPassword && (
                        <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-red-600">{errors.confirmPassword.message}</p>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex space-x-3 sm:space-x-4">
                  {!isEdit && (
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="w-1/2 bg-gray-200 text-gray-700 py-2.5 sm:py-3 px-4 sm:px-6 rounded-md text-base sm:text-lg hover:bg-gray-300 transition-colors duration-200"
                    >
                      Back
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={submitting || (!isEdit && !otpVerified)}
                    className={`${!isEdit ? 'w-1/2' : 'w-full'} bg-[#3a5a78] text-white py-2.5 sm:py-3 px-4 sm:px-6 rounded-md text-base sm:text-lg hover:bg-[#2c3e50] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200`}
                  >
                    {submitting ? (
                      <div className="flex items-center justify-center gap-2">
                        <svg
                          className="animate-spin h-4 w-4 sm:h-5 sm:w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        {isEdit ? "Updating..." : "Registering..."}
                      </div>
                    ) : isEdit ? (
                      "Update Information"
                    ) : (
                      "Complete Registration"
                    )}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  )
}

QRForm.propTypes = {
  isEdit: PropTypes.bool,
  defaultValues: PropTypes.object,
  onUpdateSuccess: PropTypes.func,
}
