import LocaleLink from '@/components/i18n/LocaleLink';
import { PartyPopper } from 'lucide-react';

export default function SuccessPage() {
    return (
        <div className="animate-in zoom-in-95 duration-500 text-center flex flex-col items-center justify-center py-10">
            <div className="w-24 h-24 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-6 border-4 border-primary/20">
                <PartyPopper size={48} />
            </div>

            <h1 className="text-3xl font-bold text-foreground mb-4">Registration Successful!</h1>

            <p className="text-text-secondary mb-8 max-w-sm leading-relaxed">
                Welcome to the Ednleaf family! Your account has been verified and created successfully. You can now start exploring our pure and natural products.
            </p>

            <div className="flex flex-col w-full gap-3">
                <LocaleLink
                    href="/collections/best-sales"
                    className="w-full py-3.5 bg-primary hover:bg-primary-dark text-white rounded-lg font-bold text-lg transition-all shadow-md shadow-primary/20"
                >
                    Start Shopping
                </LocaleLink>
                <LocaleLink
                    href="/sign-in"
                    className="w-full py-3.5 bg-surface border border-border hover:bg-muted text-foreground rounded-lg font-bold text-lg transition-all"
                >
                    Sign In Now
                </LocaleLink>
            </div>
        </div>
    );
}
