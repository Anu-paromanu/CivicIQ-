import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Sparkles,
  ArrowRight,
  Send,
  Activity,
  MapPin,
  TrendingUp,
  Layers,
  CheckCircle,
  Clock,
  Cpu,
  Lock,
  Building,
  Play,
  Search,
  ChevronDown,
  Calendar,
  ThumbsUp,
  Sliders,
  HelpCircle,
  FileText,
  Users
} from "lucide-react";

interface HeroProps {
  onOpenReportModal: () => void;
  onScrollToDashboard: () => void;
}

export default function Hero({ onOpenReportModal, onScrollToDashboard }: HeroProps) {
  const [selectedMapNode, setSelectedMapNode] = useState<string>("pothole-main");
  const [mapViewMode, setMapViewMode] = useState<"vector" | "satellite" | "heatmap">("vector");
  const [isScanning, setIsScanning] = useState<boolean>(true);
  const [widget3Mode, setWidget3Mode] = useState<"chart" | "logs">("logs");
  const [extraNodes, setExtraNodes] = useState<any[]>([]);

  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    "System initialized on 0.0.0.0:3000",
    "SLA tracking engine: ONLINE",
    "LIDAR Satellite link established",
    "AI Model loaded: Gemini-3.5-Flash",
    "Ready for municipal operations"
  ]);

  // Mock interactive coordinates matching the map visualization
  const mapNodes = [
    { id: "pothole-main", label: "Pothole detected", x: "32%", y: "45%", color: "bg-amber-400" },
    { id: "water-leak", label: "Water Line Leakage", x: "65%", y: "28%", color: "bg-rose-500" },
    { id: "grid-outage", label: "Power Grid Outage", x: "78%", y: "65%", color: "bg-cyan-400" },
    { id: "tree-block", label: "Tree block hazard", x: "42%", y: "78%", color: "bg-emerald-400" },
  ];

  const nodeDetails: Record<string, {
    category: string;
    title: string;
    location: string;
    priority: "Critical" | "High" | "Medium";
    priorityColor: string;
    timeAgo: string;
    imageUrl: string;
  }> = {
    "pothole-main": {
      category: "Road Damage",
      title: "Pothole on Main St.",
      location: "Near City Center, Zone A",
      priority: "High",
      priorityColor: "text-rose-400 bg-rose-500/10 border border-rose-500/20",
      timeAgo: "2 min ago",
      imageUrl: "https://images.unsplash.com/photo-1515162305285-0293e4767cc2?auto=format&fit=crop&w=150&q=80"
    },
    "water-leak": {
      category: "Water Leakage",
      title: "Burst Water Main",
      location: "4th & Market St., Zone B",
      priority: "Critical",
      priorityColor: "text-rose-500 bg-rose-500/20 border border-rose-500/30",
      timeAgo: "15 min ago",
      imageUrl: "https://images.unsplash.com/photo-1542013936693-8848e574047e?auto=format&fit=crop&w=150&q=80"
    },
    "grid-outage": {
      category: "Streetlight",
      title: "Grid Power Outage",
      location: "Richmond District, Zone C",
      priority: "High",
      priorityColor: "text-rose-400 bg-rose-500/10 border border-rose-500/20",
      timeAgo: "45 min ago",
      imageUrl: "https://images.unsplash.com/photo-1509395062183-67c5ad6faff9?auto=format&fit=crop&w=150&q=80"
    },
    "tree-block": {
      category: "Tree Hazards",
      title: "Fallen Tree Hazard",
      location: "Golden Gate Park, Zone D",
      priority: "Medium",
      priorityColor: "text-amber-400 bg-amber-500/10 border border-amber-500/20",
      timeAgo: "1 hour ago",
      imageUrl: "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=150&q=80"
    }
  };

  const activeMapNodes = [...mapNodes, ...extraNodes];
  const currentDetail = nodeDetails[selectedMapNode] || extraNodes.find(n => n.id === selectedMapNode) || nodeDetails["pothole-main"];

  // Log triggers on change of focus
  React.useEffect(() => {
    const node = activeMapNodes.find(n => n.id === selectedMapNode);
    if (node) {
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setTerminalLogs(prev => [
        `[${timeStr}] FOCUS_TARGET: ${node.label || node.title}`,
        `[${timeStr}] AI_ENGINE: Verifying visual pixels & coordinate metadata...`,
        `[${timeStr}] STATUS_MATCH: Category=${currentDetail.category} | Priority=${currentDetail.priority}`,
        ...prev.slice(0, 15)
      ]);
    }
  }, [selectedMapNode]);

  const handleMapViewChange = (mode: "vector" | "satellite" | "heatmap") => {
    setMapViewMode(mode);
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setTerminalLogs(prev => [
      `[${timeStr}] ACTION: Switched map view layer to ${mode.toUpperCase()}`,
      ...prev.slice(0, 15)
    ]);
  };

  const handleSimulateIncident = () => {
    const mockReports = [
      {
        id: "sim-gas",
        label: "Gas Pipe Pressure Fluctuation",
        x: "52%",
        y: "22%",
        color: "bg-rose-500",
        category: "Gas & Utility",
        title: "Gas Pipe Leakage",
        location: "120 Market St, Zone E",
        priority: "Critical" as const,
        priorityColor: "text-rose-500 bg-rose-500/20 border border-rose-500/30",
        timeAgo: "Just now",
        imageUrl: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=150&q=80"
      },
      {
        id: "sim-sewer",
        label: "Clogged Sewer Drain Flooding",
        x: "24%",
        y: "68%",
        color: "bg-rose-400",
        category: "Water Leakage",
        title: "Storm Drain Backup",
        location: "9th Ave & Geary Blvd, Zone B",
        priority: "High" as const,
        priorityColor: "text-rose-400 bg-rose-500/10 border border-rose-500/20",
        timeAgo: "Just now",
        imageUrl: "https://images.unsplash.com/photo-1542013936693-8848e574047e?auto=format&fit=crop&w=150&q=80"
      },
      {
        id: "sim-light",
        label: "Exposed Wire Streetlight Box",
        x: "82%",
        y: "40%",
        color: "bg-amber-400",
        category: "Streetlight",
        title: "Exposed Grid Cable Box",
        location: "1420 18th Ave, Zone D",
        priority: "High" as const,
        priorityColor: "text-amber-400 bg-amber-500/10 border border-amber-500/20",
        timeAgo: "Just now",
        imageUrl: "https://images.unsplash.com/photo-1509395062183-67c5ad6faff9?auto=format&fit=crop&w=150&q=80"
      }
    ];

    const chosen = mockReports[Math.floor(Math.random() * mockReports.length)];

    if (extraNodes.some(n => n.id === chosen.id)) {
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setTerminalLogs(prev => [
        `[${timeStr}] WARN: Injected telemetry '${chosen.id}' already active.`,
        ...prev.slice(0, 15)
      ]);
      setSelectedMapNode(chosen.id);
      return;
    }

    setExtraNodes(prev => [...prev, chosen]);
    setSelectedMapNode(chosen.id);

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setTerminalLogs(prev => [
      `[${timeStr}] REPORT_SIMULATOR: Injected active telemetry for '${chosen.id}'`,
      `[${timeStr}] AI_OCR: Running plate & object scanning on Vision feed...`,
      `[${timeStr}] DISPATCH: Dynamic routing to authorized Municipal dispatchers...`,
      ...prev.slice(0, 15)
    ]);
  };

  return (
    <section id="home" className="relative overflow-hidden bg-[#070A13] text-white py-16 lg:py-24 border-b border-white/5">
      
      {/* Immersive night city background with long-exposure light trails matching the user's shared image exactly */}
      <div 
        className="absolute inset-0 bg-cover bg-center pointer-events-none opacity-[0.35] mix-blend-screen select-none"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=1920&q=80')" }}
      />
      {/* Overlay vignette/gradient to blend city trails background seamlessly with deep dark theme */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#070A13] via-transparent to-[#070A13]/85 pointer-events-none" />

      {/* Background grids and glowing lights */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.012)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.012)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
      <div className="absolute top-0 right-0 -z-10 h-[650px] w-[650px] rounded-full bg-gradient-to-br from-[#1D9BF0]/15 via-transparent to-transparent blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -z-10 h-[450px] w-[450px] rounded-full bg-gradient-to-tr from-[#00C2FF]/10 via-transparent to-transparent blur-3xl pointer-events-none" />

      {/* Cybernetic scanning light ray across top of page */}
      <div className="absolute top-0 left-0 w-full h-[1.5px] bg-gradient-to-r from-transparent via-[#00F0FF]/25 to-transparent animate-[pulse_4s_infinite] pointer-events-none" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Main Centered Layout: Simple and elegant landing page design */}
        <div className="flex flex-col items-center justify-center text-center max-w-4xl mx-auto mb-16 relative z-10">
          
          {/* Tagline exactly as requested in image */}
          <span className="text-[10px] sm:text-[11px] font-bold tracking-[0.22em] text-[#00F0FF] uppercase block mb-4 animate-[pulse_2s_infinite]">
            AI-POWERED CIVIC INTELLIGENCE PLATFORM
          </span>

          {/* Header matches title in image exactly but centered */}
          <h1 className="font-display text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-[48px] xl:text-[56px] leading-[1.12] mb-6 text-white font-black max-w-3xl">
            AI That Helps Cities <br />
            Solve Problems <br />
            <span className="bg-gradient-to-r from-[#1D9BF0] via-[#00F0FF] to-white bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(0,240,255,0.25)]">
              Before
            </span> They Become Crises
          </h1>

          {/* Beautiful, faithful description paragraph */}
          <p className="text-sm sm:text-base text-slate-300 font-medium leading-relaxed mb-8 max-w-2xl text-center">
            Report issues in seconds. Let AI verify, categorize, prioritize, and route them automatically while citizens, authorities, and contractors collaborate in one transparent platform.
          </p>

          {/* Interactive CTAs styled perfectly like the image buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 mb-12">
            <button
              onClick={onOpenReportModal}
              className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#1D9BF0] to-[#00F0FF] px-7 py-4 text-xs font-extrabold text-[#070A13] uppercase tracking-wider shadow-[0_4px_25px_rgba(29,155,240,0.4)] hover:shadow-[0_4px_35px_rgba(0,240,255,0.6)] hover:scale-102 transition-all duration-300 cursor-pointer"
              id="create-smart-report-hero-btn"
            >
              <Send className="h-4 w-4 stroke-[2.5]" />
              <span>Create Smart Report</span>
            </button>
            
            <button
              onClick={onScrollToDashboard}
              className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 px-7 py-4 text-xs font-extrabold text-white uppercase tracking-wider shadow-sm hover:scale-102 transition-all cursor-pointer"
              id="watch-demo-hero-btn"
            >
              <Play className="h-4 w-4 fill-white text-white" />
              <span>Watch Demo</span>
            </button>
          </div>

          {/* Glowing technology badges strip at bottom left of text - styled as icon-only */}
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            {[
              { label: "AI Powered", icon: Cpu, color: "text-[#00C2FF]" },
              { label: "Live Tracking", icon: Activity, color: "text-emerald-400" },
              { label: "Secure", icon: Lock, color: "text-blue-400" },
              { label: "Government Ready", icon: Building, color: "text-purple-400" },
            ].map((badge) => {
              const IconComp = badge.icon;
              return (
                <div
                  key={badge.label}
                  title={badge.label}
                  className="flex items-center justify-center rounded-xl border border-white/5 bg-[#0F1422]/80 p-2.5 text-slate-300 shadow-sm hover:bg-white/5 hover:border-white/10 transition-all cursor-help"
                >
                  <IconComp className={`h-4.5 w-4.5 ${badge.color}`} />
                </div>
              );
            })}
          </div>

        </div>

        {/* =========================================================================
            CITY STATS TICKER (Simplified, clean, minimal styling as requested)
            ========================================================================= */}
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5 shadow-sm relative">
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { label: "Total Issues", val: "12,842", icon: FileText, text: "text-[#1D9BF0]" },
              { label: "Resolved", val: "9,684", icon: CheckCircle, text: "text-emerald-400" },
              { label: "Avg. Resolution Time", val: "2.4 Days", icon: Clock, text: "text-amber-400" },
              { label: "Active Citizens", val: "25,318", icon: Users, text: "text-purple-400" },
            ].map((stat, idx) => {
              const IconComp = stat.icon;
              return (
                <div key={idx} className="flex flex-col gap-1.5 px-2">
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <IconComp className={`h-4 w-4 ${stat.text}`} />
                    <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider">
                      {stat.label}
                    </span>
                  </div>
                  
                  <span className="text-xl sm:text-2xl font-bold font-mono text-white leading-none">
                    {stat.val}
                  </span>
                </div>
              );
            })}
          </div>

        </div>

      </div>
    </section>
  );
}
