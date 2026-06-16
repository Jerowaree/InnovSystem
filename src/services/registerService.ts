export type RegisterPayload = {
  name: string;
  companyName: string;
  email: string;
  password: string;
  ruc: string;
};

export async function registerUser(payload: RegisterPayload) {
  const response = await fetch("/api/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    return {
      data: null,
      error: new Error(data.error || "Error al registrar usuario"),
    };
  }

  return { data, error: null };
}
