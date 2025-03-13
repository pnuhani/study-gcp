import { AppBar, Toolbar, Typography, Container, Box } from '@mui/material';
import { QrCode as QrCodeIcon } from '@mui/icons-material';
import PropTypes from 'prop-types';



export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* {title && (
        <header className="bg-white shadow-sm py-4">
          <div className="container mx-auto px-4">
            <h1 className="text-xl font-semibold text-gray-800">{title}</h1>
          </div>
        </header>
      )} */}
      <main className="flex-1 flex items-center justify-center">
        <div className="w-full">{children}</div>
      </main>
    </div>
  )
}

Layout.propTypes = {
  children: PropTypes.node.isRequired,
  // title: PropTypes.string.isRequired
};


