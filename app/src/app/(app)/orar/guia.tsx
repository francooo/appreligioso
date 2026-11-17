import Head from 'expo-router/head';
import { GuideWeb } from '../../../screens/main/GuideWeb';

export default function GuideWebRoute() {
  return (
    <>
      <Head>
        <title>Guia espiritual · Lumina</title>
      </Head>
      <GuideWeb />
    </>
  );
}
