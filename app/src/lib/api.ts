const API_URL = process.env.EXPO_PUBLIC_API_URL;

export async function checkApiDatabase() {
  if (!API_URL) {
    console.warn('EXPO_PUBLIC_API_URL não definida — pulando health check.');
    return;
  }
  try {
    const res = await fetch(`${API_URL}/api/health/db`);
    const body = await res.json();
    console.log(body.ok ? 'Banco conectado:' : 'Falha no banco:', body);
  } catch (err) {
    console.warn('API indisponível:', err);
  }
}
