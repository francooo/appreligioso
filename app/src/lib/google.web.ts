// Web: Google Identity Services (script oficial do Google, botão "Continuar com o Google").
const WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ?? '';
const GSI_SRC = 'https://accounts.google.com/gsi/client';

type CredentialResponse = { credential?: string };

type GoogleId = {
  initialize(config: {
    client_id: string;
    callback: (response: CredentialResponse) => void;
    ux_mode?: 'popup' | 'redirect';
    auto_select?: boolean;
  }): void;
  renderButton(parent: HTMLElement, options: Record<string, unknown>): void;
  disableAutoSelect(): void;
};

declare global {
  interface Window {
    google?: { accounts: { id: GoogleId } };
  }
}

let scriptPromise: Promise<GoogleId> | null = null;

function loadGoogleIdentity(): Promise<GoogleId> {
  if (window.google?.accounts?.id) return Promise.resolve(window.google.accounts.id);
  scriptPromise ??= new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = GSI_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () =>
      window.google?.accounts?.id
        ? resolve(window.google.accounts.id)
        : reject(new Error('Google Identity Services indisponível.'));
    script.onerror = () => {
      scriptPromise = null;
      reject(new Error('Não foi possível carregar o login do Google.'));
    };
    document.head.appendChild(script);
  });
  return scriptPromise;
}

/** Desenha o botão oficial do Google dentro de `container` e chama `onIdToken` após o login. */
export async function renderGoogleButton(
  container: HTMLElement,
  width: number,
  onIdToken: (idToken: string) => void
) {
  const gsi = await loadGoogleIdentity();
  gsi.initialize({
    client_id: WEB_CLIENT_ID,
    ux_mode: 'popup',
    callback: ({ credential }) => credential && onIdToken(credential),
  });
  container.innerHTML = '';
  gsi.renderButton(container, {
    type: 'standard',
    theme: 'outline',
    size: 'large',
    text: 'continue_with',
    shape: 'rectangular',
    logo_alignment: 'center',
    locale: 'pt-BR',
    width: Math.min(400, Math.round(width)),
  });
}

export async function googleSignOut() {
  window.google?.accounts?.id?.disableAutoSelect();
}
