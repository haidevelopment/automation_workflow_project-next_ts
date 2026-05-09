import React, { Suspense } from "react";
import { getUserBalance } from "@/lib/actions/billing";
import { CREDITS_PACKS } from "@/lib/workflow/billing/pricing";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CoinsIcon } from "lucide-react";
import CreditsPurchase from "./_components/CreditsPurchase";
import ReactCountUpWrapper from "./_components/ReactCountUpWrapper";
import TransactionHistoryTable from "./_components/TransactionHistoryTable";
import BillingNotifications from "./_components/BillingNotifications";

export default function BillingPage() {
  return (
    <div className="flex-1 flex flex-col h-full gap-8 p-4 md:p-8">
      <Suspense fallback={null}>
        <BillingNotifications />
      </Suspense>
      <div className="flex flex-col">
        <h1 className="text-3xl font-bold">Billing & Credits</h1>
        <p className="text-muted-foreground">Quản lý số dư Credit và các gói dịch vụ của bạn</p>
      </div>

      <Suspense fallback={<BalanceSkeleton />}>
        <BalanceCard />
      </Suspense>

      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Nạp thêm Credits</h2>
        <CreditsPurchase packs={CREDITS_PACKS} />
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Lịch sử giao dịch</h2>
        <Suspense fallback={<Skeleton className="h-[300px] w-full rounded-xl" />}>
          <TransactionHistoryTable />
        </Suspense>
      </div>
    </div>
  );
}

async function BalanceCard() {
  const balance = await getUserBalance();

  return (
    <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-none shadow-lg">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-emerald-100 text-sm font-medium uppercase tracking-wider">
              Số dư hiện tại
            </p>
            <div className="flex items-baseline gap-2">
              <ReactCountUpWrapper value={balance.credits} />
              <span className="text-emerald-100 font-medium">Credits</span>
            </div>
          </div>
          <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-sm">
            <CoinsIcon size={48} className="text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function BalanceSkeleton() {
  return <Skeleton className="h-[140px] w-full rounded-xl" />;
}
