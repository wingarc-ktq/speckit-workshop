import { useMemo } from 'react';
import {
  Grid as MuiGrid,
  Card,
  CardContent,
  CardActions,
  Skeleton,
  Box,
  Chip,
  IconButton,
  Tooltip,
  Typography,
} from '@mui/material';
import { Download as DownloadIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import type { Document } from '@/domain/models/document';

// MUI v7 Grid コンポーネントの型互換性を確保
const Grid = MuiGrid as any;

interface FileGridViewProps {
  documents: Document[];
  isLoading: boolean;
  onCardClick?: (document: Document) => void;
}

/**
 * FileGridView コンポーネント
 * MUI Grid を使用してドキュメントをカード形式で表示
 *
 * @component
 * @example
 * ```tsx
 * <FileGridView
 *   documents={documents}
 *   isLoading={loading}
 *   onCardClick={handleCardClick}
 * />
 * ```
 */
export function FileGridView({ documents, isLoading, onCardClick }: FileGridViewProps) {
  // ローディング中のスケルトンカードを生成
  const skeletonCards = useMemo(() => {
    return isLoading ? Array.from({ length: 6 }).map((_, i) => ({ id: `skeleton-${i}` })) : [];
  }, [isLoading]);

  const formatFileSize = (bytes: number): string => {
    const kb = bytes / 1024;
    const mb = kb / 1024;
    return mb >= 1 ? `${mb.toFixed(1)} MB` : `${kb.toFixed(1)} KB`;
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      month: '2-digit',
      day: '2-digit',
    });
  };

  if (isLoading && documents.length === 0) {
    return (
      <Grid container spacing={2}>
        {skeletonCards.map((card) => (
          <Grid key={card.id} xs={12} sm={6} md={4}>
            <Card data-testid="skeleton-loader">
              <CardContent>
                <Skeleton variant="text" height={40} />
                <Skeleton variant="text" sx={{ mt: 1 }} />
                <Skeleton variant="text" sx={{ mt: 1 }} />
              </CardContent>
              <CardActions>
                <Skeleton variant="circular" width={40} height={40} />
                <Skeleton variant="circular" width={40} height={40} />
                <Skeleton variant="circular" width={40} height={40} />
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  }

  if (documents.length === 0) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '300px',
          backgroundColor: '#fafafa',
          borderRadius: 1,
          border: '1px dashed #ccc',
        }}
      >
        <Box sx={{ textAlign: 'center' }}>
          <p style={{ color: '#666', marginBottom: '8px' }}>ドキュメントが見つかりません</p>
          <p style={{ color: '#999', fontSize: '0.875rem' }}>ファイルをアップロードしてください</p>
        </Box>
      </Box>
    );
  }

  return (
    <Grid container spacing={2}>
      {documents.map((document) => (
        <Grid key={document.id} xs={12} sm={6} md={4}>
          <Card
            sx={{
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              '&:hover': {
                boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)',
                transform: 'translateY(-4px)',
              },
            }}
            onClick={() => onCardClick?.(document)}
            data-testid={`grid-card-${document.id}`}
          >
            <CardContent>
              <Typography
                variant="subtitle1"
                sx={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  mb: 1,
                  fontWeight: 600,
                }}
              >
                {document.fileName}
              </Typography>

              <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mb: 1 }}>
                {formatFileSize(document.fileSize)} • {formatDate(document.uploadedAt)}
              </Typography>

              <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 1 }}>
                {document.tags.length > 0 ? (
                  document.tags.map((tag) => (
                    <Chip
                      key={tag.id}
                      label={tag.name}
                      size="small"
                      variant="outlined"
                      sx={{
                        height: '20px',
                        fontSize: '0.75rem',
                      }}
                    />
                  ))
                ) : (
                  <Typography variant="caption" color="textSecondary">
                    タグなし
                  </Typography>
                )}
              </Box>
            </CardContent>

            <CardActions sx={{ justifyContent: 'flex-end', pt: 0 }}>
              <Tooltip title="ダウンロード">
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                  data-testid={`download-button-${document.id}`}
                >
                  <DownloadIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="編集">
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                  data-testid={`edit-button-${document.id}`}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="削除">
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                  data-testid={`delete-button-${document.id}`}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </CardActions>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}
