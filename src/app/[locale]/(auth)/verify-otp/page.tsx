import VerifyOtpClient from "@/components/auth/VerifyOtpClient";
import { getOtpTiming } from "@/service/AuthService/AuthServiceAPi";

export default async function VerifyOtpPage() {
  const { timing, now } = await getOtpTiming();
  return <VerifyOtpClient key={`${timing?.type}:${timing?.email}:${timing?.expiresAt}`} initialTiming={timing} initialNow={now} />;
}
