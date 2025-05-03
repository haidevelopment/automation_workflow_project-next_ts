"use client";
import { DeleteWorkflow } from "@/actions/workflows/deleteWorkflow";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { useMutation } from "@tanstack/react-query";
import React, { use, useState } from "react";
import { toast } from "sonner";
interface Props {
  open: boolean;
  setOpen: (open: boolean) => void;
  workflowName: string;
  workflowId: string;
}
function DeleteWorkflowDialog({ open, setOpen, workflowName,workflowId }: Props) {
  const [confirmText, setConfirmText] = useState("");
  const deleteMutation = useMutation({
    mutationFn: DeleteWorkflow,
    onSuccess: () => {
      toast.success("Xóa thành công workflows", { id: workflowId });
      setConfirmText("");
    },
    onError: () => {
      toast.error("Something went wrong delete workflows",{id:workflowId});
    },
  });
  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are yout absolutely sure ?</AlertDialogTitle>
          <AlertDialogDescription>
            If you delete workflow , you will not be able to recover it
            <div className="flex-flex-col py-4 gap-2">
              <p>
                If you are sure ,enter <b>{workflowName}</b> to confirm
              </p>
              <Input
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
              />
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={()=> setConfirmText("")}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            disabled={confirmText != workflowName || deleteMutation.isPending}
            onClick={(e) => {
              e.stopPropagation();
              toast.loading("Deleting workflow...",{id:workflowId});
              deleteMutation.mutate(workflowId)
            }}
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default DeleteWorkflowDialog;
