"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { Camera, KeyRound, User } from "lucide-react";
import { updateProfile, changeUserPassword } from "@/service/AuthService/AuthServiceAPi";
import tryCatchWrapper from "@/utils/tryCatchWrapper";
import { FormInput, FormPassword } from "@/components/ui/CustomUi/ReuseForm/Form";
import { FieldGroup } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import type { IWebsiteUser } from "@/types";
import { bdPhoneSchema } from "@/utils/phoneValidation";

// PATCH /users/me only accepts { name?, phone?, avatar? } — no email, no
// firstName/lastName split on the backend, so email is read-only display.
const personalInfoSchema = z.object({
    name: z.string().min(1, "Name is required"),
    phone: bdPhoneSchema,
});

const passwordSchema = z
    .object({
        currentPassword: z.string().min(1, "Current password is required"),
        newPassword: z.string().min(6, "Password must be at least 6 characters"),
        confirmPassword: z.string().min(6, "Confirm your new password"),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });

const DEFAULT_AVATAR = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80";

export default function ProfileClient({ user }: { user: IWebsiteUser | null }) {
    const [avatarPreview, setAvatarPreview] = useState(user?.avatar || DEFAULT_AVATAR);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const infoForm = useForm({
        resolver: zodResolver(personalInfoSchema),
        defaultValues: { name: user?.name ?? "", phone: user?.phone ?? "" },
    });

    const passwordForm = useForm({
        resolver: zodResolver(passwordSchema),
        defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
    });

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // Local preview only — the backend's `avatar` field expects an
        // already-hosted URL, and no upload endpoint exists yet. Real upload
        // is a fast-follow once a media part lands.
        const file = e.target.files?.[0];
        if (file) setAvatarPreview(URL.createObjectURL(file));
    };

    const onSaveInfo = async (data: z.infer<typeof personalInfoSchema>) => {
        await tryCatchWrapper(updateProfile, { body: data }, { toastLoadingMessage: "Saving changes..." });
    };

    const onChangePassword = async (data: z.infer<typeof passwordSchema>) => {
        const res = await tryCatchWrapper(
            changeUserPassword,
            { body: { oldPassword: data.currentPassword, newPassword: data.newPassword } },
            { toastLoadingMessage: "Updating password..." }
        );
        if (res?.success) passwordForm.reset();
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">My Profile</h1>
                <p className="text-sm text-text-secondary mt-1">Manage your personal information and security.</p>
            </div>

            <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-gray-100 p-6 md:p-8 max-w-3xl">
                <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-100">
                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                        <User size={18} />
                    </div>
                    <h2 className="text-lg font-bold text-foreground">Personal Information</h2>
                </div>

                <div className="flex flex-col md:flex-row gap-8 items-start">
                    <div className="flex flex-col items-center gap-3 mx-auto md:mx-0">
                        <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-border relative">
                            <Image src={avatarPreview} alt="Profile Avatar" fill className="object-cover" />
                        </div>
                        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="text-sm font-semibold text-primary hover:underline flex items-center gap-1.5"
                        >
                            <Camera size={14} /> Change Picture
                        </button>
                    </div>

                    <form onSubmit={infoForm.handleSubmit(onSaveInfo)} className="flex-grow w-full space-y-5">
                        <FieldGroup>
                            <FormInput control={infoForm.control} name="name" label="Full Name" />
                            <div>
                                <label className="text-sm font-medium text-foreground mb-1.5 block">Email Address</label>
                                <p className="text-sm text-text-secondary px-3 py-2.5 rounded-lg bg-gray-50 border border-gray-100">
                                    {user?.email}
                                </p>
                            </div>
                            <FormInput control={infoForm.control} name="phone" label="Phone Number" type="tel" />
                        </FieldGroup>

                        <div className="pt-4 border-t border-gray-100 flex justify-end">
                            <Button type="submit" className="px-6 font-bold">Save Changes</Button>
                        </div>
                    </form>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-gray-100 p-6 md:p-8 max-w-3xl">
                <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-100">
                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                        <KeyRound size={18} />
                    </div>
                    <h2 className="text-lg font-bold text-foreground">Change Password</h2>
                </div>

                <form onSubmit={passwordForm.handleSubmit(onChangePassword)} className="space-y-5 max-w-md">
                    <FieldGroup>
                        <FormPassword control={passwordForm.control} name="currentPassword" label="Current Password" placeholder="••••••••" />
                        <FormPassword control={passwordForm.control} name="newPassword" label="New Password" placeholder="••••••••" />
                        <FormPassword control={passwordForm.control} name="confirmPassword" label="Confirm New Password" placeholder="••••••••" />
                    </FieldGroup>

                    <div className="pt-2 flex justify-end">
                        <Button type="submit" className="px-6 font-bold">Update Password</Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
