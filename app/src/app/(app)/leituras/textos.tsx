import Head from 'expo-router/head';
import { TextsWeb } from '../../../screens/web/TextsWeb';

export default function TextsWebRoute() {
  return (
    <>
      <Head>
        <title>Textos sagrados · Lumina</title>
      </Head>
      <TextsWeb />
    </>
  );
}
