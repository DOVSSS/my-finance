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
  Groups as GroupsIcon,
  MonetizationOn as MonetizationOnIcon // ПРАВИЛЬНОЕ ИМЯ
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { getCurrentMonth } from '../../utils/dateUtils';

const Header = ({ balance, paidCount, totalMembers, collectedAmount }) => {
  const { currentUser, isAdmin, logout } = useAuth();
  const currentMonth = getCurrentMonth();

  return (
    <Paper 
      elevation={3}
      sx={{ 
        p: { xs: 1.5, sm: 2 },
        mb: 2,
        background: 'linear-gradient(135deg, #1976d2 0%, #2196f3 100%)',
        color: 'white',
        borderRadius: 3,
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: -50,
          right: -50,
          width: 150,
          height: 150,
          background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)',
          borderRadius: '50%'
        }
      }}
    >
      {/* Верхняя часть с логотипом */}
      <Box display="flex" justifyContent="space-between" alignItems="flex-start">
        <Box>
          {/* Логотип ВАШТАРОЙ */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1,
            mb: 0.5
          }}>
            <Box sx={{
              width: 32,
              height: 32,
              bgcolor: 'rgba(255,255,255,0.9)',
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }}>
              <WalletIcon sx={{ 
                color: '#1976d2',
                fontSize: 20
              }} />
            </Box>
            <Typography 
              variant="h4" 
              fontWeight="900"
              sx={{ 
                textShadow: '2px 2px 4px rgba(0,0,0,0.2)',
                letterSpacing: '1px',
                background: 'linear-gradient(45deg, #ffffff 30%, #e3f2fd 90%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                color: 'transparent'
              }}
            >
              ВАШТАРОЙ
            </Typography>
          </Box>
          
          <Typography variant="caption" sx={{ 
            opacity: 0.9,
            display: 'block',
            ml: 1
          }}>
            Семейная финансовая система
          </Typography>
        </Box>
        
        {/* Правая часть - пользователь и кнопки */}
        <Box textAlign="right" sx={{ minWidth: 100 }}>
          {currentUser ? (
            <Box>
              {isAdmin && (
                <Tooltip title="Администратор">
                  <Badge 
                    color="secondary" 
                    variant="dot"
                    sx={{ mb: 0.5 }}
                  >
                    <Chip 
                      icon={<AdminIcon />}
                      label="Админ"
                      size="small"
                      sx={{ 
                        bgcolor: 'rgba(255,255,255,0.2)', 
                        color: 'white',
                        fontSize: '0.7rem',
                        '& .MuiChip-icon': {
                          color: '#ffeb3b',
                          fontSize: 16
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
                startIcon={<LoginIcon />}
                sx={{ 
                  bgcolor: 'rgba(255,255,255,0.9)',
                  color: '#1976d2',
                  fontWeight: 'bold',
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
        mt: 2,
        p: 2,
        bgcolor: 'rgba(255,255,255,0.1)',
        borderRadius: 2,
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255,255,255,0.2)'
      }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography variant="caption" sx={{ opacity: 0.8 }}>
              Общий баланс • {currentMonth}
            </Typography>
            <Typography variant="h3" fontWeight="800" sx={{ mt: 0.5 }}>
              {balance.toLocaleString('ru-RU')} ₽
            </Typography>
          </Box>
          <Box sx={{
            width: 60,
            height: 60,
            bgcolor: 'rgba(255,255,255,0.9)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
          }}>
            <MonetizationOnIcon sx={{ 
              color: '#4caf50',
              fontSize: 32
            }} />
          </Box>
        </Box>
      </Box>
      
      {/* Статистика */}
      <Box sx={{ 
        mt: 2,
        display: 'grid',
        gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)' },
        gap: 1.5
      }}>
        {/* Внесли */}
        <Box sx={{
          p: 1.5,
          bgcolor: 'rgba(76, 175, 80, 0.2)',
          borderRadius: 2,
          textAlign: 'center',
          border: '1px solid rgba(76, 175, 80, 0.3)'
        }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            gap: 1,
            mb: 0.5
          }}>
            <GroupsIcon sx={{ fontSize: 18, opacity: 0.9 }} />
            <Typography variant="caption" fontWeight="medium">
              Внесли
            </Typography>
          </Box>
          <Typography variant="h6" fontWeight="bold">
            {paidCount}
            <Typography 
              component="span" 
              variant="caption" 
              sx={{ opacity: 0.7, ml: 0.5 }}
            >
              / {totalMembers}
            </Typography>
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.8, display: 'block', mt: 0.5 }}>
            участников
          </Typography>
        </Box>
        
        {/* Собрано */}
        <Box sx={{
          p: 1.5,
          bgcolor: 'rgba(255, 193, 7, 0.2)',
          borderRadius: 2,
          textAlign: 'center',
          border: '1px solid rgba(255, 193, 7, 0.3)'
        }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            gap: 1,
            mb: 0.5
          }}>
            <MonetizationOnIcon sx={{ fontSize: 18, opacity: 0.9 }} />
            <Typography variant="caption" fontWeight="medium">
              Собрано
            </Typography>
          </Box>
          <Typography variant="h6" fontWeight="bold">
            {collectedAmount.toLocaleString('ru-RU')} ₽
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.8, display: 'block', mt: 0.5 }}>
            за месяц
          </Typography>
        </Box>
        
        {/* Осталось */}
        <Box sx={{
          p: 1.5,
          bgcolor: 'rgba(244, 67, 54, 0.2)',
          borderRadius: 2,
          textAlign: 'center',
          border: '1px solid rgba(244, 67, 54, 0.3)'
        }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            gap: 1,
            mb: 0.5
          }}>
            <GroupsIcon sx={{ fontSize: 18, opacity: 0.9 }} />
            <Typography variant="caption" fontWeight="medium">
              Осталось
            </Typography>
          </Box>
          <Typography variant="h6" fontWeight="bold">
            {totalMembers - paidCount}
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.8, display: 'block', mt: 0.5 }}>
            внести
          </Typography>
        </Box>
      </Box>
      
      {/* Прогресс бар */}
      <Box sx={{ mt: 2 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
          <Typography variant="caption" sx={{ opacity: 0.8 }}>
            Прогресс сбора
          </Typography>
          <Typography variant="caption" fontWeight="bold">
            {totalMembers > 0 ? Math.round((paidCount / totalMembers) * 100) : 0}%
          </Typography>
        </Box>
        <Box sx={{
          height: 6,
          bgcolor: 'rgba(255,255,255,0.1)',
          borderRadius: 3,
          overflow: 'hidden'
        }}>
          <Box sx={{
            height: '100%',
            width: `${totalMembers > 0 ? (paidCount / totalMembers) * 100 : 0}%`,
            background: 'linear-gradient(90deg, #4caf50 0%, #8bc34a 100%)',
            borderRadius: 3,
            transition: 'width 0.5s ease'
          }} />
        </Box>
      </Box>
    </Paper>
  );
};

export default Header;