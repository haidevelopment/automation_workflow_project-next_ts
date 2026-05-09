import React, { Suspense } from "react";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ShieldCheck, InboxIcon, KeyIcon, CpuIcon } from "lucide-react";
import CreateCredentialDialog from "./_components/CreateCredentialDialog";
import CredentialActions from "./_components/CredentialActions";
import { format } from "date-fns";

export default function CredentialsPage() {
  return (
    <div className="flex-1 flex flex-col h-full gap-4">
      <div className="flex justify-between items-center">
        <div className="flex flex-col">
          <h1 className="text-3xl font-bold">Credentials</h1>
          <p className="text-muted-foreground">Quản lý các kết nối API và tài khoản của bạn</p>
        </div>
        <CreateCredentialDialog />
      </div>

      <div className="h-full py-4">
        <Suspense fallback={<CredentialsSkeleton />}>
          <CredentialsList />
        </Suspense>
      </div>
    </div>
  );
}

function CredentialsSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3, 4].map((i) => (
        <Skeleton key={i} className="h-16 w-full" />
      ))}
    </div>
  );
}

async function CredentialsList() {
  const { userId } = await auth();
  if (!userId) return null;

  const credentials = await (prisma as any).credentials.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  if (credentials.length === 0) {
    return (
      <div className="flex flex-col h-[400px] items-center justify-center border-2 border-dashed rounded-lg bg-muted/20">
        <div className="rounded-full bg-accent w-16 h-16 flex items-center justify-center mb-4">
          <InboxIcon size={32} className="text-muted-foreground" />
        </div>
        <p className="font-bold text-lg">Chưa có kết nối nào</p>
        <p className="text-sm text-muted-foreground mb-6">
          Thêm kết nối đầu tiên để bắt đầu xây dựng workflow tự động.
        </p>
        <CreateCredentialDialog />
      </div>
    );
  }

  return (
    <div className="rounded-md border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tên kết nối</TableHead>
            <TableHead>Loại</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead>Ngày tạo</TableHead>
            <TableHead className="text-right">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {credentials.map((cred: any) => (
            <TableRow key={cred.id}>
              <TableCell>
                <div className="flex items-center gap-2">
                  {cred.type === "GOOGLE" && <ShieldCheck className="h-4 w-4 text-emerald-500" />}
                  {cred.type === "OPENAI" && <KeyIcon className="h-4 w-4 text-blue-500" />}
                  {cred.type === "GEMINI" && <CpuIcon className="h-4 w-4 text-purple-500" />}
                  <span className="font-medium">{cred.name}</span>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className={getTypeStyle(cred.type)}>
                  {cred.type}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <div className={`h-2 w-2 rounded-full ${getStatusColor(cred.status)}`} />
                  <span className="text-sm capitalize">{cred.status.toLowerCase()}</span>
                </div>
              </TableCell>
              <TableCell className="text-muted-foreground text-sm">
                {format(new Date(cred.createdAt), "dd/MM/yyyy HH:mm")}
              </TableCell>
              <TableCell className="text-right">
                <CredentialActions id={cred.id} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function getTypeStyle(type: string) {
  switch (type) {
    case "GOOGLE":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "OPENAI":
      return "bg-blue-50 text-blue-700 border-blue-200";
    case "GEMINI":
      return "bg-purple-50 text-purple-700 border-purple-200";
    default:
      return "";
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case "ACTIVE":
    case "VALID":
      return "bg-emerald-500";
    case "EXPIRED":
      return "bg-amber-500";
    case "INVALID":
      return "bg-red-500";
    default:
      return "bg-gray-400";
  }
}
