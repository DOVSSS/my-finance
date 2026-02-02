import React from 'react';
import { Box, Typography } from '@mui/material';
import { formatDate } from '../../utils/dateUtils';

const TransactionItem = ({ transaction }) => {
  return (
    <Box 
      sx={{ 
        p: 1.5,
        borderBottom: '1px solid #f0f0f0',
        '&:last-child': { borderBottom: 'none' }
      }}
    >
      <Box display="flex" justifyContent="space-between" alignItems="flex-start">
        <Box sx={{ flexGrow: 1, mr: 1 }}>
          <Typography variant="body2" fontWeight="medium">
            {transaction.type === 'deposit' 
              ? `Взнос от ${transaction.memberName}`
              : transaction.reason || 'Расход'}
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block">
            {formatDate(transaction.date)}
          </Typography>
          {transaction.description && (
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
              {transaction.description}
            </Typography>
          )}
        </Box>
        <Typography
          variant="body1"
          fontWeight="bold"
          color={transaction.type === 'deposit' ? "success.main" : "error.main"}
        >
          {transaction.type === 'deposit' ? '+' : '-'}
          {transaction.amount.toLocaleString('ru-RU')} ₽
        </Typography>
      </Box>
    </Box>
  );
};

export default TransactionItem;