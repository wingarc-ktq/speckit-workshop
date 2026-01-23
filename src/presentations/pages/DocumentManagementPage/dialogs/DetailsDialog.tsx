import React from 'react';

import { FileDetailsModal } from '@/presentations/components';

export interface DetailsDialogProps {
  open: boolean;
  documentId?: string;
  onClose: () => void;
}

export const DetailsDialog: React.FC<DetailsDialogProps> = ({ open, documentId, onClose }) => {
  if (!documentId) return null;

  return <FileDetailsModal open={open} documentId={documentId} onClose={onClose} />;
};
