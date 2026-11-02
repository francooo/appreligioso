import Head from 'expo-router/head';
import { HomeWeb } from '../../screens/web/HomeWeb';

export default function HomeRoute() {
  return (
    <>
      <Head>
        <title>Início · Lumina</title>
      </Head>
      <HomeWeb />
    </>
  );
}
