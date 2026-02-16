import Image from "next/image";
import { Wrench } from "lucide-react";
import { AllImages } from "../../../../../public/images/AllImages";

export default function MaintenancePage() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 py-16">
      <Image src={AllImages.logo} alt="Ednleaf" className="mb-8 h-10 w-auto" />
      <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-6">
        <Wrench size={28} />
      </div>
      <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-3">We&apos;ll be back soon!</h1>
      <p className="text-text-secondary max-w-md">
        We&apos;re currently performing scheduled maintenance to improve your shopping experience.
        Please check back shortly — we won&apos;t be long.
      </p>
    </div>
  );
}
