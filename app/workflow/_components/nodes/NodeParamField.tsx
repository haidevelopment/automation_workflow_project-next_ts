"use client";
import { Input } from "@/components/ui/input";
import { TaskParam, TaskParamType } from "@/types/task";
import React, { useCallback } from "react";
import StringParam from "./StringParam";
import { useReactFlow } from "@xyflow/react";
import { AppNode } from "@/types/appNode";
import BrowserInstanceParam from "./BrowserInstanceParam";
import CredentialParam from "./CredentialParam";

function NodeParamField({ param,nodeId ,disabled}: { param: TaskParam,nodeId:string,disabled:boolean }) {
  const {updateNodeData,getNode} = useReactFlow();
  const node = getNode(nodeId) as AppNode;
  const value = node?.data.inputs?.[param.name];
  
  const dependsOnValue = param.dependsOn ? node?.data.inputs?.[param.dependsOn] : undefined;

  const updateNodeParamValue = useCallback((newValue:string)=>{
   updateNodeData(nodeId,{
    inputs:{
      ...node?.data.inputs,
      [param.name]: newValue
    }
   })
  },[updateNodeData,node?.data.inputs,param.name,nodeId])
  
  const resolvedParam: TaskParam = (() => {
    const base = { ...param, dependsOnValue };
    if (param.variant !== "select") return base;
    if (!param.optionsByProvider || !param.dependsOn) return base;
    const provider = node?.data.inputs?.[param.dependsOn];
    const options = provider ? param.optionsByProvider[provider] : undefined;
    return {
      ...base,
      options: options ?? [],
    };
  })();
  switch (param.type) {
    case TaskParamType.STRING:
      return <StringParam param={resolvedParam} value={value} updateNodeParamValue={updateNodeParamValue} disabled={disabled} />;
    case TaskParamType.BROWSER_INSTANCE:
        return <BrowserInstanceParam param={param} value={value} updateNodeParamValue={updateNodeParamValue} />;
    case TaskParamType.CREDENTIAL:
      return <CredentialParam param={resolvedParam} value={value} updateNodeParamValue={updateNodeParamValue} disabled={disabled} />;
    default:
      return (
        <div className="w-full">
          <p className="text-xs text-muted-foreground">Not Implemented</p>
        </div>
      );
  }
}

export default NodeParamField;
