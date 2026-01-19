import React, { useState } from 'react';

import AddIcon from '@mui/icons-material/Add';
import FolderIcon from '@mui/icons-material/Folder';
import GridViewIcon from '@mui/icons-material/GridView';
import SearchIcon from '@mui/icons-material/Search';
import TableRowsIcon from '@mui/icons-material/TableRows';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import InputAdornment from '@mui/material/InputAdornment';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Select from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Typography from '@mui/material/Typography';

import type { GetFilesParams } from '@/domain/models/files';

import { useFiles } from '../../hooks/queries/useFiles';
import { useTags } from '../../hooks/queries/useTags';

import { CategoryFilter } from './components/CategoryFilter';
import { FileListTable } from './components/FileListTable';
import { PaginationControls } from './components/PaginationControls';

type ViewMode = 'table' | 'grid';
type SortBy = 'name' | 'uploadedAt' | 'size';
type SortOrder = 'asc' | 'desc';

export const FilesPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [sortBy, setSortBy] = useState<SortBy>('uploadedAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [page, setPage] = useState(1);

  const queryParams: GetFilesParams = {
    page,
    limit: 20,
    search: searchQuery,
    tagIds: selectedTags,
    sortBy,
    sortOrder,
  };

  const { data: filesData, isLoading } = useFiles(queryParams);

  const { data: tagsData } = useTags();

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
              <FolderIcon sx={{ fontSize: 28, color: '#7e2a0c' }} />
              <Typography variant="h4" sx={{ color: '#7e2a0c', fontWeight: 'bold', fontSize: 24 }}>
                おたより・資料一覧
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ color: '#f54900', ml: 4.5 }}>
              {filesData?.total || 0}件のおたより
            </Typography>
          </Box>
          <Button
            variant="contained"
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
        </Box>
      </Paper>

      {/* 検索・ソートバー */}
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
          <TextField
            placeholder="ファイル名やタグで検索..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            size="small"
            sx={{
              flex: 1,
              maxWidth: 496,
              '& .MuiOutlinedInput-root': {
                bgcolor: '#fffbf5',
                borderRadius: 3,
                '& fieldset': { borderColor: '#ffd6a7' },
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: '#8b7355' }} />
                </InputAdornment>
              ),
            }}
          />
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

      {/* ファイル一覧テーブル */}
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
        <FileListTable files={filesData?.files || []} isLoading={isLoading} />
        {filesData && filesData.total > 0 && (
          <PaginationControls
            page={page}
            totalPages={Math.ceil(filesData.total / 20)}
            total={filesData.total}
            onPageChange={setPage}
            itemsPerPage={20}
          />
        )}
      </Paper>
    </Box>
  );
};
