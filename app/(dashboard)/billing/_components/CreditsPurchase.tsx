"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import { CreditsPack } from "@/lib/workflow/billing/pricing";
import { useMutation } from "@tanstack/react-query";
import { createCheckoutSession } from "@/lib/actions/stripe";
import { toast } from "sonner";

export default function CreditsPurchase({ packs }: { packs: CreditsPack[] }) {
  const [mounted, setMounted] = React.useState(false);

  const mutation = useMutation({
    mutationFn: createCheckoutSession,
    onSuccess: (url) => {
      window.location.href = url;
    },
    onError: (error: any) => {
      toast.error(error.message || "Đã có lỗi xảy ra khi khởi tạo thanh toán");
    },
  });

  React.useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {packs.map((pack) => (
        <Card key={pack.id} className="flex flex-col justify-between hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="text-xl">{pack.name}</CardTitle>
            <CardDescription>{pack.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-bold">${pack.price}</span>
              <span className="text-muted-foreground">/ một lần</span>
            </div>

            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span>{mounted ? pack.credits.toLocaleString() : pack.credits} Credits</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span>Sử dụng trọn đời</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span>Support 24/7</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full"
              variant={pack.id === "pro" ? "default" : "outline"}
              disabled={mutation.isPending}
              onClick={() => {
                mutation.mutate(pack.id);
              }}
            >
              {mutation.isPending ? "Connecting..." : `Buy ${mounted ? pack.credits.toLocaleString() : pack.credits} Credits`}
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
