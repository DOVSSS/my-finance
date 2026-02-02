import React from 'react';
import {
  Box,
  Typography,
  Chip,
  Collapse,
  List
} from '@mui/material';
import { ExpandMore as ExpandMoreIcon, ExpandLess as ExpandLessIcon } from '@mui/icons-material';
import MemberItem from './MemberItem';

const FamilyItem = ({ 
  family, 
  isExpanded, 
  onToggleExpand, 
  isAdmin, 
  onTogglePayment 
}) => {
  const familyPaidCount = family.members?.filter(m => m.paid).length || 0;
  const familyTotal = family.members?.length || 0;

  return (
    <Box sx={{ borderBottom: '1px solid #f0f0f0' }}>
      <Box 
        sx={{ 
          p: 1.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          '&:hover': { bgcolor: '#f9f9f9' }
        }}
        onClick={onToggleExpand}
      >
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="body1" fontWeight="medium">
            {family.name}
          </Typography>
          <Box display="flex" alignItems="center" gap={1} sx={{ mt: 0.5 }}>
            <Chip 
              label={`${familyPaidCount}/${familyTotal}`}
              size="small"
              color={familyPaidCount === familyTotal ? "success" : "default"}
              sx={{ height: 20, fontSize: '0.75rem' }}
            />
            <Typography variant="caption" color="text.secondary">
              {familyPaidCount === familyTotal ? 'Все внесли' : 
               familyPaidCount > 0 ? 'Часть внесла' : 'Не внесли'}
            </Typography>
          </Box>
        </Box>
        {isExpanded ? 
          <ExpandLessIcon fontSize="small" /> : 
          <ExpandMoreIcon fontSize="small" />
        }
      </Box>
      
      <Collapse in={isExpanded}>
        <Box sx={{ p: 1, pl: 2, bgcolor: '#fafafa' }}>
          <List disablePadding dense>
            {family.members?.map((member, index) => (
              <MemberItem
                key={index}
                member={member}
                familyId={family.id}
                index={index}
                isAdmin={isAdmin}
                onTogglePayment={onTogglePayment}
              />
            ))}
          </List>
        </Box>
      </Collapse>
    </Box>
  );
};

export default FamilyItem;