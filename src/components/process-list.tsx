import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Process } from "../lib/types";

export const ProcessList: React.FC<{ processes: Process[] }> = ({
  processes,
}) => {
  return (
    <div className="mb-4">
      <h3 className="text-lg font-semibold mb-2">Processs</h3>
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
          {processes.map((process) => (
            <TableRow key={process.id}>
              <TableCell>{process.id}</TableCell>
              <TableCell>{process.name}</TableCell>
              <TableCell>{process.cpu.toFixed(1)}</TableCell>
              <TableCell>{process.memory.toFixed(1)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
