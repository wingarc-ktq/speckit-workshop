import { useRef } from 'react';

import { render, fireEvent } from '@testing-library/react';

import { ResizableLayout, type ResizableLayoutRef } from '../ResizableLayout';

// ウィンドウサイズをvi.stubGlobalでモック
const mockWindowSize = (width: number, height: number) => {
  vi.stubGlobal('innerWidth', width);
  vi.stubGlobal('innerHeight', height);
};

const TestWrapper = () => {
  const ref = useRef<ResizableLayoutRef>(null);

  const handleToggle = () => {
    ref.current?.toggleDrawer();
  };

  return (
    <div>
      <button data-testid="toggleButton" onClick={handleToggle}>
        Toggle
      </button>
      <ResizableLayout
        ref={ref}
        sidebarContent={<div data-testid="sidebarContent">Sidebar</div>}
      >
        <div data-testid="mainContent">Main Content</div>
      </ResizableLayout>
    </div>
  );
};

describe('ResizableLayout', () => {
  beforeEach(() => {
    // デフォルトのウィンドウサイズを設定
    mockWindowSize(1024, 768);
  });

  afterEach(() => {
    // マウスイベントのクリーンアップ
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  });

  test('基本的なレンダリングが正しく行われる', () => {
    const r = render(<TestWrapper />);

    expect(r.getByTestId('sidebarContent')).toBeInTheDocument();
    expect(r.getByTestId('mainContent')).toBeInTheDocument();
    expect(r.getByTestId('resizeHandle')).toBeInTheDocument();
  });

  test('refを通してdrawerのtoggleができる', () => {
    const r = render(<TestWrapper />);

    // 初期状態ではサイドバーが表示されている
    expect(r.getByTestId('sidebarContent')).toBeInTheDocument();
    expect(r.getByTestId('resizeHandle')).toBeInTheDocument();

    // toggleボタンをクリック
    fireEvent.click(r.getByTestId('toggleButton'));

    // ResizeHandleが非表示になることを確認
    expect(r.queryByTestId('resizeHandle')).not.toBeInTheDocument();

    // toggleボタンを再度クリック
    fireEvent.click(r.getByTestId('toggleButton'));

    // ResizeHandleが再表示されることを確認
    expect(r.getByTestId('resizeHandle')).toBeInTheDocument();
  });

  describe('リサイズハンドル', () => {
    test('ドラッグ操作中にスタイルが適用される', () => {
      const r = render(<TestWrapper />);

      const resizeHandle = r.getByTestId('resizeHandle');

      // マウスダウンでドラッグ開始
      fireEvent.mouseDown(resizeHandle, { clientX: 240 });

      // bodyのスタイルが設定されることを確認
      expect(document.body.style.cursor).toBe('col-resize');
      expect(document.body.style.userSelect).toBe('none');

      // マウス移動（ドラッグ）
      fireEvent.mouseMove(document, { clientX: 300 });

      // マウスアップでドラッグ終了
      fireEvent.mouseUp(document);

      // bodyのスタイルがリセットされることを確認
      expect(document.body.style.cursor).toBe('');
      expect(document.body.style.userSelect).toBe('');
    });
    test('ドラッグ操作をしてもsidebarとmainが表示されている', () => {
      const r = render(<TestWrapper />);

      const resizeHandle = r.getByTestId('resizeHandle');

      // マウスダウンでドラッグ開始
      fireEvent.mouseDown(resizeHandle, { clientX: 240 });

      // マウス移動（ドラッグ）
      fireEvent.mouseMove(document, { clientX: 300 });

      // sidebarとmainが表示されていることを確認
      expect(r.getByTestId('sidebarContent')).toBeInTheDocument();
      expect(r.getByTestId('mainContent')).toBeInTheDocument();

      // マウスアップでドラッグ終了
      fireEvent.mouseUp(document);

      // sidebarとmainが表示されていることを再確認
      expect(r.getByTestId('sidebarContent')).toBeInTheDocument();
      expect(r.getByTestId('mainContent')).toBeInTheDocument();
    });
  });
});
