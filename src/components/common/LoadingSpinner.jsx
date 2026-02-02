import React from 'react';
import { Container, CircularProgress, Box } from '@mui/material';

const LoadingSpinner = () => (
  <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
    <CircularProgress />
  </Container>
);

export default LoadingSpinner;