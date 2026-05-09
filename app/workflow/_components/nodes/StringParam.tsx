"use client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ParamsProps } from "@/types/appNode";
import React, { useEffect, useId, useState } from "react";

function StringParam({ param, value, updateNodeParamValue,disabled }: ParamsProps) {
  const id = useId();
  const resolvedValue = (value ?? param.defaultValue ?? "") as string;
  const [internalValue,setInternalValue] = useState(resolvedValue);
  useEffect(() => {
    setInternalValue(resolvedValue);
    if ((value === undefined || value === null || value === "") && param.defaultValue !== undefined) {
      updateNodeParamValue(param.defaultValue as string);
    }
  },[resolvedValue, value, param.defaultValue, updateNodeParamValue])
  let Component:any = Input;
  if(param.variant == "textarea"){
    Component = Textarea;
  }
  if (param.variant === "select") {
    const options = (param.options ?? []) as string[];
    return (
      <div className="space-y-4 p-1 w-full">
        <Label htmlFor={id} className="text-xs flex">
          {param.name} {param.required && <p className="text-red-400 px-2">*</p>}
        </Label>
        <Select
          value={internalValue}
          onValueChange={(v) => {
            setInternalValue(v);
            updateNodeParamValue(v);
          }}
          disabled={disabled}
        >
          <SelectTrigger className="text-xs">
            <SelectValue placeholder="Select..." />
          </SelectTrigger>
          <SelectContent>
            {options.map((opt) => (
              <SelectItem key={opt} value={opt}>
                {opt}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {param.helperText && (
          <p className="text-muted-foreground px-2">{param.helperText}</p>
        )}
      </div>
    );
  }
  return (
    <div className="space-y-4 p-1 w-full">
      <Label htmlFor={id} className="text-xs flex">
        {param.name} {param.required && <p className="text-red-400 px-2">*</p>}
      </Label>
      <Component
        id={id}
        value={internalValue}
        onChange={(e:any) => setInternalValue(e.target.value)}
        onBlur={(e:any)=>updateNodeParamValue(e.target.value)}
        placeholder="Enter value here..."
        className="text-xs"
        disabled={disabled}
        type={param.variant === "password" ? "password" : undefined}
        readOnly={Boolean(param.readOnly)}
      />
      {param.helperText && (
        <p className="text-muted-foreground px-2">{param.helperText}</p>
      )}
    </div>
  );
}

export default StringParam;
