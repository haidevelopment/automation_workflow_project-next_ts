"use client";

import React, { useEffect, useState } from "react";
import { TaskParam } from "@/types/task";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { getCredentialsForUserByType } from "@/lib/actions/credentials";
import { Button } from "@/components/ui/button";
import { ExternalLinkIcon, PlusIcon } from "lucide-react";
import Link from "next/link";

interface Props {
  param: TaskParam;
  value: string;
  updateNodeParamValue: (value: string) => void;
  disabled?: boolean;
}

export default function CredentialParam({
  param,
  value,
  updateNodeParamValue,
  disabled,
}: Props) {
  const [credentials, setCredentials] = useState<{ id: string; name: string }[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);

  // Map Provider to CredentialType
  const typeMap: Record<string, string> = {
    OpenAI: "OPENAI",
    "Google Gemini": "GEMINI",
    Google: "GOOGLE",
  };

  const provider = param.dependsOnValue; // This should be passed from NodeParamField
  const credentialType = provider ? typeMap[provider] : null;

  useEffect(() => {
    if (!credentialType) return;

    let cancelled = false;
    setIsLoading(true);

    getCredentialsForUserByType(credentialType)
      .then((data) => {
        if (!cancelled) {
          setCredentials(data);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [credentialType]);

  return (
    <div className="flex flex-col gap-2 w-full">
      <div className="flex items-center justify-between gap-2">
        <Label className="text-xs font-medium flex items-center gap-2">
          {param.name}
          {param.required && <span className="text-red-400">*</span>}
        </Label>
        <Button variant="link" className="h-auto p-0 text-[10px] gap-1" asChild>
          <Link href="/credentials" target="_blank">
            Manage <ExternalLinkIcon size={10} />
          </Link>
        </Button>
      </div>

      {(!credentials || credentials.length === 0) && !isLoading ? (
        <Button
          variant="outline"
          size="sm"
          className="w-full h-8 text-xs gap-2 border-dashed"
          asChild
        >
          <Link href="/credentials" target="_blank">
            <PlusIcon size={14} /> Add New Credential
          </Link>
        </Button>
      ) : (
        <Select
          value={value}
          onValueChange={updateNodeParamValue}
          disabled={disabled || isLoading || !credentialType}
        >
          <SelectTrigger className="w-full h-8 text-xs">
            <SelectValue placeholder="Select credential" />
          </SelectTrigger>
          <SelectContent>
            {credentials.map((c) => (
              <SelectItem key={c.id} value={c.id} className="text-xs">
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {param.helperText && (
        <p className="text-[10px] text-muted-foreground">{param.helperText}</p>
      )}
    </div>
  );
}
