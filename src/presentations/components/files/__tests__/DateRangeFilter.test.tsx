import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import { DateRangeFilter } from '../DateRangeFilter';

const renderComponent = (props?: Partial<React.ComponentProps<typeof DateRangeFilter>>) => {
  return render(
    <DateRangeFilter
      startDate=""
      endDate=""
      onStartDateChange={props?.onStartDateChange}
      onEndDateChange={props?.onEndDateChange}
    />
  );
};

test('日付範囲フィルターが表示され、入力の初期値が空であること', () => {
  renderComponent();

  expect(screen.getByText('日付範囲')).toBeInTheDocument();
  expect(screen.getByTestId('start-date-input')).toHaveValue('');
  expect(screen.getByTestId('end-date-input')).toHaveValue('');
});

test('開始日と終了日を入力するとハンドラーが呼び出されること', async () => {
  const onStartDateChange = vi.fn();
  const onEndDateChange = vi.fn();
  const user = userEvent.setup();

  renderComponent({ onStartDateChange, onEndDateChange });

  const startInput = screen.getByTestId('start-date-input');
  const endInput = screen.getByTestId('end-date-input');

  await user.type(startInput, '2024-01-15');
  await user.type(endInput, '2024-02-01');

  expect(onStartDateChange).toHaveBeenLastCalledWith('2024-01-15');
  expect(onEndDateChange).toHaveBeenLastCalledWith('2024-02-01');
});
