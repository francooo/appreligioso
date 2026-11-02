import Head from 'expo-router/head';
import { PlansWeb } from '../../../screens/web/PlansWeb';

export default function PlansWebRoute() {
  return (
    <>
      <Head>
        <title>Planos de leitura · Lumina</title>
      </Head>
      <PlansWeb />
    </>
  );
}
