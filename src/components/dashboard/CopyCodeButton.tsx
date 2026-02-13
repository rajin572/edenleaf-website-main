"use client";

import { toast } from 'sonner';
import { Copy } from 'lucide-react';

export default function CopyCodeButton({ code }: { code: string }) {
    const handleCopy = () => {
        navigator.clipboard.writeText(code).then(() => {
            toast.success(`Copied ${code}`);
        });
    };

    return (
        <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1.5 text-primary hover:text-primary-dark text-xs font-semibold"
        >
            <Copy size={14} /> Copy Code
        </button>
    );
}
