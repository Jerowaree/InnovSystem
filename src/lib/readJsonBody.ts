interface ReadJsonBodySuccess<T> {
  ok: true;
  data: T;
  error: null;
}

interface ReadJsonBodyFailure {
  ok: false;
  data: null;
  error: string;
}

export async function readJsonBody<T>(
  request: Request,
  fallbackMessage = "No pudimos leer los datos enviados. Recarga la pagina y vuelve a intentarlo."
): Promise<ReadJsonBodySuccess<T> | ReadJsonBodyFailure> {
  try {
    const data = (await request.json()) as T;
    return {
      ok: true,
      data,
      error: null,
    };
  } catch {
    return {
      ok: false,
      data: null,
      error: fallbackMessage,
    };
  }
}
