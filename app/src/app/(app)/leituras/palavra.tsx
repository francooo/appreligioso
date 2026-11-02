import Head from 'expo-router/head';
import { WordWeb } from '../../../screens/web/WordWeb';

export default function WordWebRoute() {
  return (
    <>
      <Head>
        <title>Palavra diária · Lumina</title>
      </Head>
      <WordWeb />
    </>
  );
}
