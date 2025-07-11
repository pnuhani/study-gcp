"use client"

import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import {
  Email as EmailIcon,
  Phone as PhoneIcon,
  Edit as EditIcon,
  LocationOn as LocationIcon,
  WhatsApp as WhatsAppIcon,
} from "@mui/icons-material"
import api from "../api/api"

function QRDisplay() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("Fetching data for QR ID:", id);
        const result = await api.getQRInfo(id)
        console.log("QR Data received in component:", result);
        
        if (result) {
          console.log("Result exists, checking notFound flag:", result.notFound);
          if (result.notFound) {
            console.log("QR not found, setting error");
            setError("Invalid QR code. This QR code does not exist in our system. Debug info: " + 
                     JSON.stringify({
                         resultExists: !!result,
                         isActive: result?.isActive,
                         rawResult: result
                     }));
            return;
          }

          console.log("Checking QR active status:", result.isActive);
          const isQrActive = result.isActive === true 
          
          if (!isQrActive) {
            console.log("QR not active, redirecting to register page");
            navigate(`/qr/${id}/register`)
            return
          }
          
          console.log("Setting QR data:", result);
          setData(result)
        } else {
          console.log("No result received, setting error");
          setError("Invalid QR code. This QR code does not exist in our system.")
        }
      } catch (error) {
        console.error("Error in QRDisplay:", error)
        setError("QR code not found or is invalid")
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id, navigate])

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin h-8 w-8 border-4 border-gray-300 border-t-[#3a5a78] rounded-full"></div>
      </div>
    )
  }

if (error) {
  return (
    <div className="text-[#3a5a78] text-center py-8 px-4">
      <p className="text-lg font-medium">{error}</p>
    </div>
  )
}

  if (!data) {
    return (
      <div className="text-center py-8 px-4">
        <p className="text-lg">No data found.</p>
        <button className="mt-2 text-[#3a5a78] hover:underline" onClick={() => navigate(`/qr/${id}/register`)}>
          Register this QR code
        </button>
      </div>
    )
  }

  const safeData = {
    name: data.name || "Not provided",
    email: data.email || "Not provided",
    address: data.address || "Not provided",
    phoneNumber: data.phoneNumber || "Not provided",
  }

  const handleWhatsAppClick = () => {
    const message = encodeURIComponent(`Hello! I would like to get in touch with CareVego Care for support and guidance.`);
    const whatsappUrl = `https://wa.me/919999756745?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="container max-w-md mx-auto px-4 py-8">
      <div className="bg-white rounded-lg overflow-hidden shadow-lg border border-gray-200 relative">
        {/* Edit Button - Top Right Corner */}
        <button
          onClick={() => navigate(`/qr/${id}/edit`)}
          className="absolute top-4 right-4 bg-white hover:bg-gray-50 text-[#3a5a78] p-2 rounded-full shadow-md border border-gray-200 transition-all duration-200 hover:shadow-lg z-10"
          title="Edit Information"
        >
          <EditIcon className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="bg-gradient-to-r from-[#3a5a78] to-[#2c3e50] px-6 py-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-white p-3 rounded-full">
              <LocationIcon className="h-8 w-8 text-[#3a5a78]" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-white">
            Device Information
          </h2>
          <p className="mt-2 text-gray-200 text-sm">
            Contact details for device recovery
          </p>
        </div>

        {/* Content */}
        <div className="pt-8 pb-4 px-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-semibold text-[#3a5a78] mb-2">{safeData.name}</h2>
            <p className="text-gray-600 text-sm">{safeData.address}</p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-gray-700 leading-relaxed text-center">
              Hello friend! <br/>Thank you for finding my medical device.
              <br />
              This item is very important to me.
              <br />
              If you find it, please contact me and let me take it home!

            </p>
          </div>

          <h3 className="text-[#3a5a78] font-medium mb-3">Emergency contact information</h3>

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="bg-gray-100 p-2 rounded-full">
                <PhoneIcon className="h-5 w-5 text-[#3a5a78]" />
              </div>
              <a 
                href={`tel:${safeData.phoneNumber}`} 
                className="text-gray-700 hover:text-[#3a5a78] hover:underline cursor-pointer transition-colors duration-200 flex items-center gap-2"
              >
                {safeData.phoneNumber}
                <span className="text-xs bg-[#3a5a78] text-white px-2 py-1 rounded-full">Tap to call</span>
              </a>
            </div>

            <div className="flex items-center gap-3">
              <div className="bg-gray-100 p-2 rounded-full">
                <EmailIcon className="h-5 w-5 text-[#3a5a78]" />
              </div>
              <a 
                href={`mailto:${safeData.email}`} 
                className="text-gray-700 hover:text-[#3a5a78] hover:underline cursor-pointer transition-colors duration-200 flex items-center gap-2"
              >
                {safeData.email}
                <span className="text-xs bg-[#3a5a78] text-white px-2 py-1 rounded-full">Tap to email</span>
              </a>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 space-y-3">
          <div className="text-center mb-3">
            <p className="text-sm text-gray-600">
              Need help? Contact CareVego Care for dietitian tips, usage guidance, and general enquiries
            </p>
          </div>
          
          <button
            onClick={handleWhatsAppClick}
            className="w-full bg-[#3a5a78] hover:bg-[#2c3e50] text-white py-3 px-6 rounded-md text-lg flex items-center justify-center gap-2 transition-colors duration-200"
          >
            <WhatsAppIcon className="w-5 h-5" />
            Talk with CareVego Care
          </button>
        </div>
      </div>
    </div>
  )
}

export default QRDisplay

