"use client";

import React, { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";

export default function BillingNotifications() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const success = searchParams.get("success");
    const canceled = searchParams.get("canceled");

    if (success === "true") {
      toast.success("Thanh toán thành công! Credits đã được cộng vào tài khoản.", {
        id: "stripe-success",
      });
      // Refresh dữ liệu Server-side để cập nhật số dư mới nhất
      router.refresh();
      // Xóa query params trên thanh địa chỉ
      router.replace("/billing");
    }

    if (canceled === "true") {
      toast.error("Giao dịch đã bị hủy.", {
        id: "stripe-canceled",
      });
      router.replace("/billing");
    }
  }, [searchParams, router]);

  return null;
}
