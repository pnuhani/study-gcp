import { createBrowserRouter } from 'react-router-dom';
import QRDisplay from './components/QRDisplay';
import QREdit from './components/QREdit';
import QRForm from './components/QRForm';
import AdminDashboard from './components/AdminDashboard';
import AdminLogin from './components/AdminLogin';
import ForgetPassword from './components/ForgetPassword';
import AuthLayout from './layouts/AuthLayout';
import Layout from './components/layout';
import LandingPage from './components/LandingPage';


const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
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
        path: "forgot-password/:id",
        element: <ForgetPassword />
      },
      {
        path: "qr/:id/register",
        element: <QRForm />
      },
    ]
  },
  {
    path: "/admin-dashboard",
    element: <AuthLayout />,
    children: [
      {
        index: true,
        element: <AdminDashboard />
      }
    ]
  },
  {
    path: "/admin/login",
    element: <AdminLogin />
  },
  {
    path: "*",
    element: (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-[#3a5a78] mb-4">404</h1>
          <p className="text-gray-600">Page not found</p>
        </div>
      </div>
    )
  }
]);

export default router;
