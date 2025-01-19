import { AppBar, Toolbar, Typography, Container, Box } from '@mui/material';
import { QrCode as QrCodeIcon } from '@mui/icons-material';
import PropTypes from 'prop-types';



export default function Layout({ children, title }) {
  return (
    <Box style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      <AppBar position="static" style={{ backgroundColor: '#3a5a78' }}>
        <Toolbar>
          <QrCodeIcon style={{ marginRight: '10px' }} />
          <Typography variant="h3" component="div" style={{ flexGrow: 1, fontSize: '1.1rem' }}>
            COMPANY NAME
          </Typography>
        </Toolbar>
      </AppBar>
      <Container maxWidth="md" style={{ marginTop: '2rem', marginBottom: '2rem' }}>
        <Typography variant="h4" component="h1" style={{ marginBottom: '1.5rem', color: '#3a5a78', textAlign: 'center', fontSize: '2rem' }}>
          {title}
        </Typography>
        <Box style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          {children}
        </Box>
      </Container>

    </Box>
  );
}

Layout.propTypes = {
  children: PropTypes.node.isRequired,
  title: PropTypes.string.isRequired
};


