import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Path, Stop } from 'react-native-svg';

type Props = {
  height?: number;
  variant?: 'mobile' | 'wide';
};

function SunGradient() {
  return (
    <Defs>
      <LinearGradient id="sun" x1="0" y1="0" x2="0" y2="1">
        <Stop offset="0" stopColor="#FBD9A8" stopOpacity="0.9" />
        <Stop offset="1" stopColor="#FBE7CC" stopOpacity="0.4" />
      </LinearGradient>
    </Defs>
  );
}

export function Dunes({ height = 110, variant = 'mobile' }: Props) {
  if (variant === 'wide') {
    return (
      <View style={[styles.wrap, { height }]} pointerEvents="none">
        <Svg width="100%" height={height} viewBox="0 0 1440 340" preserveAspectRatio="xMinYMax slice">
          <SunGradient />
          <Path d="M0 120 C 200 60, 420 90, 620 140 S 1060 70, 1440 110 L 1440 340 L 0 340 Z" fill="#F2E3CE" opacity={0.8} />
          <Circle cx="420" cy="205" r="115" fill="url(#sun)" />
          <Path d="M0 190 C 260 130, 520 210, 800 180 S 1200 150, 1440 200 L 1440 340 L 0 340 Z" fill="#EFDCC3" />
          <Path d="M0 260 C 300 220, 560 280, 880 250 S 1260 230, 1440 270 L 1440 340 L 0 340 Z" fill="#F6EBDC" />
        </Svg>
      </View>
    );
  }

  return (
    <View style={[styles.wrap, { height }]} pointerEvents="none">
      <Svg width="100%" height={height} viewBox="0 0 400 140" preserveAspectRatio="none">
        <SunGradient />
        <Circle cx="205" cy="55" r="40" fill="url(#sun)" />
        <Path d="M0 40 C 60 20, 120 30, 180 50 S 300 30, 400 45 L 400 140 L 0 140 Z" fill="#F2E3CE" opacity={0.8} />
        <Path d="M0 65 C 80 45, 150 70, 230 60 S 340 50, 400 70 L 400 140 L 0 140 Z" fill="#EFDCC3" />
        <Path d="M0 90 C 90 75, 170 95, 260 85 S 360 80, 400 92 L 400 140 L 0 140 Z" fill="#F6EBDC" />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 0, right: 0, bottom: 0 },
});
