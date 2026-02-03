import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Box,
  MenuItem,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  Groups as GroupsIcon
} from '@mui/icons-material';

const FamilyManager = ({ 
  families, 
  onAddFamily, 
  onAddMember, 
  onDeleteFamily,
  onDeleteMember,
  newFamilyName, 
  setNewFamilyName,
  newMemberName,
  setNewMemberName,
  selectedFamily,
  setSelectedFamily 
}) => {
  const [deleteDialog, setDeleteDialog] = useState({ open: false, type: '', data: null });
  
  const handleDeleteFamily = (familyId, familyName) => {
    setDeleteDialog({
      open: true,
      type: 'family',
      data: { id: familyId, name: familyName }
    });
  };
  
  const handleDeleteMember = (familyId, memberIndex, memberName) => {
    setDeleteDialog({
      open: true,
      type: 'member',
      data: { familyId, memberIndex, name: memberName }
    });
  };
  
  const confirmDelete = () => {
    if (deleteDialog.type === 'family') {
      onDeleteFamily(deleteDialog.data.id);
    } else if (deleteDialog.type === 'member') {
      onDeleteMember(deleteDialog.data.familyId, deleteDialog.data.memberIndex);
    }
    setDeleteDialog({ open: false, type: '', data: null });
  };
  
  const selectedFamilyData = families.find(f => f.id === selectedFamily);

  return (
    <>
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Добавить семью
          </Typography>
          <Box display="flex" gap={1}>
            <TextField
              fullWidth
              label="Название семьи"
              value={newFamilyName}
              onChange={(e) => setNewFamilyName(e.target.value)}
              size="small"
            />
            <Button
              variant="contained"
              onClick={onAddFamily}
              startIcon={<AddIcon />}
            >
              Добавить
            </Button>
          </Box>
        </CardContent>
      </Card>

      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Добавить участника
          </Typography>
          <TextField
            fullWidth
            select
            label="Выберите семью"
            value={selectedFamily}
            onChange={(e) => setSelectedFamily(e.target.value)}
            size="small"
            sx={{ mb: 2 }}
          >
            <MenuItem value="">Выберите семью</MenuItem>
            {families.map((family) => (
              <MenuItem key={family.id} value={family.id}>
                {family.name} ({family.members?.length || 0} участ.)
              </MenuItem>
            ))}
          </TextField>
          <Box display="flex" gap={1}>
            <TextField
              fullWidth
              label="Имя участника"
              value={newMemberName}
              onChange={(e) => setNewMemberName(e.target.value)}
              size="small"
            />
            <Button
              variant="contained"
              onClick={onAddMember}
              startIcon={<AddIcon />}
              disabled={!selectedFamily}
            >
              Добавить
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Список семей с возможностью удаления */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Управление семьями и участниками
          </Typography>
          
          {families.length === 0 ? (
            <Alert severity="info">
              Семьи пока не добавлены
            </Alert>
          ) : (
            <List>
              {families.map((family) => (
                <React.Fragment key={family.id}>
                  <ListItem
                    sx={{
                      bgcolor: 'grey.50',
                      borderRadius: 1,
                      mb: 1,
                      border: '1px solid',
                      borderColor: 'grey.200'
                    }}
                  >
                    <Box display="flex" alignItems="center" gap={1}>
                      <GroupsIcon color="primary" />
                      <ListItemText
                        primary={family.name}
                        secondary={`${family.members?.length || 0} участников`}
                      />
                    </Box>
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        onClick={() => handleDeleteFamily(family.id, family.name)}
                        color="error"
                        size="small"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                  
                  {/* Список участников семьи */}
                  {family.members && family.members.length > 0 && (
                    <List disablePadding sx={{ pl: 3 }}>
                      {family.members.map((member, index) => (
                        <ListItem
                          key={index}
                          dense
                          secondaryAction={
                            <IconButton
                              edge="end"
                              onClick={() => handleDeleteMember(family.id, index, member.name)}
                              color="error"
                              size="small"
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          }
                        >
                          <Box display="flex" alignItems="center" gap={1}>
                            <PersonIcon fontSize="small" color="action" />
                            <ListItemText
                              primary={member.name}
                              secondary={
                                <Box component="span" sx={{ 
                                  color: member.paid ? 'success.main' : 'error.main',
                                  fontSize: '0.75rem'
                                }}>
                                  {member.paid ? '✅ Внёс взнос' : '❌ Не внёс'}
                                </Box>
                              }
                            />
                          </Box>
                        </ListItem>
                      ))}
                    </List>
                  )}
                </React.Fragment>
              ))}
            </List>
          )}
        </CardContent>
      </Card>

      {/* Диалог подтверждения удаления */}
      <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, type: '', data: null })}>
        <DialogTitle>
          Подтверждение удаления
        </DialogTitle>
        <DialogContent>
          {deleteDialog.type === 'family' ? (
            <Alert severity="error">
              Вы уверены, что хотите удалить семью <strong>"{deleteDialog.data?.name}"</strong> 
              и всех её участников? Это действие нельзя отменить.
            </Alert>
          ) : deleteDialog.type === 'member' ? (
            <Alert severity="warning">
              Вы уверены, что хотите удалить участника <strong>"{deleteDialog.data?.name}"</strong>? 
              Все его платежи также будут удалены.
            </Alert>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, type: '', data: null })}>
            Отмена
          </Button>
          <Button 
            onClick={confirmDelete} 
            color="error" 
            variant="contained"
          >
            Удалить
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default FamilyManager;