import { useEffect } from "react";
import { useParams } from "react-router-dom";

interface Props {
  title?: string;
  description?: string;
  image?: string;
}

export default function DynamicSEO({ title, description, image }: Props) {
  const { slug } = useParams<{ slug: string }>();

  useEffect(() => {
    const loadMeta = async () => {
      if (slug) {
        try {
          const res = await fetch(`/api/meta?slug=${slug}`);
          if (res.ok) {
            const data = await res.json();
            document.title = data.title;
            setMeta('description', data.description);
            setMeta('og:title', data.title, true);
            setMeta('og:description', data.description, true);
            setMeta('og:image', data.image, true);
            setMeta('og:url', data.url, true);
            setMeta('twitter:card', 'summary_large_image', true);
            setMeta('twitter:title', data.title, true);
            setMeta('twitter:description', data.description, true);
            setMeta('twitter:image', data.image, true);
          }
        } catch {}
      } else if (title) {
        document.title = title;
        if (description) setMeta('description', description);
      }
    };
    loadMeta();
  }, [slug, title, description]);

  return null;
}

function setMeta(name: string, content: string, isProperty = false) {
  const attr = isProperty ? 'property' : 'name';
  let el = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement;
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.content = content;
}
