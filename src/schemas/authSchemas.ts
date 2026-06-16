import * as yup from "yup";

export const loginSchema = yup
  .object({
    email: yup
      .string()
      .required("El correo es obligatorio")
      .email("Correo no válido"),
    password: yup
      .string()
      .required("La contraseña es obligatoria")
      .min(8, "Mínimo 8 caracteres"),
  })
  .required();

export const registerSchema = yup
  .object({
    name: yup
      .string()
      .required("El nombre es obligatorio")
      .min(2, "Nombre muy corto"),
    companyName: yup
      .string()
      .required("El nombre de la empresa es obligatorio")
      .min(2, "Nombre de empresa muy corto"),
    email: yup
      .string()
      .required("El correo es obligatorio")
      .email("Correo no válido"),
    password: yup
      .string()
      .required("La contraseña es obligatoria")
      .min(8, "Mínimo 8 caracteres"),
    confirm: yup
      .string()
      .oneOf([yup.ref("password")], "Las contraseñas no coinciden")
      .required("Confirmar contraseña es obligatorio"),
    ruc: yup
      .string()
      .required("RUC es obligatorio")
      .matches(/^\d{11}$/, "RUC debe tener 11 dígitos"),
    accepted: yup
      .boolean()
      .oneOf([true], "Debes aceptar los términos")
      .required(),
  })
  .required();

export const forgotPasswordSchema = yup
  .object({
    email: yup
      .string()
      .required("El correo es obligatorio")
      .email("Correo no válido"),
  })
  .required();

export type LoginFormValues = yup.InferType<typeof loginSchema>;
export type RegisterFormValues = yup.InferType<typeof registerSchema>;
export type ForgotPasswordFormValues = yup.InferType<
  typeof forgotPasswordSchema
>;
