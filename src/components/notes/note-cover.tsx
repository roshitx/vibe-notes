"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { ImagePlus, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { uploadCover } from "@/lib/actions/upload";
import { cn } from "@/lib/utils";

interface NoteCoverProps {
  coverUrl: string | null | undefined;
  onCoverChange: (url: string | null) => void;
}

export function NoteCover({ coverUrl, onCoverChange }: NoteCoverProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [mounted, setMounted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      
      const result = await uploadCover(formData);
      
      if (result.success && result.data) {
        onCoverChange(result.data.url);
      } else {
        console.error("Cover upload failed:", result.error);
      }
    } catch (error) {
      console.error("Cover upload error:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveCover = () => {
    onCoverChange(null);
  };

  // Show nothing during SSR to prevent hydration mismatch
  if (!mounted) {
    return <div className="mb-6 h-8" />;
  }

  // If no cover, show add cover button
  if (!coverUrl) {
    return (
      <div className="mb-6">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          accept="image/*"
          className="hidden"
        />
        <Button
          variant="ghost"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="text-muted-foreground hover:text-foreground"
        >
          {isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <ImagePlus className="mr-2 h-4 w-4" />
              Add Cover
            </>
          )}
        </Button>
      </div>
    );
  }

  // Show cover image with hover controls
  return (
    <div 
      className="relative mb-6 -mx-4 sm:-mx-6 md:-mx-8"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <div className="relative h-48 sm:h-56 md:h-64 w-full overflow-hidden">
        <Image
          src={coverUrl}
          alt="Note cover"
          fill
          className="object-cover"
          priority
        />
        {/* Premium Gradient overlay for seamless blending */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />
      </div>

      {/* Hover controls */}
      <div 
        className={cn(
          "absolute top-3 right-3 flex gap-2 transition-opacity duration-200",
          isHovering ? "opacity-100" : "opacity-0"
        )}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          accept="image/*"
          className="hidden"
        />
        <Button
          variant="secondary"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="bg-background/80 backdrop-blur-sm hover:bg-background"
        >
          {isUploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <ImagePlus className="mr-1 h-4 w-4" />
              Change
            </>
          )}
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={handleRemoveCover}
          className="bg-background/80 backdrop-blur-sm hover:bg-destructive hover:text-destructive-foreground"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
