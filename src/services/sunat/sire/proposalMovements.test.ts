import {
  buildDatasetFromStoredSireSalesTickets,
  buildMovementsFromSireSalesPreview,
} from "@/services/sunat/sire/proposalMovements";
import type { SunatSireSalesTicket } from "@/types/db";
import type { SireSalesProposalPreview } from "@/types/sire";

const preview: SireSalesProposalPreview = {
  sourceFileName: "rvie-202605.txt",
  sourceType: "txt",
  columns: [
    "Fecha de emisión",
    "Tipo CP/Doc.",
    "Serie CDP",
    "Numero CDP",
    "Apellidos Nombres/ Razón Social",
    "BI Gravada",
    "IGV / IPM",
    "Total CP",
    "Moneda",
    "Tipo Operación",
  ],
  rows: [
    {
      id: "row-1",
      values: [
        "15/05/2026",
        "01",
        "F001",
        "123",
        "Transportes Acme SAC",
        "1,059.75",
        "190.75",
        "1,250.50",
        "PEN",
        "0101",
      ],
    },
    {
      id: "row-2",
      values: [
        "18/05/2026",
        "03",
        "B001",
        "9",
        "Juan Perez",
        "296.61",
        "53.39",
        "350.00",
        "PEN",
        "0101",
      ],
    },
  ],
  totalRows: 2,
  truncated: false,
  notes: [],
};

describe("buildMovementsFromSireSalesPreview", () => {
  it("convierte la propuesta SUNAT en movimientos reutilizables por el dashboard", () => {
    const result = buildMovementsFromSireSalesPreview({
      companyId: "company-1",
      periodo: "202605",
      ticketNumber: "20260300000007",
      preview,
    });

    expect(result).toHaveLength(2);
    expect(result[0]).toMatchObject({
      company_id: "company-1",
      movement_type: "Venta",
      document_type: "Factura",
      amount: 1250.5,
      movement_date: "2026-05-15",
      customer_name: "Transportes Acme SAC",
      currency_code: "PEN",
      operation_type: "0101",
      taxable_base_amount: 1059.75,
      tax_amount: 190.75,
    });
    expect(result[0]?.description).toContain("F001-123");
  });

  it("omite filas sin monto util", () => {
    const result = buildMovementsFromSireSalesPreview({
      companyId: "company-1",
      periodo: "202605",
      ticketNumber: "20260300000007",
      preview: {
        ...preview,
        rows: [
          {
            id: "row-1",
            values: [
              "15/05/2026",
              "01",
              "F001",
              "123",
              "Transportes Acme SAC",
              "0",
              "0",
              "0",
              "PEN",
              "0101",
            ],
          },
        ],
      },
    });

    expect(result).toEqual([]);
  });

  it("infiere columnas utiles cuando SUNAT entrega encabezados genericos", () => {
    const result = buildMovementsFromSireSalesPreview({
      companyId: "company-1",
      periodo: "202605",
      ticketNumber: "20260300000008",
      preview: {
        ...preview,
        columns: ["Campo 1", "Campo 2", "Campo 3", "Campo 4"],
        rows: [
          {
            id: "row-1",
            values: ["20260515", "01", "F001-125", "3,580.90"],
          },
          {
            id: "row-2",
            values: ["20260518", "03", "B001-12", "980.00"],
          },
        ],
      },
    });

    expect(result).toHaveLength(2);
    expect(result[0]).toMatchObject({
      document_type: "Factura",
      amount: 3580.9,
      movement_date: "2026-05-15",
    });
  });

  it("prefiere la columna de importe y no el RUC ni el numero del documento", () => {
    const result = buildMovementsFromSireSalesPreview({
      companyId: "company-1",
      periodo: "202605",
      ticketNumber: "20260300000009",
      preview: {
        ...preview,
        columns: ["Campo 1", "Campo 2", "Campo 3", "Campo 4", "Campo 5"],
        rows: [
          {
            id: "row-1",
            values: ["20260515", "20123456789", "F001", "123456", "1,250.50"],
          },
          {
            id: "row-2",
            values: ["20260518", "10455667789", "B001", "654321", "350.00"],
          },
        ],
      },
    });

    expect(result).toHaveLength(2);
    expect(result[0]?.amount).toBe(1250.5);
    expect(result[1]?.amount).toBe(350);
  });
});

describe("buildDatasetFromStoredSireSalesTickets", () => {
  it("toma el ticket mas reciente por periodo que ya tiene propuesta guardada", () => {
    const baseTicket: SunatSireSalesTicket = {
      id: "ticket-1",
      company_id: "company-1",
      periodo: "202605",
      ticket_number: "20260300000007",
      file_type_code: "0",
      process_status: "10",
      report_file_name: "archivo.zip",
      report_file_type_code: "01",
      last_response: {
        proposalPreview: preview,
      },
      created_at: "2026-06-23T10:00:00.000Z",
      updated_at: "2026-06-23T10:00:00.000Z",
    };

    const result = buildDatasetFromStoredSireSalesTickets({
      companyId: "company-1",
      tickets: [
        {
          ...baseTicket,
          id: "ticket-older",
          ticket_number: "20260300000001",
          updated_at: "2026-06-20T10:00:00.000Z",
        },
        baseTicket,
      ],
    });

    expect(result.movements).toHaveLength(2);
    expect(result.reports).toHaveLength(1);
    expect(result.periods).toEqual(["202605"]);
  });
});
