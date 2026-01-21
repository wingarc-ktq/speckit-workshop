import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

interface DocumentEmptyStateProps {
  onUploadClick?: () => void;
}

/**
 * DocumentEmptyState コンポーネント
 * ドキュメントがない場合の空状態表示
 *
 * @component
 * @example
 * ```tsx
 * <DocumentEmptyState onUploadClick={handleUploadClick} />
 * ```
 */
export function DocumentEmptyState({ onUploadClick }: DocumentEmptyStateProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '400px',
        backgroundColor: '#fafafa',
        borderRadius: 2,
        border: '2px dashed #ccc',
        gap: 2,
        p: 4,
      }}
    >
      <CloudUploadIcon sx={{ fontSize: 80, color: '#ccc' }} />

      <Typography variant="h6" sx={{ color: '#666' }}>
        ドキュメントがまだアップロードされていません
      </Typography>

      <Typography variant="body2" sx={{ color: '#999', textAlign: 'center', maxWidth: 300 }}>
        ファイルをアップロードして、ドキュメント管理を始めましょう。
      </Typography>

      {onUploadClick && (
        <Button
          variant="contained"
          color="primary"
          size="large"
          startIcon={<CloudUploadIcon />}
          onClick={onUploadClick}
          data-testid="empty-state-upload-button"
          sx={{ mt: 2 }}
        >
          ファイルをアップロード
        </Button>
      )}
    </Box>
  );
}
