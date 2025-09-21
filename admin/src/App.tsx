import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ApolloProvider } from '@apollo/client';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Box } from '@mui/material';

import { store } from './store';
import { apolloClient } from './graphql/client';
import AppRoutes from './routes/AppRoutes';
import Sidebar from './components/Layout/Sidebar';
import Header from './components/Layout/Header';
import { AuthProvider } from './contexts/AuthContext';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});

function App() {
  return (
    <Provider store={store}>
      <ApolloProvider client={apolloClient}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Router>
            <AuthProvider>
              <Box sx={{ display: 'flex' }}>
                <Sidebar />
                <Box component="main" sx={{ flexGrow: 1 }}>
                  <Header />
                  <Box sx={{ p: 3 }}>
                    <AppRoutes />
                  </Box>
                </Box>
              </Box>
            </AuthProvider>
          </Router>
        </ThemeProvider>
      </ApolloProvider>
    </Provider>
  );
}

export default App;
