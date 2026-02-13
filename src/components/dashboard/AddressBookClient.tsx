"use client";

import { useState } from "react";
import { toast } from "sonner";
import { MapPin, Plus, Edit, Trash2, Star } from "lucide-react";
import { EmptyState } from "@/components/ui/CustomUi/EmptyState";
import ConfirmModal from "@/components/ui/CustomUi/Modal/ConfirmModal";
import AddressFormModal, { type AddressFormValues } from "./AddressFormModal";

export interface Address extends AddressFormValues {
    id: string;
    isDefault: boolean;
}

// TODO: wire to GET/POST/PATCH/DELETE /addresses once those endpoints exist —
// this list lives in local component state until then.
const INITIAL_ADDRESSES: Address[] = [
    {
        id: "addr-1",
        label: "Home",
        recipientName: "Rahim Uddin",
        phone: "+880 1712345678",
        street: "House #12, Road #4, Sector 7",
        city: "Dhaka",
        zone: "Uttara",
        isDefault: true,
    },
    {
        id: "addr-2",
        label: "Office",
        recipientName: "Rahim Uddin",
        phone: "+880 1712345678",
        street: "Level 4, SEL HUQ SKYPARK, 23/2 Mirpur Road",
        city: "Dhaka",
        zone: "Dhanmondi",
        isDefault: false,
    },
];

export default function AddressBookClient() {
    const [addresses, setAddresses] = useState<Address[]>(INITIAL_ADDRESSES);
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState<Address | null>(null);
    const [deleting, setDeleting] = useState<Address | null>(null);

    const openAddModal = () => {
        setEditing(null);
        setModalOpen(true);
    };

    const openEditModal = (address: Address) => {
        setEditing(address);
        setModalOpen(true);
    };

    const handleSave = (values: AddressFormValues) => {
        if (editing) {
            setAddresses((prev) => prev.map((a) => (a.id === editing.id ? { ...a, ...values } : a)));
            toast.success("Address updated");
        } else {
            setAddresses((prev) => [...prev, { ...values, id: `addr-${Date.now()}`, isDefault: prev.length === 0 }]);
            toast.success("Address added");
        }
    };

    const handleDelete = () => {
        if (!deleting) return;
        setAddresses((prev) => prev.filter((a) => a.id !== deleting.id));
        toast.success("Address removed");
        setDeleting(null);
    };

    const handleSetDefault = (id: string) => {
        setAddresses((prev) => prev.map((a) => ({ ...a, isDefault: a.id === id })));
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold">Saved Addresses</h1>
                    <p className="text-sm text-text-secondary mt-1">Manage the addresses used at checkout.</p>
                </div>
                <button
                    onClick={openAddModal}
                    className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg font-bold text-sm transition-colors shrink-0"
                >
                    <Plus size={16} /> Add New
                </button>
            </div>

            {addresses.length === 0 ? (
                <EmptyState
                    icon={MapPin}
                    title="No saved addresses"
                    description="Add an address to check out faster next time."
                    action={{ label: "Add New Address", onClick: openAddModal }}
                />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {addresses.map((address) => (
                        <div
                            key={address.id}
                            className={`bg-white rounded-2xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)] relative border-2 ${address.isDefault ? "border-primary/20" : "border-gray-100"}`}
                        >
                            {address.isDefault && (
                                <span className="absolute top-4 right-4 bg-primary text-white text-xs font-bold px-2 py-1 rounded">Default</span>
                            )}
                            <div className="flex items-start gap-3 mb-4">
                                <div className={`mt-1 ${address.isDefault ? "text-primary" : "text-text-muted"}`}>
                                    <MapPin size={20} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-foreground">{address.label}</h3>
                                    <p className="text-sm text-text-secondary mt-1">{address.recipientName}<br />{address.phone}</p>
                                </div>
                            </div>
                            <p className="text-sm text-text-secondary mb-6 pl-8">
                                {address.street}<br />
                                {address.zone}, {address.city}
                            </p>
                            <div className="flex flex-wrap items-center gap-4 pl-8">
                                <button onClick={() => openEditModal(address)} className="text-sm font-semibold text-primary hover:underline flex items-center gap-1">
                                    <Edit size={14} /> Edit
                                </button>
                                <button onClick={() => setDeleting(address)} className="text-sm font-semibold text-destructive hover:underline flex items-center gap-1">
                                    <Trash2 size={14} /> Delete
                                </button>
                                {!address.isDefault && (
                                    <button onClick={() => handleSetDefault(address.id)} className="text-sm font-semibold text-text-secondary hover:text-primary hover:underline flex items-center gap-1">
                                        <Star size={14} /> Set as Default
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <AddressFormModal open={modalOpen} onOpenChange={setModalOpen} editing={editing} onSave={handleSave} />

            <ConfirmModal
                open={!!deleting}
                onCancel={() => setDeleting(null)}
                currentRecord={deleting}
                onConfirm={handleDelete}
                title="Delete this address?"
                description="This address will be removed from your saved list."
                confirmText="Delete"
                variant="danger"
                iconPreset="delete"
            />
        </div>
    );
}
