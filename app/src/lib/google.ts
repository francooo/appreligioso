import {
  GoogleOneTapSignIn,
  isCancelledResponse,
  isErrorWithCode,
  isSuccessResponse,
  statusCodes,
} from 'react-native-nitro-google-signin';

// Android/iOS: Google via Credential Manager (nitro). A web usa google.web.ts.
const WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ?? '';

let configured = false;

function ensureConfigured() {
  if (configured) return;
  GoogleOneTapSignIn.configure({ webClientId: WEB_CLIENT_ID });
  configured = true;
}

/** Abre o seletor de contas do Google. Retorna o ID token, ou null se o usuário cancelar. */
export async function requestGoogleIdToken(): Promise<string | null> {
  ensureConfigured();
  try {
    await GoogleOneTapSignIn.checkPlayServices();
    const response = await GoogleOneTapSignIn.presentExplicitSignIn();
    if (isCancelledResponse(response)) return null;
    if (isSuccessResponse(response) && response.data.idToken) return response.data.idToken;
    throw new Error('O Google não retornou o token de login.');
  } catch (err) {
    if (isErrorWithCode(err)) {
      if (err.code === statusCodes.SIGN_IN_CANCELLED) return null;
      if (err.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        throw new Error('Atualize o Google Play Services para entrar com Google.');
      }
      if (err.code === statusCodes.DEVELOPER_ERROR) {
        throw new Error('Login com Google mal configurado (SHA-1 / pacote / client ID).');
      }
    }
    throw err;
  }
}

export async function googleSignOut() {
  ensureConfigured();
  await GoogleOneTapSignIn.signOut().catch(() => {});
}
