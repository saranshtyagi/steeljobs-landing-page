import React, { useEffect } from "react";

interface SEOHeadProps {
  title: string;
  description: string;
  keywords?: string;
  canonicalUrl?: string;
  ogImage?: string;
  ogType?: "website" | "article" | "product";
  noIndex?: boolean;
}

const SEOHead = ({
  title,
  description,
  keywords,
  canonicalUrl,
  ogImage = "https://lovable.dev/opengraph-image-p98pqg.png",
  ogType = "website",
  noIndex = false,
}: SEOHeadProps) => {
  useEffect(() => {
    // Update document title
    document.title = title;

    // Update or create meta tags
    const updateMetaTag = (name: string, content: string, isProperty = false) => {
      const attribute = isProperty ? "property" : "name";
      let meta = document.querySelector(`meta[${attribute}="${name}"]`) as HTMLMetaElement;
      
      if (!meta) {
        meta = document.createElement("meta");
        meta.setAttribute(attribute, name);
        document.head.appendChild(meta);
      }
      meta.content = content;
    };

    // Basic meta tags
    updateMetaTag("description", description);
    if (keywords) {
      updateMetaTag("keywords", keywords);
    }

    // Robots
    if (noIndex) {
      updateMetaTag("robots", "noindex, nofollow");
    } else {
      updateMetaTag("robots", "index, follow");
    }

    // Open Graph tags
    updateMetaTag("og:title", title, true);
    updateMetaTag("og:description", description, true);
    updateMetaTag("og:type", ogType, true);
    updateMetaTag("og:image", ogImage, true);

    // Twitter tags
    updateMetaTag("twitter:card", "summary_large_image");
    updateMetaTag("twitter:title", title);
    updateMetaTag("twitter:description", description);
    updateMetaTag("twitter:image", ogImage);

    // Canonical URL
    if (canonicalUrl) {
      let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
      if (!link) {
        link = document.createElement("link");
        link.rel = "canonical";
        document.head.appendChild(link);
      }
      link.href = canonicalUrl;
    }

    // Cleanup function
    return () => {
      // Keep the meta tags as they might be needed by the next page
    };
  }, [title, description, keywords, canonicalUrl, ogImage, ogType, noIndex]);

  return null;
};

export default SEOHead;
