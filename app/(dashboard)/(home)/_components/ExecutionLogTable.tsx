import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FormatDurationMs } from "@/lib/helper/dates";
import Link from "next/link";

export type RecentRunRow = {
  id: string;
  workflowId: string;
  workflowName: string;
  status: string;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  creditsConsumed: number;
  durationMs: number | null;
};

function StatusBadge({ status }: { status: string }) {
  const s = status?.toUpperCase?.() ?? status;
  const variant = s === "COMPLETED" ? "default" : s === "FAILED" ? "destructive" : "secondary";
  return <Badge variant={variant as any}>{status}</Badge>;
}

export default function ExecutionLogTable({ rows }: { rows: RecentRunRow[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Runs</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Workflow</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Thời gian chạy</TableHead>
              <TableHead className="text-right">Credits</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(rows ?? []).map((r) => {
              const durationLabel = FormatDurationMs(r.durationMs);

              return (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">
                    <Link
                      href={`/workflow/runs/${r.workflowId}/${r.id}`}
                      className="hover:underline underline-offset-4"
                    >
                      {r.workflowName}
                    </Link>
                  </TableCell>
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
