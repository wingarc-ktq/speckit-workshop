import { useMemo, useState } from 'react';

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
  Checkbox,
} from '@mui/material';

import type { Document } from '@/domain/models/document';
import { TagChip } from '@/presentations/components/tags/TagChip';
import { highlightMatch } from '@/presentations/utils/highlightMatch';

const PROGRESS_TAG_NAMES = ['完了', '未完了', '進行中'];

interface FileListProps {
  documents: Document[];
  isLoading: boolean;
  searchKeyword?: string;
  onSort?: (sortBy: string, sortOrder: 'asc' | 'desc') => void;
  onPageChange?: (page: number) => void;
  onRowClick?: (document: Document) => void;
  onSelectionChange?: (selectedIds: string[]) => void;
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
  searchKeyword,
  onSort: _onSort,
  onPageChange: _onPageChange,
  onRowClick,
  onSelectionChange,
  totalCount: _totalCount,
  currentPage: _currentPage,
  pageSize: _pageSize,
}: FileListProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // ローディング中のスケルトン行を生成
  const skeletonRows = useMemo(() => {
    return isLoading ? Array.from({ length: 5 }).map((_, i) => ({ id: `skeleton-${i}` })) : [];
  }, [isLoading]);

  const handleRowClick = (document: Document) => {
    if (onRowClick) {
      onRowClick(document);
    }
  };

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelectedIds = documents.map((doc) => doc.id);
      setSelectedIds(newSelectedIds);
      onSelectionChange?.(newSelectedIds);
    } else {
      setSelectedIds([]);
      onSelectionChange?.([]);
    }
  };

  const handleSelectRow = (documentId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    event.stopPropagation();
    let newSelectedIds: string[];
    if (event.target.checked) {
      newSelectedIds = [...selectedIds, documentId];
    } else {
      newSelectedIds = selectedIds.filter((id) => id !== documentId);
    }
    setSelectedIds(newSelectedIds);
    onSelectionChange?.(newSelectedIds);
  };

  const isAllSelected = documents.length > 0 && selectedIds.length === documents.length;
  const isIndeterminate = selectedIds.length > 0 && selectedIds.length < documents.length;

  if (isLoading && documents.length === 0) {
    return (
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              <TableCell width="5%" padding="checkbox">
                <Checkbox disabled checked={false} indeterminate={false} />
              </TableCell>
              <TableCell width="30%">ファイル名</TableCell>
              <TableCell width="15%">タグ</TableCell>
              <TableCell width="15%">アップロード日時</TableCell>
              <TableCell width="15%">サイズ</TableCell>
              <TableCell width="15%">
                アップロードユーザー
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {skeletonRows.map((row) => (
              <TableRow key={row.id} data-testid="skeleton-loader">
                <TableCell padding="checkbox">
                  <Checkbox disabled />
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
                  <Skeleton variant="text" />
                </TableCell>
                <TableCell>
                  <Skeleton variant="text" />
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
            <TableCell width="5%" padding="checkbox">
              <Checkbox
                indeterminate={isIndeterminate}
                checked={isAllSelected}
                onChange={handleSelectAll}
                data-testid="select-all-checkbox"
              />
            </TableCell>
            <TableCell width="30%">ファイル名</TableCell>
            <TableCell width="20%">タグ</TableCell>
            <TableCell width="15%">アップロード日時</TableCell>
            <TableCell width="15%">サイズ</TableCell>
            <TableCell width="15%">
              アップロードユーザー
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {documents.map((document) => (
            <TableRow
              key={document.id}
              data-testid={`document-item-${document.id}`}
              hover
              sx={{
                cursor: 'pointer',
                backgroundColor: selectedIds.includes(document.id) ? '#f0f7ff' : 'transparent',
                '&:hover': { backgroundColor: selectedIds.includes(document.id) ? '#e8f4fd' : '#f9f9f9' },
              }}
              onClick={() => handleRowClick(document)}
            >
              <TableCell padding="checkbox" onClick={(e) => e.stopPropagation()}>
                <Checkbox
                  checked={selectedIds.includes(document.id)}
                  onChange={(e) => handleSelectRow(document.id, e)}
                  data-testid={`checkbox-${document.id}`}
                />
              </TableCell>
              <TableCell
                sx={{ fontWeight: 500 }}
                dangerouslySetInnerHTML={{
                  __html: searchKeyword ? highlightMatch(document.fileName, searchKeyword) : document.fileName,
                }}
              />
              <TableCell>
                <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                  {document.tags.length > 0 ? (
                    document.tags.map((tag) => {
                      const isProgress = PROGRESS_TAG_NAMES.includes(tag.name);
                      const tone = isProgress ? 'progress' : 'document';
                      const variant = isProgress ? 'filled' : 'outlined';

                      return <TagChip key={tag.id} tag={tag} tone={tone} variant={variant} />;
                    })
                  ) : (
                    <span style={{ color: '#999', fontSize: '0.875rem' }}>-</span>
                  )}
                </Box>
              </TableCell>
              <TableCell>{formatDate(document.uploadedAt)}</TableCell>
              <TableCell>{formatFileSize(document.fileSize)}</TableCell>
              <TableCell>{document.uploadedByUserId}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
