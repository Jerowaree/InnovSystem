import {
  buildDashboardPeriodsFromSire,
  ensureDashboardPeriods,
  mergeDashboardPeriods,
} from "@/features/dashboard/lib/dashboardPeriods";

describe("dashboardPeriods", () => {
  it("ignora periodos SIRE invalidos y conserva solo los utilizables", () => {
    const result = buildDashboardPeriodsFromSire([
      "202605",
      "202613",
      "periodo-roto",
      "202600",
    ]);

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      key: "2026-05",
      sirePeriodCode: "202605",
    });
  });

  it("genera un fallback cuando no existe ningun periodo disponible", () => {
    const result = ensureDashboardPeriods([]);

    expect(result).toHaveLength(1);
    expect(result[0]?.key).toBe("all");
    expect(result[0]?.label).toBeTruthy();
  });

  it("usa el fallback si el merge termina sin periodos validos", () => {
    const result = mergeDashboardPeriods([], []);

    expect(result).toHaveLength(1);
    expect(result[0]?.key).toBe("all");
  });
});
