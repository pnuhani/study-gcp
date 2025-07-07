# QR Code Sign-in System

This document describes the QR code sign-in functionality that has been added to the QwerVego medical device tracking system.

## Overview

The QR sign-in system allows users to authenticate using QR codes with OTP (One-Time Password) verification. The system supports both first-time device registration and subsequent sign-ins.

## Features

- **QR Code Scanning**: Users can scan QR codes or manually enter QR IDs
- **Phone Number Verification**: OTP-based authentication using phone numbers
- **Device Registration**: Automatic device registration for first-time users
- **Session Management**: Secure session handling with Firebase authentication
- **Responsive UI**: Modern, mobile-friendly interface with Material-UI components

## Architecture

### Backend Components

#### 1. OTP Service (`OtpService.java`)
- Handles OTP generation and verification
- Manages session lifecycle (10-minute expiration)
- Integrates with Firebase Auth for user creation/verification
- Phone number normalization and validation

#### 2. QR Sign-in Controller (`QrSignInController.java`)
- REST API endpoints for QR sign-in flow
- QR code scanning and validation
- Device registration
- Sign-in completion

#### 3. Firebase Integration
- User creation and management
- Custom token generation
- Phone number verification

### Frontend Components

#### 1. QR Sign-in Component (`QrSignIn.jsx`)
- Multi-step sign-in process
- Phone number input and OTP verification
- Progress tracking with stepper UI
- Error handling and success states

#### 2. QR Scanner Component (`QrScanner.jsx`)
- Camera-based QR code scanning
- Manual QR ID input option
- Real-time video processing

#### 3. Success Page (`QrSignInSuccess.jsx`)
- Sign-in confirmation and details
- Device information display
- Navigation options

## API Endpoints

### 1. Send OTP
```
POST /api/qr-signin/send-otp
Content-Type: application/json

{
  "phoneNumber": "+1234567890"
}

Response:
{
  "success": true,
  "sessionId": "session_1234567890_abc123",
  "message": "OTP sent successfully",
  "phoneNumber": "+1234567890"
}
```

### 2. Verify OTP
```
POST /api/qr-signin/verify-otp
Content-Type: application/json

{
  "sessionId": "session_1234567890_abc123",
  "otp": "123456"
}

Response:
{
  "success": true,
  "message": "OTP verified successfully",
  "uid": "firebase_user_id",
  "customToken": "firebase_custom_token",
  "phoneNumber": "+1234567890"
}
```

### 3. Scan QR Code
```
GET /api/qr-signin/scan/{qrId}

Response:
{
  "success": true,
  "qrId": "qr_123",
  "name": "John Doe",
  "email": "john@example.com",
  "address": "123 Main St",
  "phoneNumber": "+1234567890",
  "isActive": true,
  "createdDate": "2024-01-01T00:00:00Z",
  "activationDate": "2024-01-01T00:00:00Z"
}
```

### 4. Register Device
```
POST /api/qr-signin/register-device
Authorization: Bearer {customToken}
Content-Type: application/json

{
  "qrId": "qr_123",
  "deviceId": "device_1234567890_abc123",
  "deviceName": "Chrome/120.0"
}

Response:
{
  "success": true,
  "message": "Device registered successfully",
  "qrId": "qr_123",
  "deviceId": "device_1234567890_abc123",
  "deviceName": "Chrome/120.0",
  "phoneNumber": "+1234567890"
}
```

### 5. Sign In
```
POST /api/qr-signin/signin
Authorization: Bearer {customToken}
Content-Type: application/json

{
  "qrId": "qr_123"
}

Response:
{
  "success": true,
  "message": "Sign-in successful",
  "qrId": "qr_123",
  "name": "John Doe",
  "email": "john@example.com",
  "address": "123 Main St",
  "phoneNumber": "+1234567890",
  "uid": "firebase_user_id",
  "signInTime": "2024-01-01T12:00:00Z"
}
```

## User Flow

### First-Time User
1. **Scan QR Code**: User scans QR code or enters QR ID manually
2. **Enter Phone Number**: User enters their phone number
3. **Receive OTP**: System sends OTP to the phone number
4. **Verify OTP**: User enters the 6-digit OTP
5. **Device Registration**: System automatically registers the device
6. **Sign-in Complete**: User is redirected to success page

### Returning User
1. **Scan QR Code**: User scans the same QR code
2. **Enter Phone Number**: User enters their phone number
3. **Receive OTP**: System sends OTP to the phone number
4. **Verify OTP**: User enters the 6-digit OTP
5. **Sign-in Complete**: User is redirected to success page

## Security Features

- **Session Management**: OTP sessions expire after 10 minutes
- **Phone Verification**: Firebase phone number verification
- **Token-based Auth**: Custom Firebase tokens for API access
- **Device Tracking**: Unique device IDs for registration
- **Input Validation**: Server-side validation of all inputs

## Configuration

### Environment Variables
```properties
# Firebase Configuration
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CREDENTIALS=path/to/serviceAccountKey.json

# Server Configuration
server.port=8080
```

### Dependencies

#### Backend (Gradle)
```gradle
implementation 'com.google.firebase:firebase-admin:9.1.0'
implementation 'org.springframework.boot:spring-boot-starter-security'
implementation 'org.springframework.boot:spring-boot-starter-web'
```

#### Frontend (npm)
```json
{
  "@mui/material": "^6.3.1",
  "@mui/icons-material": "^6.3.1",
  "axios": "^1.8.4",
  "react-router-dom": "^7.1.1"
}
```

## Usage

### Accessing the QR Sign-in
1. Navigate to the landing page
2. Click the "QR Code Sign-in" button
3. Follow the step-by-step process

### Testing
1. Create a QR code using the existing QR generation system
2. Use the QR ID to test the sign-in flow
3. Use any 6-digit number as OTP (for demo purposes)

## Future Enhancements

1. **Real SMS Integration**: Integrate with Twilio or similar SMS service
2. **QR Code Detection**: Implement actual QR code scanning with jsQR library
3. **Biometric Authentication**: Add fingerprint/face recognition
4. **Multi-factor Authentication**: Add email verification as second factor
5. **Device Management**: Allow users to manage registered devices
6. **Audit Logging**: Track all sign-in attempts and device registrations

## Troubleshooting

### Common Issues

1. **Camera Access Denied**
   - Ensure HTTPS is enabled for camera access
   - Check browser permissions

2. **OTP Not Received**
   - Verify phone number format (+1234567890)
   - Check Firebase configuration

3. **QR Code Not Found**
   - Verify QR ID exists in database
   - Check if QR code is active

4. **Authentication Failed**
   - Verify Firebase credentials
   - Check custom token generation

### Debug Mode
Enable debug logging in `application.properties`:
```properties
logging.level.com.qwervego=DEBUG
logging.level.org.springframework.web=DEBUG
```

## Support

For technical support or questions about the QR sign-in system, please refer to the project documentation or contact the development team. 