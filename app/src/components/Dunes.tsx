import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Path, Stop } from 'react-native-svg';

export function Dunes({ height = 110 }: { height?: number }) {
  return (
    <View style={[styles.wrap, { height }]} pointerEvents="none">
      <Svg width="100%" height={height} viewBox="0 0 400 140" preserveAspectRatio="none">
        <Defs>
          <LinearGradient id="sun" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#FBD9A8" stopOpacity="0.9" />
            <Stop offset="1" stopColor="#FBE7CC" stopOpacity="0.4" />
          </LinearGradient>
        </Defs>
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
