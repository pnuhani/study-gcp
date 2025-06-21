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
import QrCodeIcon from "@mui/icons-material/QrCode"
import api from "../api/api"
import { useNavigate, useParams } from "react-router-dom"
import PhoneOtp from "./PhoneOtp"

// Updated schema without password fields
const schema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string()
    .min(1, "Email is required")
    .email("Please enter a valid email address (e.g., example@domain.com)")
    .regex(/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, "Please enter a valid email address"),
  address: z.string().min(1, "Address is required"),
  phoneNumber: z.string().min(1, "Phone number is required"),
})

export default function QRForm({ isEdit = false, defaultValues, onUpdateSuccess }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const [serverError, setServerError] = useState("")
  const [loading, setLoading] = useState(true)
  const [phoneVerified, setPhoneVerified] = useState(false)
  const [step, setStep] = useState(1) // For both new registration and edit: 1 = phone verification, 2 = form details
  const [submitting, setSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: defaultValues || {
      name: "",
      email: "",
      address: "",
      phoneNumber: "",
    },
  })

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
      } catch {
        alert("Error checking QR code. Please try again.")
        navigate('/', { replace: true })
      }
    }

    checkQRExists()
  }, [id, navigate, isEdit])

  const onSubmit = async (data) => {
    setSubmitting(true)
    try {
      if (isEdit) {
        if (!phoneVerified) {
          setServerError("Please verify your phone number before updating the information.")
          return
        }
        await api.updateQRInfo(id, data)
        if (onUpdateSuccess) {
          onUpdateSuccess()
        } else {
          navigate(`/qr/${id}`)
        }
      } else {
        if (!phoneVerified) {
          setServerError("Please verify your phone number before submitting the form.")
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

        await api.submitQRForm(id, data)
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
    <div className="container max-w-lg mx-auto px-4 py-4 sm:py-8">
      <div className="bg-white rounded-lg overflow-hidden shadow-lg border border-gray-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#3a5a78] to-[#2c3e50] px-6 py-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-white p-3 rounded-full">
              <QrCodeIcon className="h-8 w-8 text-[#3a5a78]" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-white">
            {isEdit ? "Update Device Information" : "Register Your Medical Device"}
          </h2>
          <p className="mt-2 text-gray-200 text-sm">
            {isEdit 
              ? "Verify your phone and update device information" 
              : "Complete the registration process to activate your device"}
          </p>
        </div>

        {/* Progress Steps */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div className="flex justify-between">
            <div className={`flex flex-col items-center ${step >= 1 ? 'text-[#3a5a78]' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${step >= 1 ? 'bg-[#3a5a78] text-white' : 'bg-gray-200 text-gray-500'}`}>
                1
              </div>
              <span className="text-xs">Phone Verification</span>
            </div>
            <div className={`flex flex-col items-center ${step >= 2 ? 'text-[#3a5a78]' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${step >= 2 ? 'bg-[#3a5a78] text-white' : 'bg-gray-200 text-gray-500'}`}>
                2
              </div>
              <span className="text-xs">Device Details</span>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {serverError && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4 rounded">
                <p className="text-red-700 text-sm">{serverError}</p>
              </div>
            )}

            {/* Step 1: Phone Verification */}
            {step === 1 && (
              <div className="space-y-4">
                <div className="text-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {isEdit ? "Verify Your Identity" : "Verify Your Phone Number"}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {isEdit 
                      ? "Please verify your phone number to proceed with updating your device information"
                      : "We'll send you a verification code to confirm your phone number"}
                  </p>
                </div>
                <PhoneOtp
                  onVerified={(phone, _user, idToken) => {
                    setPhoneVerified(true);
                    setStep(2);
                    setValue("phoneNumber", phone);
                    localStorage.setItem("firebaseIdToken", idToken);
                  }}
                />
              </div>
            )}

            {/* Step 2: Complete Registration/Update */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {isEdit ? "Update Device Information" : "Complete Device Registration"}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Please provide your device information below
                  </p>
                </div>

                {/* Name and Phone Number Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="relative">
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <div className="bg-gray-100 p-2 rounded-full">
                          <PersonIcon className="h-5 w-5 text-[#3a5a78]" />
                        </div>
                      </div>
                      <input
                        id="name"
                        type="text"
                        {...register("name")}
                        placeholder="Enter your full name"
                        className={`w-full pl-14 pr-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#3a5a78] ${
                          errors.name ? "border-red-500" : "border-gray-300"
                        }`}
                      />
                    </div>
                    {errors.name && <p className="mt-2 text-sm text-red-600">{errors.name.message}</p>}
                  </div>

                  <div className="relative">
                    <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <div className="bg-gray-100 p-2 rounded-full">
                          <PhoneIcon className="h-5 w-5 text-[#3a5a78]" />
                        </div>
                      </div>
                      <input
                        id="phoneNumber"
                        type="tel"
                        {...register("phoneNumber")}
                        placeholder="Your verified phone number"
                        className="w-full pl-14 pr-4 py-3 border border-gray-300 rounded-md bg-gray-50 text-gray-600"
                        readOnly
                      />
                    </div>
                    <p className="mt-1 text-xs text-green-600">✓ Verified</p>
                  </div>
                </div>

                {/* Email */}
                <div className="relative">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <div className="bg-gray-100 p-2 rounded-full">
                        <EmailIcon className="h-5 w-5 text-[#3a5a78]" />
                      </div>
                    </div>
                    <input
                      id="email"
                      type="email"
                      {...register("email")}
                      placeholder="Enter your email address"
                      className={`w-full pl-14 pr-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#3a5a78] ${
                        errors.email ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                  </div>
                  {errors.email && <p className="mt-2 text-sm text-red-600">{errors.email.message}</p>}
                </div>

                {/* Address */}
                <div className="relative">
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                    Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <div className="bg-gray-100 p-2 rounded-full">
                        <HomeIcon className="h-5 w-5 text-[#3a5a78]" />
                      </div>
                    </div>
                    <input
                      id="address"
                      type="text"
                      {...register("address")}
                      placeholder="Enter your complete address"
                      className={`w-full pl-14 pr-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#3a5a78] ${
                        errors.address ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                  </div>
                  {errors.address && <p className="mt-2 text-sm text-red-600">{errors.address.message}</p>}
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setStep(1);
                      setPhoneVerified(false);
                    }}
                    className="w-1/2 bg-gray-200 text-gray-700 py-3 px-6 rounded-md text-lg hover:bg-gray-300 transition-colors duration-200"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || !phoneVerified}
                    className="w-full bg-[#3a5a78] text-white py-3 px-6 rounded-md text-lg hover:bg-[#2c3e50] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    {submitting ? (isEdit ? "Updating..." : "Registering...") : (isEdit ? "Update Information" : "Complete Registration")}
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