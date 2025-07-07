import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Typography,
  Paper,
  Container,
  Alert,
  CircularProgress,
  TextField,
  Card,
  CardContent
} from '@mui/material';
import { QrCode, Camera, Phone, DeviceHub } from '@mui/icons-material';

const ScanPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [scanData, setScanData] = useState(null);
  
  const qrToken = searchParams.get('qrToken');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [deviceId, setDeviceId] = useState('');

  useEffect(() => {
    if (qrToken) {
      // Auto-fill device ID with a generated one if not provided
      if (!deviceId) {
        setDeviceId(`device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
      }
    }
  }, [qrToken, deviceId]);

  const handleScan = async () => {
    if (!phoneNumber.trim()) {
      setError('Please enter your phone number');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/test/scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          qrToken: qrToken || 'testtoken123',
          phoneNumber: phoneNumber.trim(),
          deviceId: deviceId.trim()
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setScanData(data);
        setSuccess(true);
      } else {
        setError(data.message || 'Scan failed');
      }
    } catch (err) {
      setError('Network error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!scanData?.sessionId) {
      setError('No session available for OTP verification');
      return;
    }

    const otp = prompt('Enter the OTP sent to your phone:');
    if (!otp) return;

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/test/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: scanData.sessionId,
          otp: otp,
          deviceId: deviceId.trim()
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setError('');
        alert('OTP verification successful! User ID: ' + data.uid);
        // Navigate to welcome page or success page
        navigate('/welcome?qrId=' + (qrToken || 'test'));
      } else {
        setError(data.message || 'OTP verification failed');
      }
    } catch (err) {
      setError('Network error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!qrToken) {
    return (
      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <QrCode sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
          <Typography variant="h4" gutterBottom>
            QR Code Scanner
          </Typography>
          <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
            No QR token provided. Please scan a QR code or provide a token.
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate('/')}
            startIcon={<QrCode />}
          >
            Go to Home
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <QrCode sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
          <Typography variant="h4" gutterBottom>
            QR Code Scan
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Token: {qrToken}
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {success && scanData ? (
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Scan Successful!
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Session ID: {scanData.sessionId}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Phone: {scanData.phoneNumber}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Device: {scanData.deviceId}
              </Typography>
            </CardContent>
          </Card>
        ) : (
          <Box sx={{ mb: 3 }}>
            <TextField
              fullWidth
              label="Phone Number"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="Enter your phone number"
              sx={{ mb: 2 }}
              InputProps={{
                startAdornment: <Phone sx={{ mr: 1, color: 'text.secondary' }} />
              }}
            />
            
            <TextField
              fullWidth
              label="Device ID"
              value={deviceId}
              onChange={(e) => setDeviceId(e.target.value)}
              placeholder="Device identifier"
              sx={{ mb: 2 }}
              InputProps={{
                startAdornment: <DeviceHub sx={{ mr: 1, color: 'text.secondary' }} />
              }}
            />

            <Button
              fullWidth
              variant="contained"
              onClick={handleScan}
              disabled={loading || !phoneNumber.trim()}
              startIcon={loading ? <CircularProgress size={20} /> : <Camera />}
              sx={{ mb: 2 }}
            >
              {loading ? 'Processing...' : 'Scan QR Code'}
            </Button>
          </Box>
        )}

        {success && scanData && (
          <Box sx={{ textAlign: 'center' }}>
            <Button
              variant="outlined"
              onClick={handleVerifyOTP}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : <QrCode />}
              sx={{ mr: 2 }}
            >
              {loading ? 'Verifying...' : 'Verify OTP'}
            </Button>
            
            <Button
              variant="outlined"
              onClick={() => navigate('/welcome?qrId=' + qrToken)}
            >
              Go to Welcome
            </Button>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default ScanPage; 