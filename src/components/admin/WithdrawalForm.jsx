import React from 'react';
import {
  Box,
  Typography,
  Card,
  TextField,
  Button
} from '@mui/material';

const WithdrawalForm = ({ 
  withdrawalAmount, 
  setWithdrawalAmount, 
  withdrawalReason, 
  setWithdrawalReason, 
  onWithdraw 
}) => {
  return (
    <Box sx={{ maxWidth: 500, mx: 'auto' }}>
      <Typography variant="h6" gutterBottom>
        Списание средств из казны
      </Typography>
      
      <Card sx={{ p: 3 }}>
        <TextField
          fullWidth
          label="Сумма списания (₽)"
          type="number"
          value={withdrawalAmount}
          onChange={(e) => setWithdrawalAmount(e.target.value)}
          margin="normal"
          InputProps={{ inputProps: { min: 1 } }}
        />
        
        <TextField
          fullWidth
          label="Причина списания"
          value={withdrawalReason}
          onChange={(e) => setWithdrawalReason(e.target.value)}
          margin="normal"
          required
        />
        
        <Button
          fullWidth
          variant="contained"
          color="error"
          size="large"
          onClick={onWithdraw}
          sx={{ mt: 3 }}
          disabled={!withdrawalAmount || !withdrawalReason}
        >
          Списать средства
        </Button>
      </Card>
    </Box>
  );
};

export default WithdrawalForm;