import React from 'react';

import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';

interface FileListTableSkeletonProps {
  rows?: number;
}

export const FileListTableSkeleton: React.FC<FileListTableSkeletonProps> = ({ rows = 5 }) => {
  return (
    <Box sx={{ overflowX: 'auto' }}>
      <Table sx={{ minWidth: { xs: 650, md: 'auto' } }}>
        <TableHead
          sx={{
            background: 'linear-gradient(to right, #eff6ff, #eef2ff)',
            borderBottom: '2px solid #bedbff',
          }}
        >
          <TableRow>
            <TableCell sx={{ color: '#1c398e', fontWeight: 'bold' }}>ファイル名</TableCell>
            <TableCell sx={{ color: '#1c398e', fontWeight: 'bold', display: { xs: 'none', sm: 'table-cell' } }}>
              カテゴリー
            </TableCell>
            <TableCell sx={{ color: '#1c398e', fontWeight: 'bold', display: { xs: 'none', md: 'table-cell' } }}>
              サイズ
            </TableCell>
            <TableCell sx={{ color: '#1c398e', fontWeight: 'bold', display: { xs: 'none', lg: 'table-cell' } }}>
              更新日時
            </TableCell>
            <TableCell sx={{ color: '#1c398e', fontWeight: 'bold' }}>操作</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {Array.from({ length: rows }).map((_, index) => (
            <TableRow key={index} sx={{ borderBottom: '1px solid #dbeafe' }}>
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Skeleton variant="rounded" width={36} height={36} />
                  <Skeleton variant="text" width={150} />
                </Box>
              </TableCell>
              <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                <Box sx={{ display: 'flex', gap: 0.75 }}>
                  <Skeleton variant="rounded" width={60} height={21} />
                  <Skeleton variant="rounded" width={50} height={21} />
                </Box>
              </TableCell>
              <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                <Skeleton variant="text" width={60} />
              </TableCell>
              <TableCell sx={{ display: { xs: 'none', lg: 'table-cell' } }}>
                <Skeleton variant="text" width={120} />
              </TableCell>
              <TableCell>
                <Skeleton variant="circular" width={32} height={32} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
};
