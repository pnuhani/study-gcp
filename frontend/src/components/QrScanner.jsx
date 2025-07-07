import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  Container,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { QrCode, Camera, Close } from '@mui/icons-material';

const QrScanner = ({ onScan, onClose, open }) => {
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState('');
  const [stream, setStream] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    if (open) {
      startScanner();
    } else {
      stopScanner();
    }

    return () => {
      stopScanner();
    };
  }, [open]);

  const startScanner = async () => {
    try {
      setScanning(true);
      setError('');

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Use back camera on mobile
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });

      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play();
      }

      // Start scanning loop
      scanLoop();
    } catch (err) {
      setError('Failed to access camera: ' + err.message);
      setScanning(false);
    }
  };

  const stopScanner = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setScanning(false);
  };

  const scanLoop = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    const scanFrame = () => {
      if (!scanning) return;

      try {
        // Draw video frame to canvas
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Get image data for QR code detection
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        
        // Here you would integrate with a QR code detection library
        // For demo purposes, we'll simulate QR code detection
        // In production, you would use libraries like jsQR or ZXing
        
        // Simulate QR code detection (replace with actual implementation)
        const qrCode = detectQRCode(imageData);
        
        if (qrCode) {
          handleQRCodeDetected(qrCode);
          return;
        }

        // Continue scanning
        requestAnimationFrame(scanFrame);
      } catch (err) {
        console.error('Scanning error:', err);
        requestAnimationFrame(scanFrame);
      }
    };

    scanFrame();
  };

  const detectQRCode = (imageData) => {
    // This is a placeholder for QR code detection
    // In a real implementation, you would use a library like jsQR:
    // import jsQR from 'jsqr';
    // const code = jsQR(imageData.data, imageData.width, imageData.height);
    // return code ? code.data : null;
    
    // For demo purposes, we'll return null
    // You can implement actual QR detection here
    return null;
  };

  const handleQRCodeDetected = (qrData) => {
    stopScanner();
    onScan(qrData);
  };

  const handleManualInput = () => {
    const qrId = prompt('Enter QR Code ID:');
    if (qrId && qrId.trim()) {
      onScan(qrId.trim());
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 }
      }}
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">
            <QrCode sx={{ mr: 1, verticalAlign: 'middle' }} />
            Scan QR Code
          </Typography>
          <Button onClick={onClose} size="small">
            <Close />
          </Button>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Container maxWidth="sm">
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Paper elevation={3} sx={{ p: 2, textAlign: 'center' }}>
            {scanning ? (
              <Box>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  Point your camera at the QR code
                </Typography>
                
                <Box sx={{ position: 'relative', width: '100%', height: 300, bgcolor: 'black' }}>
                  <video
                    ref={videoRef}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                    playsInline
                  />
                  
                  {/* QR Code overlay */}
                  <Box
                    sx={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      width: 200,
                      height: 200,
                      border: '2px solid #fff',
                      borderRadius: 2,
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: -2,
                        left: -2,
                        right: -2,
                        bottom: -2,
                        border: '2px solid #00ff00',
                        borderRadius: 2,
                        animation: 'pulse 2s infinite'
                      }
                    }}
                  />
                  
                  <canvas
                    ref={canvasRef}
                    style={{ display: 'none' }}
                    width={640}
                    height={480}
                  />
                </Box>
                
                <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
                  Scanning for QR code...
                </Typography>
              </Box>
            ) : (
              <Box>
                <CircularProgress size={60} sx={{ mb: 2 }} />
                <Typography variant="body1" gutterBottom>
                  Initializing camera...
                </Typography>
              </Box>
            )}
          </Paper>

          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Button
              variant="outlined"
              onClick={handleManualInput}
              startIcon={<QrCode />}
              sx={{ mr: 1 }}
            >
              Enter Manually
            </Button>
            
            <Button
              variant="outlined"
              onClick={onClose}
            >
              Cancel
            </Button>
          </Box>
        </Container>
      </DialogContent>
    </Dialog>
  );
};

export default QrScanner; 