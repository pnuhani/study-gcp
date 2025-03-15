

## Features

### End User Features
- **QR Code Display**
  - Visit a URL in the form of `/qr/{id}` to view QR code details.
  - Display of key details such as name, address, phone number, and email.
  - Emergency contact information with clickable links for direct call and mail.
  - A clear design with a header icon and background messaging.

- **QR Code Registration**
  - If a QR code isn’t already active, the application redirects users to register their information.
  - Registration form validation (e.g., required fields, email format, password confirmation) using zod.
  - Once the user submits a valid form, the backend activates the QR code.

- **QR Code Editing**
  - For active QR codes, users can update their information.
  - A two-step security flow that first verifies the user’s password before allowing an update.
  - Uses a pre-filled form (with current details) for a seamless update experience.

### Admin Features
- **Admin Authentication**
  - Login page for administrators at `/admin/login` that validates credentials.
  - Token generation on successful login and verification for admin endpoints.
  - Logout functionality to clear admin sessions.

- **Admin Dashboard**
  - A dedicated dashboard for QR code management.
  - Displays a paginated list of generated QR codes sorted by active status.
  - Users can select one or multiple QR codes and download them as a PDF.
  - Batch generation of new QR codes (with configurable batch size).
  - Pagination controls to navigate through result pages.
  - Dark mode toggle which persists user preferences.
  - Refresh button to re-fetch the latest list of QR codes.
  - Action buttons on each row allowing admins to view and edit QR code details.

### Backend Features
- **REST API**
  - Endpoints for adding, updating, and retrieving QR code information.
  - Dedicated endpoints for admin login, token verification, logout, and batch generation.
  - Global exception handling and custom exceptions (e.g., UnauthorizedException, QrNotFoundException) for robust error reporting.
  - MongoDB integration for document-based persistence.

- **Security**
  - Basic in-memory admin authentication with token-based session management.
  - BCrypt password encoding for secure password storage and verification.
  - CORS setup to allow requests from configured frontend origins.

## Application Walkthrough

1. **QR Code Interaction (User Flow):**
   - A user navigates to a URL like `http://localhost:5173/qr/qr123`.
   - If the QR code is inactive, they are redirected to a registration form.
   - On the registration page, the user fills in data such as name, email, address, phone number, and sets a password.
   - After submission, the backend activates the QR code and saves the data.
   - Once registered, the QR code details can be viewed and later edited if needed.

2. **Admin Dashboard Workflow:**
   - An admin visits the login page at `/admin/login` and enters predefined credentials.
   - After successful authentication, an admin token is stored locally.
   - The admin is then redirected to the dashboard where a paginated list of QR codes is shown.
   - In the dashboard view:
     - QR codes are sorted by active status.
     - The admin can select individual or all QR codes.
     - Batch generation of QR codes is done using a configurable batch size.
     - Selected QR codes can be downloaded in a PDF layout with QR images and details.
     - There are also navigation buttons with pagination and a dark mode toggle.
   - The dashboard uses caching (storing loaded pages) to improve navigation between pages.

3. **Backend Operations:**
   - API endpoints such as `/api/qr/add`, `/api/qr/update`, and `/api/qr?id={id}` deliver the core functionality.
   - The endpoints are secured using simple token authentication for admin functions.
   - Global exception handling ensures that any errors in the backend are logged and a friendly error message is returned to the client.

## Getting Started

### Prerequisites
- **JDK 21** (or later as specified in the Gradle build)
- **MongoDB** instance running locally (URI: `mongodb://localhost:27017/qr_database`)
- **Node.js** (for the frontend)

### Backend Setup
1. Navigate to the `backend` folder.
2. Run the following command (on Windows, use Command Prompt or PowerShell):
   ```bat
   gradlew bootRun
   ```
   This will start the Spring Boot application on port 8080.

### Frontend Setup
1. Navigate to the `frontend` folder.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
   The development server typically runs on port 5173.

## Deployment
- **Frontend:** Can be deployed to services like Netlify, Vercel, or Render with minimal configuration.
- **Backend:** Options include deploying to cloud platforms (e.g., GCP Cloud Run) or hosting on services like Render or Heroku.

## Additional Notes
- **Dark Mode:** The dashboard supports dark mode with user preference stored in localStorage.
- **PDF Generation:** Administrators can select QR codes and download a PDF report which uses third-party libraries to generate QR images.
- **Error Handling:** Both frontend and backend have comprehensive error handling to produce user-friendly messages.

## Project Structure

```
study-gcp/
├── backend/            # Spring Boot backend
│   ├── src/main/java  # Java source files, controllers, services, models, and configuration
│   ├── src/test/java  # Unit tests for the backend
│   ├── build.gradle   # Gradle build file
│   └── ...
├── frontend/           # React frontend built with Vite
│   ├── src/           # React components, API calls, and styles
│   ├── public/        # Static files
│   ├── package.json   # Frontend dependencies and scripts
│   └── ...
└── README.md           # This file
```
