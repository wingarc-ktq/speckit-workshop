import { useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Skeleton,
  Box,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import { Download as DownloadIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import type { Document } from '@/domain/models/document';

interface FileListProps {
  documents: Document[];
  isLoading: boolean;
  onSort?: (sortBy: string, sortOrder: 'asc' | 'desc') => void;
  onPageChange?: (page: number) => void;
  onRowClick?: (document: Document) => void;
  totalCount?: number;
  currentPage?: number;
  pageSize?: number;
}

/**
 * FileList コンポーネント
 * MUI Table を使用して文書一覧をテーブル形式で表示
 *
 * @component
 * @example
 * ```tsx
 * <FileList
 *   documents={documents}
 *   isLoading={loading}
 *   onSort={handleSort}
 *   onPageChange={handlePageChange}
 *   totalCount={100}
 *   currentPage={1}
 *   pageSize={20}
 * />
 * ```
 */
export function FileList({
  documents,
  isLoading,
  onSort: _onSort,
  onPageChange: _onPageChange,
  onRowClick,
  totalCount: _totalCount,
  currentPage: _currentPage,
  pageSize: _pageSize,
}: FileListProps) {
  // ローディング中のスケルトン行を生成
  const skeletonRows = useMemo(() => {
    return isLoading ? Array.from({ length: 5 }).map((_, i) => ({ id: `skeleton-${i}` })) : [];
  }, [isLoading]);

  const handleRowClick = (document: Document) => {
    if (onRowClick) {
      onRowClick(document);
    }
  };

  if (isLoading && documents.length === 0) {
    return (
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              <TableCell width="40%">ファイル名</TableCell>
              <TableCell width="20%">タグ</TableCell>
              <TableCell width="15%">サイズ</TableCell>
              <TableCell width="15%">アップロード日時</TableCell>
              <TableCell width="10%" align="center">
                アクション
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {skeletonRows.map((row) => (
              <TableRow key={row.id} data-testid="skeleton-loader">
                <TableCell>
                  <Skeleton variant="text" />
                </TableCell>
                <TableCell>
                  <Skeleton variant="text" />
                </TableCell>
                <TableCell>
                  <Skeleton variant="text" />
                </TableCell>
                <TableCell>
                  <Skeleton variant="text" />
                </TableCell>
                <TableCell>
                  <Skeleton variant="circular" width={32} height={32} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
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

  const formatFileSize = (bytes: number): string => {
    const kb = bytes / 1024;
    const mb = kb / 1024;
    return mb >= 1 ? `${mb.toFixed(1)} MB` : `${kb.toFixed(1)} KB`;
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
            <TableCell width="40%">ファイル名</TableCell>
            <TableCell width="20%">タグ</TableCell>
            <TableCell width="15%">サイズ</TableCell>
            <TableCell width="15%">アップロード日時</TableCell>
            <TableCell width="10%" align="center">
              アクション
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {documents.map((document) => (
            <TableRow
              key={document.id}
              data-testid={`document-item-${document.id}`}
              hover
              sx={{ cursor: 'pointer', '&:hover': { backgroundColor: '#f9f9f9' } }}
              onClick={() => handleRowClick(document)}
            >
              <TableCell sx={{ fontWeight: 500 }}>{document.fileName}</TableCell>
              <TableCell>
                <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                  {document.tags.length > 0 ? (
                    document.tags.map((tag) => (
                      <Chip
                        key={tag.id}
                        label={tag.name}
                        size="small"
                        variant="outlined"
                        sx={{
                          borderColor: 'rgba(0, 0, 0, 0.12)',
                          height: '24px',
                        }}
                      />
                    ))
                  ) : (
                    <span style={{ color: '#999', fontSize: '0.875rem' }}>-</span>
                  )}
                </Box>
              </TableCell>
              <TableCell>{formatFileSize(document.fileSize)}</TableCell>
              <TableCell>{formatDate(document.uploadedAt)}</TableCell>
              <TableCell align="center">
                <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
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
                </Box>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
