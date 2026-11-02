import Svg, { Circle, Polygon } from 'react-native-svg';
import { colors } from '../theme';

// Sol do Lumina (LuminaSun do design system): 24 raios em cunha + círculo vazado.
const RAYS = 24;
const RAY_DEG = 2.2;

export function SunLogo({ size = 96, color = colors.gold }: { size?: number; color?: string }) {
  const c = size / 2;
  const inner = size * 0.3;
  const outer = size * 0.485;
  const core = size * 0.23;
  const stroke = Math.max(1.5, size * 0.018);

  const point = (deg: number, r: number) => {
    const a = ((deg - 90) * Math.PI) / 180;
    return `${c + Math.cos(a) * r},${c + Math.sin(a) * r}`;
  };

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {Array.from({ length: RAYS }, (_, i) => {
        const start = i * (360 / RAYS);
        const end = start + RAY_DEG;
        return (
          <Polygon
            key={i}
            points={`${point(start, inner)} ${point(start, outer)} ${point(end, outer)} ${point(end, inner)}`}
            fill={color}
          />
        );
      })}
      <Circle cx={c} cy={c} r={core} stroke={color} strokeWidth={stroke} fill="none" />
    </Svg>
  );
}
