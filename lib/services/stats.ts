"use server";

import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { Prisma } from "@/lib/generated/prisma";
import { WorkflowExecutionStatus } from "@/types/workflow";

function toIsoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function startOfUtcDay(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

function addUtcDays(d: Date, days: number): Date {
  return new Date(d.getTime() + days * 24 * 60 * 60 * 1000);
}

export type WorkflowExecutionStats = {
  metadata: {
    totalRuns: number;
    successRuns: number;
    failedRuns: number;
  };
  productivity: {
    timeSavedMinutes: number;
  };
  connections: {
    activeOrValid: number;
    total: number;
  };
  performance: {
    unitCostCreditsPerSuccessRun: number | null;
  };
  finance: {
    currentCredits: number;
    burnRateCreditsPerDay: number;
    runwayDays: number | null;
    top5ExpensiveWorkflows: Array<{
      workflowId: string;
      workflowName: string;
      totalCreditsConsumed: number;
    }>;
  };
  runtime: {
    avgDurationMs: number;
    top5LongestRuns: Array<{
      id: string;
      workflowId: string;
      workflowName: string;
      status: string;
      startedAt: string;
      completedAt: string;
      durationMs: number;
      creditsConsumed: number;
    }>;
  };
  recentRuns: Array<{
    id: string;
    workflowId: string;
    workflowName: string;
    status: string;
    startedAt: string | null;
    completedAt: string | null;
    createdAt: string;
    creditsConsumed: number;
    durationMs: number | null;
  }>;
  timeSeriesLast7Days: Array<{
    date: string;
    success: number;
    failed: number;
    runs: number;
    creditsConsumed: number;
  }>;
  credits: {
    totalConsumed: number;
  };
};

export async function getWorkflowExecutionStats(): Promise<WorkflowExecutionStats> {
  const { userId } = await auth();
  if (!userId) throw new Error("unauthenticated");

  const [totalRuns, successRuns, failedRuns, creditsAgg, userBalance] = await Promise.all([
    prisma.workflowExecution.count({ where: { userId } }),
    prisma.workflowExecution.count({ where: { userId, status: WorkflowExecutionStatus.COMPLETED } }),
    prisma.workflowExecution.count({ where: { userId, status: WorkflowExecutionStatus.FAILED } }),
    prisma.workflowExecution.aggregate({
      where: { userId },
      _sum: { creditsConsumed: true },
    }),
    prisma.userBalance.findUnique({ where: { userId }, select: { credits: true } }),
  ]);

  const connectionsRows = (await prisma.$queryRaw(
    Prisma.sql`
      SELECT
        (SELECT COUNT(*) FROM Credentials WHERE userId = ${userId}) as total,
        (SELECT COUNT(*) FROM Credentials WHERE userId = ${userId} AND status IN ('ACTIVE','VALID')) as activeOrValid
    `
  )) as Array<{ total: number | bigint; activeOrValid: number | bigint }>;

  const totalConnections = Number(connectionsRows?.[0]?.total ?? 0);
  const activeConnections = Number(connectionsRows?.[0]?.activeOrValid ?? 0);

  const endedForAvg = await prisma.workflowExecution.findMany({
    where: {
      userId,
      startedAt: { not: null },
      completedAt: { not: null },
    },
    select: { startedAt: true, completedAt: true },
    orderBy: { completedAt: "desc" },
    take: 1000,
  });

  const avgDurationMs = (() => {
    let sum = 0;
    let n = 0;
    for (const r of endedForAvg) {
      if (!r.startedAt || !r.completedAt) continue;
      const ms = r.completedAt.getTime() - r.startedAt.getTime();
      if (ms < 0) continue;
      sum += ms;
      n += 1;
    }
    if (!n) return 0;
    return Math.round(sum / n);
  })();

  const top5Rows = (await prisma.$queryRaw(
    Prisma.sql`
      SELECT
        we.id as id,
        we.workflowId as workflowId,
        w.name as workflowName,
        we.status as status,
        we.startedAt as startedAt,
        we.completedAt as completedAt,
        we.creditsConsumed as creditsConsumed,
        ((julianday(we.completedAt) - julianday(we.startedAt)) * 86400000.0) as durationMs
      FROM WorkflowExecution we
      JOIN Workflow w ON w.id = we.workflowId
      WHERE we.userId = ${userId}
        AND we.startedAt IS NOT NULL
        AND we.completedAt IS NOT NULL
        AND we.completedAt >= we.startedAt
      ORDER BY durationMs DESC
      LIMIT 5
    `
  )) as Array<{
    id: string;
    workflowId: string;
    workflowName: string;
    status: string;
    startedAt: string;
    completedAt: string;
    creditsConsumed: number;
    durationMs: number;
  }>;

  const recentRunsRows = await prisma.workflowExecution.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 5,
    select: {
      id: true,
      workflowId: true,
      status: true,
      startedAt: true,
      completedAt: true,
      createdAt: true,
      creditsConsumed: true,
      workflow: { select: { name: true } },
    },
  });

  const now = new Date();
  const todayUtc = startOfUtcDay(now);
  const startUtc = addUtcDays(todayUtc, -6);

  const last7Executions = await prisma.workflowExecution.findMany({
    where: {
      userId,
      status: { in: [WorkflowExecutionStatus.COMPLETED, WorkflowExecutionStatus.FAILED] },
      OR: [
        { startedAt: { gte: startUtc } },
        { startedAt: null, createdAt: { gte: startUtc } },
      ],
    },
    select: {
      status: true,
      startedAt: true,
      createdAt: true,
      creditsConsumed: true,
    },
  });

  const baseDays = Array.from({ length: 7 }).map((_, i) => {
    const d = addUtcDays(startUtc, i);
    return { date: toIsoDate(d), success: 0, failed: 0, runs: 0, creditsConsumed: 0 };
  });

  const indexByDay = new Map(baseDays.map((d, idx) => [d.date, idx]));
  for (const r of last7Executions) {
    const dt = r.startedAt ?? r.createdAt;
    const day = toIsoDate(startOfUtcDay(dt));
    const idx = indexByDay.get(day);
    if (idx === undefined) continue;
    if (r.status === WorkflowExecutionStatus.COMPLETED) baseDays[idx].success += 1;
    if (r.status === WorkflowExecutionStatus.FAILED) baseDays[idx].failed += 1;
    baseDays[idx].runs += 1;
    baseDays[idx].creditsConsumed += Number(r.creditsConsumed ?? 0);
  }

  const burnRateCreditsPerDay = Math.round(
    baseDays.reduce((sum, d) => sum + Number(d.creditsConsumed ?? 0), 0) / 7
  );

  const currentCredits = Number(userBalance?.credits ?? 0);
  const runwayDays = burnRateCreditsPerDay > 0 ? Number((currentCredits / burnRateCreditsPerDay).toFixed(2)) : null;

  const totalCreditsConsumedAllTime = Number(creditsAgg?._sum?.creditsConsumed ?? 0);
  const unitCostCreditsPerSuccessRun = successRuns > 0 ? Number((totalCreditsConsumedAllTime / successRuns).toFixed(2)) : null;

  const expensiveRows = (await prisma.$queryRaw(
    Prisma.sql`
      SELECT
        we.workflowId as workflowId,
        w.name as workflowName,
        SUM(COALESCE(we.creditsConsumed, 0)) as totalCreditsConsumed
      FROM WorkflowExecution we
      JOIN Workflow w ON w.id = we.workflowId
      WHERE we.userId = ${userId}
      GROUP BY we.workflowId, w.name
      ORDER BY totalCreditsConsumed DESC
      LIMIT 5
    `
  )) as Array<{
    workflowId: string;
    workflowName: string;
    totalCreditsConsumed: number | bigint;
  }>;

  return {
    metadata: {
      totalRuns,
      successRuns,
      failedRuns,
    },
    productivity: {
      timeSavedMinutes: successRuns * 10,
    },
    connections: {
      activeOrValid: activeConnections,
      total: totalConnections,
    },
    performance: {
      unitCostCreditsPerSuccessRun,
    },
    finance: {
      currentCredits,
      burnRateCreditsPerDay,
      runwayDays,
      top5ExpensiveWorkflows: (expensiveRows ?? []).map((r) => ({
        workflowId: r.workflowId,
        workflowName: r.workflowName,
        totalCreditsConsumed: typeof r.totalCreditsConsumed === "bigint" ? Number(r.totalCreditsConsumed) : Number(r.totalCreditsConsumed ?? 0),
      })),
    },
    runtime: {
      avgDurationMs,
      top5LongestRuns: (top5Rows ?? []).map((r) => ({
        id: r.id,
        workflowId: r.workflowId,
        workflowName: r.workflowName,
        status: r.status,
        startedAt: new Date(r.startedAt).toISOString(),
        completedAt: new Date(r.completedAt).toISOString(),
        durationMs: (() => {
          const started = new Date(r.startedAt);
          const completed = new Date(r.completedAt);
          const ms = completed.getTime() - started.getTime();
          if (Number.isFinite(ms) && ms >= 0) return ms;
          return Math.round(Number(r.durationMs ?? 0));
        })(),
        creditsConsumed: Number(r.creditsConsumed ?? 0),
      })),
    },
    recentRuns: (recentRunsRows ?? []).map((r) => {
      const durationMs = r.startedAt && r.completedAt ? r.completedAt.getTime() - r.startedAt.getTime() : null;
      return {
        id: r.id,
        workflowId: r.workflowId,
        workflowName: r.workflow?.name ?? r.workflowId,
        status: r.status,
        startedAt: r.startedAt ? r.startedAt.toISOString() : null,
        completedAt: r.completedAt ? r.completedAt.toISOString() : null,
        createdAt: r.createdAt.toISOString(),
        creditsConsumed: Number(r.creditsConsumed ?? 0),
        durationMs: durationMs !== null && durationMs >= 0 ? durationMs : null,
      };
    }),
    timeSeriesLast7Days: baseDays,
    credits: {
      totalConsumed: totalCreditsConsumedAllTime,
    },
  };
}
