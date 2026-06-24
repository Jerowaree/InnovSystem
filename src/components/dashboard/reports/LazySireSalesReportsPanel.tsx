"use client";

import dynamic from "next/dynamic";
import { SireSalesReportsPanelSkeleton } from "./SireSalesReportsPanelSkeleton";

export const LazySireSalesReportsPanel = dynamic(
  () =>
    import("./SireSalesReportsPanel").then((module) => ({
      default: module.SireSalesReportsPanel,
    })),
  {
    loading: () => <SireSalesReportsPanelSkeleton />,
  }
);
