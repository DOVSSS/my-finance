import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Chip
} from '@mui/material';
import { Logout as LogoutIcon } from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { getCurrentMonth } from '../../utils/dateUtils';

const Header = ({ balance, paidCount, totalMembers, collectedAmount }) => {
  const { currentUser, isAdmin, logout } = useAuth();
  const currentMonth = getCurrentMonth();

  return (
    <Paper 
      elevation={1} 
      sx={{ 
        p: 2, 
        mb: 2, 
        bgcolor: 'primary.main', 
        color: 'white',
        borderRadius: 2
      }}
    >
      <Box display="flex" justifyContent="space-between" alignItems="flex-start">
        <Box>
          <Typography variant="h6" fontWeight="bold">
            Семейная казна
          </Typography>
          <Typography variant="h5" fontWeight="bold" sx={{ mt: 0.5 }}>
            {balance.toLocaleString('ru-RU')} ₽
          </Typography>
          <Typography variant="caption">
            Текущий баланс • {currentMonth}
          </Typography>
        </Box>
        
        <Box textAlign="right">
          {currentUser ? (
            <Box>
              {isAdmin && (
                <Chip 
                  label="Админ" 
                  size="small"
                  sx={{ 
                    bgcolor: 'rgba(255,255,255,0.2)', 
                    color: 'white',
                    mb: 0.5,
                    fontSize: '0.7rem'
                  }}
                />
              )}
              <Button
                variant="text"
                onClick={logout}
                size="small"
                sx={{ 
                  color: 'white', 
                  p: 0.5,
                  minWidth: 'auto'
                }}
              >
                Выйти
              </Button>
            </Box>
          ) : (
            <Button
              variant="text"
              onClick={() => window.location.hash = '#/admin'}
              size="small"
              sx={{ 
                color: 'white', 
                p: 0.5,
                minWidth: 'auto'
              }}
            >
              Войти
            </Button>
          )}
        </Box>
      </Box>
      
      {/* Краткая статистика */}
      <Box sx={{ 
        mt: 1.5, 
        pt: 1, 
        borderTop: '1px solid rgba(255,255,255,0.2)',
        display: 'flex',
        justifyContent: 'space-between'
      }}>
        <Box textAlign="center">
          <Typography variant="body2">
            Внесли
          </Typography>
          <Typography variant="h6" fontWeight="bold">
            {paidCount}
          </Typography>
        </Box>
        <Box textAlign="center">
          <Typography variant="body2">
            Всего
          </Typography>
          <Typography variant="h6" fontWeight="bold">
            {totalMembers}
          </Typography>
        </Box>
        <Box textAlign="center">
          <Typography variant="body2">
            Собрано
          </Typography>
          <Typography variant="h6" fontWeight="bold">
            {collectedAmount.toLocaleString('ru-RU')} ₽
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
};

export default Header;