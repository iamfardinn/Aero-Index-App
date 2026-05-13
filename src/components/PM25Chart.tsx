import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Canvas, Path, Circle, LinearGradient, vec, Skia } from '@shopify/react-native-skia';
import { useSharedValue, withTiming, Easing } from 'react-native-reanimated';
import { COLORS, chartData } from '../data';

const CHART_H = 180;
const PAD_H = 12;
const PAD_V = 16;
const DATA_MIN = 138;
const DATA_MAX = 200;

// Pick 5 evenly-spaced labels for X-axis
const LABEL_INDICES = [0, 7, 14, 21, 29];

interface Props { width: number }

export function PM25Chart({ width }: Props) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(1, { duration: 1800, easing: Easing.out(Easing.cubic) });
  }, []);

  const pts = useMemo(() => {
    const w = width - PAD_H * 2;
    const h = CHART_H - PAD_V * 2;
    return chartData.map((p, i) => ({
      x: PAD_H + (i / (chartData.length - 1)) * w,
      y: PAD_V + (1 - (p.pm25 - DATA_MIN) / (DATA_MAX - DATA_MIN)) * h,
      ...p,
    }));
  }, [width]);

  const { linePath, areaPath, peakPt } = useMemo(() => {
    const line = Skia.Path.Make();
    const area = Skia.Path.Make();
    const bottom = CHART_H - PAD_V;

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

  return (
    <View style={styles.wrapper}>
      <Text style={styles.title}>PM2.5 · 30-Minute Trend</Text>

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
        <Circle cx={peakPt.x} cy={peakPt.y} r={6} color={COLORS.spike} />
        <Circle cx={peakPt.x} cy={peakPt.y} r={3} color={COLORS.white} />
      </Canvas>

      {/* X-axis labels */}
      <View style={[styles.xAxis, { width }]}>
        {LABEL_INDICES.map(i => {
          const p = pts[i];
          return p ? (
            <Text key={i} style={[styles.xLabel, { left: p.x - 16 }]}>
              {chartData[i].time}
            </Text>
          ) : null;
        })}
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
