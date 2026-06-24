import ExcelJS from "exceljs";
import JSZip from "jszip";
import { parseSireSalesProposalPreview } from "@/services/sunat/sire/proposalPreview";

describe("parseSireSalesProposalPreview", () => {
  it("parsea un zip con txt delimitado por barras verticales", async () => {
    const zip = new JSZip();
    zip.file(
      "propuesta.txt",
      ["202506|01|F001|123", "202506|03|F002|456"].join("\n")
    );

    const bytes = await zip.generateAsync({ type: "nodebuffer" });
    const result = await parseSireSalesProposalPreview({
      fileName: "propuesta.zip",
      bytes,
    });

    expect(result.sourceType).toBe("txt");
    expect(result.columns).toEqual(["Campo 1", "Campo 2", "Campo 3", "Campo 4"]);
    expect(result.totalRows).toBe(2);
    expect(result.rows[0]?.values).toEqual(["202506", "01", "F001", "123"]);
  });

  it("parsea una hoja xlsx con cabecera", async () => {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Propuesta");
    sheet.addRow(["Periodo", "Tipo", "Serie", "Numero"]);
    sheet.addRow(["202506", "01", "F001", "123"]);

    const bytes = Buffer.from(await workbook.xlsx.writeBuffer());
    const result = await parseSireSalesProposalPreview({
      fileName: "propuesta.xlsx",
      bytes,
    });

    expect(result.sourceType).toBe("xlsx");
    expect(result.columns).toEqual(["Periodo", "Tipo", "Serie", "Numero"]);
    expect(result.totalRows).toBe(1);
    expect(result.rows[0]?.values).toEqual(["202506", "01", "F001", "123"]);
  });

  it("rechaza un zip sin archivos utiles", async () => {
    const zip = new JSZip();
    const bytes = await zip.generateAsync({ type: "nodebuffer" });

    await expect(
      parseSireSalesProposalPreview({
        fileName: "vacio.zip",
        bytes,
      })
    ).rejects.toThrow("SUNAT devolvio un ZIP sin archivos para mostrar.");
  });
});
