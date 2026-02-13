import ProfileClient from "@/components/dashboard/ProfileClient";
import { getCurrentUser } from "@/service/AuthService/AuthServiceAPi";

export default async function ProfilePage() {
    const me = await getCurrentUser();
    return <ProfileClient user={me?.data ?? null} />;
}
