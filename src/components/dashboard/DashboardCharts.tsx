"use client";

import { useEffect, useRef, useState } from "react";
import {
  Cell,
  CartesianGrid,
  Line,
  LineChart,
  Pie,
  PieChart,
  Tooltip,
} from "recharts";
import type {
  DashboardDistributionItem,
  DashboardSeriesPoint,
} from "@/features/dashboard/lib/dashboardViewModel";

interface DashboardChartsProps {
  series: DashboardSeriesPoint[];
  lineChartTitle: string;
  showPurchasesSeries: boolean;
  distribution: DashboardDistributionItem[];
  distributionTitle: string;
  distributionTotal: string;
  distributionEmptyTitle: string;
  distributionEmptyDescription: string;
}

function EmptyChartState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex h-full min-h-[220px] w-full items-start justify-center px-6 pt-6 text-center">
      <div className="max-w-sm">
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <p className="mt-2 text-sm leading-6 text-slate-400">{description}</p>
      </div>
    </div>
  );
}

function CurrencyTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-xl">
      <p className="text-xs font-semibold text-slate-500">{label}</p>
      {payload.map((entry) => (
        <p key={entry.name} className="mt-1 text-sm text-slate-700">
          <span className="font-semibold" style={{ color: entry.color }}>
            {entry.name}
          </span>{" "}
          S/ {entry.value.toLocaleString("en-US")}
        </p>
      ))}
    </div>
  );
}

function useMeasuredWidth() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) {
      return;
    }

    const updateWidth = () => {
      setWidth(element.getBoundingClientRect().width);
    };

    updateWidth();

    const observer = new ResizeObserver(() => {
      updateWidth();
    });

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, []);

  return { containerRef, width };
}

export default function DashboardCharts({
  series,
  lineChartTitle,
  showPurchasesSeries,
  distribution,
  distributionTitle,
  distributionTotal,
  distributionEmptyTitle,
  distributionEmptyDescription,
}: DashboardChartsProps) {
  const { containerRef, width } = useMeasuredWidth();
  const lineChartWidth = Math.max(width - 24, 220);
  const hasLineData = series.some(
    (point) => point.sales > 0 || point.purchases > 0
  );
  const hasDistributionData = distribution.some((item) => item.value > 0);

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1.7fr)_minmax(320px,0.9fr)]">
      <section className="min-w-0 rounded-[28px] border border-white/80 bg-white px-5 py-5 shadow-[0_30px_60px_-45px_rgba(15,23,42,0.35)]">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-950">
            {lineChartTitle}
          </h2>
          <div className="flex items-center gap-5 text-xs text-slate-500">
            <span className="inline-flex items-center gap-2">
              <span className="h-2 w-5 rounded-full bg-[#2F6BFF]" />
              Ventas
            </span>
            {showPurchasesSeries ? (
              <span className="inline-flex items-center gap-2">
                <span className="h-2 w-5 rounded-full bg-[#9AA8BE]" />
                Compras
              </span>
            ) : null}
          </div>
        </div>

        <div
          ref={containerRef}
          className="h-[290px] min-h-[290px] w-full min-w-0"
        >
          {width > 0 && hasLineData ? (
            <LineChart
              width={lineChartWidth}
              height={290}
              data={series}
              margin={{ top: 10, right: 12, left: 0, bottom: 0 }}
            >
              <CartesianGrid stroke="#E8EEF7" vertical={false} />
              <Tooltip content={<CurrencyTooltip />} />
              <Line
                type="monotone"
                dataKey="sales"
                name="Ventas"
                stroke="#2F6BFF"
                strokeWidth={3}
                dot={{ r: 0 }}
                activeDot={{ r: 4 }}
              />
              {showPurchasesSeries ? (
                <Line
                  type="monotone"
                  dataKey="purchases"
                  name="Compras"
                  stroke="#94A3B8"
                  strokeWidth={2.4}
                  dot={{ r: 0 }}
                  activeDot={{ r: 4 }}
                />
              ) : null}
            </LineChart>
          ) : width > 0 ? (
            <EmptyChartState
              title="Aun no hay movimientos para graficar"
              description="Cuando registres ventas y compras, aqui veras su comportamiento en el tiempo."
            />
          ) : null}
        </div>
      </section>

      <section className="min-w-0 rounded-[28px] border border-white/80 bg-white px-5 py-5 shadow-[0_30px_60px_-45px_rgba(15,23,42,0.35)]">
        <h2 className="text-base font-semibold text-slate-950">
          {distributionTitle}
        </h2>

        <div className="mt-4 grid gap-3 lg:grid-cols-[180px_minmax(0,1fr)] xl:grid-cols-1">
          {hasDistributionData ? (
            <>
              <div className="mx-auto h-[220px] w-[220px]">
                <PieChart width={220} height={220}>
                  <Pie
                    data={distribution}
                    dataKey="value"
                    nameKey="label"
                    innerRadius={62}
                    outerRadius={88}
                    paddingAngle={2}
                    strokeWidth={0}
                  >
                    {distribution.map((entry) => (
                      <Cell key={entry.label} fill={entry.color} />
                    ))}
                  </Pie>
                  <text
                    x="50%"
                    y="48%"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="fill-slate-900 text-[18px] font-semibold"
                  >
                    {distributionTotal}
                  </text>
                  <text
                    x="50%"
                    y="58%"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="fill-slate-500 text-[12px]"
                  >
                    Total
                  </text>
                </PieChart>
              </div>

              <div className="space-y-3">
                {distribution.map((entry) => (
                  <div
                    key={entry.label}
                    className="flex items-center justify-between text-sm"
                  >
                    <div className="inline-flex items-center gap-3 text-slate-600">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: entry.color }}
                      />
                      {entry.label}
                    </div>
                    <span className="font-medium text-slate-500">
                      {entry.percentage}%
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="lg:col-span-2 xl:col-span-1">
              <EmptyChartState
                title={distributionEmptyTitle}
                description={distributionEmptyDescription}
              />
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
