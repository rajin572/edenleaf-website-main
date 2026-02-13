const STATUS_STYLES: Record<string, string> = {
    PENDING: "bg-gray-500/10 text-gray-600",
    CONFIRMED: "bg-blue-500/10 text-blue-600",
    PROCESSING: "bg-amber-500/10 text-amber-600",
    PACKED: "bg-blue-500/10 text-blue-600",
    SHIPPED: "bg-primary/10 text-primary",
    OUT_FOR_DELIVERY: "bg-primary/10 text-primary",
    DELIVERED: "bg-emerald-500/10 text-emerald-600",
    DELIVERY_FAILED: "bg-destructive/10 text-destructive",
    RETURNED_TO_ORIGIN: "bg-orange-500/10 text-orange-600",
    CANCELLED: "bg-destructive/10 text-destructive",
};

const humanize = (status: string) =>
    status
        .toLowerCase()
        .split("_")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");

export default function OrderStatusBadge({ status }: { status: string }) {
    const style = STATUS_STYLES[status] ?? "bg-muted text-muted-foreground";
    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${style}`}>
            {humanize(status)}
        </span>
    );
}
