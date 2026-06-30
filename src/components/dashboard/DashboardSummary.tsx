import {
  ArrowUpRight,
  CircleDollarSign,
  ShoppingCart,
  Wallet,
} from "lucide-react";
import type { DashboardViewModel } from "@/features/dashboard/lib/dashboardViewModel";
import AnimatedCounter from "@/components/dashboard/AnimatedCounter";

interface DashboardSummaryProps {
  viewModel: DashboardViewModel;
}

const iconByTone = {
  blue: ArrowUpRight,
  green: ShoppingCart,
  violet: Wallet,
  amber: CircleDollarSign,
};

const iconWrapperByTone = {
  blue: "bg-slate-100 text-slate-700",
  green: "bg-slate-100 text-slate-700",
  violet: "bg-slate-100 text-slate-700",
  amber: "bg-slate-100 text-slate-700",
};

function parseKpiValue(valueStr: string) {
  const clean = valueStr.replace(/[^\d.-]/g, '');
  const num = parseFloat(clean) || 0;
  const prefix = valueStr.includes("S/") ? "S/ " : "";
  // Check if it has a decimal point and determine number of decimals
  const decimals = valueStr.includes(".") ? valueStr.split(".")[1]?.length || 0 : 0;
  return { num, prefix, decimals };
}

export default function DashboardSummary({ viewModel }: DashboardSummaryProps) {
  return (
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {viewModel.kpis.map((item) => {
        const Icon = iconByTone[item.tone];
        const parsed = parseKpiValue(item.value);

        return (
          <article
            key={item.label}
            className="rounded-[10px] border border-slate-200/80 bg-white px-4 py-4 shadow-[0_18px_36px_-34px_rgba(15,23,42,0.28)]"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  {item.label}
                </p>
                <p className="mt-2 text-[1.8rem] font-semibold tracking-[-0.04em] text-slate-950">
                  <AnimatedCounter
                    value={parsed.num}
                    prefix={parsed.prefix}
                    decimals={parsed.decimals}
                  />
                </p>
              </div>

              <div
                className={`flex h-10 w-10 items-center justify-center rounded-lg ${iconWrapperByTone[item.tone]}`}
              >
                <Icon className="h-5 w-5" />
              </div>
            </div>

            <p className="mt-3 text-xs font-medium text-slate-500">
              {item.changeLabel}
            </p>
          </article>
        );
      })}
    </section>
  );
}
