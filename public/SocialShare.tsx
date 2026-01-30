import { Facebook, Twitter, Linkedin, Link2, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface SocialShareProps {
  url?: string;
  title: string;
  description?: string;
}

export function SocialShare({ url, title, description }: SocialShareProps) {
  const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '');
  
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedTitle = encodeURIComponent(title);
  const encodedDescription = encodeURIComponent(description || '');

  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success('Link copied to clipboard');
    } catch {
      toast.error('Failed to copy link');
    }
  };

  const openShareWindow = (url: string) => {
    window.open(url, '_blank', 'width=600,height=400');
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground flex items-center gap-1">
        <Share2 className="h-4 w-4" />
        Share
      </span>
      <div className="flex gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => openShareWindow(shareLinks.twitter)}
          title="Share on Twitter"
          className="h-8 w-8 hover:text-primary hover:bg-primary/10"
        >
          <Twitter className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => openShareWindow(shareLinks.facebook)}
          title="Share on Facebook"
          className="h-8 w-8 hover:text-primary hover:bg-primary/10"
        >
          <Facebook className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => openShareWindow(shareLinks.linkedin)}
          title="Share on LinkedIn"
          className="h-8 w-8 hover:text-primary hover:bg-primary/10"
        >
          <Linkedin className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={copyToClipboard}
          title="Copy link"
          className="h-8 w-8 hover:text-primary hover:bg-primary/10"
        >
          <Link2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
