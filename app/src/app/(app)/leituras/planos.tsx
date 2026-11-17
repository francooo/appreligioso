import Head from 'expo-router/head';
import { PlansWeb } from '../../../screens/main/PlansWeb';

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
