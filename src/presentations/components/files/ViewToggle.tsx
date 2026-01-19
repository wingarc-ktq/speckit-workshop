import { ToggleButton, ToggleButtonGroup, Box, Tooltip } from '@mui/material';
import {
  ViewWeek as ViewListIcon,
  ViewAgenda as ViewGridIcon,
} from '@mui/icons-material';

interface ViewToggleProps {
  currentView: 'list' | 'grid';
  onViewChange: (view: 'list' | 'grid') => void;
}

/**
 * ViewToggle コンポーネント
 * リスト表示とグリッド表示を切り替える
 *
 * @component
 * @example
 * ```tsx
 * <ViewToggle
 *   currentView="list"
 *   onViewChange={handleViewChange}
 * />
 * ```
 */
export function ViewToggle({ currentView, onViewChange }: ViewToggleProps) {
  const handleChange = (_event: React.MouseEvent<HTMLElement>, newView: string) => {
    if (newView && (newView === 'list' || newView === 'grid')) {
      onViewChange(newView);
      // localStorage に保存
      localStorage.setItem('documentViewPreference', newView);
    }
  };

  return (
    <Box sx={{ display: 'flex', gap: 1 }}>
      <ToggleButtonGroup
        value={currentView}
        exclusive
        onChange={handleChange}
        aria-label="表示形式"
      >
        <Tooltip title="リスト表示">
          <ToggleButton value="list" aria-label="list view" data-testid="view-toggle-list">
            <ViewListIcon />
          </ToggleButton>
        </Tooltip>
        <Tooltip title="グリッド表示">
          <ToggleButton value="grid" aria-label="grid view" data-testid="view-toggle-grid">
            <ViewGridIcon />
          </ToggleButton>
        </Tooltip>
      </ToggleButtonGroup>
    </Box>
  );
}
