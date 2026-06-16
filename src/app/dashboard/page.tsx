import DashboardWorkspace from "@/components/dashboard/DashboardWorkspace";
import { getPublicDashboardErrorMessage } from "@/lib/publicErrorMessages";
import { loadDashboardDataServer } from "@/services/dashboardServiceServer";

export default async function DashboardPage() {
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

  return <DashboardWorkspace data={data} />;
}
