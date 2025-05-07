import { AppNode, AppNodeMissingInputs } from "@/types/appNode";
import {
  WorkflowExecutionPlan,
  WorkflowExecutionPlanPhase,
} from "@/types/workflow";
import { Edge } from "@xyflow/react";
import { TaskRegistry } from "./task/registry";
export enum  FlowToExecutionPlanValidationError{
"NO_ENTRY_POINT",
"INVALID_INPUTS"
}
type FlowToExecutionPlantType = {
  executionPlan?: WorkflowExecutionPlan;
  error?:{
    type:FlowToExecutionPlanValidationError;
    invalidElements?:AppNodeMissingInputs[]
  }
};
export function FlowToExecutionPlan(
  nodes: AppNode[],
  edges: Edge[]
): FlowToExecutionPlantType {
  const entryPoint = nodes.find(
    (node) => TaskRegistry[node.data.type].isEntryPoint
  );
  if (!entryPoint) {
    return {
    error:{
      type:FlowToExecutionPlanValidationError.NO_ENTRY_POINT
    }
    }
  }
  const inputsWithErrors:AppNodeMissingInputs[]= [];
  const planned = new Set<string>();
  const invalidInputs = getInvalidInputs(entryPoint, edges, planned);
  if(invalidInputs.length > 0) {
    inputsWithErrors.push({
      nodeId:entryPoint.id,
      inputs:invalidInputs
    })
  }
  const executionPlan: WorkflowExecutionPlan= [
    { phase: 1, nodes: [entryPoint] }
  ];
  planned.add(entryPoint.id);
  for (
    let phase = 2;
    phase <= nodes.length && planned.size < nodes.length;
    phase++
  ) {
    const nextPhase: WorkflowExecutionPlanPhase = { phase, nodes: [] };
    for (const currentNode of nodes) {
      if (planned.has(currentNode.id)) {
        //node already put in the execution plan
        continue;
      }
      const invalidInputs = getInvalidInputs(currentNode, edges, planned);
      if (invalidInputs.length > 0) {
        const incomers = getIncomers(currentNode, nodes, edges);
        if (incomers.every((incomer) => planned.has(incomer.id))) {
          // if all incoming incormer/edges are planned and there are still invalid inputs
          //this mean that this particular node has and invalid input
          //which mean that the workflow is invalid
          console.log("invalid input", currentNode.id, invalidInputs);
          inputsWithErrors.push({
            nodeId:currentNode.id,
            inputs:invalidInputs
          })
        } else {
          continue;
        }
      }
      nextPhase.nodes.push(currentNode);
    }
    for(const node of nextPhase.nodes){
        planned.add(node.id);
    }
    executionPlan?.push(nextPhase);
  }
  if(inputsWithErrors.length > 0) {
    return {
      error:{
        type:FlowToExecutionPlanValidationError.INVALID_INPUTS,
        invalidElements:inputsWithErrors
      }
    }
  }
  return { executionPlan };
}
function getInvalidInputs(node: AppNode, edges: Edge[], planned: Set<string>) {
  const invalidInputs = [];
  const inputs = TaskRegistry[node?.data?.type]?.inputs;
  for (const input of inputs) {
    const inputValue = node.data.inputs[input.name];
    const inputValueProvided = inputValue?.length > 0;
    if (inputValueProvided) {
      continue;
    }
    const incommingEdges = edges.filter((edge) => edge.target === node.id);
    const inputEdgeLinkedToOutput = incommingEdges.find(
      (edge) => edge.targetHandle == input.name
    );
    const requireInputProvidedByVisitedOuput = input.required && inputEdgeLinkedToOutput && planned.has(inputEdgeLinkedToOutput.source);
    if (requireInputProvidedByVisitedOuput){
        continue;
    }else if(!input.required){
        if(!inputEdgeLinkedToOutput) continue;
        if(inputEdgeLinkedToOutput && planned.has(inputEdgeLinkedToOutput.source)){
            continue;
        }
    }
    invalidInputs.push(input.name);

  }
  return invalidInputs;
}
function getIncomers(node:AppNode,nodes:AppNode[],edges:Edge[]){
  if(!node.id){
    return [];
  }
  const incomersIds = new Set<string>();
  edges.forEach((edge) => {
    if(edge.target === node.id){
      incomersIds.add(edge.source);
    }
  }) ;
  return nodes.filter(n=>incomersIds.has(n.id));
}