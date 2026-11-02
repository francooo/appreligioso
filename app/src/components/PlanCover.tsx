import { useState } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import Svg, { Line } from 'react-native-svg';
import { colors } from '../theme';
import { SunLogo } from './SunLogo';

// Capa de plano: listras diagonais em areia (como no mockup) com o sol ao centro.
export function PlanCover({ style }: { style?: StyleProp<ViewStyle> }) {
  const [box, setBox] = useState({ w: 0, h: 0 });
  const step = 22;
  const lines = box.w ? Math.ceil((box.w + box.h) / step) + 1 : 0;

  return (
    <View style={[styles.cover, style]} onLayout={(e) => setBox({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })}>
      {box.w > 0 && (
        <Svg width={box.w} height={box.h} style={StyleSheet.absoluteFill}>
          {Array.from({ length: lines }, (_, i) => {
            const x = i * step - box.h;
            return <Line key={i} x1={x} y1={box.h} x2={x + box.h} y2={0} stroke="#EFE0CB" strokeWidth={9} />;
          })}
        </Svg>
      )}
      <SunLogo size={34} color={colors.goldLight} />
    </View>
  );
}

const styles = StyleSheet.create({
  cover: {
    backgroundColor: '#F6EADB',
    borderRadius: 10,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
