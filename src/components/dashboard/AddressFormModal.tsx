"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import ReusableModal from "@/components/ui/CustomUi/ReuseableModal";
import { FormInput, FormTextarea } from "@/components/ui/CustomUi/ReuseForm/Form";
import { FieldGroup } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import type { Address } from "./AddressBookClient";
import { bdPhoneSchema } from "@/utils/phoneValidation";

const addressSchema = z.object({
    label: z.string().min(1, "Label is required"),
    recipientName: z.string().min(1, "Name is required"),
    phone: bdPhoneSchema,
    street: z.string().min(1, "Street address is required"),
    city: z.string().min(1, "City is required"),
    zone: z.string().min(1, "Zone / area is required"),
});

export type AddressFormValues = z.infer<typeof addressSchema>;

const CITIES = ["Dhaka", "Chattogram", "Sylhet"];
const ZONES = ["Mirpur", "Gulshan", "Dhanmondi", "Uttara", "Other"];

interface AddressFormModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    editing: Address | null;
    onSave: (values: AddressFormValues) => void;
}

export default function AddressFormModal({ open, onOpenChange, editing, onSave }: AddressFormModalProps) {
    const form = useForm<AddressFormValues>({
        resolver: zodResolver(addressSchema),
        defaultValues: { label: "", recipientName: "", phone: "", street: "", city: "", zone: "" },
    });

    useEffect(() => {
        if (open) {
            form.reset(
                editing
                    ? {
                        label: editing.label,
                        recipientName: editing.recipientName,
                        phone: editing.phone,
                        street: editing.street,
                        city: editing.city,
                        zone: editing.zone,
                    }
                    : { label: "", recipientName: "", phone: "", street: "", city: "", zone: "" }
            );
        }
    }, [open, editing, form]);

    const onSubmit = (values: AddressFormValues) => {
        onSave(values);
        onOpenChange(false);
    };

    return (
        <ReusableModal
            open={open}
            onOpenChange={onOpenChange}
            title={editing ? "Edit Address" : "Add New Address"}
            footer={
                <Button type="submit" form="address-form" className="w-full sm:w-auto">
                    {editing ? "Save Changes" : "Add Address"}
                </Button>
            }
        >
            <form id="address-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <FieldGroup>
                    <FormInput control={form.control} name="label" label="Address Label" placeholder="e.g. Home, Office" />
                    <FormInput control={form.control} name="recipientName" label="Recipient Name" placeholder="e.g. Rahim Uddin" />
                    <FormInput control={form.control} name="phone" label="Phone Number" placeholder="017XXXXXXXX" />
                    <FormTextarea control={form.control} name="street" label="Street Address" placeholder="House/Flat No, Road No, Area..." />

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1.5">City</label>
                            <select
                                {...form.register("city")}
                                className="w-full h-12 px-4 bg-surface border border-border rounded-xl outline-none focus:border-primary transition-colors text-sm"
                            >
                                <option value="">Select city</option>
                                {CITIES.map((city) => (
                                    <option key={city} value={city}>{city}</option>
                                ))}
                            </select>
                            {form.formState.errors.city && (
                                <p className="text-xs text-destructive mt-1">{form.formState.errors.city.message}</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1.5">Zone / Area</label>
                            <select
                                {...form.register("zone")}
                                className="w-full h-12 px-4 bg-surface border border-border rounded-xl outline-none focus:border-primary transition-colors text-sm"
                            >
                                <option value="">Select zone</option>
                                {ZONES.map((zone) => (
                                    <option key={zone} value={zone}>{zone}</option>
                                ))}
                            </select>
                            {form.formState.errors.zone && (
                                <p className="text-xs text-destructive mt-1">{form.formState.errors.zone.message}</p>
                            )}
                        </div>
                    </div>
                </FieldGroup>
            </form>
        </ReusableModal>
    );
}
