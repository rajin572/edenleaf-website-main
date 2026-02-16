import { Suspense } from "react";
import UnsubscribeClient from "@/components/newsletter/UnsubscribeClient";

export default function UnsubscribePage() {
  return (
    <Suspense fallback={null}>
      <UnsubscribeClient />
    </Suspense>
  );
}
