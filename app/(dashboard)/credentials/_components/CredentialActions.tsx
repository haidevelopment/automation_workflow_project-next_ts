"use client";

import React, { useTransition } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Trash2, RefreshCw, Loader2 } from "lucide-react";
import { deleteCredential, validateCredential } from "@/lib/actions/credentials";
import { toast } from "sonner";

export default function CredentialActions({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();

  const onDelete = () => {
    if (!confirm("Bạn có chắc chắn muốn xóa kết nối này?")) return;
    startTransition(async () => {
      try {
        await deleteCredential(id);
        toast.success("Đã xóa kết nối");
      } catch (error: any) {
        toast.error(error.message || "Không thể xóa kết nối");
      }
    });
  };

  const onValidate = () => {
    startTransition(async () => {
      try {
        const result = await validateCredential(id);
        if (result.status === "VALID") {
          toast.success("Kết nối hoạt động tốt");
        } else {
          toast.error(`Kết nối không hợp lệ: ${result.status}`);
        }
      } catch (error: any) {
        toast.error(error.message || "Lỗi khi kiểm tra kết nối");
      }
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0" disabled={isPending}>
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <MoreHorizontal className="h-4 w-4" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem onClick={onValidate} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Refresh / Validate
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onDelete} className="text-destructive gap-2">
          <Trash2 className="h-4 w-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
