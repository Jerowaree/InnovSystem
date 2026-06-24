import {
  normalizeReportFileTypeCode,
  parseSirePeriodsResponse,
  parseSireProposalTicketResponse,
  parseTicketStatusItems,
} from "@/services/sunat/sire/shared";

describe("normalizeReportFileTypeCode", () => {
  it("normaliza codigos con cero a la izquierda", () => {
    expect(normalizeReportFileTypeCode("00")).toBe("0");
    expect(normalizeReportFileTypeCode("01")).toBe("1");
    expect(normalizeReportFileTypeCode("02")).toBe("2");
  });

  it("mantiene el valor null cuando SUNAT lo manda asi", () => {
    expect(normalizeReportFileTypeCode("null")).toBe("null");
  });
});

describe("parseSirePeriodsResponse", () => {
  it("acepta la estructura documentada de periodos", () => {
    expect(
      parseSirePeriodsResponse([
        {
          numEjercicio: "2026",
          desEstado: "Activo",
          lisPeriodos: [
            {
              perTributario: "202601",
              codEstado: "01",
              desEstado: "Abierto",
            },
          ],
        },
      ])
    ).toEqual([
      {
        numEjercicio: "2026",
        desEstado: "Activo",
        lisPeriodos: [
          {
            perTributario: "202601",
            codEstado: "01",
            desEstado: "Abierto",
          },
        ],
      },
    ]);
  });

  it("rechaza una respuesta sin lisPeriodos", () => {
    expect(() =>
      parseSirePeriodsResponse([
        {
          numEjercicio: "2026",
          desEstado: "Activo",
        },
      ])
    ).toThrow("lisPeriodos");
  });
});

describe("parseSireProposalTicketResponse", () => {
  it("acepta la respuesta con numTicket", () => {
    expect(parseSireProposalTicketResponse({ numTicket: "202600000001" })).toEqual(
      {
        numTicket: "202600000001",
      }
    );
  });

  it("acepta una respuesta simple en texto", () => {
    expect(parseSireProposalTicketResponse("202600000001")).toEqual({
      numTicket: "202600000001",
    });
  });

  it("rechaza una respuesta sin numTicket", () => {
    expect(() => parseSireProposalTicketResponse({ ok: true })).toThrow(
      "numTicket"
    );
  });
});

describe("parseTicketStatusItems", () => {
  it("normaliza un ticket con archivoReporte anidado segun la documentacion", () => {
    const items = parseTicketStatusItems({
      registros: [
        {
          numTicket: "202600000001",
          codProceso: "3",
          desProceso: "Descarga de propuesta",
          codEstadoProceso: "06",
          desEstadoProceso: "Terminado",
          archivoReporte: {
            nomArchivoReporte: "20100176450-CPF-202302-01.zip",
            codTipoArchivoReporte: "01",
          },
        },
      ],
    });

    expect(items).toEqual([
      expect.objectContaining({
        numTicket: "202600000001",
        codProceso: "3",
        desProceso: "Descarga de propuesta",
        codEstadoProceso: "06",
        desEstadoProceso: "Terminado",
        nomArchivoReporte: "20100176450-CPF-202302-01.zip",
        codTipoArchivoReporte: "1",
        archivoReporte: {
          nomArchivoReporte: "20100176450-CPF-202302-01.zip",
          codTipoArchivoReporte: "1",
        },
      }),
    ]);
  });

  it("acepta archivoReporte como arreglo y el campo codTipoAchivoReporte tal como aparece en el manual", () => {
    const items = parseTicketStatusItems({
      registros: [
        {
          numTicket: "202600000003",
          codProceso: "3",
          desProceso: "Descarga de propuesta",
          codEstadoProceso: "06",
          desEstadoProceso: "Terminado",
          archivoReporte: [
            {
              nomArchivoReporte: "20100176450-CPF-202303-01.zip",
              codTipoAchivoReporte: "01",
              nomArchivoContenido: "20100176450-CPF-202303-01.txt",
            },
          ],
        },
      ],
    });

    expect(items[0]).toEqual(
      expect.objectContaining({
        numTicket: "202600000003",
        codEstadoProceso: "06",
        desEstadoProceso: "Terminado",
        nomArchivoReporte: "20100176450-CPF-202303-01.zip",
        codTipoArchivoReporte: "1",
      })
    );
  });

  it("usa detalleTicket.nomArchivoReporte cuando SUNAT no envia archivoReporte completo", () => {
    const items = parseTicketStatusItems({
      registros: [
        {
          numTicket: "202600000004",
          codProceso: "3",
          desProceso: "Descarga de propuesta",
          detalleTicket: {
            numTicket: "202600000004",
            codEstadoEnvio: "06",
            desEstadoEnvio: "Terminado",
            nomArchivoReporte: "20100176450-CPF-202304-01.zip",
          },
        },
      ],
    });

    expect(items[0]).toEqual(
      expect.objectContaining({
        numTicket: "202600000004",
        nomArchivoReporte: "20100176450-CPF-202304-01.zip",
        codTipoArchivoReporte: "null",
      })
    );
  });

  it("usa detalleTicket como respaldo cuando SUNAT no manda el estado plano", () => {
    const items = parseTicketStatusItems({
      registros: [
        {
          numTicket: "202600000002",
          detalleTicket: {
            numTicket: "202600000002",
            codEstadoEnvio: "06",
            desEstadoEnvio: "Terminado",
          },
        },
      ],
    });

    expect(items[0]).toEqual(
      expect.objectContaining({
        numTicket: "202600000002",
        codEstadoProceso: "06",
        desEstadoProceso: "Terminado",
      })
    );
  });

  it("rechaza una respuesta sin arreglo registros/items", () => {
    expect(() => parseTicketStatusItems({ resultado: [] })).toThrow(
      "estructura de ticket"
    );
  });
});
