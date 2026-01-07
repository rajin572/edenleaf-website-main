'use client';

import { Button } from '../button';
import { Link as LinkIcon, Share2 } from 'lucide-react';
import { FaFacebook, FaXTwitter } from 'react-icons/fa6';
import { toast } from 'sonner';
import { useT } from '@/components/i18n/DictionaryProvider';

interface SocialShareBarProps {
  /** Absolute URL — share targets and the clipboard both need the full address. */
  url: string;
  title: string;
  showLabel?: boolean;
}

export const SocialShareBar = ({ url, title, showLabel = true }: SocialShareBarProps) => {
  const t = useT();

  const handleCopyLink = () => {
    navigator.clipboard.writeText(url);
    toast.success(t.product.linkCopied);
  };

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
  };

  const handleNativeShare = async () => {
    if (!navigator.share) {
      handleCopyLink();
      return;
    }

    // A dismissed share sheet rejects; that is a cancel, not a failure to report.
    await navigator.share({ title, url }).catch(() => undefined);
  };

  return (
    <div className="flex items-center gap-2">
      {showLabel && (
        <span className="text-sm text-text-secondary mr-2 font-medium">{t.product.share}</span>
      )}
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8 rounded-full"
        onClick={() => window.open(shareLinks.facebook, '_blank', 'noopener,noreferrer')}
        aria-label={t.product.shareOnFacebook}
      >
        <FaFacebook className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8 rounded-full"
        onClick={() => window.open(shareLinks.twitter, '_blank', 'noopener,noreferrer')}
        aria-label={t.product.shareOnTwitter}
      >
        <FaXTwitter className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8 rounded-full"
        onClick={handleCopyLink}
        aria-label={t.product.copyLink}
      >
        <LinkIcon className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8 rounded-full sm:hidden"
        onClick={handleNativeShare}
        aria-label={t.product.shareVia}
      >
        <Share2 className="h-4 w-4" />
      </Button>
    </div>
  );
};
