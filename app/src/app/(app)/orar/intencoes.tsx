import Head from 'expo-router/head';
import { IntentionsWeb } from '../../../screens/web/IntentionsWeb';

export default function IntentionsWebRoute() {
  return (
    <>
      <Head>
        <title>Intenções · Lumina</title>
      </Head>
      <IntentionsWeb />
    </>
  );
}
