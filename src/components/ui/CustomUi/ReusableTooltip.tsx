import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "../tooltip"

interface ReusableTooltipProps {
    children: React.ReactElement
    content: string | React.ReactNode
    side?: "top" | "right" | "bottom" | "left"
    align?: "start" | "center" | "end"
    delayDuration?: number
}

export function ReusableTooltip({
    children,
    content,
    side = "top",
    align = "center",
    delayDuration = 200
}: ReusableTooltipProps) {
    return (
        <TooltipProvider delay={delayDuration}>
            <Tooltip>
                <TooltipTrigger render={children} />
                <TooltipContent side={side} align={align}>
                    {typeof content === 'string' ? <p>{content}</p> : content}
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    )
}