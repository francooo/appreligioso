import { useState } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import Svg, { Defs, Ellipse, LinearGradient, RadialGradient, Rect, Stop } from 'react-native-svg';
import { colors } from '../theme';

type Props = {
  /** Altura da área de dunas (px ou %). Fica presa à base do container pai. */
  height?: number | `${number}%`;
  style?: StyleProp<ViewStyle>;
  /** Mantido por compatibilidade com o layout de login anterior. */
  variant?: 'mobile' | 'wide';
};

// Dunas ao amanhecer (LuminaDunes): três elipses de areia, sol suave e degradê creme no topo.
export function Dunes({ height = '44%', style }: Props) {
  const [box, setBox] = useState({ w: 0, h: 0 });
  const { w, h } = box;

  // Converte as caixas CSS (left/bottom/width/height em %) do design em elipses SVG.
  const ellipse = (left: number, bottom: number, width: number, hh: number) => ({
    cx: (left + width / 2) * w,
    cy: h - (bottom + hh / 2) * h,
    rx: (width / 2) * w,
    ry: (hh / 2) * h,
  });
  const sunR = (0.24 * w) / 2;

  return (
    <View
      pointerEvents="none"
      style={[styles.wrap, { height }, style]}
      onLayout={(e) => setBox({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })}
    >
      {w > 0 && (
        <Svg width={w} height={h}>
          <Defs>
            <RadialGradient id="dunesSun" cx="50%" cy="50%" r="50%">
              <Stop offset="0" stopColor={colors.sunSoft} />
              <Stop offset="0.78" stopColor="#F6DDBB" />
              <Stop offset="1" stopColor="#F6DDBB" stopOpacity="0" />
            </RadialGradient>
            <LinearGradient id="dunesFade" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={colors.background} />
              <Stop offset="1" stopColor={colors.background} stopOpacity="0" />
            </LinearGradient>
          </Defs>
          <Ellipse
            cx={0.36 * w + sunR}
            cy={h - 0.28 * h - sunR}
            rx={sunR}
            ry={sunR}
            fill="url(#dunesSun)"
          />
          <Ellipse {...ellipse(-0.3, -0.45, 1.05, 0.95)} fill={colors.dune1} opacity={0.9} />
          <Ellipse {...ellipse(0.35, -0.6, 1, 1)} fill={colors.dune2} opacity={0.75} />
          <Ellipse {...ellipse(-0.15, -0.78, 0.85, 1)} fill={colors.dune3} opacity={0.6} />
          <Rect x={0} y={0} width={w} height={h * 0.4} fill="url(#dunesFade)" />
        </Svg>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 0, right: 0, bottom: 0, overflow: 'hidden' },
});
