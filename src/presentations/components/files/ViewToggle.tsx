import ViewAgendaIcon from '@mui/icons-material/ViewAgenda';
import ViewWeekIcon from '@mui/icons-material/ViewWeek';
import Box from '@mui/material/Box';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Tooltip from '@mui/material/Tooltip';

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
            <ViewWeekIcon />
          </ToggleButton>
        </Tooltip>
        <Tooltip title="グリッド表示">
          <ToggleButton value="grid" aria-label="grid view" data-testid="view-toggle-grid">
            <ViewAgendaIcon />
          </ToggleButton>
        </Tooltip>
      </ToggleButtonGroup>
    </Box>
  );
}
