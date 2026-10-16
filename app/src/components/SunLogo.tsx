import Svg, { Circle, Line } from 'react-native-svg';
import { colors } from '../theme';

const RAYS = 20;

export function SunLogo({ size = 96 }: { size?: number }) {
  const c = size / 2;
  const core = size * 0.24;
  const inner = size * 0.32;

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <Circle cx={c} cy={c} r={core} stroke={colors.gold} strokeWidth={1.6} fill="none" />
      {Array.from({ length: RAYS }, (_, i) => {
        const angle = (i / RAYS) * Math.PI * 2;
        const outer = i % 2 === 0 ? size * 0.48 : size * 0.42;
        return (
          <Line
            key={i}
            x1={c + Math.cos(angle) * inner}
            y1={c + Math.sin(angle) * inner}
            x2={c + Math.cos(angle) * outer}
            y2={c + Math.sin(angle) * outer}
            stroke={colors.gold}
            strokeWidth={1.4}
            strokeLinecap="round"
          />
        );
      })}
    </Svg>
  );
}
