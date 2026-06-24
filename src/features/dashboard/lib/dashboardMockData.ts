import type { DashboardData } from "@/services/dashboardServiceServer";
import type { Movement, Report } from "@/types/db";

export function hasRealDashboardRecords(data: DashboardData) {
  return data.movements.length > 0 || data.reports.length > 0;
}

function buildMockMovements(companyId: string): Movement[] {
  return [
    {
      id: "mock-movement-1",
      company_id: companyId,
      movement_type: "Venta",
      document_type: "Factura",
      description: "Servicio de transporte interprovincial",
      amount: 4800,
      movement_date: "2026-05-06",
      created_at: "2026-05-06T10:00:00.000Z",
    },
    {
      id: "mock-movement-2",
      company_id: companyId,
      movement_type: "Compra",
      document_type: "Combustible",
      description: "Carga de combustible para flota",
      amount: 1650,
      movement_date: "2026-05-09",
      created_at: "2026-05-09T13:20:00.000Z",
    },
    {
      id: "mock-movement-3",
      company_id: companyId,
      movement_type: "Venta",
      document_type: "Boleta",
      description: "Traslado urbano programado",
      amount: 3950,
      movement_date: "2026-05-12",
      created_at: "2026-05-12T09:15:00.000Z",
    },
    {
      id: "mock-movement-4",
      company_id: companyId,
      movement_type: "Gasto",
      document_type: "Mantenimiento",
      description: "Mantenimiento preventivo de unidades",
      amount: 1240,
      movement_date: "2026-05-16",
      created_at: "2026-05-16T16:40:00.000Z",
    },
    {
      id: "mock-movement-5",
      company_id: companyId,
      movement_type: "Venta",
      document_type: "Factura",
      description: "Ruta logistica para cliente corporativo",
      amount: 6200,
      movement_date: "2026-05-19",
      created_at: "2026-05-19T11:05:00.000Z",
    },
    {
      id: "mock-movement-6",
      company_id: companyId,
      movement_type: "Compra",
      document_type: "Peajes",
      description: "Peajes de rutas nacionales",
      amount: 580,
      movement_date: "2026-05-22",
      created_at: "2026-05-22T08:25:00.000Z",
    },
    {
      id: "mock-movement-7",
      company_id: companyId,
      movement_type: "Venta",
      document_type: "Factura",
      description: "Distribucion de mercaderia en Lima",
      amount: 7100,
      movement_date: "2026-05-26",
      created_at: "2026-05-26T14:10:00.000Z",
    },
    {
      id: "mock-movement-8",
      company_id: companyId,
      movement_type: "Gasto",
      document_type: "Servicios",
      description: "Monitoreo GPS y soporte operativo",
      amount: 890,
      movement_date: "2026-05-29",
      created_at: "2026-05-29T17:30:00.000Z",
    },
  ];
}

function buildMockReports(companyId: string): Report[] {
  return [
    {
      id: "mock-report-1",
      company_id: companyId,
      report_type: "Reporte de Ventas",
      file_url: "#",
      generated_at: "2026-05-29T18:00:00.000Z",
    },
    {
      id: "mock-report-2",
      company_id: companyId,
      report_type: "Reporte de Compras",
      file_url: "#",
      generated_at: "2026-05-28T18:00:00.000Z",
    },
    {
      id: "mock-report-3",
      company_id: companyId,
      report_type: "Resumen Financiero",
      file_url: "#",
      generated_at: "2026-05-27T18:00:00.000Z",
    },
  ];
}

export function applyDashboardMockData(data: DashboardData): DashboardData {
  if (data.movements.length > 0) {
    return data;
  }

  return {
    ...data,
    movements: buildMockMovements(data.company.id),
    reports:
      data.reports.length > 0 ? data.reports : buildMockReports(data.company.id),
  };
}
