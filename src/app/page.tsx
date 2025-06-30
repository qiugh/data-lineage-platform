import Flow from "@/components/Flow";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Data Lineage Visualization",
  description: "A simple data lineage visualization tool.",
};

export default function HomePage() {
  return (
    <main className="w-screen h-screen">
      <h1 className="text-2xl font-bold text-center py-4">Data Lineage Visualization</h1>
      <Flow />
    </main>
  );
}
