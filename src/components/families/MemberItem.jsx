import React from 'react';
import { Box, Typography, ListItem } from '@mui/material';
import { Person as PersonIcon } from '@mui/icons-material';
import PaymentChip from '../common/PaymentChip';

const MemberItem = ({ member, familyId, index, isAdmin, onTogglePayment }) => {
  return (
    <ListItem 
      disablePadding
      sx={{ 
        py: 1,
        borderBottom: '1px solid #f0f0f0'
      }}
    >
      <Box display="flex" alignItems="center" gap={1} sx={{ width: '100%' }}>
        <PersonIcon 
          fontSize="small" 
          sx={{ 
            color: member.paid ? '#4caf50' : '#9e9e9e',
            fontSize: '1rem'
          }} 
        />
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="body2">
            {member.name}
          </Typography>
        </Box>
        <PaymentChip
          paid={member.paid}
          onClick={() => onTogglePayment(familyId, index, member)}
          clickable={isAdmin}
        />
      </Box>
    </ListItem>
  );
};

export default MemberItem;