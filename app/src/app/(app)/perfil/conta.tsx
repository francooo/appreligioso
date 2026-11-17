import Head from 'expo-router/head';
import { AccountWeb } from '../../../screens/main/AccountWeb';

export default function ContaRoute() {
  return (
    <>
      <Head>
        <title>Conta e configurações · Lumina</title>
      </Head>
      <AccountWeb />
    </>
  );
}
