import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  List,
  ListItem,
  IconButton
} from '@mui/material';
import {
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  Person as PersonIcon
} from '@mui/icons-material';

const PaymentManager = ({ families, onTogglePayment }) => {
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Отметить ежемесячные взносы
      </Typography>
      
      <Grid container spacing={2}>
        {families.map((family) => (
          <Grid item xs={12} key={family.id}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom color="primary">
                  {family.name}
                </Typography>
                <List>
                  {family.members?.map((member, index) => (
                    <ListItem
                      key={index}
                      secondaryAction={
                        <IconButton
                          onClick={() => onTogglePayment(family.id, index, member)}
                          color={member.paid ? "success" : "default"}
                          size="small"
                        >
                          {member.paid ? <CheckIcon /> : <CancelIcon />}
                        </IconButton>
                      }
                    >
                      <Box display="flex" alignItems="center" gap={2}>
                        <PersonIcon color={member.paid ? "success" : "action"} />
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography variant="body1">{member.name}</Typography>
                          <Typography
                            variant="body2"
                            color={member.paid ? "success.main" : "error.main"}
                          >
                            {member.paid ? '✅ Внёс 1000 ₽' : '❌ Не внёс взнос'}
                          </Typography>
                        </Box>
                      </Box>
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default PaymentManager;