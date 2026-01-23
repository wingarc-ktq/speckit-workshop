import DeleteIcon from '@mui/icons-material/Delete';
import DownloadIcon from '@mui/icons-material/Download';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

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
        flexDirection: { xs: 'column', sm: 'row' },
        gap: { xs: 1.5, sm: 0 },
        padding: { xs: 1.5, sm: 2 },
        backgroundColor: '#e3f2fd',
        borderRadius: 1,
        border: '1px solid #90caf9',
      }}
      data-testid="selection-toolbar"
    >
      <Typography variant="body2" sx={{ fontWeight: 500, fontSize: { xs: '0.875rem', sm: '1rem' } }}>
        {selectedCount}件選択中
      </Typography>
      
      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', justifyContent: { xs: 'center', sm: 'flex-end' } }}>
        {onDownload && (
          <Button
            variant="outlined"
            size="small"
            startIcon={<DownloadIcon />}
            onClick={onDownload}
            data-testid="bulk-download-button"
            sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
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
            sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
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
            sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
          >
            選択解除
          </Button>
        )}
      </Box>
    </Box>
  );
}
