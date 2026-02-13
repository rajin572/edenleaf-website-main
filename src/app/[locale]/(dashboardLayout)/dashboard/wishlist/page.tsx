import { getWishlist } from '@/service/WishlistService/wishlistApi';
import WishlistClient from '@/components/dashboard/WishlistClient';
import type { IWishlistItem } from '@/types';

export default async function WishlistPage() {
    const res = await getWishlist();
    const items: IWishlistItem[] = res?.success ? res.data?.data ?? [] : [];

    return (
        <div>
            <WishlistClient initialItems={items} />
        </div>
    );
}
