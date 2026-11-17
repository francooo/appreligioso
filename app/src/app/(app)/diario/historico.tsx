import Head from 'expo-router/head';
import { HistoryWeb } from '../../../screens/main/HistoryWeb';

export default function HistoryWebRoute() {
  return (
    <>
      <Head>
        <title>Histórico · Lumina</title>
      </Head>
      <HistoryWeb />
    </>
  );
}
