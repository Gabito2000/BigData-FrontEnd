"use client";

import FullScreenIframe from "@/components/ui/FullScreenIframe";

const NEO4J_URL = "/neo4j/browser/";

export function DataLakeCuadernos() {
  return <FullScreenIframe url={NEO4J_URL} title="Neo4j Browser" />;
}