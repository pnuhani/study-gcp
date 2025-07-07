import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Container,
  Alert,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  Card,
  CardContent,
  Grid
} from '@mui/material';
import { Phone, QrCode, CheckCircle, Error } from '@mui/icons-material';
import axios from 'axios';

const QrSignIn = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [qrId, setQrId] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [qrData, setQrData] = useState(null);
  const [isFirstTime, setIsFirstTime] = useState(false);
  const [deviceId, setDeviceId] = useState('');
  const [deviceName, setDeviceName] = useState('');
  const [customToken, setCustomToken] = useState('');

  useEffect(() => {
    // Generate device ID on component mount
    const generatedDeviceId = 'device_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    setDeviceId(generatedDeviceId);
    setDeviceName(navigator.userAgent.split(' ')[0] || 'Unknown Device');
  }, []);

  const steps = ['Scan QR Code', 'Enter Phone Number', 'Verify OTP', 'Complete'];

  const handleQrScan = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await axios.get(`/api/qr-signin/scan/${qrId}`);
      
      if (response.data.success) {
        setQrData(response.data);
        setActiveStep(1);
        setSuccess('QR code scanned successfully!');
      } else {
        setError(response.data.error || 'Failed to scan QR code');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to scan QR code');
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await axios.post('/api/qr-signin/send-otp', {
        phoneNumber: phoneNumber
      });
      
      if (response.data.success) {
        setSessionId(response.data.sessionId);
        setActiveStep(2);
        setSuccess('OTP sent successfully!');
      } else {
        setError(response.data.error || 'Failed to send OTP');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await axios.post('/api/qr-signin/verify-otp', {
        sessionId: sessionId,
        otp: otp
      });
      
      if (response.data.success) {
        setCustomToken(response.data.customToken);
        setActiveStep(3);
        setSuccess('OTP verified successfully!');
        
        // Check if this is first time registration
        if (response.data.uid) {
          await registerDevice(response.data.customToken);
        }
      } else {
        setError(response.data.error || 'Failed to verify OTP');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to verify OTP');
    } finally {
      setLoading(false);
    }
  };

  const registerDevice = async (token) => {
    try {
      const response = await axios.post('/api/qr-signin/register-device', {
        qrId: qrId,
        deviceId: deviceId,
        deviceName: deviceName
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
        setIsFirstTime(true);
      }
    } catch (err) {
      console.log('Device registration failed:', err);
    }
  };

  const handleSignIn = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await axios.post('/api/qr-signin/signin', {
        qrId: qrId
      }, {
        headers: {
          'Authorization': `Bearer ${customToken}`
        }
      });
      
      if (response.data.success) {
        setSuccess('Sign-in successful! Welcome back.');
        
        // Navigate to success page with sign-in data
        navigate('/qr-signin/success', {
          state: {
            signInData: {
              ...response.data,
              deviceName: deviceName,
              isFirstTime: isFirstTime
            }
          }
        });
      } else {
        setError(response.data.error || 'Sign-in failed');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Sign-in failed');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setActiveStep(0);
    setQrId('');
    setPhoneNumber('');
    setOtp('');
    setSessionId('');
    setError('');
    setSuccess('');
    setQrData(null);
    setIsFirstTime(false);
    setCustomToken('');
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Scan QR Code
              </Typography>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Enter the QR code ID to scan and verify
              </Typography>
              <TextField
                fullWidth
                label="QR Code ID"
                value={qrId}
                onChange={(e) => setQrId(e.target.value)}
                margin="normal"
                placeholder="Enter QR code ID"
              />
              <Button
                variant="contained"
                onClick={handleQrScan}
                disabled={!qrId || loading}
                startIcon={loading ? <CircularProgress size={20} /> : <QrCode />}
                sx={{ mt: 2 }}
                fullWidth
              >
                {loading ? 'Scanning...' : 'Scan QR Code'}
              </Button>
            </CardContent>
          </Card>
        );

      case 1:
        return (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Enter Phone Number
              </Typography>
              {qrData && (
                <Box sx={{ mb: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                  <Typography variant="subtitle2" color="primary">
                    QR Code Details:
                  </Typography>
                  <Typography variant="body2">
                    Name: {qrData.name}<br/>
                    Email: {qrData.email}<br/>
                    Phone: {qrData.phoneNumber}
                  </Typography>
                </Box>
              )}
              <TextField
                fullWidth
                label="Phone Number"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                margin="normal"
                placeholder="+1234567890"
                type="tel"
              />
              <Button
                variant="contained"
                onClick={handleSendOtp}
                disabled={!phoneNumber || loading}
                startIcon={loading ? <CircularProgress size={20} /> : <Phone />}
                sx={{ mt: 2 }}
                fullWidth
              >
                {loading ? 'Sending...' : 'Send OTP'}
              </Button>
            </CardContent>
          </Card>
        );

      case 2:
        return (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Verify OTP
              </Typography>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Enter the 6-digit OTP sent to your phone
              </Typography>
              <TextField
                fullWidth
                label="OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                margin="normal"
                placeholder="123456"
                inputProps={{ maxLength: 6 }}
              />
              <Button
                variant="contained"
                onClick={handleVerifyOtp}
                disabled={!otp || otp.length !== 6 || loading}
                startIcon={loading ? <CircularProgress size={20} /> : <CheckCircle />}
                sx={{ mt: 2 }}
                fullWidth
              >
                {loading ? 'Verifying...' : 'Verify OTP'}
              </Button>
            </CardContent>
          </Card>
        );

      case 3:
        return (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Sign-in Complete
              </Typography>
              {isFirstTime ? (
                <Alert severity="info" sx={{ mb: 2 }}>
                  This is your first time signing in. Your device has been registered.
                </Alert>
              ) : (
                <Alert severity="success" sx={{ mb: 2 }}>
                  Welcome back! You have successfully signed in.
                </Alert>
              )}
              <Box sx={{ mb: 2, p: 2, bgcolor: 'success.light', borderRadius: 1 }}>
                <Typography variant="subtitle2" color="white">
                  Sign-in Details:
                </Typography>
                <Typography variant="body2" color="white">
                  QR ID: {qrId}<br/>
                  Device: {deviceName}<br/>
                  Phone: {phoneNumber}
                </Typography>
              </Box>
              <Button
                variant="contained"
                onClick={handleSignIn}
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : <CheckCircle />}
                sx={{ mt: 2 }}
                fullWidth
              >
                {loading ? 'Signing in...' : 'Complete Sign-in'}
              </Button>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom align="center">
          QR Code Sign-in
        </Typography>
        
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        {renderStepContent(activeStep)}

        {activeStep === steps.length - 1 && (
          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Button
              variant="outlined"
              onClick={resetForm}
              sx={{ mr: 2 }}
            >
              Start Over
            </Button>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default QrSignIn; 