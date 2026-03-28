import { useEffect } from "react";

interface SEOHeadProps {
  title: string;
  description: string;
  path?: string;
  image?: string;
  type?: string;
  noIndex?: boolean;
  jsonLd?: Record<string, any>;
}

const BASE_URL = "https://trustbank.app";

const SEOHead = ({ title, description, path = "/", image, type = "website", noIndex = false, jsonLd }: SEOHeadProps) => {
  useEffect(() => {
    // Enforce limits
    const safeTitle = title.slice(0, 60);
    const safeDesc = description.slice(0, 160);

    document.title = safeTitle;

    const setMeta = (name: string, content: string, attr = "name") => {
      let el = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement;
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, name);
        document.head.appendChild(el);
      }
      el.content = content;
    };

    setMeta("description", safeDesc);
    setMeta("og:title", safeTitle, "property");
    setMeta("og:description", safeDesc, "property");
    setMeta("og:type", type, "property");
    setMeta("og:url", `${BASE_URL}${path}`, "property");
    setMeta("twitter:card", "summary_large_image", "name");
    setMeta("twitter:title", safeTitle, "name");
    setMeta("twitter:description", safeDesc, "name");

    if (image) {
      setMeta("og:image", image, "property");
      setMeta("twitter:image", image, "name");
    }

    // Robots
    if (noIndex) {
      setMeta("robots", "noindex, nofollow");
    } else {
      let robotsEl = document.querySelector('meta[name="robots"]') as HTMLMetaElement;
      if (robotsEl) robotsEl.remove();
    }

    // Canonical
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = `${BASE_URL}${path}`;

    // JSON-LD
    const existingLd = document.getElementById("seo-jsonld");
    if (existingLd) existingLd.remove();
    if (jsonLd) {
      const script = document.createElement("script");
      script.id = "seo-jsonld";
      script.type = "application/ld+json";
      script.textContent = JSON.stringify(jsonLd);
      document.head.appendChild(script);
    }

    return () => {
      const ld = document.getElementById("seo-jsonld");
      if (ld) ld.remove();
    };
  }, [title, description, path, image, type, noIndex, jsonLd]);

  return null;
};

export default SEOHead;
