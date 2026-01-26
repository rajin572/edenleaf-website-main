"use client";

import React, { useState, useRef, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
    verifySignupOtp,
    verifyForgotOtp,
    resendOtp,
    getOtpTiming,
} from '@/service/AuthService/AuthServiceAPi';
import tryCatchWrapper from '@/utils/tryCatchWrapper';
import { Button } from "@/components/ui/button";
import { useT } from '@/components/i18n/DictionaryProvider';
import type { IOtpTiming } from '@/types';

const OTP_LENGTH = 6;

const secondsUntil = (deadline: string | undefined, now: number) =>
    deadline ? Math.max(0, Math.ceil((Date.parse(deadline) - now) / 1000)) : 0;

function VerifyOTPContent({ initialTiming, initialNow }: { initialTiming: IOtpTiming | null; initialNow: number }) {
    const t = useT();
    const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
    const [timing, setTiming] = useState(initialTiming);
    const [now, setNow] = useState(initialNow);
    const [isResending, setIsResending] = useState(false);
    // Set when the server says this code can no longer be used at all.
    const [codeDead, setCodeDead] = useState(false);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
    const router = useRouter();
    const searchParams = useSearchParams();
    const email = searchParams.get('email') || '';
    const type = searchParams.get('type') || 'signup';

    const isReset = type === 'reset';
    const activeTiming = timing?.email === email.trim().toLowerCase() && timing.type === (isReset ? 'reset' : 'signup') ? timing : null;
    const expiresIn = secondsUntil(activeTiming?.expiresAt, now);
    const resendIn = secondsUntil(activeTiming?.resendAt, now);
    const cooldownFinished = resendIn === 0;
    const canResend = cooldownFinished && !isResending;

    useEffect(() => {
        const updateNow = () => setNow(Date.now());
        updateNow();
        const id = setInterval(updateNow, 1000);
        document.addEventListener('visibilitychange', updateNow);
        return () => {
            clearInterval(id);
            document.removeEventListener('visibilitychange', updateNow);
        };
    }, []);

    const focusInput = (index: number) => inputRefs.current[index]?.focus();

    const handleChange = (index: number, value: string) => {
        const digits = value.replace(/\D/g, '');
        if (!digits) {
            setOtp((prev) => prev.map((d, i) => (i === index ? '' : d)));
            return;
        }

        // Handles both single keystrokes and a pasted full code.
        setOtp((prev) => {
            const next = [...prev];
            for (let i = 0; i < digits.length && index + i < OTP_LENGTH; i++) {
                next[index + i] = digits[i];
            }
            return next;
        });

        focusInput(Math.min(index + digits.length, OTP_LENGTH - 1));
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            focusInput(index - 1);
        }
    };

    /** The server burns the code after too many wrong tries, or on expiry. */
    const isDeadCodeMessage = (message?: string) => {
        const m = (message ?? '').toLowerCase();
        return m.includes('max attempts') || m.includes('expired') || m.includes('not found');
    };

    const handleFailure = (message?: string) => {
        setOtp(Array(OTP_LENGTH).fill(''));
        focusInput(0);
        if (isDeadCodeMessage(message)) setCodeDead(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const code = otp.join('');
        if (code.length !== OTP_LENGTH || expiresIn === 0 || !activeTiming) return;

        const res = isReset
            ? await tryCatchWrapper(
                  verifyForgotOtp,
                  { body: { email, otp: code } },
                  { toastLoadingMessage: t.auth?.loadingVerifyOtp || "Verifying OTP..." }
              )
            : await tryCatchWrapper(
                  verifySignupOtp,
                  { body: { code } },
                  { toastLoadingMessage: t.auth?.loadingSignUp || "Creating account..." }
              );

        if (res?.success) {
            // verifyForgotOtp stores the reset token in an httpOnly cookie.
            router.push(isReset ? '/reset-password' : '/success');
        } else {
            handleFailure(res?.message);
        }
    };

    const handleResend = async () => {
        if (!canResend || !email) return;
        setIsResending(true);
        const res = await tryCatchWrapper(
            resendOtp,
            { body: { email, type: isReset ? 'forgot' : 'signup' } },
            { toastLoadingMessage: t.auth?.loadingResend || "Resending OTP..." }
        );

        if (res?.success) {
            setTiming((await getOtpTiming()).timing);
            setCodeDead(false);
            setOtp(Array(OTP_LENGTH).fill(''));
            focusInput(0);
        }
        setIsResending(false);
    };

    const formatTime = (time: number) => {
        const m = Math.floor(time / 60);
        const s = time % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-foreground mb-2">{t.auth?.verifyOtpTitle || "Verify OTP 📩"}</h1>
                <p className="text-text-secondary leading-relaxed">
                    {(t.auth?.verifyOtpPrompt || "We've sent a 6-digit code to {email}. Please enter it below.").replace('{email}', email)}
                </p>
            </div>

            {codeDead && (
                <div className="mb-6 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                    {t.auth?.codeDeadMsg || "That code can no longer be used. Request a new one "}
                    {cooldownFinished ? (t.auth?.codeDeadBelow || ' below.') : (t.auth?.codeDeadIn || ` in {time}.`).replace('{time}', formatTime(resendIn))}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
                <div className="flex justify-between gap-2 sm:gap-3">
                    {otp.map((digit, idx) => (
                        <input
                            key={idx}
                            ref={(el) => { inputRefs.current[idx] = el; }}
                            type="text"
                            inputMode="numeric"
                            autoComplete={idx === 0 ? "one-time-code" : "off"}
                            value={digit}
                            onChange={(e) => handleChange(idx, e.target.value)}
                            onKeyDown={(e) => handleKeyDown(idx, e)}
                            className="w-full aspect-square min-w-0 text-center text-xl sm:text-2xl font-bold border border-border rounded-xl outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all bg-surface"
                            maxLength={OTP_LENGTH}
                            required
                        />
                    ))}
                </div>

                <Button
                    type="submit"
                    disabled={codeDead || expiresIn === 0 || !activeTiming}
                    className="w-full h-12 text-lg font-bold"
                >
                    {t.auth?.verifyCodeBtn || "Verify Code"}
                </Button>
            </form>

            <div className="mt-8 text-center text-sm">
                <p className="text-text-secondary mb-2">
                    {!activeTiming ? (
                        <span className="font-semibold text-amber-700">{t.auth?.codeTimingUnavailable || "No active code found. Request a new code."}</span>
                    ) : expiresIn > 0 ? (
                        <>
                            {t.auth?.codeExpiresIn || "Code expires in"}{' '}
                            <span className="font-mono font-bold text-primary">{formatTime(expiresIn)}</span>
                        </>
                    ) : (
                        <span className="font-semibold text-amber-700">{t.auth?.codeExpired || "This code has expired."}</span>
                    )}
                </p>
                <p className="text-text-secondary">
                    {t.auth?.didntReceiveCode || "Didn't receive the code?"}{' '}
                    <button
                        type="button"
                        onClick={handleResend}
                        disabled={!canResend}
                        className={`font-bold transition-colors ${canResend ? 'text-primary hover:text-primary-dark' : 'text-text-muted cursor-not-allowed'}`}
                    >
                        {isResending ? (t.auth?.loadingResend || "Resending OTP...") : cooldownFinished ? (t.auth?.resendOtp || "Resend OTP") : (t.auth?.resendIn || `Resend in {time}`).replace('{time}', formatTime(resendIn))}
                    </button>
                </p>
            </div>
        </div>
    );
}

export default function VerifyOTPPage({ initialTiming, initialNow }: { initialTiming: IOtpTiming | null; initialNow: number }) {
    return (
        <Suspense fallback={<div className="flex items-center justify-center p-12 text-primary">Loading...</div>}>
            <VerifyOTPContent initialTiming={initialTiming} initialNow={initialNow} />
        </Suspense>
    );
}
