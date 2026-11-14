"use client";

import { QRCodeSVG } from "qrcode.react";
import { QrCode } from "lucide-react";
import { useEffect, useState } from "react";

interface IssueShareQRProps {
  issueId: string;
}

export function IssueShareQR({ issueId }: IssueShareQRProps) {
  const [url, setUrl] = useState("");

  // Build URL on client so it works in both dev and production
  useEffect(() => {
    setUrl(`${window.location.origin}/join/${issueId}`);
  }, [issueId]);

  return (
    <div className="glass rounded-2xl p-5 border border-white/7">
      <div className="flex items-center gap-2 mb-2">
        <QrCode className="w-4 h-4 text-civic-cyan" />
        <h2 className="text-sm font-semibold text-civic-text">Share & Vote</h2>
      </div>
      <p className="text-xs text-civic-text-muted mb-4">
        Display this QR code — anyone who scans it can vote on this issue in real-time, no sign-in needed.
      </p>
      <div className="flex justify-center">
        {url ? (
          <div className="bg-white p-3 rounded-xl">
            <QRCodeSVG
              value={url}
              size={164}
              bgColor="#ffffff"
              fgColor="#05080f"
              level="M"
            />
          </div>
        ) : (
          <div className="w-[188px] h-[188px] bg-white/5 rounded-xl animate-pulse" />
        )}
      </div>
      <p className="text-center text-xs text-civic-text-muted mt-3 break-all font-mono leading-relaxed">
        {url || "loading…"}
      </p>
    </div>
  );
}
