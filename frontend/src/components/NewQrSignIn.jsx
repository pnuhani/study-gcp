import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
  Grid,
  Divider
} from '@mui/material';
import { Phone, QrCode, CheckCircle, Error, Person, Email, LocationOn } from '@mui/icons-material';
import axios from 'axios';

const NewQrSignIn = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeStep, setActiveStep] = useState(0);
  const [qrToken, setQrToken] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [qrData, setQrData] = useState(null);
  const [deviceId, setDeviceId] = useState('');
  const [customToken, setCustomToken] = useState('');

  useEffect(() => {
    // Generate device ID on component mount
    const generatedDeviceId = 'device_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    setDeviceId(generatedDeviceId);
    
    // Check if qrToken is in URL params
    const tokenFromUrl = searchParams.get('qrToken');
    if (tokenFromUrl) {
      setQrToken(tokenFromUrl);
      setActiveStep(1); // Skip to phone number step
    }
  }, [searchParams]);

  const steps = ['Enter QR Token', 'Enter Phone Number', 'Verify OTP', 'Complete'];

  const handleScan = async () => {
    if (!qrToken.trim()) {
      setError('Please enter a QR token');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const response = await axios.post('/api/scan', {
        qrToken: qrToken,
        phoneNumber: phoneNumber,
        deviceId: deviceId
      });
      
      if (response.data.success) {
        setQrData(response.data);
        setSessionId(response.data.sessionId);
        setActiveStep(2);
        setSuccess('QR code scanned successfully! OTP sent to your phone.');
      } else {
        setError(response.data.error || 'Failed to scan QR code');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to scan QR code');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp.trim()) {
      setError('Please enter the OTP');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const response = await axios.post('/api/verify-otp', {
        sessionId: sessionId,
        otp: otp,
        deviceId: deviceId
      });
      
      if (response.data.success) {
        setCustomToken(response.data.customToken);
        setActiveStep(3);
        setSuccess('OTP verified successfully!');
        
        // Navigate to welcome page
        setTimeout(() => {
          navigate(`/welcome?qrToken=${qrToken}&deviceId=${deviceId}`);
        }, 2000);
      } else {
        setError(response.data.error || 'Failed to verify OTP');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to verify OTP');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setActiveStep(0);
    setQrToken('');
    setPhoneNumber('');
    setOtp('');
    setSessionId('');
    setError('');
    setSuccess('');
    setQrData(null);
    setCustomToken('');
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Enter QR Token
              </Typography>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Enter the QR token from the QR code or URL
              </Typography>
              <TextField
                fullWidth
                label="QR Token"
                value={qrToken}
                onChange={(e) => setQrToken(e.target.value)}
                margin="normal"
                placeholder="e.g., abc123xyz"
              />
              <Button
                variant="contained"
                onClick={() => setActiveStep(1)}
                disabled={!qrToken.trim()}
                sx={{ mt: 2 }}
              >
                Continue
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
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Enter the phone number associated with this QR code
              </Typography>
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
                onClick={handleScan}
                disabled={!phoneNumber.trim() || loading}
                sx={{ mt: 2 }}
                startIcon={loading ? <CircularProgress size={20} /> : <QrCode />}
              >
                {loading ? 'Scanning...' : 'Scan QR Code'}
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
                type="text"
                inputProps={{ maxLength: 6 }}
              />
              <Button
                variant="contained"
                onClick={handleVerifyOtp}
                disabled={!otp.trim() || otp.length !== 6 || loading}
                sx={{ mt: 2 }}
                startIcon={loading ? <CircularProgress size={20} /> : <CheckCircle />}
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
              <Typography variant="h6" gutterBottom color="primary">
                Success!
              </Typography>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Your OTP has been verified successfully.
              </Typography>
              {qrData && (
                <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    QR Code Information:
                  </Typography>
                  <Grid container spacing={1}>
                    <Grid item xs={12}>
                      <Typography variant="body2">
                        <Person sx={{ fontSize: 16, mr: 1, verticalAlign: 'middle' }} />
                        <strong>Name:</strong> {qrData.name}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="body2">
                        <Email sx={{ fontSize: 16, mr: 1, verticalAlign: 'middle' }} />
                        <strong>Email:</strong> {qrData.email}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="body2">
                        <LocationOn sx={{ fontSize: 16, mr: 1, verticalAlign: 'middle' }} />
                        <strong>Address:</strong> {qrData.address}
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>
              )}
              <Button
                variant="contained"
                onClick={() => navigate(`/welcome?qrToken=${qrToken}&deviceId=${deviceId}`)}
                sx={{ mt: 2 }}
              >
                Go to Welcome Page
              </Button>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom align="center">
          QR Code Sign-In
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

        {activeStep < steps.length - 1 && (
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
            <Button
              disabled={activeStep === 0}
              onClick={() => setActiveStep((prev) => prev - 1)}
            >
              Back
            </Button>
            <Button onClick={resetForm}>
              Reset
            </Button>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default NewQrSignIn; 