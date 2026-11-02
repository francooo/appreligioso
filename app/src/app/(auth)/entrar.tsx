import Head from 'expo-router/head';
import { LoginScreen } from '../../screens/LoginScreen';

export default function EntrarRoute() {
  return (
    <>
      <Head>
        <title>Entrar · Lumina</title>
      </Head>
      <LoginScreen />
    </>
  );
}
