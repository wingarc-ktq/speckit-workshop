import { useMemo } from 'react';
import type { ReactElement } from 'react';

import DescriptionIcon from '@mui/icons-material/Description';
import ImageIcon from '@mui/icons-material/Image';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import SlideshowIcon from '@mui/icons-material/Slideshow';
import TableChartIcon from '@mui/icons-material/TableChart';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Checkbox from '@mui/material/Checkbox';
import Grid from '@mui/material/Grid';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';

import type { Document } from '@/domain/models/document';
import { TagChip } from '@/presentations/components/tags/TagChip';
import { highlightMatch } from '@/presentations/utils/highlightMatch';

const PROGRESS_TAG_NAMES = ['完了', '未完了', '進行中'];

interface FileGridViewProps {
  documents: Document[];
  isLoading: boolean;
  searchKeyword?: string;
  onCardClick?: (document: Document) => void;
}

// ファイル拡張子から背景色とアイコンを決定
const getFileTypeInfo = (fileName: string) => {
  const extension = fileName.split('.').pop()?.toLowerCase() || '';
  
  const typeMap: Record<string, { icon: ReactElement; bgColor: string }> = {
    pdf: { icon: <PictureAsPdfIcon sx={{ fontSize: 80, color: '#D32F2F' }} />, bgColor: '#FFE5E5' },
    doc: { icon: <DescriptionIcon sx={{ fontSize: 80, color: '#1976D2' }} />, bgColor: '#E3F2FD' },
    docx: { icon: <DescriptionIcon sx={{ fontSize: 80, color: '#1976D2' }} />, bgColor: '#E3F2FD' },
    ppt: { icon: <SlideshowIcon sx={{ fontSize: 80, color: '#FF9800' }} />, bgColor: '#FFF3E0' },
    pptx: { icon: <SlideshowIcon sx={{ fontSize: 80, color: '#FF9800' }} />, bgColor: '#FFF3E0' },
    xls: { icon: <TableChartIcon sx={{ fontSize: 80, color: '#2E7D32' }} />, bgColor: '#E8F5E9' },
    xlsx: { icon: <TableChartIcon sx={{ fontSize: 80, color: '#2E7D32' }} />, bgColor: '#E8F5E9' },
    jpg: { icon: <ImageIcon sx={{ fontSize: 80, color: '#9C27B0' }} />, bgColor: '#F3E5F5' },
    jpeg: { icon: <ImageIcon sx={{ fontSize: 80, color: '#9C27B0' }} />, bgColor: '#F3E5F5' },
    png: { icon: <ImageIcon sx={{ fontSize: 80, color: '#9C27B0' }} />, bgColor: '#F3E5F5' },
  };

  return typeMap[extension] || { icon: <InsertDriveFileIcon sx={{ fontSize: 80, color: '#757575' }} />, bgColor: '#F5F5F5' };
};

/**
 * FileGridView コンポーネント
 * MUI Grid を使用してドキュメントをカード形式で表示（Figmaデザイン準拠）
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
export function FileGridView({ documents, isLoading, searchKeyword, onCardClick }: FileGridViewProps) {
  // ローディング中のスケルトンカードを生成
  const skeletonCards = useMemo(() => {
    return isLoading ? Array.from({ length: 8 }).map((_, i) => ({ id: `skeleton-${i}` })) : [];
  }, [isLoading]);

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
    });
  };

  if (isLoading && documents.length === 0) {
    return (
      <Grid container spacing={1.5}>
        {skeletonCards.map((card) => (
          <Grid key={card.id} size={{ xs: 6, sm: 6, md: 3 }}>
            <Card>
              <CardContent>
                <Skeleton variant="rectangular" height={120} />
                <Skeleton variant="text" height={30} sx={{ mt: 2 }} />
                <Skeleton variant="text" height={20} />
              </CardContent>
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
    <Grid container spacing={1.5}>
      {documents.map((document) => {
        const { icon, bgColor } = getFileTypeInfo(document.fileName);
        
        return (
          <Grid key={document.id} size={{ xs: 6, sm: 6, md: 3 }}>
            <Card
              sx={{
                position: 'relative',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                '&:hover': {
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                  transform: 'translateY(-2px)',
                },
              }}
              onClick={() => onCardClick?.(document)}
              data-testid={`grid-card-${document.id}`}
            >
              {/* チェックボックス（左上） */}
              <Checkbox
                sx={{
                  position: 'absolute',
                  top: 8,
                  left: 8,
                  zIndex: 1,
                }}
                onClick={(e) => e.stopPropagation()}
                data-testid={`checkbox-${document.id}`}
              />

              <CardContent sx={{ textAlign: 'center', pb: 2 }}>
                {/* ファイルアイコン（背景色付き） */}
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: 140,
                    backgroundColor: bgColor,
                    borderRadius: 1,
                    mb: 2,
                  }}
                >
                  {icon}
                </Box>

                {/* ファイル名 */}
                <Typography
                  variant="body2"
                  sx={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    fontWeight: 500,
                    mb: 1,
                  }}
                  title={document.fileName}
                  dangerouslySetInnerHTML={{
                    __html: searchKeyword ? highlightMatch(document.fileName, searchKeyword) : document.fileName,
                  }}
                />

                {/* タグ */}
                <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', justifyContent: 'center', mb: 1, minHeight: 24 }}>
                  {document.tags.map((tag) => {
                    const isProgress = PROGRESS_TAG_NAMES.includes(tag.name);
                    const tone = isProgress ? 'progress' : 'document';
                    const variant = isProgress ? 'filled' : 'outlined';
                    return (
                      <TagChip
                        key={tag.id}
                        tag={tag}
                        tone={tone}
                        variant={variant}
                        size="small"
                      />
                    );
                  })}
                </Box>

                {/* 日付、ファイルサイズ、アップロードユーザー */}
                <Typography variant="caption" color="textSecondary" sx={{ fontSize: '0.7rem' }}>
                  {formatDate(document.uploadedAt)} • {formatFileSize(document.fileSize)}
                </Typography>
                <Typography variant="caption" color="textSecondary" sx={{ fontSize: '0.7rem', display: 'block', mt: 0.5 }}>
                  {document.uploadedByUserId}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        );
      })}
    </Grid>
  );
}
