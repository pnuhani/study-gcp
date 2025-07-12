# Local Testing Guide

This guide will help you set up and test the QR code management system locally.

## Prerequisites

1. **Java 21** - Download from [Oracle](https://www.oracle.com/java/technologies/downloads/) or [OpenJDK](https://adoptium.net/)
2. **Node.js** (v18 or later) - Download from [nodejs.org](https://nodejs.org/)
3. **Firebase Project** - Required for authentication and database

## Step 1: Firebase Setup

### Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable Authentication (Phone provider)
4. Enable Firestore Database

### Get Firebase Configuration
1. In Firebase Console → Project Settings → General
2. Scroll to "Your apps" section
3. Add a web app if not already added
4. Copy the Firebase config object

### Generate Service Account Key
1. Go to Project Settings → Service Accounts
2. Click "Generate new private key"
3. Download the JSON file
4. Convert to Base64 for backend use

## Step 2: Environment Setup

### Frontend Environment
Create `frontend/.env.local`:
```bash
VITE_BASE_URL=http://localhost:8080
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### Backend Environment
Create `backend/.env` (optional - you can also set these as system environment variables):
```bash
# Firebase Configuration
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CREDENTIALS=base64_encoded_service_account_json

# Admin Configuration (optional - defaults are in application-local.properties)
ADMIN_USERNAME=admin@example.com
ADMIN_PASSWORD=admin123
ADMIN_EMAIL=admin@example.com

# Email Configuration (optional for local testing)
SMTP_PORT=587
SMTP_EMAIL=your_email@gmail.com
SMTP_PASSWORD=your_app_password
```

## Step 3: Convert Firebase Service Account to Base64

### macOS/Linux:
```bash
base64 -i path/to/serviceAccountKey.json
```

### Windows (PowerShell):
```powershell
[Convert]::ToBase64String([IO.File]::ReadAllBytes("path/to/serviceAccountKey.json"))
```

## Step 4: Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Start the backend with local profile:**
   ```bash
   # On macOS/Linux
   SPRING_PROFILES_ACTIVE=local ./gradlew bootRun
   
   # On Windows (Command Prompt)
   set SPRING_PROFILES_ACTIVE=local
   gradlew.bat bootRun
   
   # On Windows (PowerShell)
   $env:SPRING_PROFILES_ACTIVE="local"
   gradlew.bat bootRun
   ```

   **Alternative: Set environment variables and run:**
   ```bash
   # Set Firebase environment variables
   export FIREBASE_PROJECT_ID=your_project_id
   export FIREBASE_CREDENTIALS=your_base64_credentials
   
   # Run with local profile
   SPRING_PROFILES_ACTIVE=local ./gradlew bootRun
   ```

## Step 5: Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

## Step 6: Testing the Application

### Verify Backend is Running
- Health check: `http://localhost:8080/actuator/health`
- Should return: `{"status":"UP","components":{"firestore":{"status":"UP"}}}`

### Test User Flow

1. **Landing Page:**
   - Visit: `http://localhost:5173`
   - Should show the landing page

2. **QR Code Registration:**
   - Visit: `http://localhost:5173/qr/test123`
   - Should redirect to registration form
   - Fill in the form and verify phone number
   - Complete registration

3. **QR Code Display:**
   - After registration, visit: `http://localhost:5173/qr/test123`
   - Should display the registered information

4. **QR Code Editing:**
   - Visit: `http://localhost:5173/qr/test123/edit`
   - Verify phone number and update information

### Test Admin Flow

1. **Admin Login:**
   - Visit: `http://localhost:5173/admin/login`
   - Use credentials: `admin@example.com` / `admin123`

2. **Admin Dashboard:**
   - After login, you'll be redirected to the dashboard
   - Test QR code management features
   - Test batch generation
   - Test PDF download

## Step 7: Docker Alternative

If you prefer using Docker for local development:

```bash
# Build and run with Docker Compose
docker-compose up --build

# Or run individual services
docker-compose up backend
docker-compose up frontend
```

## Troubleshooting

### Backend Issues

1. **Firebase Connection Error:**
   - Verify `FIREBASE_PROJECT_ID` and `FIREBASE_CREDENTIALS` are set correctly
   - Check that the service account has proper permissions

2. **Port Already in Use:**
   - Change port in `application-local.properties`: `server.port=8081`
   - Update frontend `.env.local`: `VITE_BASE_URL=http://localhost:8081`

3. **Gradle Issues:**
   - Clean and rebuild: `./gradlew clean bootRun`

### Frontend Issues

1. **API Connection Error:**
   - Verify `VITE_BASE_URL` points to correct backend URL
   - Check CORS configuration in backend

2. **Firebase Authentication Error:**
   - Verify Firebase configuration in `.env.local`
   - Check Firebase Console for authentication settings

3. **Build Errors:**
   - Clear node modules: `rm -rf node_modules && npm install`

### Common Issues

1. **Phone Authentication Not Working:**
   - Ensure Firebase project has Phone Authentication enabled
   - Add test phone numbers in Firebase Console for development

2. **CORS Errors:**
   - Backend CORS is configured for localhost:5173
   - If using different port, update `CorsConfig.java`

3. **Database Connection:**
   - Firestore is cloud-based, no local database setup needed
   - Ensure Firebase project is properly configured

## Development Tips

1. **Use Browser Developer Tools:**
   - Check Network tab for API calls
   - Check Console for errors
   - Use Application tab to inspect localStorage

2. **Backend Logging:**
   - Check console output for detailed logs
   - Use `logging.level.com.qwervego=DEBUG` for more verbose logging

3. **Frontend Hot Reload:**
   - Vite provides hot reload by default
   - Changes to React components will auto-refresh

4. **API Testing:**
   - Use tools like Postman or curl to test backend APIs directly
   - Base URL: `http://localhost:8080/api`

## Environment Variables Reference

### Backend Environment Variables
- `FIREBASE_PROJECT_ID`: Your Firebase project ID
- `FIREBASE_CREDENTIALS`: Base64 encoded service account JSON
- `ADMIN_USERNAME`: Admin login email (default: admin@example.com)
- `ADMIN_PASSWORD`: Admin login password (default: admin123)
- `ADMIN_EMAIL`: Admin email (default: admin@example.com)
- `SMTP_PORT`: Email port (default: 587)
- `SMTP_EMAIL`: Email username
- `SMTP_PASSWORD`: Email password

### Frontend Environment Variables
- `VITE_BASE_URL`: Backend API URL (default: http://localhost:8080)
- `VITE_FIREBASE_API_KEY`: Firebase API key
- `VITE_FIREBASE_AUTH_DOMAIN`: Firebase auth domain
- `VITE_FIREBASE_PROJECT_ID`: Firebase project ID
- `VITE_FIREBASE_STORAGE_BUCKET`: Firebase storage bucket
- `VITE_FIREBASE_MESSAGING_SENDER_ID`: Firebase messaging sender ID
- `VITE_FIREBASE_APP_ID`: Firebase app ID 