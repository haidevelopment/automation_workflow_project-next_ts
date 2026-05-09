import { intervalToDuration } from "date-fns";

export function DatesToDurationString(end: Date | null | undefined, start: Date | null | undefined) {
    if (!end || !start) return null
    const timeElapsed = end.getTime() - start.getTime();
    if (timeElapsed < 1000) {
        //less then 1 second
        return `${timeElapsed}ms`
    }
    const duration = intervalToDuration({
        start: 0,
        end: timeElapsed,
    })
    return `${duration.minutes || 0}m ${duration.seconds || 0}s`
}

export function FormatDurationMs(durationMs: number | null | undefined) {
    if (!durationMs || durationMs <= 0) return "-"
    const totalSeconds = Math.floor(durationMs / 1000)
    const seconds = totalSeconds % 60
    const totalMinutes = Math.floor(totalSeconds / 60)
    const minutes = totalMinutes % 60
    const hours = Math.floor(totalMinutes / 60)
    if (hours > 0) {
        return `${hours}h ${minutes}m`
    }
    return `${minutes}m ${seconds}s`
}

export function FormatMinutesToHoursMinutes(totalMinutes: number | null | undefined) {
    if (!totalMinutes || totalMinutes <= 0) return "0 giờ 0 phút"
    const hours = Math.floor(totalMinutes / 60)
    const minutes = totalMinutes % 60
    return `${hours} giờ ${minutes} phút`
}