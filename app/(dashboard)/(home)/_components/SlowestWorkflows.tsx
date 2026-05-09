import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { FormatDurationMs } from "@/lib/helper/dates";

export type SlowestWorkflowRow = {
  id: string;
  workflowId: string;
  workflowName: string;
  status: string;
  startedAt: string;
  completedAt: string;
  durationMs: number;
  creditsConsumed: number;
};

function StatusBadge({ status }: { status: string }) {
  const s = status?.toUpperCase?.() ?? status;
  const variant = s === "COMPLETED" ? "default" : s === "FAILED" ? "destructive" : "secondary";
  return <Badge variant={variant as any}>{status}</Badge>;
}

export default function SlowestWorkflows({ rows }: { rows: SlowestWorkflowRow[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Slowest Workflows</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Workflow</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead className="text-right">Credits</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(rows ?? []).map((r) => {
              const durationLabel = FormatDurationMs(r.durationMs);

              return (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">{r.workflowName}</TableCell>
                  <TableCell>
                    <StatusBadge status={r.status} />
                  </TableCell>
                  <TableCell>{durationLabel}</TableCell>
                  <TableCell className="text-right">{r.creditsConsumed}</TableCell>
                </TableRow>
              );
            })}

            {!rows?.length && (
              <TableRow>
                <TableCell colSpan={4} className="text-muted-foreground">
                  No data
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
