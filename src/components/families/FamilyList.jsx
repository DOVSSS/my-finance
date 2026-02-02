import React from 'react';
import {
  Paper,
  Box,
  Typography,
  Divider,
  Alert
} from '@mui/material';
import FamilyItem from './FamilyItem';
import { getCurrentMonth } from '../../utils/dateUtils';

const FamilyList = ({ 
  families, 
  expandedFamily, 
  setExpandedFamily, 
  isAdmin, 
  onTogglePayment 
}) => {
  const currentMonth = getCurrentMonth();

  return (
    <Paper elevation={0} sx={{ mb: 2, borderRadius: 2, border: '1px solid #e0e0e0' }}>
      <Box sx={{ p: 1.5 }}>
        <Typography variant="subtitle1" fontWeight="bold">
          Участники • {currentMonth}
        </Typography>
        {isAdmin && (
          <Typography variant="caption" color="text.secondary">
            Нажмите на статус, чтобы изменить
          </Typography>
        )}
      </Box>
      
      <Divider />
      
      {families.length === 0 ? (
        <Alert severity="info" sx={{ m: 1.5, borderRadius: 1 }}>
          Семьи пока не добавлены
        </Alert>
      ) : (
        <Box>
          {families.map((family) => (
            <FamilyItem
              key={family.id}
              family={family}
              isExpanded={expandedFamily === family.id}
              onToggleExpand={() => setExpandedFamily(
                expandedFamily === family.id ? null : family.id
              )}
              isAdmin={isAdmin}
              onTogglePayment={onTogglePayment}
            />
          ))}
        </Box>
      )}
    </Paper>
  );
};

export default FamilyList;