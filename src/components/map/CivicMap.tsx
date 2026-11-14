"use client";

import { useEffect, useRef, useCallback } from "react";
import type maplibregl from "maplibre-gl";
import { cn } from "@/lib/utils";
import { CATEGORY_COLORS, CATEGORY_LABELS } from "@/types";
import type { Issue } from "@/types";

interface CivicMapProps {
  issues?: Issue[];
  center?: [number, number];
  zoom?: number;
  height?: string;
  className?: string;
  onIssueClick?: (issue: Issue) => void;
  selectedIssueId?: string;
  interactive?: boolean;
}

// Dark raster map style using OpenStreetMap — no API key required
const DARK_MAP_STYLE = {
  version: 8 as const,
  sources: {
    osm: {
      type: "raster" as const,
      tiles: [
        "https://a.tile.openstreetmap.org/{z}/{x}/{y}.png",
        "https://b.tile.openstreetmap.org/{z}/{x}/{y}.png",
        "https://c.tile.openstreetmap.org/{z}/{x}/{y}.png",
      ],
      tileSize: 256,
      attribution:
        '© <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors',
    },
  },
  layers: [
    {
      id: "background",
      type: "background" as const,
      paint: { "background-color": "#05080f" },
    },
    {
      id: "osm-dark",
      type: "raster" as const,
      source: "osm",
      paint: {
        "raster-opacity": 0.9,
        "raster-saturation": -0.95,
        "raster-brightness-min": 0.0,
        "raster-brightness-max": 0.22,
        "raster-contrast": 0.15,
        "raster-hue-rotate": 190,
      },
    },
  ],
};

function getMaptilerStyle(key: string) {
  return `https://api.maptiler.com/maps/dataviz-dark/style.json?key=${key}`;
}

function createMarkerElement(issue: Issue, isSelected: boolean): HTMLElement {
  const color = CATEGORY_COLORS[issue.category] || "#00d4ff";
  const wrapper = document.createElement("div");
  wrapper.style.cssText = `
    position: relative;
    width: ${isSelected ? "28px" : "22px"};
    height: ${isSelected ? "28px" : "22px"};
    cursor: pointer;
    transition: transform 0.2s ease;
  `;

  const ring = document.createElement("div");
  ring.style.cssText = `
    position: absolute;
    top: 50%; left: 50%;
    transform: translate(-50%, -50%);
    width: ${isSelected ? "28px" : "22px"};
    height: ${isSelected ? "28px" : "22px"};
    border-radius: 50%;
    background: ${color}22;
    border: 1.5px solid ${color}55;
    animation: markerPulse 2.5s ease-out infinite;
    z-index: 1;
  `;

  const core = document.createElement("div");
  core.style.cssText = `
    position: absolute;
    top: 50%; left: 50%;
    transform: translate(-50%, -50%);
    width: ${isSelected ? "12px" : "9px"};
    height: ${isSelected ? "12px" : "9px"};
    border-radius: 50%;
    background: ${color};
    box-shadow: 0 0 ${isSelected ? "14px" : "8px"} ${color}cc, 0 0 ${isSelected ? "28px" : "16px"} ${color}44;
    z-index: 2;
    transition: all 0.2s ease;
  `;

  if (isSelected) {
    const outerRing = document.createElement("div");
    outerRing.style.cssText = `
      position: absolute;
      top: 50%; left: 50%;
      transform: translate(-50%, -50%);
      width: 44px; height: 44px;
      border-radius: 50%;
      border: 1.5px solid ${color}40;
      z-index: 0;
    `;
    wrapper.appendChild(outerRing);
  }

  wrapper.appendChild(ring);
  wrapper.appendChild(core);
  return wrapper;
}

export default function CivicMap({
  issues = [],
  center = [-76.6025, 39.3959],
  zoom = 13.5,
  height = "100%",
  className,
  onIssueClick,
  selectedIssueId,
  interactive = true,
}: CivicMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<
    Map<string, { marker: maplibregl.Marker; el: HTMLElement }>
  >(new Map());

  const addMarkers = useCallback(
    (
      gl: typeof maplibregl,
      map: maplibregl.Map,
      issueList: Issue[],
      selectedId: string | undefined,
      onClick: ((issue: Issue) => void) | undefined
    ) => {
      markersRef.current.forEach(({ marker }) => marker.remove());
      markersRef.current.clear();

      issueList.forEach((issue) => {
        const isSelected = issue.id === selectedId;
        const el = createMarkerElement(issue, isSelected);

        const marker = new gl.Marker({ element: el, anchor: "center" })
          .setLngLat([issue.location.lng, issue.location.lat])
          .addTo(map);

        el.addEventListener("click", (e) => {
          e.stopPropagation();
          onClick?.(issue);
        });

        el.addEventListener("mouseenter", () => {
          const color = CATEGORY_COLORS[issue.category] || "#00d4ff";
          const popup = new gl.Popup({
            closeButton: false,
            closeOnClick: false,
            offset: 16,
            maxWidth: "240px",
          });
          popup
            .setLngLat([issue.location.lng, issue.location.lat])
            .setHTML(`
              <div style="padding:10px 12px;font-family:system-ui,sans-serif;">
                <div style="font-size:11px;color:${color};margin-bottom:4px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">
                  ${CATEGORY_LABELS[issue.category]}
                </div>
                <div style="font-size:12px;font-weight:600;color:#f1f5f9;line-height:1.4;max-width:200px;">
                  ${issue.title}
                </div>
                <div style="font-size:11px;color:#64748b;margin-top:4px;">
                  ${issue.votes} votes · ${issue.location.name}
                </div>
              </div>
            `)
            .addTo(map);

          el.addEventListener("mouseleave", () => popup.remove(), { once: true });
        });

        markersRef.current.set(issue.id, { marker, el });
      });
    },
    []
  );

  const initMap = useCallback(async () => {
    if (!mapContainerRef.current || mapRef.current) return;
    try {
      const gl = (await import("maplibre-gl")).default;
      const apiKey = process.env.NEXT_PUBLIC_MAPTILER_KEY;
      const style = apiKey ? getMaptilerStyle(apiKey) : DARK_MAP_STYLE;

      const map = new gl.Map({
        container: mapContainerRef.current,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        style: style as any,
        center,
        zoom,
        interactive,
        attributionControl: { compact: true },
        logoPosition: "bottom-left",
      });

      mapRef.current = map;

      map.on("load", () => {
        addMarkers(gl, map, issues, selectedIssueId, onIssueClick);
      });

      const container = mapContainerRef.current;
      const observer = new ResizeObserver(() => map.resize());
      observer.observe(container);
    } catch (err) {
      console.error("MapLibre init failed:", err);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    initMap();
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Update selected marker visual state without full reinit
  useEffect(() => {
    if (!mapRef.current) return;
    markersRef.current.forEach(({ el }, id) => {
      const issue = issues.find((i) => i.id === id);
      if (!issue) return;
      const color = CATEGORY_COLORS[issue.category] || "#00d4ff";
      const isSelected = id === selectedIssueId;
      const core = el.lastElementChild as HTMLElement | null;
      if (core) {
        core.style.width = isSelected ? "12px" : "9px";
        core.style.height = isSelected ? "12px" : "9px";
        core.style.boxShadow = `0 0 ${isSelected ? "14px" : "8px"} ${color}cc`;
      }
    });
  }, [selectedIssueId, issues]);

  return (
    <div
      ref={mapContainerRef}
      className={cn("w-full overflow-hidden", className)}
      style={{ height }}
    />
  );
}
