"use client";

import React from 'react';
import LocaleLink from '@/components/i18n/LocaleLink';
import { useRouter } from 'next/navigation';
import { loginUser } from '@/service/AuthService/AuthServiceAPi';
import tryCatchWrapper from '@/utils/tryCatchWrapper';
import { AUTH_UPDATED_EVENT } from '@/hooks/useAuthUser';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { FormInput, FormPassword } from "@/components/ui/CustomUi/ReuseForm/Form";
import { FieldGroup } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { useT } from '@/components/i18n/DictionaryProvider';

const signInSchema = z.object({
    email: z.string().min(1, "Email is required").email("Invalid email address"),
    password: z.string().min(1, "Password is required"),
});

export default function SignInPage() {
    const router = useRouter();
    const t = useT();

    const form = useForm({
        resolver: zodResolver(signInSchema),
        defaultValues: { email: "", password: "" },
    });

    const onSubmit = async (data: z.infer<typeof signInSchema>) => {
        const res = await tryCatchWrapper(loginUser, { body: data }, { toastLoadingMessage: t.auth?.loadingSignIn || "Signing in..." });

        if (res?.success) {
            // loginUser sets the session cookies server-side and rejects non-customer roles.
            window.dispatchEvent(new Event(AUTH_UPDATED_EVENT));
            router.push('/');
            router.refresh();
        }
    };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-foreground mb-2">{t.auth?.welcomeBack || "Welcome Back! 👋"}</h1>
                <p className="text-text-secondary">{t.auth?.signInPrompt || "Please sign in to your account."}</p>
            </div>

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <FieldGroup>
                    <FormInput
                        control={form.control}
                        name="email"
                        label={t.auth?.emailLabel || "Email Address"}
                        placeholder={t.auth?.emailPlaceholder || "e.g. user@example.com"}
                    />

                    <FormPassword
                        control={form.control}
                        name="password"
                        label={t.auth?.passwordLabel || "Password"}
                        placeholder={t.auth?.passwordPlaceholder || "••••••••"}
                    />
                </FieldGroup>

                <div className="flex justify-between items-center -mt-2">
                    <div />
                    <LocaleLink href="/forgot-password" className="text-xs font-semibold text-primary hover:text-primary-dark transition-colors">
                        {t.auth?.forgotPasswordQ || "Forgot Password?"}
                    </LocaleLink>
                </div>

                <Button type="submit" className="w-full h-12 text-lg font-bold">
                    {t.auth?.signInBtn || "Sign In"}
                </Button>
            </form>

            <div className="mt-8 text-center text-sm text-text-secondary">
                {t.auth?.dontHaveAccount || "Don't have an account?"}{' '}
                <LocaleLink href="/sign-up" className="text-primary font-bold hover:underline transition-colors">
                    {t.auth?.createAccount || "Create Account"}
                </LocaleLink>
            </div>
        </div>
    );
}
