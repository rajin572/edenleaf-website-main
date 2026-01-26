"use client";

import React from 'react';
import LocaleLink from '@/components/i18n/LocaleLink';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { forgetPassword } from '@/service/AuthService/AuthServiceAPi';
import tryCatchWrapper from '@/utils/tryCatchWrapper';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { FormInput } from "@/components/ui/CustomUi/ReuseForm/Form";
import { FieldGroup } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { useT } from '@/components/i18n/DictionaryProvider';

const forgotSchema = z.object({
    email: z.string().min(1, "Email is required").email("Invalid email address"),
});

export default function ForgotPasswordPage() {
    const router = useRouter();
    const t = useT();

    const form = useForm({
        resolver: zodResolver(forgotSchema),
        defaultValues: { email: "" },
    });

    const onSubmit = async (data: z.infer<typeof forgotSchema>) => {
        const res = await tryCatchWrapper(forgetPassword, { body: data }, { toastLoadingMessage: t.auth?.loadingSendOtp || "Sending OTP..." });

        if (res?.success) {
            router.push('/verify-otp?type=reset&email=' + encodeURIComponent(data.email));
        }
    };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <LocaleLink href="/sign-in" className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-primary mb-6 transition-colors">
                <ArrowLeft size={16} /> {t.auth?.backToSignIn || "Back to Sign In"}
            </LocaleLink>

            <div className="mb-8">
                <h1 className="text-3xl font-bold text-foreground mb-2">{t.auth?.forgotPasswordTitle || "Forgot Password 🔒"}</h1>
                <p className="text-text-secondary leading-relaxed">
                    {t.auth?.forgotPasswordPrompt || "Enter your email address and we'll send you a link to reset your password."}
                </p>
            </div>

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FieldGroup>
                    <FormInput
                        control={form.control}
                        name="email"
                        label={t.auth?.emailLabel || "Email Address"}
                        placeholder={t.auth?.emailPlaceholder || "user@example.com"}
                    />
                </FieldGroup>

                <Button type="submit" className="w-full h-12 text-lg font-bold">
                    {t.auth?.sendResetLink || "Send Reset Link"}
                </Button>
            </form>
        </div>
    );
}
