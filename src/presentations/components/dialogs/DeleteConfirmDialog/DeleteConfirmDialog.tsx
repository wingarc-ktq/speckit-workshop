import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Typography from '@mui/material/Typography';
import { useTranslation } from 'react-i18next';

interface DeleteConfirmDialogProps {
  open: boolean;
  title?: string;
  description?: string;
  confirmLabel?: string;
  isLoading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export const DeleteConfirmDialog = ({
  open,
  title,
  description,
  confirmLabel,
  isLoading = false,
  onConfirm,
  onClose,
}: DeleteConfirmDialogProps) => {
  const { t } = useTranslation();
  const defaultTitle = t('filesPage.dialog.deleteConfirm');
  const defaultConfirmLabel = t('actions.delete');
  const cancelLabel = t('actions.cancel');

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <WarningAmberIcon sx={{ color: '#f97316' }} />
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            {title ?? defaultTitle}
          </Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        {description && (
          <Typography variant="body2" color="text.secondary">
            {description}
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isLoading}>
          {cancelLabel}
        </Button>
        <Button
          color="error"
          variant="contained"
          onClick={onConfirm}
          disabled={isLoading}
        >
          {confirmLabel ?? defaultConfirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
