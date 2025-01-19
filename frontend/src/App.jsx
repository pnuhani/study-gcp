import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import QRDisplay from './components/QRDisplay';
import QREdit from './components/QREdit';
import QRForm from './components/QRForm';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/qr/:id" element={<QRDisplay />} />
        <Route path="/qr/:id/edit" element={<QREdit />} />
        <Route path="/qr/:id/register" element={<QRForm />} />
        <Route 
          path="*" 
          element={
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
              <div className="text-center">
                <h1 className="text-4xl font-bold text-[#3a5a78] mb-4">404</h1>
                <p className="text-gray-600">Page not found</p>
              </div>
            </div>
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;