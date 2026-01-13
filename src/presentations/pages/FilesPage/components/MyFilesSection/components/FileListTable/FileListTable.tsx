import React, { useCallback } from 'react';

import DescriptionIcon from '@mui/icons-material/Description';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import {
  DataGrid,
  type GridColDef,
  type GridPaginationModel,
  type GridRowId,
  type GridRowSelectionModel,
} from '@mui/x-data-grid';
import { format } from 'date-fns';

import type { DocumentFile } from '@/domain/models/file';
import { TagChips } from '@/presentations/components/tags/TagChips/TagChips';
import { useTags } from '@/presentations/hooks/queries/tags/useTags';
import { formatFileSize } from '@/presentations/utils/fileFormatters';

interface FileListTableProps {
  files: DocumentFile[];
  total: number;
  paginationModel: GridPaginationModel;
  selectedFileIds?: string[];
  loading?: boolean;
  onPaginationModelChange: (model: GridPaginationModel) => void;
  onSelectionChange?: (fileIds: string[]) => void;
}

export const FileListTable: React.FC<FileListTableProps> = ({
  files,
  total,
  paginationModel,
  selectedFileIds = [],
  loading = false,
  onPaginationModelChange,
  onSelectionChange,
}) => {
  const { data: tags } = useTags();

  // Convert string[] to GridRowSelectionModel
  const rowSelectionModel: GridRowSelectionModel = React.useMemo(
    () => ({
      type: 'include',
      ids: new Set<GridRowId>(selectedFileIds),
    }),
    [selectedFileIds]
  );

  const getFileTags = useCallback(
    (tagIds: string[]) => {
      if (!Array.isArray(tagIds)) return [];
      return tags.filter((tag) => tagIds.includes(tag.id));
    },
    [tags]
  );

  const columns: GridColDef<DocumentFile>[] = React.useMemo(
    () => [
      {
        field: 'name',
        headerName: 'Name',
        flex: 1,
        minWidth: 300,
        renderCell: (params) => (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar sx={{ width: 32, height: 32, bgcolor: 'info.main' }}>
              <DescriptionIcon sx={{ fontSize: 24 }} />
            </Avatar>
            <Typography variant="body2">{params.value}</Typography>
          </Box>
        ),
      },
      {
        field: 'tagIds',
        headerName: 'Tags',
        flex: 1,
        minWidth: 200,
        sortable: false,
        renderCell: (params) => (
          <TagChips tags={getFileTags(params.value)} size="small" />
        ),
      },
      {
        field: 'uploadedAt',
        headerName: 'Last Modified',
        flex: 1,
        minWidth: 200,
        renderCell: (params) => (
          <Typography variant="body2" color="text.secondary">
            {format(params.value, 'yyyy/MM/dd HH:mm')}
          </Typography>
        ),
      },
      {
        field: 'size',
        headerName: 'File Size',
        flex: 1,
        minWidth: 150,
        renderCell: (params) => (
          <Typography variant="body2" color="text.secondary">
            {formatFileSize(params.value)}
          </Typography>
        ),
      },
    ],
    [getFileTags]
  );

  const handleRowSelectionModelChange = useCallback(
    (newSelection: GridRowSelectionModel) => {
      // Convert GridRowSelectionModel to string[]
      const selectedIds = Array.from(newSelection.ids) as string[];
      onSelectionChange?.(selectedIds);
    },
    [onSelectionChange]
  );

  return (
    <DataGrid
      rows={files}
      columns={columns}
      paginationMode="server"
      paginationModel={paginationModel}
      onPaginationModelChange={onPaginationModelChange}
      rowCount={total}
      rowSelectionModel={rowSelectionModel}
      onRowSelectionModelChange={handleRowSelectionModelChange}
      loading={loading}
      checkboxSelection
      disableRowSelectionOnClick
      pageSizeOptions={[5, 10, 25]}
      sx={{
        '& .MuiDataGrid-cell': {
          display: 'flex',
          alignItems: 'center',
        },
        '& .MuiDataGrid-columnHeader': {
          display: 'flex',
          alignItems: 'center',
        },
      }}
    />
  );
};
