import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Container,
  Button,
  Card,
  CardContent,
  Grid,
  Chip,
  Divider
} from '@mui/material';
import {
  CheckCircle,
  QrCode,
  Phone,
  DeviceHub,
  AccessTime,
  Person
} from '@mui/icons-material';

const QrSignInSuccess = () => {
  const location = useLocation();
  const signInData = location.state?.signInData || {};

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box textAlign="center" sx={{ mb: 4 }}>
          <CheckCircle sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
          <Typography variant="h4" gutterBottom color="success.main">
            Sign-in Successful!
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Welcome back! You have successfully signed in using QR code authentication.
          </Typography>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <QrCode sx={{ mr: 1 }} />
                  QR Code Details
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="textSecondary">
                    QR ID
                  </Typography>
                  <Typography variant="body1" sx={{ fontFamily: 'monospace' }}>
                    {signInData.qrId || 'N/A'}
                  </Typography>
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Name
                  </Typography>
                  <Typography variant="body1">
                    {signInData.name || 'N/A'}
                  </Typography>
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Email
                  </Typography>
                  <Typography variant="body1">
                    {signInData.email || 'N/A'}
                  </Typography>
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Address
                  </Typography>
                  <Typography variant="body1">
                    {signInData.address || 'N/A'}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <Person sx={{ mr: 1 }} />
                  Sign-in Information
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Phone Number
                  </Typography>
                  <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center' }}>
                    <Phone sx={{ mr: 1, fontSize: 16 }} />
                    {signInData.phoneNumber || 'N/A'}
                  </Typography>
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="textSecondary">
                    User ID
                  </Typography>
                  <Typography variant="body1" sx={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>
                    {signInData.uid || 'N/A'}
                  </Typography>
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Sign-in Time
                  </Typography>
                  <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center' }}>
                    <AccessTime sx={{ mr: 1, fontSize: 16 }} />
                    {formatDate(signInData.signInTime)}
                  </Typography>
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Device Information
                  </Typography>
                  <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center' }}>
                    <DeviceHub sx={{ mr: 1, fontSize: 16 }} />
                    {navigator.userAgent.split(' ')[0] || 'Unknown Device'}
                  </Typography>
                </Box>

                <Box sx={{ mt: 3 }}>
                  <Chip
                    label="First Time User"
                    color="primary"
                    variant="outlined"
                    sx={{ mr: 1 }}
                  />
                  <Chip
                    label="OTP Verified"
                    color="success"
                    variant="outlined"
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            Your device has been successfully authenticated and registered.
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              component={Link}
              to="/"
              sx={{ minWidth: 120 }}
            >
              Go Home
            </Button>
            
            <Button
              variant="outlined"
              component={Link}
              to="/qr-signin"
              sx={{ minWidth: 120 }}
            >
              Sign In Again
            </Button>
          </Box>
        </Box>

        <Box sx={{ mt: 4, p: 3, bgcolor: 'info.light', borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom>
            What's Next?
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            You can now:
          </Typography>
          <ul style={{ margin: 0, paddingLeft: 20 }}>
            <li>
              <Typography variant="body2">
                Access your registered devices and their information
              </Typography>
            </li>
            <li>
              <Typography variant="body2">
                Update your contact information if needed
              </Typography>
            </li>
            <li>
              <Typography variant="body2">
                Register additional devices using the same process
              </Typography>
            </li>
            <li>
              <Typography variant="body2">
                Contact support if you need assistance
              </Typography>
            </li>
          </ul>
        </Box>
      </Paper>
    </Container>
  );
};

export default QrSignInSuccess; 