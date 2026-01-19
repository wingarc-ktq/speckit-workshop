import { Alert, AlertTitle, Box, List, ListItem, ListItemText } from '@mui/material';
import type { FileValidationError } from '@/domain/models/document/DocumentError';

export interface FileUploadErrorProps {
  errors: FileValidationError[];
  onDismiss?: () => void;
}

/**
 * ファイルアップロードエラー表示コンポーネント
 */
export const FileUploadError: React.FC<FileUploadErrorProps> = ({ errors, onDismiss }) => {
  if (errors.length === 0) {
    return null;
  }

  // ファイル名がない場合は全体エラー
  const isGlobalError = errors.some((e) => !e.fileName);

  if (isGlobalError) {
    return (
      <Alert severity="error" onClose={onDismiss} sx={{ mb: 2 }}>
        <AlertTitle>アップロードエラー</AlertTitle>
        {errors.map((error, index) =>
          !error.fileName ? (
            <Box key={index}>{error.error}</Box>
          ) : null
        )}
      </Alert>
    );
  }

  return (
    <Alert severity="error" onClose={onDismiss} sx={{ mb: 2 }}>
      <AlertTitle>アップロードエラー</AlertTitle>
      <List dense>
        {errors.map((error, index) => (
          <ListItem key={index} disableGutters>
            <ListItemText
              primary={error.fileName}
              secondary={error.error}
              primaryTypographyProps={{ variant: 'body2' }}
              secondaryTypographyProps={{ variant: 'caption' }}
            />
          </ListItem>
        ))}
      </List>
    </Alert>
  );
};

export default FileUploadError;
