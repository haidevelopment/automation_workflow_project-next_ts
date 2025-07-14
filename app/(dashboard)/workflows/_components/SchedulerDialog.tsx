"use client"
import { UpdateWorfklowCron } from '@/actions/workflows/updateWorkflowCron'
import CustomDialogHeader from '@/components/CustomDialogHeader'
import { Button } from '@/components/ui/button'
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { useMutation } from '@tanstack/react-query'
import { CalendarIcon, ClockIcon, TriangleAlertIcon } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { toast } from 'sonner'
import cronstrue from 'cronstrue'
import CronExpressionParser from 'cron-parser'
import { RemoveWorkflowSchedule } from '@/actions/workflows/removeWorkflowSchedule'
import { Separator } from '@/components/ui/separator'
function SchedulerDialog(props: { cron?: string, workflowId?: string }) {
    const [cron, setCron] = useState(props.cron || "");
    const [validCron, setValidCron] = useState(false);
    const [readableCron, setReadableCron] = useState("");
    const mutation = useMutation({
        mutationFn: UpdateWorfklowCron,
        onSuccess: () => {
            toast.success("Workflow scheduled successfully", { id: "schedule" })
        },
        onError: () => {
            toast.error("Something went wrong", { id: "schedule" })
        }
    })
    const removeScheduleMutation = useMutation({
        mutationFn: RemoveWorkflowSchedule,
        onSuccess: () => {
            toast.success("Workflow scheduled successfully", { id: "schedule" })
        },
        onError: () => {
            toast.error("Something went wrong", { id: "schedule" })
        }
    })
    useEffect(() => {
        try {
            CronExpressionParser.parse(cron);
            const humanCronStr = cronstrue.toString(cron);
            setReadableCron(humanCronStr);
            setValidCron(true);
        } catch (error) {
            setValidCron(false);
        }
    }, [cron])
    const workflowHasValidCron = props.cron && props.cron.length > 0;
    const readableSaveCron = workflowHasValidCron && cronstrue.toString(props.cron!);
    return (
        <Dialog>
            <DialogTrigger asChild >
                <Button variant={"link"} size="sm" className={cn("text-sm p-0 h-auto text-orange-500",workflowHasValidCron && "text-primary")}>
                    {workflowHasValidCron && <div className="flex items-center gap-2">
                        <ClockIcon className="h-4 w-4" size={20} />
                        {readableSaveCron}
                    </div>}
                   {!workflowHasValidCron &&  <div className="flex items-center gap-1">
                        <TriangleAlertIcon className="h-4 w-4" /> Set Schedule for Tool
                    </div>}
                </Button>
            </DialogTrigger>
            <DialogContent className="px-0" >
                <CustomDialogHeader title="Set Schedule for Tool" icon={CalendarIcon} />
                <div className="p-6 space-y-4">
                    <p className="text-muted-foreground text-sm">
                        Specify a cron expression to schedule periodic execution of the tool
                    </p>
                    <Input placeholder="E.g. * * * * *" className="w-full" onChange={(e) => setCron(e.target.value)} value={cron} />
                    <div className={cn("bg-accent text-sm p-4 border rounded-md", validCron ? " border-primary text-primary" : "border-destructive text-destructive")}>{validCron ? readableCron : "Not a valid cron expression"}</div>
                    {workflowHasValidCron && <DialogClose asChild>
                        <div className="">
                            <Button variant={"outline"} className="w-full text-destructive border-destructive hover:bg-destructive" disabled={removeScheduleMutation.isPending || mutation.isPending} onClick={() => {
                                toast.loading("Removing schedule...", { id: "schedule" })
                                removeScheduleMutation.mutate(props.workflowId!)
                            }}>Remove Schedule</Button>
                            <Separator className="my-4" />
                        </div>
                    </DialogClose>}
                </div>
                <DialogFooter className="px-6 gap-2">
                    <DialogClose asChild>
                        <Button className="w-full" variant={"secondary"}>Cancel</Button>
                    </DialogClose>
                    <DialogClose asChild onClick={() => {
                        toast.loading("Saving...", { id: "schedule" })
                        mutation.mutate({ id: props.workflowId!, cron })
                    }} disabled={mutation.isPending && !validCron}>
                        <Button className="w-full" >Save</Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default SchedulerDialog
