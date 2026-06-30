import React, { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";
import Navigation from "./components/Navigation";
import Hero from "./components/Hero";
import Pricing from "./components/Pricing";
import ActiveDashboard from "./components/ActiveDashboard";
import ReportModal from "./components/ReportModal";
import AiAssistant from "./components/AiAssistant";
import CivicIqLogo from "./components/CivicIqLogo";
import { CivicReport, UserRole } from "./types";
import {
  Shield,
  Lock,
  Cpu,
  Link,
  Mail,
  Heart,
  Github,
  Twitter,
  Linkedin,
  Database,
  Building,
  HardHat,
  ArrowRight,
  CheckCircle,
  HelpCircle,
  MessageSquare,
  MapPin,
  X
} from "lucide-react";

export default function App() {
  const [activeRole, setActiveRole] = useState<UserRole>("Citizen");
  const [activeTab, setActiveTab] = useState<string>("home");
  const [reports, setReports] = useState<CivicReport[]>([]);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const dashboardRef = useRef<HTMLDivElement>(null);

  const [showLocationPrompt, setShowLocationPrompt] = useState(false);
  const [locationStatus, setLocationStatus] = useState<"idle" | "fetching" | "success" | "denied">("idle");
  const [detectedAddress, setDetectedAddress] = useState<string | null>(null);

  // Check if user has already allowed or dismissed location prompt on mount
  useEffect(() => {
    const status = localStorage.getItem("civiciq_location_status");
    if (!status) {
      const timer = setTimeout(() => {
        setShowLocationPrompt(true);
      }, 1500);
      return () => clearTimeout(timer);
    } else if (status === "granted") {
      navigator.geolocation?.getCurrentPosition(
        (position) => {
          console.log("Auto-location updated:", position.coords.latitude, position.coords.longitude);
        },
        () => {}
      );
    }
  }, []);

  const handleEnableLocation = () => {
    setLocationStatus("fetching");
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude.toFixed(4);
          const lng = position.coords.longitude.toFixed(4);
          setLocationStatus("success");
          setDetectedAddress(`${lat}° N, ${lng}° W`);
          localStorage.setItem("civiciq_location_status", "granted");
          
          // Auto-close banner on success after a short delay
          setTimeout(() => {
            setShowLocationPrompt(false);
          }, 2500);
        },
        (error) => {
          console.warn("Location prompt denied/failed:", error);
          setLocationStatus("denied");
          localStorage.setItem("civiciq_location_status", "denied");
          
          setTimeout(() => {
            setShowLocationPrompt(false);
          }, 2500);
        }
      );
    } else {
      setLocationStatus("denied");
      setTimeout(() => {
        setShowLocationPrompt(false);
      }, 2500);
    }
  };

  const handleDismissLocation = () => {
    setShowLocationPrompt(false);
    localStorage.setItem("civiciq_location_status", "dismissed");
  };

  // Load initial reports from our in-memory Express server
  useEffect(() => {
    async function loadReports() {
      try {
        const response = await fetch("/api/reports");
        const data = await response.json();
        setReports(data);
      } catch (err) {
        console.error("Failed to load seeded reports:", err);
      }
    }
    loadReports();
  }, []);

  const handleReportCreated = (newReport: CivicReport) => {
    // Prepend to show on top
    setReports((prev) => [newReport, ...prev]);
    // Scroll to dashboard
    handleScrollToDashboard();
  };

  const handleUpdateReport = (updatedReport: CivicReport) => {
    setReports((prev) =>
      prev.map((r) => (r.id === updatedReport.id ? updatedReport : r))
    );
  };

  const handleScrollToDashboard = () => {
    if (dashboardRef.current) {
      dashboardRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      document.getElementById("live-hub")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="min-h-screen bg-[#070A13] text-slate-300 font-sans">
      
      {/* 1. Global Header Navigation */}
      <Navigation
        activeRole={activeRole}
        onRoleChange={setActiveRole}
        onNavigateToDashboard={handleScrollToDashboard}
        onOpenReportModal={() => setReportModalOpen(true)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Concise on-load Location Permission Request Dialogue */}
      {showLocationPrompt && (
        <div className="sticky top-20 z-40 bg-[#0B0F19]/95 backdrop-blur-md border-b border-[#00C2FF]/15 px-4 py-3 shadow-[0_4px_30px_rgba(0,0,0,0.5)] transition-all duration-300">
          <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5 text-slate-200">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-[#00C2FF]/10 text-[#00F0FF] border border-[#00C2FF]/20">
                <MapPin className="h-4 w-4" />
              </div>
              <p className="font-semibold leading-relaxed">
                {locationStatus === "idle" && (
                  <span>To view nearby municipal hazard reports in real-time, please enable your device location.</span>
                )}
                {locationStatus === "fetching" && (
                  <span className="text-[#00F0FF] animate-pulse">Establishing contact with device GPS coordinates...</span>
                )}
                {locationStatus === "success" && (
                  <span className="text-emerald-400 font-extrabold flex items-center gap-1">
                    ✓ GPS Connected successfully! Local zone established at {detectedAddress}.
                  </span>
                )}
                {locationStatus === "denied" && (
                  <span className="text-rose-400 font-extrabold">
                    ✗ Location access declined. Falling back to default municipal map view.
                  </span>
                )}
              </p>
            </div>
            {locationStatus === "idle" && (
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={handleEnableLocation}
                  className="rounded-lg bg-gradient-to-r from-[#1D9BF0] to-[#00F0FF] text-[#070A13] font-black px-3.5 py-1.5 uppercase tracking-wider hover:opacity-90 active:scale-95 transition-all cursor-pointer text-[10px]"
                >
                  Enable GPS
                </button>
                <button
                  onClick={handleDismissLocation}
                  className="rounded-lg bg-white/5 border border-white/10 text-slate-300 font-bold px-3 py-1.5 hover:bg-white/10 active:scale-95 transition-all cursor-pointer text-[10px]"
                >
                  Dismiss
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. Headline & Map Showcase Hero */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <Hero
          onOpenReportModal={() => setReportModalOpen(true)}
          onScrollToDashboard={handleScrollToDashboard}
        />
      </motion.div>

      {/* 3. Role-Based Feature Highlight Section */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        id="solutions"
        className="scroll-mt-24 bg-[#070A13] py-12 border-t border-white/5"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-[#0B0F19] border border-white/5 p-8 flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl">
            <div className="max-w-xl">
              <span className="font-mono text-xs font-bold text-[#00C2FF] uppercase tracking-wider">[ DESIGNED FOR COLLABORATION ]</span>
              <h3 className="font-display text-xl font-extrabold text-white mt-1">Multi-Tenant Portals with Granular Security Controls</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                CivicIQ isolates workflows based on organizational role permissions. Toggle spaces in the header navigation to test actions for **Citizens**, **Government Managers**, or **Allocated contractors** live in the map.
              </p>
            </div>
            
            {/* Quick overview pills */}
            <div className="flex flex-wrap gap-2.5 shrink-0 justify-center">
              <button onClick={() => setActiveRole("Citizen")} className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${activeRole === "Citizen" ? "bg-gradient-to-r from-[#1D9BF0] to-[#00C2FF] text-[#070A13] border-transparent shadow-lg shadow-[#1D9BF0]/20" : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10"}`}>
                <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
                Citizen Hub
              </button>
              <button onClick={() => setActiveRole("Government")} className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${activeRole === "Government" ? "bg-gradient-to-r from-[#1D9BF0] to-[#00C2FF] text-[#070A13] border-transparent shadow-lg shadow-[#1D9BF0]/20" : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10"}`}>
                <Building className="h-3.5 w-3.5 text-blue-400" />
                Gov Workspace
              </button>
              <button onClick={() => setActiveRole("Contractor")} className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${activeRole === "Contractor" ? "bg-gradient-to-r from-[#1D9BF0] to-[#00C2FF] text-[#070A13] border-transparent shadow-lg shadow-[#1D9BF0]/20" : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10"}`}>
                <HardHat className="h-3.5 w-3.5 text-amber-400" />
                Contractor Field
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 4. Active GIS Map & Workflow Execution Hub */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        ref={dashboardRef}
        id="live-hub"
        className="bg-[#070A13] border-t border-white/5 scroll-mt-16"
      >
        <ActiveDashboard
          reports={reports}
          activeRole={activeRole}
          onUpdateReport={handleUpdateReport}
        />
      </motion.div>

      {/* 5. Pricing Section with Dynamic Bill Cycle Toggle */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <Pricing />
      </motion.div>

      {/* 6. Security & Government Compliance Section */}
      <motion.section
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        id="security"
        className="py-20 bg-[#070A13] border-b border-white/5"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left explanation */}
            <div className="lg:col-span-5 space-y-6">
              <div>
                <span className="font-mono text-xs font-bold text-[#00C2FF] uppercase tracking-wider">[ COMPLIANCE FIRST ]</span>
                <h3 className="font-display text-3xl font-extrabold text-white mt-1">Government-Grade Infrastructure & Security</h3>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed font-medium">
                CivicIQ is built from the ground up for critical public utilities. We maintain maximum uptime, data redundancy, and robust role-based encryption schemas compliant with local and federal guidelines.
              </p>

              <div className="space-y-4 pt-2">
                {[
                  { title: "AES-256 Data Encryption", desc: "All media, diagnostic parameters, and reporter profiles are encrypted end-to-end both in transit and at rest." },
                  { title: "Granular Role-Based Access Control", desc: "Verifications, budgets, and contractor bidding details are restricted using strict JSON Web Token validation layers." },
                  { title: "Complete Compliance Alignment", desc: "Full alignment with SOC 2, HIPAA, GDPR privacy frameworks, and accessibility standards (WCAG AA)." },
                ].map((item) => (
                  <div key={item.title} className="flex gap-3">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-500/10 text-[#00C2FF] border border-blue-500/20 mt-0.5">
                      <Lock className="h-3 w-3" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-100">{item.title}</h4>
                      <p className="text-[11px] text-slate-400 leading-relaxed font-medium mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Premium Isometric Visual Cards representing compliance blocks */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[
                { title: "SOC 2 Type II Certified", sub: "Enterprise Audited", detail: "Annual independent third-party audits ensure CivicIQ continuously adheres to industry safety standards." },
                { title: "99.99% Core SLA Uptime", sub: "Highly Available", detail: "Globally distributed regional clusters powered by auto-scaling containers guarantee instant failure mitigation." },
                { title: "GDPR & HIPAA Ready", sub: "Privacy Safeguards", detail: "Automated scrubbers sanitize citizen photo license plates, faces, and phone numbers before caching data." },
                { title: "Fully Documented REST API", sub: "Open Municipalities", detail: "Facilitates seamless custom integration with existing local 311 service records or contractor tools." },
              ].map((card, idx) => (
                <div key={idx} className="rounded-2xl border border-white/5 p-5 bg-[#0B0F19] hover:bg-[#0F1422] hover:border-white/10 hover:shadow-2xl transition-all duration-300">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/5 text-[#00C2FF] border border-white/10">
                      <Shield className="h-4 w-4" />
                    </div>
                    <div>
                      <span className="text-[9px] font-bold text-[#00C2FF] uppercase tracking-wider block">{card.sub}</span>
                      <h4 className="text-xs font-extrabold text-white">{card.title}</h4>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
                    {card.detail}
                  </p>
                </div>
              ))}
            </div>

          </div>

        </div>
      </motion.section>

      {/* 7. Integrations Section */}
      <motion.section
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="py-16 bg-[#0B0F19] border-t border-b border-white/5"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <span className="font-mono text-xs font-bold text-[#00C2FF] uppercase tracking-wider">[ ECOSYSTEM READY ]</span>
          <h3 className="font-display text-2xl font-extrabold text-white mt-1 mb-8">Integrated with Industry Standards</h3>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { name: "Google Maps", spec: "GIS, Heatmaps, satellite" },
              { name: "Gemini AI", spec: "Diagnostics & summaries" },
              { name: "OpenStreetMap", spec: "Alternative open routing" },
              { name: "Firebase Notifications", spec: "Immediate dispatch SMS" },
              { name: "REST Webhooks", spec: "Bespoke citizen platforms" },
              { name: "SaaS Cloud Storage", spec: "Secure attachment vaults" },
            ].map((integ, idx) => (
              <div key={idx} className="rounded-xl border border-white/5 bg-[#070A13] p-4 shadow-xl hover:scale-102 hover:border-[#00C2FF]/30 transition-all">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#00C2FF]/10 text-[#00C2FF] mx-auto mb-2 border border-[#00C2FF]/20">
                  <Cpu className="h-4.5 w-4.5" />
                </div>
                <h5 className="text-xs font-bold text-white">{integ.name}</h5>
                <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">{integ.spec}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* 8. Comprehensive Municipal SaaS Footer */}
      <motion.footer
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        id="about"
        className="scroll-mt-24 bg-[#0F172A] text-slate-400 py-16 border-t border-white/5 relative overflow-hidden"
      >
        <div className="absolute bottom-0 right-0 h-64 w-64 bg-[#1D9BF0]/5 blur-3xl rounded-full" />
        
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-12">
            
            {/* Left Brand details */}
            <div className="md:col-span-4 space-y-4">
              <CivicIqLogo size="md" variant="light" showSubtext={true} />
              <p className="text-xs text-slate-400 leading-relaxed max-w-sm mt-2">
                CivicIQ is a premier SaaS operating system designed for smart municipalities, enterprises, contractors, and forward-thinking neighborhoods. Empowering community alignment through server-side AI solutions.
              </p>
              <div className="flex items-center gap-3 pt-2">
                <a href="#" className="h-8 w-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-[#1D9BF0] transition-colors">
                  <Twitter className="h-4 w-4" />
                </a>
                <a href="#" className="h-8 w-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-[#1D9BF0] transition-colors">
                  <Linkedin className="h-4 w-4" />
                </a>
                <a href="#" className="h-8 w-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-[#1D9BF0] transition-colors">
                  <Github className="h-4 w-4" />
                </a>
              </div>
            </div>

            {/* Links Columns */}
            <div className="md:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-6">
              {[
                {
                  title: "Solutions",
                  links: ["Municipalities", "Contractors", "NGOs", "Universities", "Smart Cities"],
                },
                {
                  title: "Features",
                  links: ["Vision Diagnostics", "GIS Live Map", "Workflow Dispatch", "Citizen ranks", "Fiscal Budgets"],
                },
                {
                  title: "Developers",
                  links: ["Documentation", "API status", "Github repo", "SDK guides", "System status"],
                },
                {
                  title: "Legal & Support",
                  links: ["Privacy Policy", "SLA Agreements", "Terms of Use", "Help Center", "Trust Center"],
                },
              ].map((col) => (
                <div key={col.title} className="space-y-3">
                  <h5 className="text-[11px] font-bold uppercase tracking-wider text-white">{col.title}</h5>
                  <ul className="space-y-2">
                    {col.links.map((link) => (
                      <li key={link}>
                        <a href="#" className="text-xs text-slate-400 hover:text-white transition-colors">
                          {link}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

          </div>

          {/* Bottom Bar */}
          <div className="border-t border-white/5 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center">
            <span className="text-[11px] text-slate-500 font-medium">
              © {new Date().getFullYear()} CivicIQ, Inc. All rights reserved. Globally distributed across secure Cloud clusters.
            </span>
            <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium">
              <span>Crafted with</span>
              <Heart className="h-3.5 w-3.5 text-rose-500 animate-pulse fill-rose-500" />
              <span>for healthier smart communities.</span>
            </div>
          </div>

        </div>
      </motion.footer>

      {/* 9. Floating Grounded Conversational AI Assistant */}
      <AiAssistant />

      {/* 10. Citizen Report Submission Modal */}
      {reportModalOpen && (
        <ReportModal
          onClose={() => setReportModalOpen(false)}
          onReportCreated={handleReportCreated}
        />
      )}

    </div>
  );
}
