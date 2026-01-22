import { render, screen } from '@testing-library/react';

import { FileUploadProgress } from '../FileUploadProgress';

describe('FileUploadProgress', () => {
  test('アップロード中の状態が正しく表示されること', () => {
    render(
      <FileUploadProgress
        fileName="test.pdf"
        progress={50}
        status="uploading"
      />
    );

    expect(screen.getByText('test.pdf')).toBeInTheDocument();
    expect(screen.getByText('50%')).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  test('成功状態の場合にチェックアイコンが表示されること', () => {
    render(
      <FileUploadProgress
        fileName="test.pdf"
        progress={100}
        status="success"
      />
    );

    expect(screen.getByText('test.pdf')).toBeInTheDocument();
    expect(screen.getByTestId('CheckCircleIcon')).toBeInTheDocument();
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
  });

  test('エラー状態の場合にエラーアイコンとメッセージが表示されること', () => {
    const errorMessage = 'アップロードに失敗しました';
    render(
      <FileUploadProgress
        fileName="test.pdf"
        progress={0}
        status="error"
        error={errorMessage}
      />
    );

    expect(screen.getByText('test.pdf')).toBeInTheDocument();
    expect(screen.getByTestId('ErrorIcon')).toBeInTheDocument();
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
  });

  test('エラー状態でエラーメッセージがない場合はメッセージが表示されないこと', () => {
    render(
      <FileUploadProgress
        fileName="test.pdf"
        progress={0}
        status="error"
      />
    );

    expect(screen.getByTestId('ErrorIcon')).toBeInTheDocument();
    expect(screen.queryByText('アップロードに失敗しました')).not.toBeInTheDocument();
  });
});
