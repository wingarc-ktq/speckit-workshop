import React from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';

import type { FileInfo } from '@/adapters/generated/files';
import { formatFileSize } from '@/domain/models/files/FileInfo';
import { TAG_COLOR_PALETTE } from '@/domain/models/files/TagInfo';
import { FileIcon } from '@/presentations/components';
import { useTags } from '@/presentations/hooks/queries/useTags';

interface FileListItemProps {
  file: FileInfo;
  onFileClick?: (fileId: string) => void;
}

export const FileListItem: React.FC<FileListItemProps> = ({ file, onFileClick }) => {
  const { data: tagsData } = useTags();
  const tags = tagsData?.tags ?? [];

  // タグIDから実際のタグ情報を取得
  const fileTags = file.tagIds
    .map((tagId) => tags.find((tag) => tag.id === tagId))
    .filter((tag): tag is NonNullable<typeof tag> => tag !== undefined);

  return (
    <Card
      elevation={0}
      onClick={() => onFileClick?.(file.id)}
      sx={{
        border: '2px solid',
        borderColor: '#ffd6a7',
        borderRadius: 2,
        bgcolor: 'white',
        height: '100%',
        transition: 'all 0.2s',
        cursor: onFileClick ? 'pointer' : 'default',
        '&:hover': {
          borderColor: '#ff9800',
          boxShadow: '0 4px 12px rgba(255, 152, 0, 0.15)',
        },
      }}
    >
      <CardContent sx={{ p: 2.5 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* ファイルアイコン */}
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <FileIcon size={48} />
          </Box>

          {/* ファイル名 */}
          <Typography
            variant="h6"
            sx={{
              fontWeight: 'bold',
              fontSize: '1rem',
              color: '#101828',
              textAlign: 'center',
              wordBreak: 'break-word',
              minHeight: '3rem',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {file.name}
          </Typography>

          {/* ファイルサイズ */}
          <Typography
            variant="body2"
            sx={{
              color: '#6b7280',
              textAlign: 'center',
              fontWeight: 600,
            }}
          >
            {formatFileSize(file.size)}
          </Typography>

          {/* タグ */}
          {fileTags.length > 0 && (
            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', justifyContent: 'center' }}>
              {fileTags.slice(0, 3).map((tag) => {
                const palette = TAG_COLOR_PALETTE[tag.color];
                return (
                  <Chip
                    key={tag.id}
                    label={tag.name}
                    size="small"
                    sx={{
                      bgcolor: palette.main,
                      color: 'white',
                      fontWeight: 'bold',
                      fontSize: 11,
                      height: 20,
                    }}
                  />
                );
              })}
              {fileTags.length > 3 && (
                <Chip
                  label={`+${fileTags.length - 3}`}
                  size="small"
                  sx={{
                    bgcolor: '#f3f4f6',
                    color: '#6b7280',
                    fontWeight: 'bold',
                    fontSize: 11,
                    height: 20,
                  }}
                />
              )}
            </Box>
          )}

          {/* 更新日時 */}
          <Typography
            variant="caption"
            sx={{
              color: '#9ca3af',
              textAlign: 'center',
              fontSize: '0.75rem',
            }}
          >
            {new Date(file.uploadedAt).toLocaleDateString('ja-JP', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
            })}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};
