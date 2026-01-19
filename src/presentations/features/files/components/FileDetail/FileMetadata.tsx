import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import type { FileInfo } from '@/adapters/generated/files';
import { formatFileSize } from '@/domain/models/files/FileInfo';
import { useTags } from '@/presentations/hooks/queries/useTags';

interface FileMetadataProps {
  file: FileInfo;
}

/**
 * ファイルのメタデータ表示コンポーネント
 */
export const FileMetadata = ({ file }: FileMetadataProps) => {
  const { data: tags } = useTags();

  // ファイルに紐づくタグ情報を取得
  const fileTags = tags?.tags?.filter((tag) => file.tagIds.includes(tag.id)) ?? [];

  // 日時フォーマット
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <Stack spacing={3} sx={{ p: 3 }}>
      {/* ファイル名 */}
      <Box>
        <Typography variant="caption" color="text.secondary" gutterBottom>
          ファイル名
        </Typography>
        <Typography variant="body1">{file.name}</Typography>
      </Box>

      {/* ファイルサイズ */}
      <Box>
        <Typography variant="caption" color="text.secondary" gutterBottom>
          サイズ
        </Typography>
        <Typography variant="body1">{formatFileSize(file.size)}</Typography>
      </Box>

      {/* MIMEタイプ */}
      <Box>
        <Typography variant="caption" color="text.secondary" gutterBottom>
          ファイル形式
        </Typography>
        <Typography variant="body1">{file.mimeType}</Typography>
      </Box>

      {/* アップロード日時 */}
      <Box>
        <Typography variant="caption" color="text.secondary" gutterBottom>
          アップロード日時
        </Typography>
        <Typography variant="body1">{formatDate(file.uploadedAt)}</Typography>
      </Box>

      {/* 説明 */}
      {file.description && (
        <Box>
          <Typography variant="caption" color="text.secondary" gutterBottom>
            説明
          </Typography>
          <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
            {file.description}
          </Typography>
        </Box>
      )}

      {/* タグ */}
      {fileTags.length > 0 && (
        <Box>
          <Typography variant="caption" color="text.secondary" gutterBottom>
            タグ
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {fileTags.map((tag) => (
              <Chip
                key={tag.id}
                label={tag.name}
                size="small"
                sx={{
                  bgcolor: `${tag.color}.100`,
                  color: `${tag.color}.800`,
                }}
              />
            ))}
          </Stack>
        </Box>
      )}
    </Stack>
  );
};
