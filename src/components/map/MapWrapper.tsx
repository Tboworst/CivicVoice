"use client";

import dynamic from "next/dynamic";
import { MapSkeleton } from "./MapSkeleton";
import type { Issue } from "@/types";

const CivicMap = dynamic(() => import("./CivicMap"), {
  ssr: false,
  loading: () => <MapSkeleton className="w-full h-full" />,
});

interface MapWrapperProps {
  issues?: Issue[];
  center?: [number, number];
  zoom?: number;
  height?: string;
  className?: string;
  onIssueClick?: (issue: Issue) => void;
  selectedIssueId?: string;
  interactive?: boolean;
}

export function MapWrapper(props: MapWrapperProps) {
  return <CivicMap {...props} />;
}
