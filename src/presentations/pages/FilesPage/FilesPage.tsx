import React, { useState } from 'react';

import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import FolderIcon from '@mui/icons-material/Folder';
import GridViewIcon from '@mui/icons-material/GridView';
import LabelIcon from '@mui/icons-material/Label';
import ListIcon from '@mui/icons-material/List';
import TableRowsIcon from '@mui/icons-material/TableRows';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Fab from '@mui/material/Fab';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Select from '@mui/material/Select';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Typography from '@mui/material/Typography';
import Zoom from '@mui/material/Zoom';

import type { GetFilesParams, TrashFileInfo } from '@/domain/models/files';
import { DeleteConfirmDialog } from '@/presentations/components/dialogs';
import { FileSearchBar } from '@/presentations/features/files/components/FileSearch/FileSearchBar';
import { FileSearchResults } from '@/presentations/features/files/components/FileSearch/FileSearchResults';
import { FileUploadDialog } from '@/presentations/features/files/components/FileUpload/FileUploadDialog';
import { FileDetailDialog } from '@/presentations/features/files/components/FileDetail/FileDetailDialog';
import { TagManagementDialog } from '@/presentations/features/files/components/TagManagement/TagManagementDialog';

import { useDebounce } from '../../hooks/useDebounce';
import { useDeleteFile } from '../../hooks/mutations/useDeleteFile';
import { usePermanentlyDeleteFile } from '../../hooks/mutations/usePermanentlyDeleteFile';
import { useRestoreFile } from '../../hooks/mutations/useRestoreFile';
import { useFiles } from '../../hooks/queries/useFiles';
import { useTags } from '../../hooks/queries/useTags';
import { useTrash } from '../../hooks/queries/useTrash';
import { TrashFileList } from '../TrashPage/components/TrashFileList';

import { CategoryFilter } from './components/CategoryFilter';
import { FileListGrid } from './components/FileListGrid';
import { FileListTable } from './components/FileListTable';
import { PaginationControls } from './components/PaginationControls';

type ViewMode = 'table' | 'grid';
type SortBy = 'name' | 'uploadedAt' | 'size';
type SortOrder = 'asc' | 'desc';
type PageMode = 'list' | 'trash';

export const FilesPage: React.FC = () => {
  const [pageMode, setPageMode] = useState<PageMode>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [sortBy, setSortBy] = useState<SortBy>('uploadedAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [page, setPage] = useState(1);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [tagManagementOpen, setTagManagementOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<TrashFileInfo | null>(null);
  const [selectedFileIds, setSelectedFileIds] = useState<string[]>([]);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);

  // デバウンス処理を適用した検索クエリ
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const queryParams: GetFilesParams = {
    page,
    limit: 20,
    search: debouncedSearchQuery,
    tagIds: selectedTags,
    sortBy,
    sortOrder,
  };

  const { data: filesData, isLoading } = useFiles(queryParams);

  const { data: tagsData } = useTags();

  // ごみ箱関連
  const { data: trashData, isLoading: isTrashLoading } = useTrash();
  const restoreMutation = useRestoreFile();
  const permanentlyDeleteMutation = usePermanentlyDeleteFile();
  const deleteMutation = useDeleteFile();

  const handleTagClick = (tagId: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId],
    );
  };

  const handleViewModeChange = (_event: React.MouseEvent<HTMLElement>, newMode: ViewMode | null) => {
    if (newMode !== null) {
      setViewMode(newMode);
    }
  };

  const handleRestore = async (file: TrashFileInfo) => {
    await restoreMutation.mutateAsync(file.id);
  };

  const handlePermanentDelete = (file: TrashFileInfo) => {
    setDeleteTarget(file);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    await permanentlyDeleteMutation.mutateAsync(deleteTarget.id);
    setDeleteTarget(null);
  };

  const trashFiles = trashData?.files ?? [];

  const handleBulkDelete = () => {
    if (selectedFileIds.length === 0) return;
    setBulkDeleteDialogOpen(true);
  };

  const handleConfirmBulkDelete = async () => {
    for (const fileId of selectedFileIds) {
      await deleteMutation.mutateAsync(fileId);
    }
    setSelectedFileIds([]);
    setBulkDeleteDialogOpen(false);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, width: '100%' }}>
      {/* ヘッダーセクション */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          border: '2px solid',
          borderColor: '#ffd6a7',
          borderRadius: 2,
          bgcolor: 'white',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
              {pageMode === 'list' ? (
                <FolderIcon sx={{ fontSize: 28, color: '#7e2a0c' }} />
              ) : (
                <DeleteIcon sx={{ fontSize: 28, color: '#7e2a0c' }} />
              )}
              <Typography variant="h4" sx={{ color: '#7e2a0c', fontWeight: 'bold', fontSize: 24 }}>
                {pageMode === 'list' ? 'おたより・資料一覧' : 'ごみ箱'}
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ color: '#f54900', ml: 4.5 }}>
              {pageMode === 'list'
                ? `${filesData?.total || 0}件のおたより`
                : `${trashFiles.length}件`}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {pageMode === 'list' ? (
              <>
                <Button
                  variant="outlined"
                  onClick={() => setTagManagementOpen(true)}
                  startIcon={<LabelIcon />}
                  sx={{
                    borderColor: '#ffd6a7',
                    color: '#7e2a0c',
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 'bold',
                    '&:hover': {
                      borderColor: '#ff6900',
                      bgcolor: '#fff7ed',
                    },
                  }}
                >
                  タグ管理
                </Button>
                <Button
                  variant="contained"
                  onClick={() => setUploadDialogOpen(true)}
                  startIcon={<AddIcon />}
                  sx={{
                    bgcolor: '#ff6900',
                    '&:hover': { bgcolor: '#e65f00' },
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 'bold',
                  }}
                >
                  おたよりを追加
                </Button>
                <Button
                  variant="contained"
                  onClick={() => setPageMode('trash')}
                  startIcon={<DeleteIcon />}
                  sx={{
                    bgcolor: '#7e2a0c',
                    '&:hover': { bgcolor: '#5a1e08' },
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 'bold',
                  }}
                >
                  ごみ箱
                </Button>
              </>
            ) : (
              <Button
                variant="contained"
                onClick={() => setPageMode('list')}
                startIcon={<ListIcon />}
                sx={{
                  bgcolor: '#ff6900',
                  '&:hover': { bgcolor: '#e65f00' },
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 'bold',
                }}
              >
                一覧へ
              </Button>
            )}
          </Box>
        </Box>
      </Paper>

      {/* 検索・ソートバー (一覧モード時のみ) */}
      {pageMode === 'list' && (
        <>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              border: '2px solid',
              borderColor: '#fff085',
              borderRadius: 2,
              bgcolor: 'white',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <FileSearchBar value={searchQuery} onChange={setSearchQuery} />
              <Box sx={{ display: 'flex', gap: 1, ml: 'auto' }}>
                <Select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortBy)}
                  size="small"
                  sx={{
                    minWidth: 140,
                    bgcolor: '#fffbf5',
                    borderRadius: 3,
                    '& fieldset': { borderColor: '#ffd6a7' },
                  }}
                >
                  <MenuItem value="name">ファイル名</MenuItem>
                  <MenuItem value="uploadedAt">更新日時</MenuItem>
                  <MenuItem value="size">サイズ</MenuItem>
                </Select>
                <Select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value as SortOrder)}
                  size="small"
                  sx={{
                    minWidth: 100,
                    bgcolor: '#fffbf5',
                    borderRadius: 3,
                    '& fieldset': { borderColor: '#ffd6a7' },
                  }}
                >
                  <MenuItem value="asc">昇順</MenuItem>
                  <MenuItem value="desc">降順</MenuItem>
                </Select>
                <ToggleButtonGroup
                  value={viewMode}
                  exclusive
                  onChange={handleViewModeChange}
                  size="small"
                  sx={{
                    bgcolor: '#fff7ed',
                    border: '2px solid #ffd6a7',
                    borderRadius: 3,
                  }}
                >
                  <ToggleButton
                    value="table"
                    sx={{
                      border: 'none',
                      '&.Mui-selected': { bgcolor: '#ff6900', color: 'white' },
                    }}
                  >
                    <TableRowsIcon />
                  </ToggleButton>
                  <ToggleButton
                    value="grid"
                    sx={{
                      border: 'none',
                      '&.Mui-selected': { bgcolor: '#ff6900', color: 'white' },
                    }}
                  >
                    <GridViewIcon />
                  </ToggleButton>
                </ToggleButtonGroup>
              </Box>
            </Box>
          </Paper>

          {/* タグフィルター */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              border: '2px solid',
              borderColor: '#b9f8cf',
              borderRadius: 2,
              bgcolor: 'white',
            }}
          >
            <CategoryFilter
              tags={tagsData?.tags || []}
              selectedTags={selectedTags}
              onTagClick={handleTagClick}
            />
          </Paper>
        </>
      )}

      {/* ファイル一覧テーブル or ごみ箱 */}
      <Paper
        elevation={0}
        sx={{
          border: '2px solid',
          borderColor: '#bedbff',
          borderRadius: 2,
          bgcolor: 'white',
          overflow: 'hidden',
        }}
      >
        {pageMode === 'list' ? (
          <>
            {/* 検索結果表示 */}
            <FileSearchResults
              searchQuery={debouncedSearchQuery}
              resultCount={filesData?.total || 0}
              isLoading={isLoading}
            />

            {/* ファイル一覧 */}
            {viewMode === 'table' ? (
              <FileListTable
                files={filesData?.files || []}
                isLoading={isLoading}
                onFileClick={(fileId) => setSelectedFileId(fileId)}
                selectedFileIds={selectedFileIds}
                onSelectionChange={setSelectedFileIds}
              />
            ) : (
              <FileListGrid
                files={filesData?.files || []}
                isLoading={isLoading}
                onFileClick={(fileId) => setSelectedFileId(fileId)}
              />
            )}

            {/* ページネーション */}
            {filesData && filesData.total > 0 && (
              <PaginationControls
                page={page}
                totalPages={Math.ceil(filesData.total / 20)}
                total={filesData.total}
                onPageChange={setPage}
                itemsPerPage={20}
              />
            )}
          </>
        ) : (
          <TrashFileList
            files={trashFiles}
            isLoading={isTrashLoading}
            onRestore={handleRestore}
            onPermanentDelete={handlePermanentDelete}
            isDeleting={permanentlyDeleteMutation.isPending}
            isRestoring={restoreMutation.isPending}
          />
        )}
      </Paper>

      {/* アップロードダイアログ */}
      <FileUploadDialog open={uploadDialogOpen} onClose={() => setUploadDialogOpen(false)} />

      {/* タグ管理ダイアログ */}
      <TagManagementDialog
        open={tagManagementOpen}
        onClose={() => setTagManagementOpen(false)}
      />

      {/* ファイル詳細ダイアログ */}
      <FileDetailDialog
        fileId={selectedFileId}
        open={selectedFileId !== null}
        onClose={() => setSelectedFileId(null)}
      />

      {/* 完全削除確認ダイアログ */}
      <DeleteConfirmDialog
        open={!!deleteTarget}
        title="完全削除しますか？"
        description={deleteTarget?.name}
        confirmLabel="完全削除"
        isLoading={permanentlyDeleteMutation.isPending}
        onConfirm={handleConfirmDelete}
        onClose={() => setDeleteTarget(null)}
      />

      {/* 一括削除確認ダイアログ */}
      <DeleteConfirmDialog
        open={bulkDeleteDialogOpen}
        title="選択したファイルをごみ箱に移動しますか？"
        description={`${selectedFileIds.length}件のファイルをごみ箱に移動します。`}
        confirmLabel="ごみ箱へ移動"
        isLoading={deleteMutation.isPending}
        onConfirm={handleConfirmBulkDelete}
        onClose={() => setBulkDeleteDialogOpen(false)}
      />

      {/* フローティング一括削除ボタン */}
      <Zoom in={selectedFileIds.length > 0 && pageMode === 'list'}>
        <Fab
          variant="extended"
          color="error"
          onClick={handleBulkDelete}
          sx={{
            position: 'fixed',
            bottom: 32,
            right: 32,
            bgcolor: '#dc2626',
            color: 'white',
            fontWeight: 'bold',
            px: 3,
            py: 1.5,
            boxShadow: '0 4px 20px rgba(220, 38, 38, 0.4)',
            '&:hover': {
              bgcolor: '#b91c1c',
              boxShadow: '0 6px 24px rgba(220, 38, 38, 0.5)',
            },
          }}
        >
          <DeleteIcon sx={{ mr: 1 }} />
          選択した{selectedFileIds.length}件をごみ箱へ
        </Fab>
      </Zoom>
    </Box>
  );
};