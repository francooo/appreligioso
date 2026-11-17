import Head from 'expo-router/head';
import { PrayersWeb } from '../../../screens/main/PrayersWeb';

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
