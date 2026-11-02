import Head from 'expo-router/head';
import { RemindersWeb } from '../../../screens/web/RemindersWeb';

export default function RemindersWebRoute() {
  return (
    <>
      <Head>
        <title>Lembretes · Lumina</title>
      </Head>
      <RemindersWeb />
    </>
  );
}
