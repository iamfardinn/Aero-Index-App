import React, { useEffect, useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Canvas, Path, Circle, LinearGradient, vec, Skia } from '@shopify/react-native-skia';
import { useSharedValue, withTiming, Easing } from 'react-native-reanimated';
import { COLORS } from '../data';
import { SensorPayload } from '../services/useBLE';

const CHART_H = 180;
const PAD_H = 12;
const PAD_V = 16;

interface Props {
  width: number;
  history: SensorPayload[];  // live rolling buffer from BLE
}

export function PM25Chart({ width, history }: Props) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = 0;
    progress.value = withTiming(1, { duration: 1200, easing: Easing.out(Easing.cubic) });
  }, [history.length]);

  const pts = useMemo(() => {
    if (history.length < 2) return [];
    const values = history.map(h => h.pm25);
    const minVal = Math.min(...values);
    const maxVal = Math.max(...values);
    const range = maxVal - minVal || 1;
    const w = width - PAD_H * 2;
    const h = CHART_H - PAD_V * 2;
    return history.map((p, i) => ({
      x: PAD_H + (i / (history.length - 1)) * w,
      y: PAD_V + (1 - (p.pm25 - minVal) / range) * h,
      pm25: p.pm25,
      index: i,
    }));
  }, [history, width]);

  const { linePath, areaPath, peakPt } = useMemo(() => {
    const line = Skia.Path.Make();
    const area = Skia.Path.Make();
    const bottom = CHART_H - PAD_V;

    if (pts.length < 2) return { linePath: line, areaPath: area, peakPt: null };

    pts.forEach((p, i) => {
      if (i === 0) { line.moveTo(p.x, p.y); area.moveTo(p.x, bottom); }
      line.lineTo(p.x, p.y);
      area.lineTo(p.x, p.y);
    });
    area.lineTo(pts[pts.length - 1].x, bottom);
    area.close();

    const peak = pts.reduce((a, b) => (b.pm25 > a.pm25 ? b : a));
    return { linePath: line, areaPath: area, peakPt: peak };
  }, [pts]);

  if (pts.length < 2) return null;

  return (
    <View style={styles.wrapper}>
      <Text style={styles.title}>PM2.5 · Live Trend ({history.length} readings)</Text>

      {/* Chart canvas */}
      <Canvas style={{ width, height: CHART_H }}>
        {/* Gradient fill */}
        <Path path={areaPath} style="fill" opacity={0.18}>
          <LinearGradient
            start={vec(0, 0)} end={vec(0, CHART_H)}
            colors={[COLORS.sky500, COLORS.sky100 + '00']}
          />
        </Path>

        {/* Line */}
        <Path
          path={linePath}
          style="stroke"
          strokeWidth={2.5}
          strokeCap="round"
          strokeJoin="round"
          color={COLORS.sky500}
          start={0}
          end={progress}
        />

        {/* Peak spike dot */}
        {peakPt && (
          <>
            <Circle cx={peakPt.x} cy={peakPt.y} r={6} color={COLORS.spike} />
            <Circle cx={peakPt.x} cy={peakPt.y} r={3} color={COLORS.white} />
          </>
        )}
      </Canvas>

      {/* X-axis: show first and last reading index */}
      <View style={[styles.xAxis, { width }]}>
        <Text style={[styles.xLabel, { left: PAD_H }]}>
          #{1}
        </Text>
        <Text style={[styles.xLabel, { left: width - PAD_H - 32 }]}>
          #{history.length}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    paddingTop: 16,
    paddingBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 14,
    elevation: 3,
  },
  title: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.slate400,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    paddingHorizontal: PAD_H + 8,
    marginBottom: 8,
  },
  xAxis: { position: 'relative', height: 20, marginTop: 4 },
  xLabel: {
    position: 'absolute',
    fontSize: 9,
    color: COLORS.slate400,
    fontWeight: '600',
    width: 32,
    textAlign: 'center',
  },
});
