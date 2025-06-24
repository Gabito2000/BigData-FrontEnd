import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Process } from "@/lib/types";
import PrefectIframe from "./prefect-iframe";

export const ProcessList: React.FC<{ pipelines: Process[] }> = ({
  pipelines,
}) => {
  return (
    <div className="mb-4">
      <h3 className="text-lg font-semibold mb-2">Pipelines</h3>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Nombre</TableHead>
            <TableHead>CPU (%)</TableHead>
            <TableHead>Memoria (GB)</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pipelines.map((process) => (
            <TableRow key={process.id}>
              <TableCell>{process.id}</TableCell>
              <TableCell>{process.name}</TableCell>
              <TableCell>{process.cpu.toFixed(1)}</TableCell>
              <TableCell>{process.memory.toFixed(1)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="mt-8">
        <h4 className="text-md font-semibold mb-2">Prefect UI</h4>
        <PrefectIframe />
      </div>
    </div>
  );
};
