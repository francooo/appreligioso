import Head from 'expo-router/head';
import { PrayersWeb } from '../../../screens/web/PrayersWeb';

export default function PrayersWebRoute() {
  return (
    <>
      <Head>
        <title>Orações · Lumina</title>
      </Head>
      <PrayersWeb />
    </>
  );
}
