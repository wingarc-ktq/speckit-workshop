import React from 'react';

import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';

import { FileUploadArea } from '@/presentations/components';

export interface UploadDialogProps {
  open: boolean;
  onClose: () => void;
  onUploadSuccess: () => void;
}

export const UploadDialog: React.FC<UploadDialogProps> = ({ open, onClose, onUploadSuccess }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>ファイルアップロード</DialogTitle>
      <DialogContent>
        <FileUploadArea
          onUploadSuccess={() => {
            onUploadSuccess();
            onClose();
          }}
        />
      </DialogContent>
    </Dialog>
  );
};
