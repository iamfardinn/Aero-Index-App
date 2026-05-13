// ─── Design Tokens ────────────────────────────────────────────────────────────

export const COLORS = {
  spike: '#6E1A37',
  spikeLight: '#6E1A3710',
  spikeBorder: '#6E1A3730',
  sky500: '#0ea5e9',
  sky900: '#0c4a6e',
  sky400: '#38bdf8',
  sky100: '#e0f2fe',
  slate700: '#334155',
  slate600: '#475569',
  slate500: '#64748b',
  slate400: '#94a3b8',
  slate300: '#cbd5e1',
  slate100: '#f1f5f9',
  emerald50: '#ecfdf5',
  emerald200: '#a7f3d0',
  emerald400: '#34d399',
  emerald500: '#10b981',
  emerald600: '#059669',
  white: '#ffffff',
};

export const FONTS = {
  spaceGrotesk: 'SpaceGrotesk_700Bold',
  spaceGroteskBlack: 'SpaceGrotesk_700Bold',
};

// ─── Chart Data ───────────────────────────────────────────────────────────────

export type ChartPoint = { time: string; pm25: number };

export function buildChartData(): ChartPoint[] {
  const noise = [2, -3, 4, -2, 5, -4, 3, 1, -5, 4, -1, 3, -4, 6, -2, 3, -3, 2, 4, -3, 5, -1, 3, -2, 2];
  const base = 150;
  const points: ChartPoint[] = noise.map((n, i) => {
    const d = new Date(2026, 3, 29, 23, 20 + Math.floor(i * 0.48));
    return {
      time: `${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`,
      pm25: base + n,
    };
  });
  [156, 165, 175, 184, 190].forEach((v, i) => {
    const d = new Date(2026, 3, 29, 23, 32 + i * 4);
    points.push({ time: `${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`, pm25: v });
  });
  return points;
}

export const chartData = buildChartData();

// ─── History ──────────────────────────────────────────────────────────────────

export type HistoryEntry = {
  id: number;
  time: string;
  source: string;
  delta: number;
  level: string;
  color: string;
};

export const historyLog: HistoryEntry[] = [
  { id: 1, time: 'Today · 23:50',     source: 'Heavy traffic / construction dust', delta: 40, level: 'Hazardous',      color: COLORS.spike },
  { id: 2, time: 'Today · 20:12',     source: 'Evening vehicle emissions',          delta: 28, level: 'Very Unhealthy', color: COLORS.spike },
  { id: 3, time: 'Today · 16:45',     source: 'Burning waste / biomass',            delta: 35, level: 'Hazardous',      color: COLORS.spike },
  { id: 4, time: 'Today · 11:23',     source: 'Industrial emissions (upwind)',       delta: 22, level: 'Very Unhealthy', color: COLORS.spike },
  { id: 5, time: 'Yesterday · 19:04', source: 'Diesel generator cluster',            delta: 31, level: 'Hazardous',      color: COLORS.spike },
];
