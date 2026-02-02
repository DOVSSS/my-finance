import React from 'react';
import { Chip } from '@mui/material';

const PaymentChip = ({ paid, onClick, clickable = false }) => (
  <Chip
    label={paid ? "Внёс" : "Не внёс"}
    size="small"
    color={paid ? "success" : "default"}
    variant="outlined"
    onClick={clickable ? onClick : undefined}
    sx={{
      height: 20,
      fontSize: '0.7rem',
      minWidth: 60,
      cursor: clickable ? 'pointer' : 'default',
      '&:hover': clickable ? { opacity: 0.8 } : {}
    }}
  />
);

export default PaymentChip;