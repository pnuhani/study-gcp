import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Container,
  Card,
  CardContent,
  Grid,
  Chip,
  Divider,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Person,
  Email,
  LocationOn,
  Phone,
  CheckCircle,
  QrCode,
  DeviceHub
} from '@mui/icons-material';
import axios from 'axios';

const WelcomePage = () => {
  const [searchParams] = useSearchParams();
  const [welcomeData, setWelcomeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchWelcomeData = async () => {
      const qrToken = searchParams.get('qrToken');
      const deviceId = searchParams.get('deviceId');

      if (!qrToken) {
        setError('QR token is required');
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(`/api/welcome?qrToken=${qrToken}&deviceId=${deviceId || ''}`);
        
        if (response.data.success) {
          setWelcomeData(response.data);
        } else {
          setError(response.data.error || 'Failed to load welcome data');
        }
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load welcome data');
      } finally {
        setLoading(false);
      }
    };

    fetchWelcomeData();
  }, [searchParams]);

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error">
          {error}
        </Alert>
      </Container>
    );
  }

  if (!welcomeData) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="warning">
          No welcome data available
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        {/* Header */}
        <Box textAlign="center" mb={4}>
          <CheckCircle sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
          <Typography variant="h3" gutterBottom color="primary">
            Welcome!
          </Typography>
          <Typography variant="h6" color="textSecondary">
            You have successfully signed in
          </Typography>
          <Chip
            label="Successfully Authenticated"
            color="success"
            icon={<CheckCircle />}
            sx={{ mt: 2 }}
          />
        </Box>

        <Divider sx={{ mb: 4 }} />

        {/* QR Code Information */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              <QrCode sx={{ mr: 1, verticalAlign: 'middle' }} />
              QR Code Information
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Person sx={{ mr: 1 }} />
                  <strong>Name:</strong>
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ ml: 3 }}>
                  {welcomeData.name}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Email sx={{ mr: 1 }} />
                  <strong>Email:</strong>
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ ml: 3 }}>
                  {welcomeData.email}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Phone sx={{ mr: 1 }} />
                  <strong>Phone:</strong>
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ ml: 3 }}>
                  {welcomeData.phoneNumber}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <LocationOn sx={{ mr: 1 }} />
                  <strong>Address:</strong>
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ ml: 3 }}>
                  {welcomeData.address}
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Device Information */}
        {welcomeData.deviceId && (
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                <DeviceHub sx={{ mr: 1, verticalAlign: 'middle' }} />
                Device Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <strong>Device ID:</strong>
                  </Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ ml: 2 }}>
                    {welcomeData.deviceId}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <strong>Sign-in Time:</strong>
                  </Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ ml: 2 }}>
                    {new Date(welcomeData.welcomeTime).toLocaleString()}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        )}

        {/* QR Code Details */}
        <Card>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              QR Code Details
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <strong>QR ID:</strong>
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ ml: 2 }}>
                  {welcomeData.qrId}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <strong>Status:</strong>
                </Typography>
                <Chip
                  label={welcomeData.isActive ? "Active" : "Inactive"}
                  color={welcomeData.isActive ? "success" : "error"}
                  size="small"
                  sx={{ ml: 2 }}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Success Message */}
        <Box textAlign="center" mt={4}>
          <Typography variant="body1" color="textSecondary">
            Thank you for using our QR code authentication system!
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
            Your session has been successfully authenticated and your device has been registered.
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default WelcomePage; 