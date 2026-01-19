import {
  Box,
  TextField,
  Button,
  IconButton,
  Paper,
  Typography,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  ViewList as ViewListIcon,
  ViewModule as ViewModuleIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  ExpandMore as ExpandMoreIcon,
  CloudUpload as UploadIcon,
  Settings as SettingsIcon,
  LocalOffer as LocalOfferIcon,
  DateRange as DateRangeIcon,
  SwapVert as SwapVertIcon,
} from '@mui/icons-material';
import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useDebounce } from 'use-debounce';

import { FileList, DocumentGridView } from '@/presentations/components/files';
import { useFileListQuery } from '@/presentations/hooks/queries';
import { useDocumentManagementState } from '@/presentations/hooks/useDocumentManagementState';
import { useUploadFiles } from '@/presentations/hooks/mutations';
import { getAllTags } from '@/domain/constants/tags';

/**
 * ファイル一覧を表示するサスペンス内の実際のコンポーネント
 */
const FileListContent = ({ 
  viewMode, 
  searchQuery,
  sortBy,
  sortOrder,
  selectedTags,
  startDate,
  endDate,
}: { 
  viewMode: 'list' | 'grid';
  searchQuery?: string;
  sortBy: string;
  sortOrder: string;
  selectedTags: string[];
  startDate: string;
  endDate: string;
}) => {
  const { data } = useFileListQuery({ search: searchQuery });
  const isSearching = Boolean(searchQuery);
  
  // フィルタリング処理
  let filteredFiles = [...data.files];
  
  // タグフィルタ
  if (selectedTags.length > 0) {
    filteredFiles = filteredFiles.filter(file => {
      if (!file.tagIds) return false;
      return selectedTags.some(selectedTag => file.tagIds?.includes(selectedTag));
    });
  }
  
  // 日時フィルタ（開始日〜終了日）
  if (startDate || endDate) {
    filteredFiles = filteredFiles.filter(file => {
      const fileDate = new Date(file.uploadedAt);
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        if (fileDate < start) return false;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        if (fileDate > end) return false;
      }
      return true;
    });
  }
  
  // ソート処理
  let sortedFiles = [...filteredFiles];
  
  if (sortBy === 'name') {
    sortedFiles.sort((a, b) => {
      const comparison = a.name.localeCompare(b.name, 'ja');
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  } else if (sortBy === 'size') {
    sortedFiles.sort((a, b) => {
      const comparison = a.size - b.size;
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  } else if (sortBy === 'uploadedAt') {
    sortedFiles.sort((a, b) => {
      const comparison = new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime();
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }

  return viewMode === 'list' ? (
    <FileList 
      files={sortedFiles} 
      isSearching={isSearching}
      searchQuery={searchQuery}
    />
  ) : (
    <Box sx={{ p: 2 }}>
      <DocumentGridView files={sortedFiles} />
    </Box>
  );
};

/**
 * 文書管理ページ
 */
export const DocumentManagementPage = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [state, actions] = useDocumentManagementState();
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortAnchorEl, setSortAnchorEl] = useState<null | HTMLElement>(null);
  
  // 検索クエリをURLから初期化
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');
  
  // デバウンス処理 (300ms)
  const [debouncedSearchQuery] = useDebounce(searchInput, 300);
  
  // URLクエリパラメータを更新
  useEffect(() => {
    if (debouncedSearchQuery) {
      setSearchParams({ search: debouncedSearchQuery }, { replace: true });
    } else {
      setSearchParams({}, { replace: true });
    }
  }, [debouncedSearchQuery, setSearchParams]);
  
  const handleCloseUpload = () => {
    setIsUploadOpen(false);
    setUploadFiles([]);
    setUploadError(null);
    setSelectedTags([]);
  };

  const { mutate: uploadFileMutate, isPending: isUploading } = useUploadFiles({
    onSuccess: () => {
      handleCloseUpload();
    },
    onError: (error: Error) => {
      setUploadError(error.message || 'アップロードに失敗しました。');
    },
  });

  const ALLOWED_EXTENSIONS = ['pdf', 'docx', 'xlsx', 'jpg', 'png'];
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  const MAX_FILES = 20;

  const handleOpenUpload = () => {
    setIsUploadOpen(true);
    setUploadFiles([]);
    setUploadError(null);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    setUploadError(null);

    // ファイル個数チェック
    if (uploadFiles.length + files.length > MAX_FILES) {
      setUploadError(`最大${MAX_FILES}ファイルまでアップロード可能です。`);
      return;
    }

    const validFiles: File[] = [];

    for (const file of files) {
      // ファイルサイズチェック
      if (file.size > MAX_FILE_SIZE) {
        setUploadError(`${file.name}: ファイルサイズが大きすぎます。10MB以下のファイルをアップロードしてください。`);
        continue;
      }

      // 拡張子チェック
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      if (!fileExtension || !ALLOWED_EXTENSIONS.includes(fileExtension)) {
        setUploadError(`${file.name}: 対応していない拡張子です。PDF、DOCX、XLSX、JPG、PNGのみアップロード可能です。`);
        continue;
      }

      validFiles.push(file);
    }

    if (validFiles.length > 0) {
      setUploadFiles((prev) => [...prev, ...validFiles]);
    }

    // イベント対象をリセット
    event.target.value = '';
  };

  const handleRemoveFile = (index: number) => {
    setUploadFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = () => {
    if (uploadFiles.length === 0) return;

    // 複数ファイルを順次アップロード
    uploadFiles.forEach((file) => {
      uploadFileMutate(file);
    });

    // アップロード後、ファイルリストをクリア
    setUploadFiles([]);
  };



  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      {/* メイン領域 */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* 検索バー */}
        <Box
          sx={{
            position: 'relative',
            height: '41.333px',
            backgroundColor: '#f9fafb',
            p: '16px 24px',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          {/* 検索入力フィールド */}
          <TextField
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder={t('fileList.search.placeholder')}
            variant="outlined"
            size="small"
            fullWidth
            sx={{
              position: 'absolute',
              left: 0,
              top: 0,
              width: '656px',
              backgroundColor: '#fff',
              '& .MuiOutlinedInput-root': {
                borderRadius: '10px',
                border: '0.667px solid #d1d5dc',
                paddingLeft: '40px',
                height: '41.333px',
                '& fieldset': {
                  border: 'none',
                },
                '&:hover': {
                  borderColor: '#d1d5dc',
                },
              },
              '& .MuiInputBase-input': {
                fontSize: '16px',
                color: '#0a0a0a',
                fontFamily: "'Arimo', 'Noto Sans JP', sans-serif",
                padding: 0,
                '&::placeholder': {
                  color: '#99a1af',
                  opacity: 1,
                },
              },
            }}
            InputProps={{
              startAdornment: (
                <SearchIcon
                  sx={{
                    position: 'absolute',
                    left: '12px',
                    fontSize: '20px',
                    color: '#99a1af',
                  }}
                />
              ),
            }}
          />

          {/* 右側ボタンエリア */}
          <Box
            sx={{
              position: 'absolute',
              right: '24px',
              top: '2.67px',
              display: 'flex',
              gap: '8px',
            }}
          >
            {/* 展開ボタン */}
            <IconButton
              size="small"
              sx={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                p: '8px',
                backgroundColor: 'transparent',
                color: '#0a0a0a',
                '&:hover': {
                  backgroundColor: '#f0f0f0',
                },
              }}
              title="展開"
            >
              <ExpandMoreIcon sx={{ fontSize: '20px' }} />
            </IconButton>

            {/* アップロードボタン */}
            <IconButton
              size="small"
              onClick={handleOpenUpload}
              sx={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                p: '8px',
                backgroundColor: 'transparent',
                color: '#0a0a0a',
                '&:hover': {
                  backgroundColor: '#f0f0f0',
                },
              }}
              title="アップロード"
            >
              <UploadIcon sx={{ fontSize: '20px' }} />
            </IconButton>

            {/* 削除ボタン */}
            <IconButton
              size="small"
              sx={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                p: '8px',
                backgroundColor: 'transparent',
                color: '#0a0a0a',
                '&:hover': {
                  backgroundColor: '#f0f0f0',
                },
              }}
              title="削除"
            >
              <DeleteIcon sx={{ fontSize: '20px' }} />
            </IconButton>

            {/* 設定ボタン */}
            <IconButton
              size="small"
              sx={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                p: '8px',
                backgroundColor: 'transparent',
                color: '#0a0a0a',
                '&:hover': {
                  backgroundColor: '#f0f0f0',
                },
              }}
              title="設定"
            >
              <SettingsIcon sx={{ fontSize: '20px' }} />
            </IconButton>
          </Box>
        </Box>

        {/* フィルタエリア */}
        <Box sx={{ px: 3, py: 2, backgroundColor: '#f9fafb', display: 'flex', gap: 2 }}>
          {/* タグフィルタ */}
          <Paper
            sx={{
              flex: 1,
              p: 2,
              borderRadius: '10px',
              border: '0.667px solid #e5e7eb',
              backgroundColor: '#fff',
              boxShadow: '0px 1px 3px 0px rgba(0,0,0,0.1), 0px 1px 2px -1px rgba(0,0,0,0.1)',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <LocalOfferIcon
                sx={{
                  fontSize: '20px',
                  color: '#364153',
                  mr: 0.5,
                }}
              />
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 600,
                  fontSize: '14px',
                  color: '#364153',
                  m: 0,
                }}
              >
                タグ
              </Typography>
              <Button
                size="small"
                sx={{
                  ml: 'auto',
                  minWidth: 'auto',
                  p: 0.5,
                  backgroundColor: '#eff6ff',
                  borderRadius: '50%',
                  width: '24px',
                  height: '24px',
                  color: '#3b82f6',
                  '&:hover': {
                    backgroundColor: '#e0f2fe',
                  },
                }}
              >
                +
              </Button>
            </Box>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {getAllTags().map((tag) => {
                const isSelected = selectedTags.includes(tag.id);
                return (
                  <Box
                    key={tag.id}
                    onClick={() => {
                      if (isSelected) {
                        setSelectedTags(selectedTags.filter(t => t !== tag.id));
                      } else {
                        setSelectedTags([...selectedTags, tag.id]);
                      }
                    }}
                    sx={{
                      px: 1.667,
                      py: 0.667,
                      borderRadius: '8px',
                      border: `0.667px solid ${tag.backgroundColor}`,
                      backgroundColor: isSelected ? tag.backgroundColor : '#fff',
                      color: isSelected ? tag.color : tag.backgroundColor,
                      fontSize: '12px',
                      fontWeight: 500,
                      cursor: 'pointer',
                      fontFamily: "'Arimo', 'Noto Sans JP', sans-serif",
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        backgroundColor: tag.backgroundColor,
                        color: tag.color,
                      },
                    }}
                  >
                    {tag.name}
                  </Box>
                );
              })}
            </Box>
          </Paper>

          {/* 日付フィルタ */}
          <Paper
            sx={{
              width: '320px',
              p: 2,
              borderRadius: '10px',
              border: '0.667px solid #e5e7eb',
              backgroundColor: '#fff',
              boxShadow: '0px 1px 3px 0px rgba(0,0,0,0.1), 0px 1px 2px -1px rgba(0,0,0,0.1)',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <DateRangeIcon
                sx={{
                  fontSize: '20px',
                  color: '#364153',
                  mr: 0.5,
                }}
              />
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 600,
                  fontSize: '14px',
                  color: '#364153',
                  m: 0,
                }}
              >
                アップロード日時
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                <Typography
                  sx={{
                    fontSize: '12px',
                    minWidth: '48px',
                    color: '#4a5565',
                    fontWeight: 400,
                    m: 0,
                  }}
                >
                  開始日
                </Typography>
                <TextField
                  type="date"
                  size="small"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  variant="outlined"
                  sx={{
                    flex: 1,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '4px',
                      backgroundColor: '#fff',
                    },
                  }}
                  InputLabelProps={{ shrink: true }}
                />
              </Box>
              <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                <Typography
                  sx={{
                    fontSize: '12px',
                    minWidth: '48px',
                    color: '#4a5565',
                    fontWeight: 400,
                    m: 0,
                  }}
                >
                  終了日
                </Typography>
                <TextField
                  type="date"
                  size="small"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  variant="outlined"
                  sx={{
                    flex: 1,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '4px',
                      backgroundColor: '#fff',
                    },
                  }}
                  InputLabelProps={{ shrink: true }}
                />
              </Box>
            </Box>
          </Paper>
        </Box>

        {/* コンテンツ領域 */}
        <Box sx={{ flex: 1, px: 3, py: 2, overflow: 'auto' }}>
          {/* ツールバー */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              mb: 2,
              height: '36px',
            }}
          >
            <Typography
              variant="body2"
              sx={{
                fontSize: '14px',
                color: '#4a5565',
                fontWeight: 400,
                m: 0,
              }}
            >
              20/25 件の文書
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, ml: 'auto', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <Typography
                  sx={{
                    fontSize: '14px',
                    color: '#4a5565',
                    fontWeight: 400,
                    m: 0,
                  }}
                >
                  並び替え:
                </Typography>
                <Button
                  size="small"
                  onClick={(e) => setSortAnchorEl(e.currentTarget)}
                  endIcon={<ExpandMoreIcon />}
                  sx={{
                    textTransform: 'none',
                    borderColor: '#d1d5dc',
                    color: '#0a0a0a',
                    backgroundColor: '#f3f3f5',
                    fontSize: '14px',
                    fontWeight: 400,
                    fontFamily: "'Arimo', 'Noto Sans JP', sans-serif",
                    p: '6px 10px',
                    minWidth: 'auto',
                    '&:hover': {
                      backgroundColor: '#e8e8ea',
                      borderColor: '#d1d5dc',
                    },
                  }}
                  variant="outlined"
                >
                  {state.sortBy === 'uploadedAt' && 'アップロード日時'}
                  {state.sortBy === 'name' && 'ファイル名'}
                  {state.sortBy === 'size' && 'サイズ'}
                </Button>
                <Menu
                  anchorEl={sortAnchorEl}
                  open={Boolean(sortAnchorEl)}
                  onClose={() => setSortAnchorEl(null)}
                >
                  <MenuItem
                    selected={state.sortBy === 'uploadedAt'}
                    onClick={() => {
                      actions.setSortBy('uploadedAt' as any);
                      setSortAnchorEl(null);
                    }}
                  >
                    アップロード日時
                  </MenuItem>
                  <MenuItem
                    selected={state.sortBy === 'name'}
                    onClick={() => {
                      actions.setSortBy('name' as any);
                      setSortAnchorEl(null);
                    }}
                  >
                    ファイル名
                  </MenuItem>
                  <MenuItem
                    selected={state.sortBy === 'size'}
                    onClick={() => {
                      actions.setSortBy('size' as any);
                      setSortAnchorEl(null);
                    }}
                  >
                    サイズ
                  </MenuItem>
                </Menu>
              </Box>
              <Button
                size="small"
                variant="outlined"
                onClick={() => actions.toggleSortOrder()}
                sx={{
                  textTransform: 'none',
                  borderColor: '#d1d5dc',
                  color: '#0a0a0a',
                  backgroundColor: '#fff',
                  fontSize: '14px',
                  fontWeight: 400,
                  fontFamily: "'Arimo', 'Noto Sans JP', sans-serif",
                  p: '6px 10px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  height: '36px',
                  '&:hover': {
                    backgroundColor: '#f0f0f0',
                    borderColor: '#d1d5dc',
                  },
                }}
                title="昇順/降順"
              >
                <SwapVertIcon sx={{ fontSize: '16px' }} />
                {state.sortOrder === 'asc' ? '昇順' : '降順'}
              </Button>
              <Divider
                orientation="vertical"
                sx={{
                  height: '24px',
                  backgroundColor: '#d1d5dc',
                }}
              />
              <Box sx={{ display: 'flex', gap: 0.5 }}>
                <IconButton
                  size="small"
                  sx={{
                    width: '36px',
                    height: '32px',
                    p: '0.667px',
                    backgroundColor:
                      state.viewMode === 'list' ? '#030213' : '#fff',
                    color: state.viewMode === 'list' ? '#fff' : '#0a0a0a',
                    borderRadius: '8px',
                    border:
                      state.viewMode === 'list'
                        ? 'none'
                        : '0.667px solid #d1d5dc',
                    '&:hover': {
                      backgroundColor:
                        state.viewMode === 'list' ? '#030213' : '#f0f0f0',
                    },
                  }}
                  onClick={() => actions.setViewMode('list')}
                >
                  <ViewListIcon sx={{ fontSize: '16px' }} />
                </IconButton>
                <IconButton
                  size="small"
                  sx={{
                    width: '36px',
                    height: '32px',
                    p: '0.667px',
                    backgroundColor:
                      state.viewMode === 'grid' ? '#fff' : 'transparent',
                    color: '#0a0a0a',
                    borderRadius: '8px',
                    border:
                      state.viewMode === 'grid'
                        ? '0.667px solid #d1d5dc'
                        : 'none',
                    '&:hover': {
                      backgroundColor: '#f0f0f0',
                    },
                  }}
                  onClick={() => actions.setViewMode('grid')}
                >
                  <ViewModuleIcon sx={{ fontSize: '16px' }} />
                </IconButton>
              </Box>
            </Box>
          </Box>

          {/* ファイルリスト */}
          <Suspense fallback={<Box sx={{ p: 2 }}>読み込み中...</Box>}>
            <FileListContent 
              viewMode={state.viewMode} 
              searchQuery={debouncedSearchQuery}
              sortBy={state.sortBy}
              sortOrder={state.sortOrder}
              selectedTags={selectedTags}
              startDate={startDate}
              endDate={endDate}
            />
          </Suspense>
        </Box>

        {/* ページネーション */}
        <Box
          sx={{
            p: 2,
            display: 'flex',
            justifyContent: 'center',
            gap: 0.5,
            alignItems: 'center',
          }}
        >
          <Button
            size="small"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            sx={{
              opacity: currentPage === 1 ? 0.5 : 1,
              color: '#0a0a0a',
              textTransform: 'none',
              fontSize: '14px',
              width: '97.917px',
              height: '36px',
              fontFamily: "'Arimo', sans-serif",
              fontWeight: 400,
              backgroundColor: 'transparent',
              cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
            }}
          >
            ← Previous
          </Button>
          {Array.from({ length: 2 }).map((_, i) => (
            <Button
              key={i + 1}
              variant={currentPage === i + 1 ? "contained" : "outlined"}
              size="small"
              onClick={() => setCurrentPage(i + 1)}
              sx={{
                width: '36px',
                height: '36px',
                p: 0,
                backgroundColor: currentPage === i + 1 ? '#0a0a0a' : '#fff',
                borderColor: 'rgba(0,0,0,0.1)',
                color: currentPage === i + 1 ? '#fff' : '#0a0a0a',
                fontSize: '14px',
                fontFamily: "'Arimo', sans-serif",
                fontWeight: 400,
                borderRadius: '8px',
                '&:hover': {
                  backgroundColor: currentPage === i + 1 ? '#333' : '#f0f0f0',
                },
              }}
            >
              {i + 1}
            </Button>
          ))}
          <Button
            size="small"
            onClick={() => setCurrentPage(prev => prev + 1)}
            sx={{
              textTransform: 'none',
              color: '#0a0a0a',
              fontSize: '14px',
              width: '74.25px',
              height: '36px',
              fontFamily: "'Arimo', sans-serif",
              fontWeight: 400,
              backgroundColor: 'transparent',
              cursor: 'pointer',
            }}
          >
            Next →
          </Button>
        </Box>

        {/* アップロードダイアログ */}
        <Dialog 
          open={isUploadOpen} 
          onClose={handleCloseUpload} 
          maxWidth="sm" 
          fullWidth
          PaperProps={{
            sx: {
              backgroundColor: '#ffffff',
              backgroundImage: 'none',
            }
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, borderBottom: '1px solid #e5e7eb' }}>
            <DialogTitle sx={{ p: 0, fontSize: 18, fontWeight: 600, color: '#0a0a0a' }}>文書をアップロード</DialogTitle>
            <IconButton
              onClick={handleCloseUpload}
              sx={{ color: '#0a0a0a', fontSize: 24, fontWeight: 'bold' }}
            >
              ✕
            </IconButton>
          </Box>
          <DialogContent sx={{ pt: 3, pb: 3, backgroundColor: '#ffffff' }}>
            {uploadError && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {uploadError}
              </Alert>
            )}

            {/* ファイル選択エリア */}
            <Box
              component="label"
              sx={{
                display: 'block',
                border: '2px dashed #cbd5e1',
                borderRadius: '12px',
                p: 4,
                textAlign: 'center',
                backgroundColor: '#f8fafc',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                mb: 3,
                outline: 'none',
                '&:hover': {
                  borderColor: '#64748b',
                  backgroundColor: '#f1f5f9',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                },
              }}
            >
              <input
                type="file"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
                accept=".pdf,.docx,.xlsx,.jpg,.png"
                multiple
              />
              <Box sx={{ fontSize: 48, mb: 1, color: '#94a3b8', fontWeight: 300 }}>↑</Box>
              <Typography
                sx={{
                  fontSize: 14,
                  color: '#475569',
                  mb: 0.5,
                  fontWeight: 500,
                }}
              >
                {uploadFiles.length > 0 ? `${uploadFiles.length}個のファイルを選択` : 'ファイルをドラッグ&ドロップ、または'}
              </Typography>
              <Button
                variant="text"
                component="span"
                sx={{
                  textTransform: 'none',
                  color: '#0066cc',
                  fontSize: 14,
                  fontWeight: 600,
                  textDecoration: 'underline',
                  '&:hover': {
                    backgroundColor: 'transparent',
                    color: '#0052a3',
                  },
                }}
              >
                ファイルを選択
              </Button>
              <Typography sx={{ fontSize: 12, color: '#64748b', mt: 1 }}>
                対応形式: PDF, Word, Excel, 画像 (最大10MB、最大20ファイル)
              </Typography>
            </Box>

            {/* 選択されたファイル一覧 */}
            {uploadFiles.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography sx={{ fontSize: 14, fontWeight: 600, mb: 1.5, color: '#0a0a0a' }}>
                  選択されたファイル ({uploadFiles.length})
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {uploadFiles.map((file, index) => (
                    <Box
                      key={`${file.name}-${index}`}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        p: 2,
                        backgroundColor: '#f8fafc',
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0',
                      }}
                    >
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography
                          sx={{
                            fontSize: 14,
                            fontWeight: 500,
                            color: '#1e293b',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {file.name}
                        </Typography>
                        <Typography sx={{ fontSize: 12, color: '#64748b', mt: 0.25 }}>
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1, ml: 2, flexShrink: 0 }}>
                        <IconButton
                          size="small"
                          onClick={() => handleRemoveFile(index)}
                          sx={{
                            color: '#ef4444',
                            '&:hover': {
                              backgroundColor: 'rgba(239, 68, 68, 0.1)',
                            },
                          }}
                        >
                          <Box sx={{ fontSize: 18 }}>✕</Box>
                        </IconButton>
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Box>
            )}
          </DialogContent>

          {/* ボタンエリア */}
          <DialogActions sx={{ p: 2, gap: 1, justifyContent: 'flex-end', borderTop: '1px solid #e5e7eb', backgroundColor: '#ffffff' }}>
            <Button
              onClick={handleCloseUpload}
              sx={{
                textTransform: 'none',
                color: '#0a0a0a',
                fontSize: 14,
                fontWeight: 500,
                borderRadius: '8px',
                px: 3,
                py: 1,
                backgroundColor: '#f5f5f5',
                '&:hover': {
                  backgroundColor: '#e5e5e5',
                },
              }}
            >
              キャンセル
            </Button>
            <Button
              onClick={handleUpload}
              disabled={uploadFiles.length === 0 || isUploading}
              variant="contained"
              sx={{
                textTransform: 'none',
                backgroundColor: uploadFiles.length > 0 && !isUploading ? '#0a0a0a' : '#d1d5dc',
                color: uploadFiles.length > 0 && !isUploading ? '#fff' : '#6b7280',
                fontSize: 14,
                fontWeight: 500,
                borderRadius: '8px',
                px: 3,
                py: 1,
                cursor: uploadFiles.length > 0 && !isUploading ? 'pointer' : 'not-allowed',
                '&:hover': {
                  backgroundColor: uploadFiles.length > 0 && !isUploading ? '#333' : '#d1d5dc',
                },
                '&:disabled': {
                  backgroundColor: '#d1d5dc',
                  color: '#6b7280',
                },
              }}
            >
              {isUploading ? 'アップロード中...' : 'アップロード'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
};

