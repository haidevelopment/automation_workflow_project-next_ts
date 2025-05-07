"use client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ParamsProps } from "@/types/appNode";
import React, { useEffect, useId, useState } from "react";

function StringParam({ param, value, updateNodeParamValue,disabled }: ParamsProps) {
  const id = useId();
  const [internalValue,setInternalValue] = useState(value ?? "");
  useEffect(() => {
    setInternalValue(value);
  },[value])
  let Component:any = Input;
  if(param.variant == "textarea"){
    Component = Textarea;
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
      />
      {param.helperText && (
        <p className="text-muted-foreground px-2">{param.helperText}</p>
      )}
    </div>
  );
}

export default StringParam;
