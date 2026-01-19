import { renderHook, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { useTagFilter } from '../useTagFilter';

describe('useTagFilter', () => {
  const createWrapper = (initialUrl: string = '/documents') => {
    return ({ children }: { children: React.ReactNode }) => (
      <MemoryRouter initialEntries={[initialUrl]}>{children}</MemoryRouter>
    );
  };

  test('URLのtagIdsクエリを初期状態として読み込む', () => {
    const { result } = renderHook(() => useTagFilter(), {
      wrapper: createWrapper('/documents?tagIds=tag-001&tagIds=tag-002'),
    });

    expect(result.current.selectedTagIds).toEqual(['tag-001', 'tag-002']);
  });

  test('setTagIdsでクエリパラメータが更新され、pageがリセットされる', () => {
    const { result } = renderHook(() => useTagFilter(), {
      wrapper: createWrapper('/documents?page=3'),
    });

    act(() => {
      result.current.setTagIds(['tag-010', 'tag-020']);
    });

    expect(result.current.selectedTagIds).toEqual(['tag-010', 'tag-020']);
  });

  test('toggleTagIdで追加・削除が切り替わる', () => {
    const { result } = renderHook(() => useTagFilter(), {
      wrapper: createWrapper('/documents?tagIds=tag-100'),
    });

    act(() => {
      result.current.toggleTagId('tag-200');
    });
    expect(result.current.selectedTagIds).toEqual(['tag-100', 'tag-200']);

    act(() => {
      result.current.toggleTagId('tag-100');
    });
    expect(result.current.selectedTagIds).toEqual(['tag-200']);
  });

  test('clearTagIdsでクエリから全てのtagIdsが削除される', () => {
    const { result } = renderHook(() => useTagFilter(), {
      wrapper: createWrapper('/documents?tagIds=tag-300&tagIds=tag-400'),
    });

    act(() => {
      result.current.clearTagIds();
    });

    expect(result.current.selectedTagIds).toEqual([]);
  });
});
