import React from "react";
import ContactSection from "@/components/home/ContactSection";

export const metadata = {
  title: "Contact Us | Ednleaf",
  description: "Get in touch with us",
};

export default function ContactPage() {
    return (
        <main className="min-h-screen bg-background">
            <ContactSection />
        </main>
    );
}
