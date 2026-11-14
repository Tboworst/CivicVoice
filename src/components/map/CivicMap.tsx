"use client";

import { useEffect, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";
import { CATEGORY_COLORS, CATEGORY_LABELS } from "@/types";
import type { Issue } from "@/types";
import type maplibregl from "maplibre-gl";

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

function buildGeoJSON(issues: Issue[], selectedId?: string) {
  return {
    type: "FeatureCollection" as const,
    features: issues.map((issue) => ({
      type: "Feature" as const,
      geometry: {
        type: "Point" as const,
        coordinates: [issue.location.lng, issue.location.lat] as [
          number,
          number,
        ],
      },
      properties: {
        id: issue.id,
        title: issue.title,
        category: issue.category,
        status: issue.status,
        votes: issue.votes,
        location: issue.location.name,
        area: issue.location.area || "",
        color: CATEGORY_COLORS[issue.category] || "#00d4ff",
        catLabel: CATEGORY_LABELS[issue.category] || issue.category,
        selected: issue.id === selectedId,
      },
    })),
  };
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
  const issuesRef = useRef<Issue[]>(issues);
  const onClickRef = useRef(onIssueClick);
  const popupRef = useRef<maplibregl.Popup | null>(null);

  issuesRef.current = issues;
  onClickRef.current = onIssueClick;

  const addLayers = useCallback(
    (gl: typeof maplibregl, map: maplibregl.Map) => {
      // ── Cluster circles ───────────────────────────────────────────────
      map.addLayer({
        id: "clusters",
        type: "circle",
        source: "issues",
        filter: ["has", "point_count"],
        paint: {
          "circle-color": "#00d4ff",
          "circle-radius": [
            "step",
            ["get", "point_count"],
            18,
            5,
            23,
            20,
            30,
          ],
          "circle-opacity": 0.12,
          "circle-stroke-width": 1,
          "circle-stroke-color": "#00d4ff",
          "circle-stroke-opacity": 0.45,
        },
      });

      // Cluster count label
      map.addLayer({
        id: "cluster-count",
        type: "symbol",
        source: "issues",
        filter: ["has", "point_count"],
        layout: {
          "text-field": "{point_count_abbreviated}",
          "text-size": 11,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          "text-font": ["Noto Sans Regular"] as any,
        },
        paint: {
          "text-color": "#00d4ff",
        },
      });

      // ── Individual point layers (glow effect) ─────────────────────────
      // Outer halo
      map.addLayer({
        id: "point-glow-outer",
        type: "circle",
        source: "issues",
        filter: ["!", ["has", "point_count"]],
        paint: {
          "circle-radius": 16,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          "circle-color": ["get", "color"] as any,
          "circle-opacity": 0.07,
          "circle-blur": 1,
        },
      });

      // Inner halo
      map.addLayer({
        id: "point-glow-inner",
        type: "circle",
        source: "issues",
        filter: ["!", ["has", "point_count"]],
        paint: {
          "circle-radius": 10,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          "circle-color": ["get", "color"] as any,
          "circle-opacity": 0.16,
        },
      });

      // Core dot — larger when selected
      map.addLayer({
        id: "point-core",
        type: "circle",
        source: "issues",
        filter: ["!", ["has", "point_count"]],
        paint: {
          "circle-radius": [
            "case",
            ["==", ["get", "selected"], true],
            7,
            5,
          ],
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          "circle-color": ["get", "color"] as any,
          "circle-stroke-width": ["case", ["==", ["get", "selected"], true], 2, 1],
          "circle-stroke-color": "rgba(255,255,255,0.35)",
          "circle-opacity": 1,
        },
      });

      // ── Interaction ───────────────────────────────────────────────────
      // Zoom into cluster on click
      map.on("click", "clusters", (e) => {
        const features = map.queryRenderedFeatures(e.point, {
          layers: ["clusters"],
        });
        if (!features[0]) return;
        const clusterId = features[0].properties?.cluster_id as number;
        const source = map.getSource("issues") as maplibregl.GeoJSONSource;
        source
          .getClusterExpansionZoom(clusterId)
          .then((zoomLevel) => {
            if (features[0].geometry.type !== "Point") return;
            map.easeTo({
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              center: features[0].geometry.coordinates as any,
              zoom: zoomLevel,
            });
          })
          .catch(() => {});
      });

      // Use outer glow as click target (16px radius vs 5px core) — much easier to hit
      map.on("click", "point-glow-outer", (e) => {
        const id = e.features?.[0]?.properties?.id as string | undefined;
        if (!id) return;
        const issue = issuesRef.current.find((i) => i.id === id);
        if (issue) onClickRef.current?.(issue);
      });

      // Hover popup for individual points
      map.on("mouseenter", "point-glow-outer", (e) => {
        map.getCanvas().style.cursor = "pointer";
        const props = e.features?.[0]?.properties as
          | Record<string, string>
          | undefined;
        if (!props || !e.lngLat) return;

        if (popupRef.current) popupRef.current.remove();

        popupRef.current = new gl.Popup({
          closeButton: false,
          closeOnClick: false,
          offset: 12,
          maxWidth: "220px",
        })
          .setLngLat(e.lngLat)
          .setHTML(
            `<div style="padding:9px 11px;font-family:system-ui,sans-serif;">
              <div style="font-size:10px;color:${props.color};margin-bottom:3px;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;">${props.catLabel}</div>
              <div style="font-size:12px;font-weight:600;color:#f1f5f9;line-height:1.4;max-width:190px;">${props.title}</div>
              <div style="font-size:11px;color:#64748b;margin-top:3px;">${props.votes} votes · ${props.location}</div>
            </div>`
          )
          .addTo(map);
      });

      map.on("mouseleave", "point-glow-outer", () => {
        map.getCanvas().style.cursor = "";
        if (popupRef.current) {
          popupRef.current.remove();
          popupRef.current = null;
        }
      });

      // Cluster hover — show issue count
      map.on("mouseenter", "clusters", (e) => {
        map.getCanvas().style.cursor = "pointer";
        const props = e.features?.[0]?.properties as
          | Record<string, unknown>
          | undefined;
        if (!props || !e.lngLat) return;

        if (popupRef.current) popupRef.current.remove();

        popupRef.current = new gl.Popup({
          closeButton: false,
          closeOnClick: false,
          offset: 12,
          maxWidth: "160px",
        })
          .setLngLat(e.lngLat)
          .setHTML(
            `<div style="padding:8px 10px;font-family:system-ui,sans-serif;text-align:center;">
              <div style="font-size:11px;color:#00d4ff;font-weight:600;">${props.point_count} issues</div>
              <div style="font-size:10px;color:#64748b;margin-top:2px;">Click to zoom in</div>
            </div>`
          )
          .addTo(map);
      });

      map.on("mouseleave", "clusters", () => {
        map.getCanvas().style.cursor = "";
        if (popupRef.current) {
          popupRef.current.remove();
          popupRef.current = null;
        }
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
      });

      mapRef.current = map;

      map.on("load", () => {
        map.addSource("issues", {
          type: "geojson",
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          data: buildGeoJSON(issuesRef.current, selectedIssueId) as any,
          cluster: true,
          clusterMaxZoom: 14,
          clusterRadius: 50,
        });

        addLayers(gl, map);
      });

      const container = mapContainerRef.current;
      const observer = new ResizeObserver(() => map.resize());
      observer.observe(container);
    } catch (err) {
      console.error("MapLibre init failed:", err);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Mount / unmount
  useEffect(() => {
    initMap();
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Update GeoJSON source when issues or selection changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;
    const source = map.getSource("issues");
    if (source) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (source as any).setData(buildGeoJSON(issues, selectedIssueId));
    }
  }, [issues, selectedIssueId]);

  return (
    <div
      ref={mapContainerRef}
      className={cn("w-full overflow-hidden", className)}
      style={{ height }}
    />
  );
}
