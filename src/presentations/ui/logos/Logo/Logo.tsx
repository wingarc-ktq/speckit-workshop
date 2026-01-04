import React from 'react';

import Box from '@mui/material/Box';

import type { SxProps, Theme } from '@mui/material/styles';

interface LogoProps {
  /**
   * ロゴのサイズ（幅と高さ）
   */
  size?: number;
  /**
   * 追加のスタイル
   */
  sx?: SxProps<Theme>;
}

/**
 * アプリケーションのロゴコンポーネント
 * ファビコンと同じSVGアイコンを使用
 */
export const Logo: React.FC<LogoProps> = ({ size = 32, sx }) => {
  return (
    <Box
      component="svg"
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      sx={sx}
    >
      <defs>
        <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop
            offset="0%"
            style={{ stopColor: '#1976d2', stopOpacity: 0.9 }}
          />
          <stop
            offset="50%"
            style={{ stopColor: '#42a5f5', stopOpacity: 0.7 }}
          />
          <stop
            offset="100%"
            style={{ stopColor: '#0d47a1', stopOpacity: 0.9 }}
          />
        </linearGradient>
      </defs>

      {/* Main circular background with subtle gradient */}
      <circle cx="16" cy="16" r="16" fill="url(#bgGradient)" />

      {/* Simple white code symbol */}
      <g transform="translate(16, 16)">
        <text
          x="0"
          y="5"
          fontFamily="monospace"
          fontSize="14"
          fontWeight="bold"
          fill="white"
          textAnchor="middle"
          transform="scale(1, 1.3)"
        >
          &lt;/&gt;
        </text>
      </g>
    </Box>
  );
};
