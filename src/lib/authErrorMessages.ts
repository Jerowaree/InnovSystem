export function getAuthErrorMessage(message?: string | null) {
  if (!message) {
    return "Ocurrió un error de autenticación. Intenta nuevamente.";
  }

  const normalizedMessage = message.toLowerCase();

  if (normalizedMessage.includes("invalid login credentials")) {
    return "Correo o contraseña incorrectos.";
  }

  if (normalizedMessage.includes("email not confirmed")) {
    return "Debes confirmar tu correo electrónico antes de iniciar sesión.";
  }

  if (normalizedMessage.includes("user already registered")) {
    return "Este correo ya se encuentra registrado.";
  }

  if (normalizedMessage.includes("password should be at least")) {
    return "La contraseña no cumple con el mínimo de seguridad requerido.";
  }

  if (normalizedMessage.includes("signup is disabled")) {
    return "El registro de usuarios no está disponible en este momento.";
  }

  return "No pudimos completar la autenticación.";
}
