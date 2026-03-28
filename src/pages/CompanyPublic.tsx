import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import SEOHead from "@/components/SEOHead";
import { Building2, Globe, Mail } from "lucide-react";

const CompanyPublic = () => {
  const { slug } = useParams<{ slug: string }>();

  const { data: company, isLoading } = useQuery({
    queryKey: ["company-slug", slug],
    queryFn: async () => {
      const { data } = await supabase
        .from("company_slugs")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();
      return data;
    },
    enabled: !!slug,
  });

  if (isLoading) return (
    <div className="min-h-screen" style={{ background: "#050508" }}>
      <Header />
      <div className="flex items-center justify-center py-32">
        <p style={{ color: "#5a5a7a" }}>Loading...</p>
      </div>
    </div>
  );

  if (!company || !company.sold_to) return (
    <div className="min-h-screen" style={{ background: "#050508" }}>
      <Header />
      <SEOHead title={`@${slug} — TrustBank`} description={`Company page @${slug} on TrustBank`} path={`/@${slug}`} />
      <div className="max-w-2xl mx-auto px-6 py-32 text-center">
        <Building2 className="w-16 h-16 mx-auto mb-6" style={{ color: "#F59E0B" }} />
        <h1 className="text-3xl font-bold mb-3" style={{ fontFamily: "'Clash Display', sans-serif", color: "#f2f2f8" }}>
          @{slug}
        </h1>
        <p className="text-sm mb-2" style={{ color: "#8888aa" }}>
          This premium company slug is available for purchase.
        </p>
        <p className="text-[11px] italic mb-8" style={{ color: "#5a5a7a" }}>
          Este slug premium para empresas está disponível.
        </p>
        {company && (
          <div className="rounded-xl p-8 border" style={{ background: "#0d0d14", borderColor: "rgba(245,158,11,.2)" }}>
            <p className="text-2xl font-black mb-2" style={{ fontFamily: "'Clash Display', sans-serif", color: "#F59E0B" }}>
              ${company.price?.toLocaleString()}
            </p>
            <p className="text-xs" style={{ color: "#8888aa" }}>
              {company.sale_type === "auction" ? "Starting bid — Auction" : "Direct purchase"}
            </p>
            <p className="text-[10px] italic" style={{ color: "#5a5a7a" }}>
              {company.sale_type === "auction" ? "Lance inicial — Leilão" : "Compra direta"}
            </p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen" style={{ background: "#050508" }}>
      <Header />
      <SEOHead title={`@${slug} — ${company.display_name || "Company"} — TrustBank`} description={company.description || `Company page @${slug}`} path={`/@${slug}`} />
      <div className="max-w-3xl mx-auto px-6 py-20">
        <div className="rounded-2xl p-10 border" style={{ background: "#0d0d14", borderColor: "#1e1e2e" }}>
          {company.logo_url && (
            <img src={company.logo_url} alt="" className="w-20 h-20 rounded-xl object-cover mb-6" style={{ border: "2px solid #1e1e2e" }} />
          )}
          <h1 className="text-3xl font-bold mb-1" style={{ fontFamily: "'Clash Display', sans-serif", color: "#f2f2f8" }}>
            {company.display_name || `@${slug}`}
          </h1>
          <p className="text-sm mb-4" style={{ fontFamily: "'DM Mono', monospace", color: "#00C9B1" }}>@{slug}</p>
          {company.description && (
            <p className="text-sm leading-relaxed" style={{ color: "#8888aa" }}>{company.description}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompanyPublic;
