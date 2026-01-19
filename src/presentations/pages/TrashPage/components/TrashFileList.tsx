import React from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';

import type { TrashFileInfo } from '@/domain/models/files';

interface TrashFileListProps {
  files: TrashFileInfo[];
  isLoading: boolean;
  onRestore: (file: TrashFileInfo) => void;
  onPermanentDelete: (file: TrashFileInfo) => void;
  isDeleting?: boolean;
  isRestoring?: boolean;
}

export const TrashFileList: React.FC<TrashFileListProps> = ({
  files,
  isLoading,
  onRestore,
  onPermanentDelete,
  isDeleting = false,
  isRestoring = false,
}) => {
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
          ゴミ箱にファイルはありません
        </Typography>
      </Box>
    );
  }

  return (
    <Table>
      <TableHead
        sx={{
          background: 'linear-gradient(to right, #eff6ff, #eef2ff)',
          borderBottom: '2px solid #bedbff',
        }}
      >
        <TableRow>
          <TableCell sx={{ color: '#1c398e', fontWeight: 'bold', fontSize: 14 }}>
            ファイル名
          </TableCell>
          <TableCell sx={{ color: '#1c398e', fontWeight: 'bold', fontSize: 14 }}>
            削除日時
          </TableCell>
          <TableCell sx={{ color: '#1c398e', fontWeight: 'bold', fontSize: 14 }}>
            操作
          </TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {files.map((file) => (
          <TableRow key={file.id} sx={{ borderBottom: '1px solid #dbeafe' }}>
            <TableCell>
              <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#101828' }}>
                {file.name}
              </Typography>
            </TableCell>
            <TableCell>
              <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#364153' }}>
                {new Date(file.deletedAt).toLocaleString('ja-JP', {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Typography>
            </TableCell>
            <TableCell>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => onRestore(file)}
                  disabled={isRestoring || isDeleting}
                >
                  復元
                </Button>
                <Button
                  size="small"
                  variant="contained"
                  color="error"
                  onClick={() => onPermanentDelete(file)}
                  disabled={isDeleting}
                >
                  完全削除
                </Button>
              </Box>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
