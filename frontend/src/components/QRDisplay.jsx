import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import HomeIcon from '@mui/icons-material/Home';
import PhoneIcon from '@mui/icons-material/Phone';
import EditIcon from '@mui/icons-material/Edit';
import Layout from './Layout';
import { api } from '../api/api';

function QRDisplay() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await api.getQRInfo(id);
        if (!result || !result.isActive) {
          navigate(`/qr/${id}/register`);
          return;
        }
        setData(result);
      } catch (error) {
        console.error('Error:', error);
        setError('QR code not found');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, navigate]);

  if (loading) return <div className="text-center py-8">Loading...</div>;
  if (error) return <div className="text-red-600 text-center py-8">{error}</div>;
  if (!data) return <div className="text-center py-8">No data found. <a href={`/qr/${id}/register`} className="text-blue-600 hover:underline">Register this QR code</a></div>;


  const safeData = {
    name: data.name || 'Not provided',
    email: data.email || 'Not provided',
    address: data.address || 'Not provided',
    phoneNumber: data.phoneNumber || 'Not provided'
  };

  return (
    <Layout title="QR Code Information">
      <div className="space-y-6">
        <div className="flex justify-center text-center">
          <div className="bg-blue-50 border-l-4 border-red-500 p-4 mb-6 rounded">
          <p className="text-blue-900 leading-relaxed">
            This medical device is very important to me.<br />
            It helps manage my health condition.<br />
            If you&apos;ve found it, I would greatly appreciate if you could contact me using the information below.<br />
            Thank you for your help!
          </p>
          </div>
        </div>
        
        <InfoField icon={<PersonIcon />} label="Name" value={safeData.name} />
        <InfoField icon={<EmailIcon />} label="Email" value={safeData.email} />
        <InfoField icon={<HomeIcon />} label="Address" value={safeData.address} />
        <InfoField icon={<PhoneIcon />} label="Phone Number" value={safeData.phoneNumber} />
        
        <button
          onClick={() => navigate(`/qr/${id}/edit`)}
          className="w-full mt-6 bg-[#3a5a78] hover:bg-[#2d4860] text-white py-3 px-6 rounded-md text-lg flex items-center justify-center gap-2 transition-colors duration-200"
        >
          <EditIcon className="w-5 h-5" />
          Edit Information
        </button>
      </div>
    </Layout>
  );
}

function InfoField({ icon, label, value }) {
  return (
    <div className="flex items-center gap-4 p-3 bg-[#f0f4f8] rounded-md">
      <div className="text-[#3a5a78]">
        {icon}
      </div>
      <div>
        <p className="text-base text-[#5a6a7a]">
          {label}
        </p>
        <p className="text-lg text-[#2c3e50] font-medium">
          {value}
        </p>
      </div>
    </div>
  );
}


InfoField.propTypes = {
  icon: PropTypes.node.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired
}


export default QRDisplay;