"use client";

import { useRouter } from "next/navigation";
import PieChart from "./PieChart";

interface PieChartData {
  label: string;
  value: number;
  color: string;
  userId?: number;
}

interface InteractivePieChartProps {
  data: PieChartData[];
  title: string;
  size?: number;
  showLegend?: boolean;
  showPercentage?: boolean;
  enableUserClick?: boolean;
}

export default function InteractivePieChart({
  data,
  title,
  size,
  showLegend,
  showPercentage,
  enableUserClick = false,
}: InteractivePieChartProps) {
  const router = useRouter();

  const handleSliceClick = (sliceData: PieChartData) => {
    if (enableUserClick && sliceData.userId) {
      router.push(`/admin/users/${sliceData.userId}`);
    }
  };

  return (
    <PieChart
      data={data}
      title={title}
      size={size}
      showLegend={showLegend}
      showPercentage={showPercentage}
      onSliceClick={enableUserClick ? handleSliceClick : undefined}
    />
  );
}
