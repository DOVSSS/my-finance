import React from 'react';
import {
  Paper,
  Box,
  Typography,
  Divider,
  Alert,
  List
} from '@mui/material';
import TransactionItem from './TransactionItem';

const TransactionList = ({ transactions, isAdmin }) => {
  // Фильтруем транзакции
  const filteredTransactions = isAdmin 
    ? transactions.filter(t => t.type === 'withdrawal' || t.type === 'deposit')
    : transactions.filter(t => t.type === 'withdrawal');

  return (
    <Paper elevation={0} sx={{ borderRadius: 2, border: '1px solid #e0e0e0' }}>
      <Box sx={{ p: 1.5 }}>
        <Typography variant="subtitle1" fontWeight="bold">
          История {isAdmin ? 'операций' : 'расходов'}
        </Typography>
      </Box>
      
      <Divider />
      
      {filteredTransactions.length === 0 ? (
        <Alert severity="info" sx={{ m: 1.5, borderRadius: 1 }}>
          {isAdmin ? 'Операций пока нет' : 'Расходов пока нет'}
        </Alert>
      ) : (
        <List disablePadding>
          {filteredTransactions.map((transaction) => (
            <TransactionItem key={transaction.id} transaction={transaction} />
          ))}
        </List>
      )}
      
     
    </Paper>
  );
};

export default TransactionList;