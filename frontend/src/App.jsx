import { RouterProvider, createBrowserRouter, Outlet } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import QRDisplay from './components/QRDisplay';
import QREdit from './components/QREdit';
import QRForm from './components/QRForm';
import AdminDashboard from './components/AdminDashboard';
import AdminLogin from './components/AdminLogin';
import ForgetPassword from './components/ForgetPassword';
import Layout from './components/layout';
import LandingPage from './components/LandingPage';
import SuperadminDashboard from './components/SuperadminDashboard';
import AdminList from './components/AdminList';
import AdminCreate from './components/AdminCreate';
import ThemeWrapper from './components/ThemeWrapper';
import RegistrationSuccess from './components/RegistrationSuccess';
import ProtectedRoute from './components/ProtectedRoute';
import QrSignIn from './components/QrSignIn';
import QrSignInSuccess from './components/QrSignInSuccess';

const router = createBrowserRouter([
  {
    path: "/",
    element: <ThemeWrapper><Layout /></ThemeWrapper>,
    children: [
      {
        index: true,
        element: <LandingPage />
      },
      {
        path: "qr/:id",
        element: <QRDisplay />
      },
      {
        path: "qr/:id/edit",
        element: <QREdit />
      },
      {
        path: "verify-identity/:id",
        element: <ForgetPassword />
      },
      {
        path: "qr/:id/register",
        element: <QRForm />
      },
      {
        path: "qr/:id/success",
        element: <RegistrationSuccess />
      },
      {
        path: "qr-signin",
        element: <QrSignIn />
      },
      {
        path: "qr-signin/success",
        element: <QrSignInSuccess />
      },
    ]
  },
  {
    path: "/admin/login",
    element: <ThemeWrapper><AdminLogin /></ThemeWrapper>
  },
  {
    path: "/admin-dashboard",
    element: (
      <ThemeWrapper>
        <ProtectedRoute>
          <AdminDashboard />
        </ProtectedRoute>
      </ThemeWrapper>
    )
  },
  {
    path: "/superadmin-dashboard",
    element: (
      <ThemeWrapper>
        <ProtectedRoute requireRole="SUPERADMIN">
          <Outlet />
        </ProtectedRoute>
      </ThemeWrapper>
    ),
    children: [
      {
        index: true,
        element: <SuperadminDashboard />
      },
      {
        path: "admins",
        element: <AdminList />
      },
      {
        path: "admins/create",
        element: <AdminCreate />
      },
      {
        path: "admin-dashboard",
        element: <AdminDashboard />
      }
    ]
  },
  {
    path: "*",
    element: <ThemeWrapper>
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-[#3a5a78] mb-4">404</h1>
          <p className="text-gray-600">Page not found</p>
        </div>
      </div>
    </ThemeWrapper>
  }
]);

function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}

export default App;
