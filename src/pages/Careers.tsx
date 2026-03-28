import { useState } from "react";
import SEOHead from "@/components/SEOHead";
import Header from "@/components/Header";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import {
  Search, MapPin, Lock, Mail, Phone, Briefcase, ChevronDown, ChevronUp, Eye,
  Building2, CreditCard, CheckCircle2
} from "lucide-react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Careers = () => {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [unlockTarget, setUnlockTarget] = useState<any>(null);
  const [companyName, setCompanyName] = useState("");
  const [companyEmail, setCompanyEmail] = useState("");

  // Check if current user has active company subscription
  const { data: mySubscription } = useQuery({
    queryKey: ["my-company-sub", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("company_subscriptions" as any)
        .select("*")
        .eq("user_id", user!.id)
        .eq("status", "active")
        .gte("expires_at", new Date().toISOString())
        .limit(1)
        .single();
      return data;
    },
    enabled: !!user,
  });

  const hasCompanyAccess = !!mySubscription;

  const { data: sites, isLoading } = useQuery({
    queryKey: ["careers-sites", search],
    queryFn: async () => {
      let q = supabase
        .from("mini_sites")
        .select("*, profiles!inner(display_name, avatar_url)")
        .eq("published", true)
        .eq("show_cv", true);
      if (search.trim()) {
        q = q.or(`site_name.ilike.%${search}%,cv_headline.ilike.%${search}%,cv_location.ilike.%${search}%`);
      }
      const { data } = await q.order("updated_at", { ascending: false }).limit(50);
      return data || [];
    },
  });

  const { data: myUnlocks } = useQuery({
    queryKey: ["my-cv-unlocks", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("cv_unlocks").select("site_id").eq("buyer_id", user!.id);
      return (data || []).map((u: any) => u.site_id);
    },
    enabled: !!user,
  });

  const unlockContact = useMutation({
    mutationFn: async (site: any) => {
      const { error } = await supabase.from("cv_unlocks").insert({
        buyer_id: user!.id,
        creator_id: site.user_id,
        site_id: site.id,
        amount_paid: 20,
        creator_share: 10,
        platform_share: 10,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-cv-unlocks"] });
      toast.success("Contact unlocked!");
      setUnlockTarget(null);
    },
    onError: (e: any) => toast.error(e.message),
  });

  const subscribeMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("company_subscriptions" as any).insert({
        user_id: user!.id,
        company_name: companyName,
        company_email: companyEmail || null,
        plan_price: 399,
        status: "active",
      } as any);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-company-sub"] });
      toast.success("Company subscription activated!");
      setCompanyName("");
      setCompanyEmail("");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const isUnlocked = (siteId: string) => myUnlocks?.includes(siteId) || hasCompanyAccess;

  return (
    <div className="min-h-screen bg-background">
      <SEOHead title="Jobs & Talent – TrustBank" description="Find professionals and talent on TrustBank. Companies subscribe to access CVs. Professionals showcase their work on Mini Sites." path="/careers" />
      <Header />

      {/* Unlock Dialog */}
      <AlertDialog open={!!unlockTarget} onOpenChange={o => !o && setUnlockTarget(null)}>
        <AlertDialogContent className="max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2"><Lock className="w-5 h-5 text-primary" /> Unlock Contact</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2 text-sm">
                <p>Unlock <strong>{unlockTarget?.site_name || "this professional"}</strong>'s contact information.</p>
                <p>Price: <span className="font-mono font-bold text-primary">$20.00 USDC</span></p>
                <p className="text-[10px] text-muted-foreground">50% goes to the professional, 50% to the platform.</p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => unlockContact.mutate(unlockTarget)} className="bg-primary text-primary-foreground">
              Unlock for $20
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-black text-foreground flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-primary" /> Jobs & Talent
          </h1>
          <p className="text-sm text-muted-foreground">Find professionals. Unlock CVs. Hire talent.</p>
        </div>

        <Tabs defaultValue="directory" className="space-y-6">
          <TabsList className="bg-secondary border border-border">
            <TabsTrigger value="directory" className="gap-1.5 font-bold">
              <Search className="w-4 h-4" /> Directory
            </TabsTrigger>
            <TabsTrigger value="companies" className="gap-1.5 font-bold">
              <Building2 className="w-4 h-4" /> For Companies
            </TabsTrigger>
          </TabsList>

          {/* ── DIRECTORY ── */}
          <TabsContent value="directory" className="space-y-4">
            <div className="relative max-w-lg">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by name, headline, or location..."
                className="pl-10"
              />
            </div>

            {hasCompanyAccess && (
              <div className="flex items-center gap-2 bg-accent/10 border border-accent/30 rounded-lg px-4 py-2">
                <CheckCircle2 className="w-4 h-4 text-accent" />
                <span className="text-xs font-bold text-accent">Company access active — all CVs unlocked</span>
              </div>
            )}

            {isLoading ? (
              <div className="text-center py-10 text-muted-foreground text-sm">Loading professionals...</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {(sites || []).map((site: any) => {
                  const profile = (site as any).profiles;
                  const isExpanded = expandedId === site.id;
                  const unlocked = isUnlocked(site.id);
                  const skills = site.cv_skills || [];
                  const experience = site.cv_experience || [];

                  return (
                    <div key={site.id} className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
                      <div className="p-5 space-y-3">
                        <div className="flex items-start gap-3">
                          {profile?.avatar_url ? (
                            <img src={profile.avatar_url} alt="" className="w-14 h-14 rounded-full object-cover border-2 border-border" />
                          ) : (
                            <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-black text-xl">
                              {(site.site_name || profile?.display_name || "?")?.[0]?.toUpperCase()}
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-black text-foreground truncate">{site.site_name || profile?.display_name}</h3>
                            {site.cv_headline && <p className="text-xs text-primary font-bold truncate">{site.cv_headline}</p>}
                            {site.cv_location && (
                              <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                                <MapPin className="w-3 h-3" /> {site.cv_location}
                              </p>
                            )}
                          </div>
                        </div>

                        {site.bio && <p className="text-xs text-muted-foreground line-clamp-2">{site.bio}</p>}

                        {skills.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {skills.slice(0, 5).map((s: string, i: number) => (
                              <span key={i} className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary">{s}</span>
                            ))}
                            {skills.length > 5 && <span className="text-[10px] text-muted-foreground">+{skills.length - 5}</span>}
                          </div>
                        )}

                        <button
                          onClick={() => setExpandedId(isExpanded ? null : site.id)}
                          className="flex items-center gap-1 text-xs text-primary font-bold hover:underline"
                        >
                          {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                          {isExpanded ? "Hide details" : "View CV"}
                        </button>

                        {isExpanded && (
                          <div className="space-y-3 pt-2 border-t border-border animate-in slide-in-from-top-2">
                            {site.cv_content && (
                              <div>
                                <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">About</p>
                                <p className="text-xs text-foreground whitespace-pre-wrap">{site.cv_content}</p>
                              </div>
                            )}
                            {experience.length > 0 && (
                              <div>
                                <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Experience</p>
                                {experience.map((exp: any, i: number) => (
                                  <div key={i} className="mb-2">
                                    <p className="text-xs font-bold text-foreground">{exp.title}</p>
                                    <p className="text-[10px] text-primary">{exp.company} · {exp.period}</p>
                                    {exp.description && <p className="text-[10px] text-muted-foreground mt-0.5">{exp.description}</p>}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Contact Footer */}
                      <div className="bg-secondary/50 border-t border-border px-5 py-3 flex items-center justify-between">
                        {unlocked ? (
                          <div className="flex items-center gap-3 text-xs">
                            {site.contact_email && (
                              <a href={`mailto:${site.contact_email}`} className="flex items-center gap-1 text-primary hover:underline">
                                <Mail className="w-3 h-3" /> {site.contact_email}
                              </a>
                            )}
                            {site.contact_phone && (
                              <a href={`tel:${site.contact_phone}`} className="flex items-center gap-1 text-primary hover:underline">
                                <Phone className="w-3 h-3" /> {site.contact_phone}
                              </a>
                            )}
                            {!site.contact_email && !site.contact_phone && (
                              <span className="text-muted-foreground text-xs">No contact info set</span>
                            )}
                          </div>
                        ) : (
                          <button
                            onClick={() => user ? setUnlockTarget(site) : toast.error("Please sign in first")}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground text-xs font-bold rounded-lg hover:bg-primary/90"
                          >
                            <Lock className="w-3 h-3" /> Unlock · $20
                          </button>
                        )}
                        <a href={`/s/${site.slug}`} className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-primary">
                          <Eye className="w-3 h-3" /> Profile
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {sites && sites.length === 0 && !isLoading && (
              <div className="text-center py-16 text-muted-foreground">
                <Briefcase className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm">No professionals found. Try a different search.</p>
              </div>
            )}
          </TabsContent>

          {/* ── COMPANIES ── */}
          <TabsContent value="companies" className="space-y-6">
            <div className="max-w-xl mx-auto">
              <div className="bg-card border border-border rounded-2xl p-8 space-y-6">
                <div className="text-center space-y-2">
                  <Building2 className="w-12 h-12 text-primary mx-auto" />
                  <h2 className="text-xl font-black text-foreground">Company CV Access</h2>
                  <p className="text-sm text-muted-foreground">Subscribe to unlock all professional CVs and contact information.</p>
                </div>

                <div className="bg-secondary rounded-xl p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-foreground">Monthly Plan</span>
                    <span className="text-3xl font-black text-accent">$399<span className="text-sm text-muted-foreground font-bold">/mo</span></span>
                  </div>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-accent" /> Unlimited CV access</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-accent" /> All contact information unlocked</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-accent" /> Search & filter professionals</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-accent" /> Priority support</li>
                  </ul>
                </div>

                {hasCompanyAccess ? (
                  <div className="text-center py-4">
                    <div className="flex items-center justify-center gap-2 text-accent font-bold">
                      <CheckCircle2 className="w-5 h-5" /> Subscription Active
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Expires: {new Date((mySubscription as any).expires_at).toLocaleDateString()}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Input
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="Company name"
                      className="font-bold"
                    />
                    <Input
                      value={companyEmail}
                      onChange={(e) => setCompanyEmail(e.target.value)}
                      placeholder="Company email (optional)"
                    />
                    <button
                      onClick={() => {
                        if (!user) return toast.error("Please sign in first");
                        if (!companyName.trim()) return toast.error("Enter company name");
                        subscribeMutation.mutate();
                      }}
                      disabled={subscribeMutation.isPending}
                      className="w-full py-3.5 bg-accent text-accent-foreground font-black text-sm rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <CreditCard className="w-4 h-4" />
                      {subscribeMutation.isPending ? "Processing..." : "Subscribe · $399/month"}
                    </button>
                    <p className="text-[10px] text-muted-foreground text-center">
                      Payment in USDC on Polygon. Subscription renews monthly.
                    </p>
                  </div>
                )}
              </div>

              {/* Individual unlock option */}
              <div className="mt-6 text-center space-y-2">
                <p className="text-xs text-muted-foreground font-bold">Or unlock individual CVs</p>
                <p className="text-sm text-foreground">
                  <span className="font-black">$20</span> per CV · 50% to professional, 50% to platform
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Careers;
