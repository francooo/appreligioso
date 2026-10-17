import { useWindowDimensions } from 'react-native';
import { LoginDesktopLayout } from './LoginDesktopLayout';
import { LoginMobileLayout } from './LoginMobileLayout';

const DESKTOP_MIN_WIDTH = 1024;

export function LoginScreen() {
  const { width } = useWindowDimensions();
  return width >= DESKTOP_MIN_WIDTH ? <LoginDesktopLayout /> : <LoginMobileLayout />;
}
