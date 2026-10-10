import { useMemo, useRef, useState } from 'react';
import { View } from 'react-native';
import Svg, { Circle, Defs, Line, LinearGradient, Path, Stop, Text as SvgText } from 'react-native-svg';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import { useTranslation } from 'react-i18next';
import { Txt } from '@/ui';
import { formatCurrency } from '@/utils/currency';
import type { BalanceDay, Currency, Language } from '@/types';
import { brand, fonts, useTheme } from '@/theme/ThemeContext';

const GUTTER = 44; // room for the y-axis labels on the left
const TOP = 12;
const BOTTOM = 22; // room for the day labels

/** "R$ 4,4 mil" / "$4.4k": axis labels have to fit in the gutter, the tooltip shows the exact value. */
function compactMoney(v: number, currency: Currency | undefined, language: Language | undefined): string {
  const abs = Math.abs(v);
  if (abs < 1000) return formatCurrency(Math.round(v), currency, language).replace(/[,.]00$/, '');
  const thousands = (abs / 1000).toFixed(abs < 10000 ? 1 : 0).replace(/\.0$/, '');
  const sign = v < 0 ? '−' : '';
  if (language === 'EnUS') return `${sign}${thousands}k`;
  return `${sign}${thousands.replace('.', ',')} mil`;
}

/** Two or three round values spanning [min, max], always including 0 when the range crosses it. */
function ticks(min: number, max: number): number[] {
  const span = max - min || 1;
  const raw = span / 2;
  const mag = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => s >= raw) ?? raw;
  const lo = Math.floor(min / step) * step;
  const hi = Math.ceil(max / step) * step;
  const out: number[] = [];
  for (let v = lo; v <= hi + step / 2; v += step) out.push(Math.round(v * 100) / 100);
  return out;
}

/**
 * The selected month's running balance: solid line for days that already happened, dashed for the
 * projection, a light wash under the realised part. Drag across it to read any day.
 */
export function BalanceChart({
  days,
  month,
  year,
  currency,
  language,
  height = 190,
  onSelect,
}: {
  days: BalanceDay[];
  month: number;
  year: number;
  currency?: Currency;
  language?: Language;
  height?: number;
  /** Scrubbed day (or null when released), so the screen can show it in its headline number. */
  onSelect?: (day: BalanceDay | null) => void;
}) {
  const { t, i18n } = useTranslation();
  const { colors } = useTheme();
  const [width, setWidth] = useState(0);
  const [active, setActiveState] = useState<number | null>(null);
  // Gesture callbacks can outlive a render, so they read the selection from a ref, never a stale closure.
  const activeRef = useRef<number | null>(null);
  const setActive = (i: number | null) => {
    activeRef.current = i;
    setActiveState(i);
    onSelect?.(i === null ? null : days[i]);
  };

  // One hue for the whole series; realised vs projected is told apart by the dash, not the colour.
  const line = colors.mode === 'dark' ? brand.blue : brand.blueAction;

  const geo = useMemo(() => {
    if (days.length < 2 || width === 0) return null;
    const values = days.map((d) => d.balance);
    const yTicks = ticks(Math.min(...values, 0), Math.max(...values, 0));
    const yMin = yTicks[0];
    const yMax = yTicks[yTicks.length - 1];
    const plotW = width - GUTTER - 4;
    const plotH = height - TOP - BOTTOM;
    const sx = (i: number) => GUTTER + (i / (days.length - 1)) * plotW;
    const sy = (v: number) => TOP + (1 - (v - yMin) / (yMax - yMin || 1)) * plotH;
    const pts = days.map((d, i) => ({ x: sx(i), y: sy(d.balance), d }));

    const lastReal = days.reduce((acc, d, i) => (d.isProjected ? acc : i), -1);
    const path = (from: number, to: number) =>
      pts
        .slice(from, to + 1)
        .map((p, i) => `${i ? 'L' : 'M'}${p.x.toFixed(1)},${p.y.toFixed(1)}`)
        .join(' ');
    const realPath = lastReal >= 1 ? path(0, lastReal) : '';
    const futurePath = lastReal < days.length - 1 ? path(Math.max(lastReal, 0), days.length - 1) : '';
    const base = sy(Math.max(yMin, Math.min(0, yMax)));
    const area = lastReal >= 1 ? `${realPath} L${pts[lastReal].x.toFixed(1)},${base} L${pts[0].x.toFixed(1)},${base} Z` : '';

    return { pts, yTicks, sy, realPath, futurePath, area, lastReal, plotW };
  }, [days, width, height]);

  const money = (v: number) => formatCurrency(v, currency, language);
  const pick = (x: number) => {
    if (!geo) return;
    const i = Math.round(((x - GUTTER) / geo.plotW) * (days.length - 1));
    const clamped = Math.max(0, Math.min(days.length - 1, i));
    if (clamped === activeRef.current) return;
    Haptics.selectionAsync().catch(() => {});
    setActive(clamped);
  };

  // Horizontal drag scrubs; a vertical drag fails fast so the screen still scrolls.
  const pan = Gesture.Pan()
    .runOnJS(true)
    .activeOffsetX([-6, 6])
    .failOffsetY([-12, 12])
    .onStart((e) => pick(e.x))
    .onUpdate((e) => pick(e.x))
    .onEnd(() => setActive(null));
  const tap = Gesture.Tap()
    .runOnJS(true)
    .onEnd((e) => (activeRef.current !== null ? setActive(null) : pick(e.x)));
  const gesture = Gesture.Exclusive(pan, tap);

  if (days.length < 2) return null;

  const today = days.findIndex((d) => d.isToday);
  const sel = active !== null && geo ? geo.pts[active] : null;
  const dateLabel = (day: number) =>
    new Intl.DateTimeFormat(i18n.language, { day: 'numeric', month: 'short' }).format(new Date(year, month - 1, day));
  const xLabels = [0, Math.floor((days.length - 1) / 2), days.length - 1];

  return (
    <View>
      <GestureDetector gesture={gesture}>
        <View
          onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
          style={{ height }}
          accessible
          accessibilityRole="image"
          accessibilityLabel={t('balances.chartA11y', {
            start: money(days[0].balance),
            end: money(days[days.length - 1].balance),
          })}
        >
          {geo && (
            <Svg width={width} height={height}>
              <Defs>
                <LinearGradient id="wash" x1="0" y1="0" x2="0" y2="1">
                  <Stop offset="0" stopColor={line} stopOpacity={0.22} />
                  <Stop offset="1" stopColor={line} stopOpacity={0.02} />
                </LinearGradient>
              </Defs>

              {/* Recessive grid: solid hairlines, zero a step stronger. */}
              {geo.yTicks.map((v) => (
                <Line
                  key={v}
                  x1={GUTTER}
                  x2={width - 4}
                  y1={geo.sy(v)}
                  y2={geo.sy(v)}
                  stroke={v === 0 ? colors.textDisabled : colors.divider}
                  strokeWidth={v === 0 ? 1 : 0.5}
                />
              ))}
              {geo.yTicks.map((v) => (
                <SvgText key={`l${v}`} x={GUTTER - 6} y={geo.sy(v) + 3.5} fontSize={10} fontFamily={fonts.body} fill={colors.textSecondary} textAnchor="end">
                  {compactMoney(v, currency, language)}
                </SvgText>
              ))}
              {xLabels.map((i, k) => (
                <SvgText
                  key={`x${i}`}
                  x={geo.pts[i].x}
                  y={height - 6}
                  fontSize={10}
                  fontFamily={fonts.body}
                  fill={colors.textSecondary}
                  textAnchor={k === 0 ? 'start' : k === xLabels.length - 1 ? 'end' : 'middle'}
                >
                  {days[i].day}
                </SvgText>
              ))}

              {geo.area ? <Path d={geo.area} fill="url(#wash)" /> : null}
              {geo.realPath ? <Path d={geo.realPath} stroke={line} strokeWidth={2} fill="none" strokeLinejoin="round" strokeLinecap="round" /> : null}
              {geo.futurePath ? (
                <Path d={geo.futurePath} stroke={line} strokeOpacity={0.6} strokeWidth={2} fill="none" strokeDasharray="5 5" strokeLinejoin="round" strokeLinecap="round" />
              ) : null}

              {today >= 0 && !sel && (
                <>
                  <Circle cx={geo.pts[today].x} cy={geo.pts[today].y} r={9} fill={line} opacity={0.18} />
                  <Circle cx={geo.pts[today].x} cy={geo.pts[today].y} r={4.5} fill={line} stroke={colors.page} strokeWidth={2} />
                </>
              )}

              {sel && (
                <>
                  <Line x1={sel.x} x2={sel.x} y1={TOP} y2={height - BOTTOM} stroke={colors.textSecondary} strokeWidth={1} />
                  <Circle cx={sel.x} cy={sel.y} r={5} fill={line} stroke={colors.page} strokeWidth={2} />
                </>
              )}
            </Svg>
          )}

        </View>
      </GestureDetector>

      {/* Line keys (not boxes) for the two strokes, plus how to read a day. */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, marginTop: 6 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <View style={{ width: 16, height: 2, borderRadius: 1, backgroundColor: line }} />
          <Txt variant="caption" muted>
            {t('balances.chartPast')}
          </Txt>
        </View>
        {geo?.futurePath ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <View style={{ flexDirection: 'row', gap: 3 }}>
              {[0, 1, 2].map((k) => (
                <View key={k} style={{ width: 4, height: 2, borderRadius: 1, backgroundColor: line, opacity: 0.6 }} />
              ))}
            </View>
            <Txt variant="caption" muted>
              {t('balances.chartFuture')}
            </Txt>
          </View>
        ) : null}
        <Txt variant="caption" muted={!sel} style={{ marginLeft: 'auto', fontFamily: sel ? fonts.bold : fonts.body }}>
          {sel ? `${dateLabel(sel.d.day)}${sel.d.isProjected ? ` · ${t('balances.legendProjected')}` : ''}` : t('balances.chartScrubHint')}
        </Txt>
      </View>
    </View>
  );
}
