"use client";

import React, { useState, useTransition } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PlusIcon, Loader2, ShieldCheck, KeyIcon } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createCredential } from "@/lib/actions/credentials";
import { toast } from "sonner";

export default function CreateCredentialDialog() {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [type, setType] = useState<"GOOGLE" | "OPENAI" | "GEMINI">("OPENAI");
  const [name, setName] = useState("");
  const [value, setValue] = useState("");

  const onSubmit = () => {
    if (!name) {
      toast.error("Vui lòng nhập tên kết nối");
      return;
    }
    if (type !== "GOOGLE" && !value) {
      toast.error("Vui lòng nhập API Key");
      return;
    }

    startTransition(async () => {
      try {
        const result: any = await createCredential({
          name,
          type,
          value: type === "GOOGLE" ? undefined : value,
        });

        if (result.ok) {
          if (result.type === "GOOGLE" && result.oauthUrl) {
            window.location.href = result.oauthUrl;
          } else {
            toast.success("Đã thêm kết nối thành công");
            setOpen(false);
            setName("");
            setValue("");
          }
        }
      } catch (error: any) {
        toast.error(error.message || "Đã có lỗi xảy ra");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <PlusIcon size={18} />
          Add Connection
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Connection</DialogTitle>
          <DialogDescription>
            Kết nối tài khoản hoặc API Key để sử dụng trong các Workflow của bạn.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Loại kết nối</Label>
            <Select
              value={type}
              onValueChange={(v: any) => setType(v)}
              disabled={isPending}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn loại kết nối" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="GOOGLE">Google (Drive/Sheets/Docs)</SelectItem>
                <SelectItem value="OPENAI">OpenAI (ChatGPT)</SelectItem>
                <SelectItem value="GEMINI">Google Gemini (AI)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Tên gợi nhớ</Label>
            <Input
              id="name"
              placeholder="Ví dụ: My OpenAI Key"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isPending}
            />
          </div>

          {type !== "GOOGLE" && (
            <div className="space-y-2">
              <Label htmlFor="value">API Key</Label>
              <div className="relative">
                <Input
                  id="value"
                  type="password"
                  placeholder="Nhập API Key của bạn"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  disabled={isPending}
                  className="pr-10"
                />
                <KeyIcon className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isPending}
          >
            Hủy
          </Button>
          <Button onClick={onSubmit} disabled={isPending} className="gap-2">
            {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            {type === "GOOGLE" ? (
              <>
                <ShieldCheck size={18} />
                Connect with Google
              </>
            ) : (
              "Save Connection"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
