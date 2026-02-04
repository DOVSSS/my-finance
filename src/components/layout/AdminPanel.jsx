import React, { useState } from 'react';
import {
  Paper,
  Tabs,
  Tab,
  Box,
  Button
} from '@mui/material';


import { AdminPanelSettings as AdminIcon } from '@mui/icons-material';
import FamilyManager from '../admin/FamilyManager';
import PaymentManager from '../admin/PaymentManager';
import WithdrawalForm from '../admin/WithdrawalForm';
import TransactionList from '../transactions/TransactionList';

const AdminPanel = ({ 
  families,
  transactions,
  activeTab,
  setActiveTab,
  newFamilyName,
  setNewFamilyName,
  newMemberName,
  setNewMemberName,
  selectedFamily,
  setSelectedFamily,
  withdrawalAmount,
  setWithdrawalAmount,
  withdrawalReason,
  setWithdrawalReason,
  onAddFamily,
  onAddMember,
  onTogglePayment,
  onWithdraw,
  onDeleteFamily, 
  onDeleteMember,
    onResetAllPayments,
}) => {
  return (
    <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
              


      <Box sx={{ mb: 2 }}>
        <Button
          fullWidth
          variant="contained"
          href="#/"
          startIcon={<AdminIcon />}
          size="small"
          sx={{ mb: 2 }}
        >
          На главную
        </Button>

           {onResetAllPayments && (
          <Button
            fullWidth
            variant="outlined"
            color="warning"
            onClick={onResetAllPayments}
            size="small"
            sx={{ mb: 2 }}
          >
            🔄 Сбросить все статусы оплаты
          </Button>
        )}
        
        <Tabs 
          value={activeTab} 
          onChange={(e, newValue) => setActiveTab(newValue)}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="Управление семьями" />
          <Tab label="Отметить взносы" />
          <Tab label="Списать средства" />
          <Tab label="История" />
          
        </Tabs>
      </Box>

      {activeTab === 0 && (
        <FamilyManager
          families={families}
          onAddFamily={onAddFamily}
          onAddMember={onAddMember}
          newFamilyName={newFamilyName}
          setNewFamilyName={setNewFamilyName}
          newMemberName={newMemberName}
          setNewMemberName={setNewMemberName}
          selectedFamily={selectedFamily}
          setSelectedFamily={setSelectedFamily}
           onDeleteFamily={onDeleteFamily} // ПЕРЕДАЙТЕ В FamilyManager
      onDeleteMember={onDeleteMember} 
        />
      )}

      {activeTab === 1 && (
        <PaymentManager
          families={families}
          onTogglePayment={onTogglePayment}
        />
      )}

      {activeTab === 2 && (
        <WithdrawalForm
          withdrawalAmount={withdrawalAmount}
          setWithdrawalAmount={setWithdrawalAmount}
          withdrawalReason={withdrawalReason}
          setWithdrawalReason={setWithdrawalReason}
          onWithdraw={onWithdraw}
        />
      )}

      {activeTab === 3 && (
        <TransactionList transactions={transactions} isAdmin={true} />
      )}



    </Paper>
  );
};

export default AdminPanel;