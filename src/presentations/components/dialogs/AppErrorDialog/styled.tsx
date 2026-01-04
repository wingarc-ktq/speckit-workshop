import type React from 'react';

import MuiDialogActions, {
  type DialogActionsProps,
} from '@mui/material/DialogActions';
import MuiDialogContent, {
  type DialogContentProps,
} from '@mui/material/DialogContent';
import MuiDialogTitle, {
  type DialogTitleProps,
} from '@mui/material/DialogTitle';
import { styled } from '@mui/material/styles';

export const DialogTitle: React.FC<DialogTitleProps> = styled(MuiDialogTitle)(
  ({ theme }) => ({
    padding: theme.spacing(2),
  })
);

export const DialogContent: React.FC<DialogContentProps> = styled(
  MuiDialogContent
)(({ theme }) => ({
  marginTop: theme.spacing(2),
  paddingLeft: theme.spacing(2),
  paddingRight: theme.spacing(2),
}));

export const DialogActions: React.FC<DialogActionsProps> = styled(
  MuiDialogActions
)(({ theme }) => ({
  padding: theme.spacing(2),
}));
