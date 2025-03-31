"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import PropTypes from "prop-types"
import PersonIcon from "@mui/icons-material/Person"
import EmailIcon from "@mui/icons-material/Email"
import HomeIcon from "@mui/icons-material/Home"
import PhoneIcon from "@mui/icons-material/Phone"
import LockIcon from "@mui/icons-material/Lock" // Import LockIcon
import Layout from "./layout"
import api from "../api/api"
import { useNavigate, useParams } from "react-router-dom"

const schema = z
  .object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email address"),
    address: z.string().min(1, "Address is required"),
    phoneNumber: z.string().min(1, "Phone number is required"),
    password: z.string().min(6, "Password must be at least 6 characters").max(50, "Password is too long").optional(),
    confirmPassword: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  })

export default function QRForm({ isEdit, defaultValues, onUpdateSuccess }) {
  const { id } = useParams()
  const [serverError, setServerError] = useState("")
  const [otpSent, setOtpSent] = useState(false)
  const [otpVerified, setOtpVerified] = useState(false)
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [verifyingOtp, setVerifyingOtp] = useState(false)
  const [sendingOtp, setSendingOtp] = useState(false)
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
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

  const handleSendOtp = async () => {
    setSendingOtp(true)
    setServerError("")
    try {
      const result = await api.generateOtp(email)
      if (result.success) {
        setOtpSent(true)
        setServerError(result.message)
      } else {
        setServerError(result.message || "Failed to send OTP")
      }
    } catch (error) {
      console.error("Error sending OTP:", error)
      setServerError("Failed to send OTP. Please try again.")
    } finally {
      setSendingOtp(false)
    }
  }

  const handleVerifyOtp = async () => {
    setVerifyingOtp(true)
    setServerError("")
    try {
      const result = await api.verifyOtp(otp)
      if (result.valid) {
        setOtpVerified(true)
        setServerError(result.message)
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
        navigate(`/qr/${id}`)
      }
    } catch (error) {
      console.error("Error:", error)
      setServerError("An error occurred. Please try again.")
    }
  }

  return (
    <Layout>
      <div className="container max-w-md mx-auto px-4 py-8">
        <div className="bg-white rounded-lg overflow-hidden shadow-lg border border-gray-200">
          <div className="bg-gray-100 p-6">
            <h2 className="text-2xl font-semibold text-red-500 text-center">
              {isEdit ? "Update Information" : "Register Your QR Code"}
            </h2>
          </div>

          <div className="p-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {serverError && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4 rounded">
                  <p className="text-red-700">{serverError}</p>
                </div>
              )}

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <div className="bg-gray-100 p-2 rounded-full">
                    <PersonIcon className="h-5 w-5 text-red-500" />
                  </div>
                </div>
                <input
                  type="text"
                  {...register("name")}
                  placeholder="Your Name"
                  className={`w-full pl-14 pr-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 ${
                    errors.name ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.name && <p className="mt-2 text-sm text-red-600">{errors.name.message}</p>}
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <div className="bg-gray-100 p-2 rounded-full">
                    <EmailIcon className="h-5 w-5 text-red-500" />
                  </div>
                </div>
                <input
                  type="email"
                  {...register("email")}
                  placeholder="Your Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full pl-14 pr-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 ${
                    errors.email ? "border-red-500" : "border-gray-300"
                  }`}
                  disabled={otpVerified}
                />
                {errors.email && <p className="mt-2 text-sm text-red-600">{errors.email.message}</p>}
              </div>

              {!otpSent && !isEdit && (
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={sendingOtp || otpVerified}
                  className="w-full bg-blue-500 text-white py-3 px-6 rounded-md text-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  {sendingOtp ? "Sending OTP..." : "Send OTP"}
                </button>
              )}

              {otpSent && !otpVerified && !isEdit && (
                <>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <div className="bg-gray-100 p-2 rounded-full">
                        <LockIcon className="h-5 w-5 text-red-500" />
                      </div>
                    </div>
                    <input
                      type="text"
                      placeholder="Enter OTP"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className={`w-full pl-14 pr-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 border-gray-300`}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleVerifyOtp}
                    disabled={verifyingOtp}
                    className="w-full bg-green-500 text-white py-3 px-6 rounded-md text-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    {verifyingOtp ? "Verifying OTP..." : "Verify OTP"}
                  </button>
                </>
              )}

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <div className="bg-gray-100 p-2 rounded-full">
                    <HomeIcon className="h-5 w-5 text-red-500" />
                  </div>
                </div>
                <input
                  type="text"
                  {...register("address")}
                  placeholder="Your Address"
                  className={`w-full pl-14 pr-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 ${
                    errors.address ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.address && <p className="mt-2 text-sm text-red-600">{errors.address.message}</p>}
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <div className="bg-gray-100 p-2 rounded-full">
                    <PhoneIcon className="h-5 w-5 text-red-500" />
                  </div>
                </div>
                <input
                  type="tel"
                  {...register("phoneNumber")}
                  placeholder="Your Phone Number"
                  className={`w-full pl-14 pr-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 ${
                    errors.phoneNumber ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.phoneNumber && <p className="mt-2 text-sm text-red-600">{errors.phoneNumber.message}</p>}
              </div>

              {/* Conditionally render password fields */}
              {!isEdit && otpVerified && (
                <>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <div className="bg-gray-100 p-2 rounded-full">
                        <LockIcon className="h-5 w-5 text-red-500" />
                      </div>
                    </div>
                    <input
                      type="password"
                      {...register("password")}
                      placeholder="Set Password"
                      className={`w-full pl-14 pr-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 ${
                        errors.password ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    {errors.password && <p className="mt-2 text-sm text-red-600">{errors.password.message}</p>}
                  </div>

                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <div className="bg-gray-100 p-2 rounded-full">
                        <LockIcon className="h-5 w-5 text-red-500" />
                      </div>
                    </div>
                    <input
                      type="password"
                      {...register("confirmPassword")}
                      placeholder="Confirm Password"
                      className={`w-full pl-14 pr-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 ${
                        errors.confirmPassword ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    {errors.confirmPassword && (
                      <p className="mt-2 text-sm text-red-600">{errors.confirmPassword.message}</p>
                    )}
                  </div>
                </>
              )}

              <button
                type="submit"
                disabled={isSubmitting || (!isEdit && !otpVerified)}
                className="w-full bg-red-500 text-white py-3 px-6 rounded-md text-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center gap-2">
                    <svg
                      className="animate-spin h-5 w-5 text-white"
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
                  "Register"
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  )
}

QRForm.propTypes = {
  isEdit: PropTypes.bool,
  defaultValues: PropTypes.object,
  onUpdateSuccess: PropTypes.func,
}