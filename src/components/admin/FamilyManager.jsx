import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Box,
  MenuItem
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';

const FamilyManager = ({ 
  families, 
  onAddFamily, 
  onAddMember, 
  newFamilyName, 
  setNewFamilyName,
  newMemberName,
  setNewMemberName,
  selectedFamily,
  setSelectedFamily 
}) => {
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

      <Card>
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
                {family.name}
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
    </>
  );
};

export default FamilyManager;