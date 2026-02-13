import React, { useMemo } from "react";
import {
  CheckCircle,
  Key,
  Shield,
  Lock,
  UploadCloud,
  Hash
} from "lucide-react";

/*
  Command-grade crypto tree
  - deterministic layout
  - animated flow beam
  - icon → check transform
  - active pulse
*/

const NODE_RADIUS = 22;
const LEVEL_GAP = 110;
const SIBLING_GAP = 90;
const HORIZONTAL_GAP = 220;

const CryptoFlow = ({ currentStep = 0, mode = "hybrid" }) => {
  const isHybrid = mode === "hybrid";

  const color = isHybrid ? "#00ff9d" : "#a855f7";
  const childText = isHybrid ? "#00ff9d" : "#d8b4fe";

  // ================= DATA =================

  const hybrid = [
    {
      title: "Ephemeral Agreement",
      sub: "X25519",
      icon: Key,
      children: ["Generate key", "Exchange values"],
    },
    {
      title: "Encapsulate",
      sub: "Kyber",
      icon: Shield,
      children: ["Shared secret", "Ciphertext"],
    },
    {
      title: "HKDF",
      sub: "SHA-256",
      icon: Hash,
      children: ["Mix salt", "Expand key"],
    },
    {
      title: "AES Encrypt",
      sub: "GCM",
      icon: Lock,
      children: ["Encrypt", "Tag"],
    },
    {
      title: "Upload",
      sub: "MinIO",
      icon: UploadCloud,
      children: ["Pack", "Store"],
    },
  ];

  const rsa = [
    {
      title: "Keypair",
      sub: "RSA-2048",
      icon: Key,
      children: ["Public key", "Private key"],
    },
    {
      title: "Padding",
      sub: "OAEP",
      icon: Shield,
      children: ["Prepare"],
    },
    {
      title: "Encrypt",
      sub: "Mod Exp",
      icon: Lock,
      children: ["Cipher"],
    },
    {
      title: "Build Blob",
      sub: "Meta",
      icon: Hash,
      children: ["Headers"],
    },
    {
      title: "Upload",
      sub: "MinIO",
      icon: UploadCloud,
      children: ["Store"],
    },
  ];

  const phases = isHybrid ? hybrid : rsa;

  // ================= LAYOUT =================

  const { nodes, edges, width, height } = useMemo(() => {
    const nodes = [];
    const edges = [];

    let x = 120;
    const y = 170;

    phases.forEach((p, i) => {
      nodes.push({ id: `p-${i}`, x, y, phase: i, ...p });

      const branchUp = i % 2 === 1;

      p.children.forEach((c, k) => {
        const offset = (k - (p.children.length - 1) / 2) * SIBLING_GAP;
        const cx = x + offset;
        const cy = branchUp ? y - LEVEL_GAP : y + LEVEL_GAP;

        nodes.push({
          id: `c-${i}-${k}`,
          x: cx,
          y: cy,
          label: c,
          child: true,
          parentPhase: i,
        });

        edges.push({ from: `p-${i}`, to: `c-${i}-${k}` });
      });

      if (i > 0) edges.push({ from: `p-${i - 1}`, to: `p-${i}` });

      x += HORIZONTAL_GAP;
    });

    return { nodes, edges, width: x + 120, height: 360 };
  }, [phases]);

  // ================= RENDER =================

  return (
    <div className="bg-black/40 border border-scifi-border rounded-xl overflow-x-auto">
      <svg width={width} height={height}>

        {/* FLOW GRADIENT */}
        <defs>
          <linearGradient id="beam" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="transparent" />
            <stop offset="50%" stopColor={color} />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
        </defs>

        {/* ================= EDGES ================= */}
        {edges.map((e, i) => {
          const a = nodes.find(n => n.id === e.from);
          const b = nodes.find(n => n.id === e.to);

          const phaseIndex = a.phase ?? a.parentPhase;
          const done = currentStep > phaseIndex;
          const active = currentStep === phaseIndex + 1 && a.phase !== undefined;

          return (
            <g key={i}>
              {/* base */}
              <line
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                stroke={done ? color : "#222"}
                strokeWidth="2"
              />

              {/* travelling beam */}
              {active && (
                <line
                  x1={a.x}
                  y1={a.y}
                  x2={b.x}
                  y2={b.y}
                  stroke="url(#beam)"
                  strokeWidth="4"
                >
                  <animate
                    attributeName="stroke-dashoffset"
                    from="200"
                    to="0"
                    dur="1.2s"
                    repeatCount="indefinite"
                  />
                </line>
              )}
            </g>
          );
        })}

        {/* ================= NODES ================= */}
        {nodes.map((n, i) => {
          if (n.child) {
            const done = currentStep > n.parentPhase;

            return (
              <g key={i}>
                <circle
                  cx={n.x}
                  cy={n.y}
                  r={9}
                  fill={done ? color : "#0b0f14"}
                  stroke={done ? color : "#555"}
                  strokeWidth="1.5"
                />
                {!done && (
                  <circle cx={n.x} cy={n.y} r={3} fill="#555" />
                )}
                <text
                  x={n.x}
                  y={n.y + 20}
                  fontSize="11"
                  textAnchor="middle"
                  fill={childText}
                  fontFamily="monospace"
                >
                  {n.label}
                </text>
              </g>
            );
          }

          const done = currentStep >= n.phase + 1;
          const active = currentStep === n.phase + 1;
          const Icon = n.icon;

          return (
            <g key={i}>
              {/* active pulse */}
              {active && (
                <circle cx={n.x} cy={n.y} r={NODE_RADIUS + 10} fill={color} opacity="0.12">
                  <animate attributeName="r" values="28;34;28" dur="1.4s" repeatCount="indefinite" />
                </circle>
              )}

              {/* glow when done */}
              {done && (
                <circle cx={n.x} cy={n.y} r={NODE_RADIUS + 6} fill={color} opacity="0.08" />
              )}

              <circle
                cx={n.x}
                cy={n.y}
                r={NODE_RADIUS}
                fill="#0b0f14"
                stroke={done ? color : "#444"}
                strokeWidth="2"
              />

              {/* ICON / CHECK */}
              <foreignObject x={n.x - 10} y={n.y - 10} width={20} height={20}>
                {done ? (
                  <CheckCircle size={18} color={color} />
                ) : (
                  <Icon size={18} color="#666" />
                )}
              </foreignObject>

              {/* title */}
              <text
                x={n.x}
                y={n.y + 40}
                fontSize="12"
                textAnchor="middle"
                fill={done ? "white" : "#777"}
                fontWeight="bold"
              >
                {n.title}
              </text>

              {/* subtitle */}
              <text
                x={n.x}
                y={n.y + 56}
                fontSize="10"
                textAnchor="middle"
                fill="#666"
                fontFamily="monospace"
              >
                {n.sub}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

export default CryptoFlow;
