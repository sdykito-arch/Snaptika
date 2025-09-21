import React from 'react';
import { Outlet } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  AppBar,
  Toolbar,
  Button,
  IconButton,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { Home, Instagram, GitHub } from '@mui/icons-material';
import { Link } from 'react-router-dom';

const AuthLayout: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header */}
      <AppBar 
        position="static" 
        elevation={0}
        sx={{ 
          backgroundColor: 'transparent',
          backdropFilter: 'blur(10px)',
        }}
      >
        <Toolbar>
          <IconButton
            component={Link}
            to="/"
            edge="start"
            color="inherit"
            sx={{ mr: 2 }}
          >
            <Home />
          </IconButton>
          
          <Typography 
            variant="h6" 
            component="div" 
            sx={{ 
              flexGrow: 1,
              fontWeight: 'bold',
              background: 'linear-gradient(45deg, #f09433, #e6683c, #dc2743)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              color: 'transparent',
            }}
          >
            Snaptika
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button 
              color="inherit" 
              component={Link} 
              to="/auth/login"
              sx={{ color: 'white' }}
            >
              Login
            </Button>
            <Button 
              variant="outlined" 
              component={Link} 
              to="/auth/register"
              sx={{ 
                color: 'white',
                borderColor: 'white',
                '&:hover': {
                  borderColor: 'white',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                }
              }}
            >
              Sign Up
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Container 
        maxWidth="lg" 
        sx={{ 
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          py: 4
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            alignItems: 'center',
            gap: 4,
            width: '100%',
            maxWidth: 900,
          }}
        >
          {/* Left Side - Branding */}
          {!isMobile && (
            <Box sx={{ flex: 1, textAlign: 'center' }}>
              <Instagram sx={{ fontSize: 120, color: 'white', mb: 2 }} />
              <Typography 
                variant="h3" 
                component="h1" 
                sx={{ 
                  color: 'white',
                  fontWeight: 'bold',
                  mb: 2,
                  textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
                }}
              >
                Welcome to Snaptika
              </Typography>
              <Typography 
                variant="h6" 
                sx={{ 
                  color: 'rgba(255, 255, 255, 0.9)',
                  mb: 3,
                  textShadow: '1px 1px 2px rgba(0,0,0,0.3)'
                }}
              >
                Share your moments, connect with friends, and earn from your creativity
              </Typography>
              
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold' }}>
                    1M+
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                    Active Users
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold' }}>
                    10M+
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                    Photos Shared
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold' }}>
                    $500K+
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                    Creator Earnings
                  </Typography>
                </Box>
              </Box>
            </Box>
          )}
          
          {/* Right Side - Auth Form */}
          <Box sx={{ flex: 1, width: '100%', maxWidth: 400 }}>
            <Outlet />
          </Box>
        </Box>
      </Container>

      {/* Footer */}
      <Box 
        sx={{ 
          backgroundColor: 'rgba(0, 0, 0, 0.2)',
          backdropFilter: 'blur(10px)',
          py: 2
        }}
      >
        <Container maxWidth="lg">
          <Box 
            sx={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              alignItems: 'center',
              flexDirection: isMobile ? 'column' : 'row',
              gap: 2
            }}
          >
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
              © 2025 Snaptika. All rights reserved.
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              <IconButton 
                size="small" 
                sx={{ color: 'rgba(255, 255, 255, 0.8)' }}
                href="https://github.com"
                target="_blank"
              >
                <GitHub />
              </IconButton>
              <IconButton 
                size="small" 
                sx={{ color: 'rgba(255, 255, 255, 0.8)' }}
                href="https://instagram.com"
                target="_blank"
              >
                <Instagram />
              </IconButton>
            </Box>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default AuthLayout;
