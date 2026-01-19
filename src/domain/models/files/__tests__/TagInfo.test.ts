import { describe, expect, it } from 'vitest';

import { getTagColor, TAG_COLOR_PALETTE, type TagColor, type TagInfo } from '../TagInfo';

describe('TagInfo', () => {
  describe('TagInfo型', () => {
    it('should define TagInfo interface correctly', () => {
      const tagInfo: TagInfo = {
        id: 'tag-001',
        name: '重要',
        color: 'red',
        createdAt: '2026-01-19T10:00:00Z',
        updatedAt: '2026-01-19T10:00:00Z',
      };

      expect(tagInfo.id).toBe('tag-001');
      expect(tagInfo.name).toBe('重要');
      expect(tagInfo.color).toBe('red');
    });
  });

  describe('TagColor型', () => {
    it('should accept valid tag colors', () => {
      const colors: TagColor[] = ['blue', 'red', 'yellow', 'green', 'purple', 'orange', 'gray'];
      expect(colors).toHaveLength(7);
    });
  });

  describe('TAG_COLOR_PALETTE', () => {
    it('should have all color definitions', () => {
      const colors: TagColor[] = ['blue', 'red', 'yellow', 'green', 'purple', 'orange', 'gray'];

      colors.forEach((color) => {
        expect(TAG_COLOR_PALETTE[color]).toBeDefined();
        expect(TAG_COLOR_PALETTE[color].light).toBeTruthy();
        expect(TAG_COLOR_PALETTE[color].main).toBeTruthy();
        expect(TAG_COLOR_PALETTE[color].dark).toBeTruthy();
      });
    });

    it('should have correct blue color', () => {
      expect(TAG_COLOR_PALETTE.blue).toEqual({
        light: '#64b5f6',
        main: '#2196f3',
        dark: '#1976d2',
      });
    });

    it('should have correct red color', () => {
      expect(TAG_COLOR_PALETTE.red).toEqual({
        light: '#e57373',
        main: '#f44336',
        dark: '#d32f2f',
      });
    });

    it('should have correct green color', () => {
      expect(TAG_COLOR_PALETTE.green).toEqual({
        light: '#81c784',
        main: '#4caf50',
        dark: '#388e3c',
      });
    });
  });

  describe('getTagColor', () => {
    it('should return blue color palette', () => {
      const color = getTagColor('blue');
      expect(color).toEqual({
        light: '#64b5f6',
        main: '#2196f3',
        dark: '#1976d2',
      });
    });

    it('should return red color palette', () => {
      const color = getTagColor('red');
      expect(color).toEqual({
        light: '#e57373',
        main: '#f44336',
        dark: '#d32f2f',
      });
    });

    it('should return yellow color palette', () => {
      const color = getTagColor('yellow');
      expect(color).toEqual({
        light: '#fff176',
        main: '#ffeb3b',
        dark: '#fbc02d',
      });
    });

    it('should return green color palette', () => {
      const color = getTagColor('green');
      expect(color).toEqual({
        light: '#81c784',
        main: '#4caf50',
        dark: '#388e3c',
      });
    });

    it('should return purple color palette', () => {
      const color = getTagColor('purple');
      expect(color).toEqual({
        light: '#ba68c8',
        main: '#9c27b0',
        dark: '#7b1fa2',
      });
    });

    it('should return orange color palette', () => {
      const color = getTagColor('orange');
      expect(color).toEqual({
        light: '#ffb74d',
        main: '#ff9800',
        dark: '#f57c00',
      });
    });

    it('should return gray color palette', () => {
      const color = getTagColor('gray');
      expect(color).toEqual({
        light: '#bdbdbd',
        main: '#9e9e9e',
        dark: '#616161',
      });
    });
  });
});
