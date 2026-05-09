import React from "react";
import { getTransactionHistory } from "@/lib/actions/billing";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { ArrowDownLeft, ArrowUpRight } from "lucide-react";

export default async function TransactionHistoryTable() {
  const transactions = await getTransactionHistory();

  return (
    <Card>
      <CardContent>
        {transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
            <p>Chưa có giao dịch nào</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ngày giao dịch</TableHead>
                <TableHead>Loại</TableHead>
                <TableHead>Số lượng Credit</TableHead>
                <TableHead>Mô tả</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(transactions as any[]).map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell className="text-muted-foreground">
                    {format(new Date(tx.createdAt), "dd/MM/yyyy HH:mm")}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {tx.type === "DEPOSIT" ? (
                        <ArrowDownLeft className="h-4 w-4 text-emerald-500" />
                      ) : (
                        <ArrowUpRight className="h-4 w-4 text-red-500" />
                      )}
                      <span
                        className={
                          tx.type === "DEPOSIT"
                            ? "text-emerald-600 font-medium"
                            : "text-red-600 font-medium"
                        }
                      >
                        {tx.type === "DEPOSIT" ? "Nạp tiền" : "Sử dụng"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span
                      className={
                        tx.type === "DEPOSIT"
                          ? "text-emerald-600 font-bold"
                          : "text-red-600 font-bold"
                      }
                    >
                      {tx.type === "DEPOSIT" ? "+" : "-"}
                      {tx.amount.toLocaleString()}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground max-w-[300px] truncate">
                    {tx.description || "-"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
