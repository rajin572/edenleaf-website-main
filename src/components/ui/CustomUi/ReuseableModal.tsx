import React from 'react';
import { Button } from "../button";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "../dialog";

interface ReusableModalProps {
    trigger?: React.ReactElement;
    title: string;
    description?: string;
    children: React.ReactNode;
    footer?: React.ReactNode;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    maxWidth?: string;
    showCloseButton?: boolean;
    closeButtonText?: string;
}

function ReusableModal({
    trigger,
    title,
    description,
    children,
    footer,
    open,
    onOpenChange,
    maxWidth = "sm:max-w-[625px]",
    showCloseButton = false,
    closeButtonText = "Cancel",
}: ReusableModalProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            {trigger && <DialogTrigger render={trigger} />}

            <DialogContent className={maxWidth}>
                <DialogHeader>
                    <DialogTitle className='text-lg sm:text-xl lg:text-2xl font-bold'>{title}</DialogTitle>
                    {description && <DialogDescription>{description}</DialogDescription>}
                </DialogHeader>

                <div className="py-4 px-1 max-h-[75vh] lg:max-h-[85vh] overflow-y-auto">{children}</div>

                {(footer || showCloseButton) && (
                    <DialogFooter>
                        {showCloseButton && (
                            <DialogClose render={<Button variant="outline">{closeButtonText}</Button>} />
                        )}
                        {footer}
                    </DialogFooter>
                )}
            </DialogContent>
        </Dialog>
    );
}

export default ReusableModal;