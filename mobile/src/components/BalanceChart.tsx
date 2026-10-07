import { useState } from 'react';
import { View } from 'react-native';
import Svg, { Circle, Line, Path } from 'react-native-svg';
import { brand, useTheme } from '@/theme/ThemeContext';

export interface ChartPoint {
  x: number;
  y: number;
}

/** Year balance line: solid for what already happened, dashed teal for the projection. */
export function BalanceChart({
  past,
  future,
  todayX,
  todayY,
  height = 160,
}: {
  past: ChartPoint[];
  future: ChartPoint[];
  todayX: number | null;
  todayY: number | null;
  height?: number;
}) {
  const { colors } = useTheme();
  const [width, setWidth] = useState(0);

  const all = [...past, ...future];
  if (all.length < 2) return null;

  const pad = 8;
  const minX = Math.min(...all.map((p) => p.x));
  const maxX = Math.max(...all.map((p) => p.x));
  const rawMin = Math.min(...all.map((p) => p.y), 0);
  const rawMax = Math.max(...all.map((p) => p.y), 0);
  const span = rawMax - rawMin || 1;

  const sx = (x: number) => pad + ((x - minX) / (maxX - minX || 1)) * (width - pad * 2);
  const sy = (y: number) => pad + (1 - (y - rawMin) / span) * (height - pad * 2);
  const toPath = (pts: ChartPoint[]) => pts.map((p, i) => `${i ? 'L' : 'M'}${sx(p.x).toFixed(1)},${sy(p.y).toFixed(1)}`).join(' ');

  return (
    <View onLayout={(e) => setWidth(e.nativeEvent.layout.width)} style={{ height }}>
      {width > 0 && (
        <Svg width={width} height={height}>
          <Line x1={pad} x2={width - pad} y1={sy(0)} y2={sy(0)} stroke={colors.divider} strokeWidth={1} strokeDasharray="3 4" />
          {past.length > 1 && <Path d={toPath(past)} stroke={brand.blue} strokeWidth={2.5} fill="none" strokeLinejoin="round" strokeLinecap="round" />}
          {future.length > 1 && (
            <Path d={toPath(future)} stroke={brand.teal} strokeWidth={2.5} fill="none" strokeDasharray="6 5" strokeLinejoin="round" strokeLinecap="round" />
          )}
          {todayX !== null && todayY !== null && (
            <>
              <Circle cx={sx(todayX)} cy={sy(todayY)} r={9} fill={brand.blue} opacity={0.2} />
              <Circle cx={sx(todayX)} cy={sy(todayY)} r={4.5} fill={brand.blue} stroke={colors.page} strokeWidth={2} />
            </>
          )}
        </Svg>
      )}
    </View>
  );
}
