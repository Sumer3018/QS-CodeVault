import React from "react";
import ReactFlow, { Background, Controls } from "reactflow";
import "reactflow/dist/style.css";

const green = "#00ff9d";
const purple = "#a855f7";

const CryptoProcessGraph = ({ mode = "hybrid" }) => {
  const isRSA = mode === "rsa";
  const color = isRSA ? purple : green;

  // ================= PROCESS DEFINITION =================
  const nodes = isRSA
    ? [
        { id: "1", data: { label: "RSA Keygen" }, position: { x: 0, y: 0 } },
        { id: "2", data: { label: "Encrypt Session Key" }, position: { x: 250, y: 0 } },
        { id: "3", data: { label: "AES Encrypt" }, position: { x: 500, y: 0 } },
        { id: "4", data: { label: "Upload MinIO" }, position: { x: 750, y: 0 } }
      ]
    : [
        { id: "1", data: { label: "Ephemeral Exchange" }, position: { x: 0, y: 0 } },
        { id: "2", data: { label: "Encapsulation" }, position: { x: 250, y: 0 } },
        { id: "3", data: { label: "HKDF" }, position: { x: 500, y: 0 } },
        { id: "4", data: { label: "AES Encrypt" }, position: { x: 750, y: 0 } },
        { id: "5", data: { label: "Upload MinIO" }, position: { x: 1000, y: 0 } }
      ];

  const edges = nodes.slice(1).map((n, i) => ({
    id: `e${i}`,
    source: nodes[i].id,
    target: n.id,
    animated: true,
    style: { stroke: color }
  }));

  const styledNodes = nodes.map(n => ({
    ...n,
    style: {
      background: "#0a0a0a",
      color: color,
      border: `1px solid ${color}`,
      padding: 10,
      borderRadius: 8,
      fontSize: 10,
      width: 150,
      textAlign: "center"
    }
  }));

  return (
    <div className="h-[300px] border border-gray-800 rounded-xl">
      <ReactFlow nodes={styledNodes} edges={edges} fitView>
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
};

export default CryptoProcessGraph;
