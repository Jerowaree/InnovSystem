import ReportsWorkspace from "@/components/dashboard/ReportsWorkspace";
import { hasRealDashboardRecords } from "@/features/dashboard/lib/dashboardMockData";
import { getPublicDashboardErrorMessage } from "@/lib/publicErrorMessages";
import { loadDashboardDataServer } from "@/services/dashboardServiceServer";
import { getSireDashboardContextForCompany } from "@/services/sunat/sireService";

export default async function DashboardReportsPage() {
  const { data, error } = await loadDashboardDataServer();

  if (error || !data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 px-6">
        <div className="w-full max-w-xl rounded-3xl bg-white p-10 shadow-lg">
          <h1 className="text-2xl font-semibold text-slate-950">
            No pudimos cargar tu panel
          </h1>
          <p className="mt-4 text-slate-600">
            {getPublicDashboardErrorMessage()}
          </p>
        </div>
      </div>
    );
  }

  const sireContext = await getSireDashboardContextForCompany(data.company.id, {
    includePeriods: hasRealDashboardRecords(data),
  });

  return <ReportsWorkspace data={data} sireContext={sireContext} />;
}
