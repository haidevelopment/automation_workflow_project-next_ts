import React, { Suspense } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { getWorkflowExecutionStats } from "@/lib/services/stats";
import DashboardChart from "./_components/DashboardChart";
import { Activity, CheckCircle, Coins, ShieldCheck, Timer, Zap } from "lucide-react";
import { FormatDurationMs, FormatMinutesToHoursMinutes } from "@/lib/helper/dates";
import SlowestWorkflows from "./_components/SlowestWorkflows";
import ExecutionLogTable from "./_components/ExecutionLogTable";

async function DashboardStats() {
  const stats = await getWorkflowExecutionStats();
  const successRate = stats.metadata.totalRuns
    ? Math.round((stats.metadata.successRuns / stats.metadata.totalRuns) * 100)
    : 0;

  const avgDurationLabel = (() => {
    const ms = stats.runtime.avgDurationMs;
    return FormatDurationMs(ms);
  })();

  const runwayDays = stats.finance.runwayDays;
  const runwayLabel = runwayDays === null ? "-" : `${runwayDays} days`;
  const runwayProgress = (() => {
    if (runwayDays === null) return 0;
    const capped = Math.max(0, Math.min(runwayDays, 30));
    return Math.round((capped / 30) * 100);
  })();

  const unitCostLabel = (() => {
    const v = stats.performance.unitCostCreditsPerSuccessRun;
    if (v === null) return "-";
    return `${v} credits`;
  })();

  const timeSavedLabel = FormatMinutesToHoursMinutes(stats.productivity.timeSavedMinutes);
  const connectionsLabel = `${stats.connections.activeOrValid} / ${stats.connections.total} accounts`;

  return (
    <div className="flex flex-col gap-6">
      {stats.metadata.totalRuns > 0 && successRate < 50 && (
        <div className="rounded-md border border-yellow-300 bg-yellow-50 px-4 py-3 text-sm text-yellow-900">
          Hệ thống đang có tỷ lệ lỗi cao, vui lòng kiểm tra lại các Workflow hay thất bại
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Tổng quan hoạt động hệ thống</p>
        </div>
        <Badge variant="secondary">Last 7 days</Badge>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Tổng lượt chạy"
          icon={<Activity className="h-5 w-5 text-muted-foreground" />}
          value={stats.metadata.totalRuns}
          badge={`${stats.metadata.successRuns} success • ${stats.metadata.failedRuns} failed`}
        />
        <StatCard
          title="Tỷ lệ thành công"
          icon={<CheckCircle className="h-5 w-5 text-muted-foreground" />}
          value={`${successRate}%`}
          badge={`${stats.metadata.successRuns}/${stats.metadata.totalRuns} runs`}
        />
        <StatCard
          title="Thời gian trung bình"
          icon={<Timer className="h-5 w-5 text-muted-foreground" />}
          value={avgDurationLabel}
          badge={`${stats.runtime.avgDurationMs}ms`}
        />
        <StatCard
          title="Credits tiêu thụ"
          icon={<Coins className="h-5 w-5 text-muted-foreground" />}
          value={stats.credits.totalConsumed}
          badge="credits"
        />

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dự báo tài chính</CardTitle>
            <Coins className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-2xl font-bold">{runwayLabel}</div>
            <Progress
              value={runwayProgress}
              className={runwayDays !== null && runwayDays < 7 ? "[&>div]:bg-red-500" : undefined}
            />
            <Badge variant="secondary" className="font-normal">
              Burn rate: {stats.finance.burnRateCreditsPerDay} credits/day • Balance: {stats.finance.currentCredits}
            </Badge>
          </CardContent>
        </Card>

        <StatCard
          title="Chi phí đơn vị"
          icon={<Coins className="h-5 w-5 text-muted-foreground" />}
          value={unitCostLabel}
          badge="avg credits / success run"
        />

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Thời gian tiết kiệm</CardTitle>
            <Zap className="h-5 w-5 text-yellow-500" />
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-2xl font-bold">{timeSavedLabel}</div>
            <Badge variant="secondary" className="font-normal">
              {stats.metadata.successRuns} success runs • 10 phút/run
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kết nối khả dụng</CardTitle>
            <ShieldCheck className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-2xl font-bold">{connectionsLabel}</div>
            <Badge variant="secondary" className="font-normal">
              Accounts with non-expired tokens
            </Badge>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="space-y-1">
            <CardTitle>Time Series</CardTitle>
            <p className="text-sm text-muted-foreground">Success vs Failed trong 7 ngày qua</p>
          </div>
          <Badge variant="outline">WorkflowExecution</Badge>
        </CardHeader>
        <CardContent>
          <DashboardChart data={stats.timeSeriesLast7Days} />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <SlowestWorkflows rows={stats.runtime.top5LongestRuns} />
        <ExecutionLogTable rows={stats.recentRuns} />
      </div>
    </div>
  );
}

function StatCard({
  title,
  icon,
  value,
  badge,
}: {
  title: string;
  icon: React.ReactNode;
  value: React.ReactNode;
  badge: string;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="text-2xl font-bold">{value}</div>
        <Badge variant="secondary" className="font-normal">
          {badge}
        </Badge>
      </CardContent>
    </Card>
  );
}

function DashboardStatsSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-9 w-40" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-6 w-24" />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-5 w-5 rounded-full" />
            </CardHeader>
            <CardContent className="space-y-2">
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-6 w-40" />
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-6 w-28" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[320px] w-full" />
        </CardContent>
      </Card>
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<DashboardStatsSkeleton />}>
      <DashboardStats />
    </Suspense>
  );
}
