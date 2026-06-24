import * as yup from "yup";

export const sireSalesProposalSchema = yup
  .object({
    periodo: yup
      .string()
      .trim()
      .required("Selecciona un periodo")
      .matches(/^\d{6}$/, "El periodo debe tener el formato AAAAMM"),
    fileType: yup
      .string()
      .required("Selecciona el tipo de archivo")
      .oneOf(["0", "1"], "El tipo de archivo no es válido"),
    ticketNumber: yup.string().trim().default(""),
  })
  .required();

export type SireSalesWorkflowFormValues = yup.InferType<
  typeof sireSalesProposalSchema
>;
