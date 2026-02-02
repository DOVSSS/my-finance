import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Chip,
  Badge,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Logout as LogoutIcon,
  Login as LoginIcon,
  AdminPanelSettings as AdminIcon,
  AccountBalanceWallet as WalletIcon,
  CheckCircle as CheckIcon,
  AttachMoney as MoneyIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { getCurrentMonth } from '../../utils/dateUtils';

const Header = ({ balance, paidCount, totalMembers, collectedAmount }) => {
  const { currentUser, isAdmin, logout } = useAuth();
  const currentMonth = getCurrentMonth();
  const remainingCount = totalMembers - paidCount;

  return (
    <Paper 
      elevation={3}
      sx={{ 
        p: { xs: 1, sm: 1.5 },
        mb: 2,
        background: 'linear-gradient(135deg, #1976d2 0%, #2196f3 100%)',
        color: 'white',
        borderRadius: 3,
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: -40,
          right: -40,
          width: 120,
          height: 120,
          background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)',
          borderRadius: '50%'
        }
      }}
    >
      {/* Верхняя часть с логотипом */}
      <Box display="flex" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1.5 }}>
        <Box>
          {/* Логотип ВАШТАРОЙ */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 0.5
          }}>
            <Box sx={{
              width: 28,
              height: 28,
              bgcolor: 'rgba(255,255,255,0.9)',
              borderRadius: 1.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 3px 8px rgba(0,0,0,0.1)'
            }}>
              <WalletIcon sx={{ 
                color: '#1976d2',
                fontSize: 16
              }} />
            </Box>
            <Typography 
              variant="h5" 
              fontWeight="900"
              sx={{ 
                textShadow: '1px 1px 3px rgba(0,0,0,0.2)',
                letterSpacing: '0.5px',
                background: 'linear-gradient(45deg, #ffffff 30%, #e3f2fd 90%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                color: 'transparent',
                fontSize: { xs: '1.25rem', sm: '1.5rem' }
              }}
            >
              ВАШТАРОЙ
            </Typography>
          </Box>
          
          <Typography variant="caption" sx={{ 
            opacity: 0.9,
            display: 'block',
            ml: 0.5,
            fontSize: '0.7rem'
          }}>
            Семейная казна
          </Typography>
        </Box>
        
        {/* Правая часть - пользователь и кнопки */}
        <Box textAlign="right">
          {currentUser ? (
            <Box display="flex" alignItems="center" gap={0.5}>
              {isAdmin && (
                <Tooltip title="Администратор">
                  <Badge 
                    color="secondary" 
                    variant="dot"
                  >
                    <Chip 
                      icon={<AdminIcon />}
                      label=""
                      size="small"
                      sx={{ 
                        bgcolor: 'rgba(255,255,255,0.2)', 
                        color: 'white',
                        minWidth: 32,
                        height: 28,
                        '& .MuiChip-icon': {
                          color: '#ffeb3b',
                          fontSize: 14,
                          ml: 0.5
                        }
                      }}
                    />
                  </Badge>
                </Tooltip>
              )}
              <Tooltip title="Выйти из системы">
                <IconButton
                  onClick={logout}
                  size="small"
                  sx={{ 
                    color: 'white', 
                    bgcolor: 'rgba(255,255,255,0.15)',
                    width: 28,
                    height: 28,
                    '&:hover': {
                      bgcolor: 'rgba(255,255,255,0.25)'
                    }
                  }}
                >
                  <LogoutIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          ) : (
            <Tooltip title="Войти как администратор">
              <Button
                variant="contained"
                onClick={() => window.location.hash = '#/admin'}
                size="small"
                sx={{ 
                  bgcolor: 'rgba(255,255,255,0.9)',
                  color: '#1976d2',
                  fontWeight: 'bold',
                  fontSize: '0.75rem',
                  px: 1,
                  py: 0.25,
                  minWidth: 'auto',
                  '&:hover': {
                    bgcolor: 'white'
                  }
                }}
              >
                Войти
              </Button>
            </Tooltip>
          )}
        </Box>
      </Box>
      
      {/* Основной баланс */}
      <Box sx={{ 
        mb: 1.5,
        p: 1.5,
        bgcolor: 'rgba(255,255,255,0.1)',
        borderRadius: 2,
        backdropFilter: 'blur(8px)',
        border: '1px solid rgba(255,255,255,0.2)'
      }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography variant="caption" sx={{ opacity: 0.8, fontSize: '0.7rem' }}>
              Баланс • {currentMonth}
            </Typography>
            <Typography variant="h4" fontWeight="800" sx={{ mt: 0.25, fontSize: { xs: '1.5rem', sm: '2rem' } }}>
              {balance.toLocaleString('ru-RU')} ₽
            </Typography>
          </Box>
          <Box sx={{
            width: 48,
            height: 48,
            bgcolor: 'rgba(255,255,255,0.9)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 3px 15px rgba(0,0,0,0.15)'
          }}>
            <MoneyIcon sx={{ 
              color: '#4caf50',
              fontSize: 24
            }} />
          </Box>
        </Box>
      </Box>
      
      {/* Статистика в одном ряду */}
      <Box sx={{ 
        display: 'flex',
        justifyContent: 'space-between',
        gap: 0.75
      }}>
        {/* Внесли */}
        <Box sx={{
          flex: 1,
          p: 1,
          bgcolor: 'rgba(76, 175, 80, 0.2)',
          borderRadius: 1.5,
          textAlign: 'center',
          border: '1px solid rgba(76, 175, 80, 0.3)',
          minWidth: 0
        }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            gap: 0.5,
            mb: 0.25
          }}>
            <CheckIcon sx={{ fontSize: 14, opacity: 0.9 }} />
            <Typography variant="caption" fontWeight="medium" sx={{ fontSize: '0.65rem' }}>
              Внесли
            </Typography>
          </Box>
          <Typography variant="h6" fontWeight="bold" sx={{ fontSize: '1rem' }}>
            {paidCount}
            <Typography 
              component="span" 
              variant="caption" 
              sx={{ opacity: 0.7, ml: 0.25, fontSize: '0.7rem' }}
            >
              /{totalMembers}
            </Typography>
          </Typography>
        </Box>
        
        {/* Собрано */}
        <Box sx={{
          flex: 1,
          p: 1,
          bgcolor: 'rgba(255, 193, 7, 0.2)',
          borderRadius: 1.5,
          textAlign: 'center',
          border: '1px solid rgba(255, 193, 7, 0.3)',
          minWidth: 0
        }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            gap: 0.5,
            mb: 0.25
          }}>
            <MoneyIcon sx={{ fontSize: 14, opacity: 0.9 }} />
            <Typography variant="caption" fontWeight="medium" sx={{ fontSize: '0.65rem' }}>
              Собрано
            </Typography>
          </Box>
          <Typography variant="h6" fontWeight="bold" sx={{ fontSize: '1rem' }}>
            {collectedAmount > 999 ? `${Math.round(collectedAmount/1000)}к` : collectedAmount} ₽
          </Typography>
        </Box>
        
        {/* Осталось */}
        <Box sx={{
          flex: 1,
          p: 1,
          bgcolor: 'rgba(244, 67, 54, 0.2)',
          borderRadius: 1.5,
          textAlign: 'center',
          border: '1px solid rgba(244, 67, 54, 0.3)',
          minWidth: 0
        }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            gap: 0.5,
            mb: 0.25
          }}>
            <CancelIcon sx={{ fontSize: 14, opacity: 0.9 }} />
            <Typography variant="caption" fontWeight="medium" sx={{ fontSize: '0.65rem' }}>
              Осталось
            </Typography>
          </Box>
          <Typography variant="h6" fontWeight="bold" sx={{ fontSize: '1rem' }}>
            {remainingCount}
          </Typography>
        </Box>
      </Box>
      
      {/* Прогресс бар - компактный */}
      <Box sx={{ mt: 1 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 0.25 }}>
          <Typography variant="caption" sx={{ opacity: 0.8, fontSize: '0.65rem' }}>
            Прогресс
          </Typography>
          <Typography variant="caption" fontWeight="bold" sx={{ fontSize: '0.65rem' }}>
            {totalMembers > 0 ? Math.round((paidCount / totalMembers) * 100) : 0}%
          </Typography>
        </Box>
        <Box sx={{
          height: 4,
          bgcolor: 'rgba(255,255,255,0.1)',
          borderRadius: 2,
          overflow: 'hidden'
        }}>
          <Box sx={{
            height: '100%',
            width: `${totalMembers > 0 ? (paidCount / totalMembers) * 100 : 0}%`,
            background: 'linear-gradient(90deg, #4caf50 0%, #8bc34a 100%)',
            borderRadius: 2,
            transition: 'width 0.5s ease'
          }} />
        </Box>
      </Box>
    </Paper>
  );
};

export default Header;