import { Box, Button, Typography } from '@mui/material';
import { Delete as DeleteIcon, Download as DownloadIcon } from '@mui/icons-material';

interface SelectionToolbarProps {
  selectedCount: number;
  onDelete?: () => void;
  onDownload?: () => void;
  onClearSelection?: () => void;
}

/**
 * SelectionToolbar コンポーネント
 * チェックボックス選択時にリスト上部に表示される操作バー
 */
export function SelectionToolbar({
  selectedCount,
  onDelete,
  onDownload,
  onClearSelection,
}: SelectionToolbarProps) {
  if (selectedCount === 0) {
    return null;
  }

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 2,
        backgroundColor: '#e3f2fd',
        borderRadius: 1,
        border: '1px solid #90caf9',
      }}
      data-testid="selection-toolbar"
    >
      <Typography variant="body2" sx={{ fontWeight: 500 }}>
        {selectedCount}件選択中
      </Typography>
      
      <Box sx={{ display: 'flex', gap: 1 }}>
        {onDownload && (
          <Button
            variant="outlined"
            size="small"
            startIcon={<DownloadIcon />}
            onClick={onDownload}
            data-testid="bulk-download-button"
          >
            ダウンロード
          </Button>
        )}
        {onDelete && (
          <Button
            variant="outlined"
            size="small"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={onDelete}
            data-testid="bulk-delete-button"
          >
            削除
          </Button>
        )}
        {onClearSelection && (
          <Button
            variant="text"
            size="small"
            onClick={onClearSelection}
            data-testid="clear-selection-button"
          >
            選択解除
          </Button>
        )}
      </Box>
    </Box>
  );
}
