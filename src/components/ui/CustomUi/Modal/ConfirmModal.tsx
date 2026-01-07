import {
    Ban,
    CheckCircle2,
    Info,
    ShieldCheck,
    Trash2,
    UserCheck,
    UserX,
    XCircle,
} from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { confirmReasonSchema } from "@/schemas/confirm";
import { Button } from "../../button";
import { FormTextarea } from "../ReuseForm/Form";
import ReusableModal from "../ReuseableModal";

type ConfirmVariant = "danger" | "warning" | "success" | "info";

export type ConfirmIconPreset =
    | "delete"
    | "block"
    | "unblock"
    | "decline"
    | "accept"
    | "approve"
    | "cancel";

const iconPresets: Record<ConfirmIconPreset, (variant: ConfirmVariant) => React.ReactNode> = {
    delete: (v) => <Trash2 className={`size-7 ${iconColor(v)}`} />,
    block: (v) => <Ban className={`size-7 ${iconColor(v)}`} />,
    unblock: (v) => <ShieldCheck className={`size-7 ${iconColor(v)}`} />,
    decline: (v) => <XCircle className={`size-7 ${iconColor(v)}`} />,
    accept: (v) => <CheckCircle2 className={`size-7 ${iconColor(v)}`} />,
    approve: (v) => <UserCheck className={`size-7 ${iconColor(v)}`} />,
    cancel: (v) => <UserX className={`size-7 ${iconColor(v)}`} />,
};

function iconColor(variant: ConfirmVariant) {
    return {
        danger: "text-destructive",
        warning: "text-amber-500",
        success: "text-emerald-500",
        info: "text-primary",
    }[variant];
}

const variantConfig: Record<
    ConfirmVariant,
    { defaultIcon: React.ReactNode; iconBg: string; confirmClass: string }
> = {
    danger: {
        defaultIcon: <Trash2 className="size-7 text-destructive" />,
        iconBg: "bg-destructive/10",
        confirmClass: "bg-destructive hover:bg-destructive/90 text-white",
    },
    warning: {
        defaultIcon: <XCircle className="size-7 text-amber-500" />,
        iconBg: "bg-amber-500/10",
        confirmClass: "bg-amber-500 hover:bg-amber-600 text-white",
    },
    success: {
        defaultIcon: <CheckCircle2 className="size-7 text-emerald-500" />,
        iconBg: "bg-emerald-500/10",
        confirmClass: "bg-emerald-500 hover:bg-emerald-600 text-white",
    },
    info: {
        defaultIcon: <Info className="size-7 text-primary" />,
        iconBg: "bg-primary/10",
        confirmClass: "",
    },
};

interface ConfirmModalProps<T> {
    open: boolean;
    onCancel: () => void;
    currentRecord: T | null;
    onConfirm: (record: T, reason?: string) => void;
    title?: string;
    description?: string;
    confirmText?: string;
    cancelText?: string;
    variant?: ConfirmVariant;
    loading?: boolean;
    iconPreset?: ConfirmIconPreset;
    icon?: React.ReactNode;
    withReason?: boolean;
    reasonLabel?: string;
    reasonRequired?: boolean;
}

function ConfirmModal<T>({
    open,
    onCancel,
    currentRecord,
    onConfirm,
    title = "Are you sure?",
    description = "This action cannot be undone.",
    confirmText = "Confirm",
    cancelText = "Cancel",
    variant = "danger",
    loading = false,
    iconPreset,
    icon,
    withReason = false,
    reasonLabel = "Reason",
    reasonRequired = true,
}: ConfirmModalProps<T>) {
    const config = variantConfig[variant];
    const resolvedIcon =
        icon ?? (iconPreset ? iconPresets[iconPreset](variant) : config.defaultIcon);

    const schema = useMemo(
        () => confirmReasonSchema(reasonLabel, reasonRequired),
        [reasonLabel, reasonRequired]
    );

    const { control, handleSubmit, reset } = useForm({
        resolver: zodResolver(schema),
        defaultValues: { reason: "" },
    });

    const handleCancel = () => {
        reset();
        onCancel();
    };

    // Called by form submit (withReason mode)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const onFormSubmit = (values: any) => {
        onConfirm(currentRecord as T, values.reason);
        reset();
    };

    // Called directly (no reason mode)
    const handleDirectConfirm = () => {
        onConfirm(currentRecord as T);
    };

    return (
        <ReusableModal
            open={open}
            onOpenChange={(v) => !v && handleCancel()}
            title=""
            maxWidth="sm:max-w-sm md:max-w-lg "
            footer={
                <div className="flex gap-3 w-full pb-2">
                    <Button
                        variant="outline"
                        className="flex-1"
                        onClick={handleCancel}
                        disabled={loading}
                    >
                        {cancelText}
                    </Button>
                    <Button
                        type={withReason ? "submit" : "button"}
                        form={withReason ? "confirm-reason-form" : undefined}
                        className={`flex-1 ${config.confirmClass}`}
                        onClick={withReason ? undefined : handleDirectConfirm}
                        disabled={loading}
                    >
                        {confirmText}
                    </Button>
                </div>
            }
        >
            {/* Icon + title + description */}
            <div className="flex flex-col items-center gap-4 text-center -mt-4">
                <div className={`p-4 rounded-full ${config.iconBg}`}>
                    {resolvedIcon}
                </div>
                <div className="space-y-1.5">
                    <h2 className="text-xl font-semibold text-foreground">{title}</h2>
                    <p className="text-sm text-muted-foreground">{description}</p>
                </div>
            </div>

            {/* Reason form */}
            {withReason && (
                <form
                    id="confirm-reason-form"
                    onSubmit={handleSubmit(onFormSubmit)}
                    className="mt-4"
                >
                    <FormTextarea
                        control={control}
                        name="reason"
                        label={reasonLabel}
                    />
                </form>
            )}
        </ReusableModal>
    );
}

export default ConfirmModal;
