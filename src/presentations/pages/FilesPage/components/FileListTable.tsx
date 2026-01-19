import React, { useState } from 'react';

import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import DeleteIcon from '@mui/icons-material/Delete';
import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';

import type { FileInfo } from '@/adapters/generated/files';
import { formatFileSize } from '@/domain/models/files/FileInfo';
import { TAG_COLOR_PALETTE } from '@/domain/models/files/TagInfo';
import { FileIcon } from '@/presentations/components';
import { DeleteConfirmDialog } from '@/presentations/components/dialogs';
import { useDeleteFile } from '@/presentations/hooks/mutations/useDeleteFile';
import { useTags } from '@/presentations/hooks/queries/useTags';

interface FileListTableProps {
  files: FileInfo[];
  isLoading: boolean;
  onFileClick?: (fileId: string) => void;
  selectedFileIds?: string[];
  onSelectionChange?: (fileIds: string[]) => void;
}

export const FileListTable: React.FC<FileListTableProps> = ({
  files,
  isLoading,
  onFileClick,
  selectedFileIds = [],
  onSelectionChange,
}) => {
  const { data: tagsData } = useTags();
  const tags = tagsData?.tags ?? [];
  const deleteMutation = useDeleteFile();
  const [deleteTarget, setDeleteTarget] = useState<FileInfo | null>(null);

  const isSelectionMode = onSelectionChange !== undefined;

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      onSelectionChange?.(files.map((file) => file.id));
    } else {
      onSelectionChange?.([]);
    }
  };

  const handleSelectFile = (fileId: string) => {
    if (selectedFileIds.includes(fileId)) {
      onSelectionChange?.(selectedFileIds.filter((id) => id !== fileId));
    } else {
      onSelectionChange?.([...selectedFileIds, fileId]);
    }
  };

  const isAllSelected = files.length > 0 && selectedFileIds.length === files.length;
  const isIndeterminate = selectedFileIds.length > 0 && selectedFileIds.length < files.length;
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (files.length === 0) {
    return (
      <Box sx={{ p: 8, textAlign: 'center' }}>
        <Typography variant="body1" color="text.secondary">
          ファイルが見つかりません
        </Typography>
      </Box>
    );
  }

  return (
    <>
      <Table>
      <TableHead
        sx={{
          background: 'linear-gradient(to right, #eff6ff, #eef2ff)',
          borderBottom: '2px solid #bedbff',
        }}
      >
        <TableRow>
          {isSelectionMode && (
            <TableCell padding="checkbox">
              <Checkbox
                indeterminate={isIndeterminate}
                checked={isAllSelected}
                onChange={handleSelectAll}
                sx={{ color: '#1c398e' }}
              />
            </TableCell>
          )}
          <TableCell sx={{ color: '#1c398e', fontWeight: 'bold', fontSize: 14 }}>
            ファイル名
          </TableCell>
          <TableCell sx={{ color: '#1c398e', fontWeight: 'bold', fontSize: 14 }}>
            カテゴリー
          </TableCell>
          <TableCell sx={{ color: '#1c398e', fontWeight: 'bold', fontSize: 14 }}>
            サイズ
          </TableCell>
          <TableCell sx={{ color: '#1c398e', fontWeight: 'bold', fontSize: 14 }}>
            更新日時
          </TableCell>
          <TableCell sx={{ color: '#1c398e', fontWeight: 'bold', fontSize: 14 }}>
            操作
          </TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {files.map((file) => {
          const isSelected = selectedFileIds.includes(file.id);
          return (
            <TableRow
              key={file.id}
              sx={{
                borderBottom: '1px solid #dbeafe',
                cursor: onFileClick ? 'pointer' : 'default',
                bgcolor: isSelected ? 'action.selected' : 'inherit',
                '&:hover': onFileClick
                  ? {
                      bgcolor: isSelected ? 'action.selected' : 'action.hover',
                    }
                  : {},
              }}
              onClick={(e) => {
                // チェックボックスまたはアクションボタンのクリックは無視
                if ((e.target as HTMLElement).closest('input[type="checkbox"], button, a')) {
                  return;
                }
                // 行クリックで詳細表示
                onFileClick?.(file.id);
              }}
            >
              {isSelectionMode && (
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={isSelected}
                    onChange={() => handleSelectFile(file.id)}
                    onClick={(e) => e.stopPropagation()}
                  />
                </TableCell>
              )}
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <FileIcon size={36} />
                  <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#101828' }}>
                    {file.name}
                  </Typography>
                </Box>
              </TableCell>
            <TableCell>
              <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
                {file.tagIds?.map((tagId) => {
                  const tag = tags.find((t) => t.id === tagId);
                  if (!tag) return null;

                  const palette = TAG_COLOR_PALETTE[tag.color];
                  return (
                    <Chip
                      key={tagId}
                      label={tag.name}
                      size="small"
                      sx={{
                        bgcolor: palette.main,
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: 12,
                        height: 21,
                      }}
                    />
                  );
                })}
              </Box>
            </TableCell>
            <TableCell>
              <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#364153' }}>
                {formatFileSize(file.size)}
              </Typography>
            </TableCell>
            <TableCell>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CalendarTodayIcon sx={{ fontSize: 16, color: '#9ca3af' }} />
                <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#364153' }}>
                  {new Date(file.uploadedAt).toLocaleString('ja-JP', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Typography>
              </Box>
            </TableCell>
            <TableCell>
              <IconButton
                aria-label="delete"
                onClick={(event) => {
                  event.stopPropagation();
                  setDeleteTarget(file);
                }}
              >
                <DeleteIcon />
              </IconButton>
            </TableCell>
          </TableRow>
          );
        })}
      </TableBody>
    </Table>

      <DeleteConfirmDialog
        open={!!deleteTarget}
        title="ファイルを削除しますか？"
        description={deleteTarget?.name}
        confirmLabel="削除"
        isLoading={deleteMutation.isPending}
        onConfirm={async () => {
          if (!deleteTarget) return;
          await deleteMutation.mutateAsync(deleteTarget.id);
          setDeleteTarget(null);
        }}
        onClose={() => setDeleteTarget(null)}
      />
    </>
  );
};
