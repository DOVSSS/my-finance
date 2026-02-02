import React from 'react';
import { Box } from '@mui/material';

const AnimatedBox = ({ children, delay = 0, ...props }) => {
  return (
    <Box
      {...props}
      sx={{
        animation: `fadeIn 0.5s ease ${delay}s both`,
        ...props.sx
      }}
    >
      {children}
    </Box>
  );
};

export default AnimatedBox;