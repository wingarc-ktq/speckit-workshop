import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

interface DateRangeFilterProps {
  startDate?: string;
  endDate?: string;
  onStartDateChange?: (date: string) => void;
  onEndDateChange?: (date: string) => void;
}

/**
 * DateRangeFilter コンポーネント
 * 日付範囲の選択フィルターを提供
 *
 * @component
 * @example
 * ```tsx
 * <DateRangeFilter
 *   startDate="2024-01-01"
 *   endDate="2024-12-31"
 *   onStartDateChange={handleStartDate}
 *   onEndDateChange={handleEndDate}
 * />
 * ```
 */
export function DateRangeFilter({
  startDate = '',
  endDate = '',
  onStartDateChange,
  onEndDateChange,
}: DateRangeFilterProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        gap: 2,
        alignItems: 'center',
        padding: '12px',
        backgroundColor: '#fafafa',
        borderRadius: 1,
        border: '1px solid #e0e0e0',
      }}
      data-testid="date-range-filter"
    >
      <Typography variant="subtitle2" sx={{ fontWeight: 600, minWidth: '80px' }}>
        日付範囲
      </Typography>
      <TextField
        type="date"
        size="small"
        value={startDate}
        onChange={(e) => onStartDateChange?.(e.target.value)}
        InputLabelProps={{ shrink: true }}
        inputProps={{ 'data-testid': 'start-date-input' }}
        sx={{ width: '140px' }}
      />
      <Typography sx={{ color: '#999' }}>〜</Typography>
      <TextField
        type="date"
        size="small"
        value={endDate}
        onChange={(e) => onEndDateChange?.(e.target.value)}
        InputLabelProps={{ shrink: true }}
        inputProps={{ 'data-testid': 'end-date-input' }}
        sx={{ width: '140px' }}
      />
    </Box>
  );
}
