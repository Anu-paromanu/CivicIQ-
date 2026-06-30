import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  MapPin,
  TrendingUp,
  AlertTriangle,
  Flame,
  Search,
  Filter,
  ArrowUp,
  Clock,
  Briefcase,
  CheckCircle,
  Activity,
  Award,
  ChevronRight,
  Shield,
  Building,
  HardHat,
  Database,
  ThumbsUp,
  User,
  Heart,
  Calendar,
  DollarSign
} from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, AreaChart, Area, PieChart, Pie, Cell } from "recharts";
import { CivicReport, IssueCategory, IssueStatus, UserRole } from "../types";

interface ActiveDashboardProps {
  reports: CivicReport[];
  activeRole: UserRole;
  onUpdateReport: (updatedReport: CivicReport) => void;
}

export default function ActiveDashboard({ reports, activeRole, onUpdateReport }: ActiveDashboardProps) {
  const [activeTab, setActiveTab] = useState<"map" | "analytics" | "gamification">("map");
  const [selectedReportId, setSelectedReportId] = useState<string>("rep-001");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");

  const selectedReport = useMemo(() => {
    return reports.find((r) => r.id === selectedReportId) || reports[0];
  }, [reports, selectedReportId]);

  // Filtered reports
  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      const matchesSearch = r.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            r.gpsAddress.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            r.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === "all" || r.category === categoryFilter;
      const matchesPriority = priorityFilter === "all" || r.priority === priorityFilter;
      return matchesSearch && matchesCategory && matchesPriority;
    });
  }, [reports, searchQuery, categoryFilter, priorityFilter]);

  // SLA calculations
  const stats = useMemo(() => {
    const total = reports.length;
    const completed = reports.filter((r) => r.status === "Completed" || r.status === "Citizen Confirmed").length;
    const inProgress = reports.filter((r) => r.status === "In Progress" || r.status === "Accepted").length;
    const emergency = reports.filter((r) => r.isEmergency).length;
    const totalCost = reports.reduce((sum, r) => sum + r.estimatedCost, 0);
    const avgSeverity = Math.round(reports.reduce((sum, r) => sum + r.severity, 0) / (total || 1));

    return { total, completed, inProgress, emergency, totalCost, avgSeverity };
  }, [reports]);

  // Analytics datasets
  const departmentBudgetData = [
    { name: "Public Works", allocated: 25000, spent: 18500 },
    { name: "Water & Sewer", allocated: 40000, spent: 28000 },
    { name: "Environmental Health", allocated: 15000, spent: 11000 },
    { name: "Forestry", allocated: 12000, spent: 8500 },
    { name: "Energy & Grid", allocated: 22000, spent: 14000 },
  ];

  const monthlySlaTrend = [
    { month: "Jan", target: 80, actual: 78 },
    { month: "Feb", target: 80, actual: 82 },
    { month: "Mar", target: 85, actual: 81 },
    { month: "Apr", target: 85, actual: 84 },
    { month: "May", target: 88, actual: 89 },
    { month: "Jun", target: 88, actual: 85 },
  ];

  const categoryDistribution = [
    { name: "Road Damage", value: reports.filter(r => r.category === "Road Damage").length },
    { name: "Water Leakage", value: reports.filter(r => r.category === "Water Leakage").length },
    { name: "Garbage", value: reports.filter(r => r.category === "Garbage").length },
    { name: "Streetlight", value: reports.filter(r => r.category === "Streetlight").length },
    { name: "Other Hazards", value: reports.filter(r => r.category !== "Road Damage" && r.category !== "Water Leakage" && r.category !== "Garbage" && r.category !== "Streetlight").length },
  ].filter(item => item.value > 0);

  const COLORS = ["#1D9BF0", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"];

  // Gamification datasets
  const leaderBoard = [
    { rank: 1, name: "David Vance", points: 1420, reports: 34, badge: "Master Inspector", level: 12 },
    { rank: 2, name: "Elena Rostova", points: 1180, reports: 27, badge: "Sewer Sentinel", level: 9 },
    { rank: 3, name: "Marcus Vance", points: 950, reports: 19, badge: "Pothole Patrol", level: 7 },
    { rank: 4, name: "Claire Dupont", points: 840, reports: 15, badge: "Eco Warrior", level: 6 },
    { rank: 5, name: "Jonathan Chen", points: 720, reports: 12, badge: "Light Ranger", level: 5 },
  ];

  // Action dispatcher based on user roles
  const handleWorkflowAction = async (action: string) => {
    if (!selectedReport) return;

    let nextStatus: IssueStatus = selectedReport.status;
    let comment = "";

    switch (activeRole) {
      case "Citizen":
        if (action === "upvote") {
          try {
            const res = await fetch(`/api/reports/${selectedReport.id}/action`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ upvote: true, updatedBy: "Community Resident" }),
            });
            const updated = await res.json();
            onUpdateReport(updated);
          } catch (e) {
            console.error(e);
          }
          return;
        } else if (action === "confirm_repair" && selectedReport.status === "Completed") {
          nextStatus = "Citizen Confirmed";
          comment = "Citizen verified the physical resolution, closing the SLA lifecycle.";
        }
        break;

      case "Government":
        if (action === "verify" && selectedReport.status === "Reported") {
          nextStatus = "Verified";
          comment = "Government authority reviewed telemetry evidence and validated report.";
        } else if (action === "assign" && selectedReport.status === "Verified") {
          nextStatus = "Assigned";
          comment = `Work order officially commissioned to primary contractor: ${selectedReport.contractor}.`;
        }
        break;

      case "Contractor":
        if (action === "accept" && selectedReport.status === "Assigned") {
          nextStatus = "Accepted";
          comment = `${selectedReport.contractor} accepted task, allocating field technicians.`;
        } else if (action === "start_repair" && selectedReport.status === "Accepted") {
          nextStatus = "In Progress";
          comment = "Maintenance crews have arrived on site. Physical repairs initiated.";
        } else if (action === "complete" && selectedReport.status === "In Progress") {
          nextStatus = "Completed";
          comment = "Heavy repairs complete. Structural diagnostic passed. Uploaded physical completion photos.";
        }
        break;

      case "Administrator":
        if (action === "archive") {
          nextStatus = "Archived";
          comment = "Administrator officially closed and archived this completed civil file.";
        } else if (action === "force_complete") {
          nextStatus = "Completed";
          comment = "Administrative direct override: completed.";
        }
        break;
    }

    if (nextStatus !== selectedReport.status) {
      try {
        const res = await fetch(`/api/reports/${selectedReport.id}/action`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: nextStatus,
            comment,
            updatedBy: `${activeRole} Hub`,
          }),
        });
        const updated = await res.json();
        onUpdateReport(updated);
      } catch (e) {
        console.error(e);
      }
    }
  };

  return (
    <section id="live-hub" className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      
      {/* Sub-Header Tabs */}
      <div className="flex flex-col md:flex-row items-center justify-between border-b border-white/5 pb-5 mb-8 gap-4">
        <div>
          <span className="font-mono text-xs font-bold text-[#00C2FF] tracking-wider uppercase">[ CIVIC WORKSPACE ]</span>
          <h2 className="font-display text-2xl font-extrabold text-white mt-1">Live Intelligence Hub</h2>
        </div>
        <div className="flex bg-white/5 p-1.5 rounded-xl border border-white/10">
          <button
            onClick={() => setActiveTab("map")}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
              activeTab === "map" ? "bg-white/10 text-white shadow-md border border-white/10" : "text-slate-400 hover:text-white"
            }`}
          >
            <MapPin className="h-4 w-4" />
            <span>Map & Operations</span>
          </button>
          <button
            onClick={() => setActiveTab("analytics")}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
              activeTab === "analytics" ? "bg-white/10 text-white shadow-md border border-white/10" : "text-slate-400 hover:text-white"
            }`}
          >
            <Activity className="h-4 w-4" />
            <span>Impact Analytics</span>
          </button>
          <button
            onClick={() => setActiveTab("gamification")}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
              activeTab === "gamification" ? "bg-white/10 text-white shadow-md border border-white/10" : "text-slate-400 hover:text-white"
            }`}
          >
            <Award className="h-4 w-4" />
            <span>Citizen Ranks</span>
          </button>
        </div>
      </div>

      {/* Overview Stats Ticker (Always Visible) */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        {[
          { label: "Active Reports", val: stats.total, color: "text-white" },
          { label: "Active Repairs", val: stats.inProgress, color: "text-[#00C2FF]" },
          { label: "Resolved cases", val: stats.completed, color: "text-emerald-400" },
          { label: "Emergency Hazards", val: stats.emergency, color: "text-rose-400", icon: Flame },
          { label: "Mean Severity Score", val: `${stats.avgSeverity}/100`, color: "text-amber-400" },
        ].map((stat, idx) => (
          <div key={idx} className="rounded-2xl border border-white/5 bg-[#0F1422]/60 p-4 shadow-xl flex flex-col justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{stat.label}</span>
            <div className="flex items-baseline justify-between mt-2">
              <span className={`text-2xl font-bold tracking-tight font-mono ${stat.color}`}>
                {stat.val}
              </span>
              {stat.icon && <stat.icon className={`h-4 w-4 ${stat.color} animate-pulse`} />}
            </div>
          </div>
        ))}
      </div>

      {/* Main Tab Views */}
      <AnimatePresence mode="wait">
        {activeTab === "map" && (
          <motion.div
            key="map"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8"
          >
          
          {/* Left Column: Search Filters & Reports Table List (4 cols) */}
          <div className="lg:col-span-5 space-y-4">
            
            {/* Search Input */}
            <div className="relative">
              <input
                type="text"
                placeholder="Type here to search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-white/5 bg-white/[0.02] pl-10 pr-4 py-2.5 text-xs text-white outline-none focus:border-white/10 focus:ring-1 focus:ring-white/5 transition-all placeholder-slate-500"
              />
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            </div>

            {/* Quick Select Categories Filters */}
            <div className="flex gap-2 overflow-x-auto pb-1">
              <button
                onClick={() => setCategoryFilter("all")}
                className={`rounded-lg px-2.5 py-1 text-[10px] font-semibold uppercase whitespace-nowrap border cursor-pointer transition-all ${
                  categoryFilter === "all" ? "bg-white/10 text-white border-white/10" : "bg-white/[0.02] text-slate-400 border-white/5 hover:bg-white/5 hover:text-white"
                }`}
              >
                All 🔍
              </button>
              {[
                { name: "Road Damage", emoji: "🕳️" },
                { name: "Water Leakage", emoji: "💧" },
                { name: "Garbage", emoji: "🗑️" },
                { name: "Streetlight", emoji: "💡" },
                { name: "Tree Hazards", emoji: "🌳" }
              ].map((item) => (
                <button
                  key={item.name}
                  onClick={() => setCategoryFilter(item.name)}
                  className={`rounded-lg px-2.5 py-1 text-[10px] font-semibold uppercase whitespace-nowrap border cursor-pointer transition-all ${
                    categoryFilter === item.name ? "bg-white/10 text-white border-white/10" : "bg-white/[0.02] text-slate-400 border-white/5 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  {item.name} {item.emoji}
                </button>
              ))}
            </div>

            {/* Scrollable list card list */}
            <div className="rounded-xl border border-white/5 bg-white/[0.02] overflow-hidden max-h-[460px] overflow-y-auto divide-y divide-white/5">
              {filteredReports.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">Nothing here! All clear! ✨</div>
              ) : (
                filteredReports.map((r) => {
                  const isSelected = r.id === selectedReportId;
                  // Map category to playful emoji
                  const categoryEmojis: Record<string, string> = {
                    "Road Damage": "🕳️",
                    "Water Leakage": "💧",
                    "Garbage": "🗑️",
                    "Streetlight": "💡",
                    "Tree Hazards": "🌳"
                  };
                  const emoji = categoryEmojis[r.category] || "⚠️";

                  return (
                    <button
                      key={r.id}
                      onClick={() => setSelectedReportId(r.id)}
                      className={`w-full p-4 text-left transition-all flex items-center gap-3 cursor-pointer ${
                        isSelected ? "bg-white/[0.06] border-l-4 border-l-[#00C2FF]" : "hover:bg-white/[0.02]"
                      }`}
                    >
                      {/* Left Giant Emoji Circle */}
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/5 border border-white/10 text-xl shadow-inner">
                        {emoji}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-0.5">
                          <span className="font-mono text-[9px] font-bold text-slate-500">{r.id}</span>
                          <span className={`px-1.5 py-0.5 rounded-full text-[8px] font-extrabold uppercase ${
                            r.priority === "Critical" ? "bg-rose-500/20 text-rose-300" :
                            r.priority === "High" ? "bg-amber-500/20 text-amber-300" : "bg-blue-500/20 text-blue-300"
                          }`}>
                            {r.priority === "Critical" ? "🚨 Danger!" : r.priority === "High" ? "⚠️ Alert" : "✅ Easy Fix"}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-white line-clamp-1">{r.title}</h4>
                        <p className="text-[10px] text-slate-400 font-medium line-clamp-1 mt-0.5">{r.gpsAddress}</p>
                        
                        <div className="flex items-center justify-between mt-1 text-[9px] text-slate-400">
                          <span className="font-bold text-[#00C2FF] flex items-center gap-1">
                            {emoji} {r.category}
                          </span>
                          <div className="flex items-center gap-3">
                            <span className="inline-flex items-center gap-1 font-bold text-slate-300">
                              {r.status === "Completed" || r.status === "Citizen Confirmed" ? "🎉 FIXED!" : 
                               r.status === "In Progress" ? "🛠️ FIXING" : "👀 NEW"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>

          </div>

          {/* Right Column: High-fidelity selected issue tracking drawer/detail pane (7 cols) */}
          <div className="lg:col-span-7">
            {selectedReport ? (
              <div className="rounded-3xl border border-white/10 bg-[#0A0E1A]/85 shadow-2xl overflow-hidden flex flex-col h-full">
                
                {/* Visual Header / Photo Grid overlay */}
                <div className="relative h-48 bg-slate-900">
                  <img 
                    src={selectedReport.imageUrl} 
                    alt={selectedReport.title} 
                    referrerPolicy="no-referrer"
                    className="h-full w-full object-cover opacity-100 transition-all duration-300 hover:scale-[1.02]" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                  
                  {/* 5-year-old high-impact visual stamp sticker */}
                  <div className="absolute top-4 right-4 z-10 select-none pointer-events-none transform rotate-3">
                    {selectedReport.status === "Completed" || selectedReport.status === "Citizen Confirmed" ? (
                      <div className="bg-emerald-400 text-slate-950 font-black text-[10px] sm:text-xs uppercase tracking-widest px-3 py-1.5 rounded-lg border-2 border-slate-950 shadow-[4px_4px_0px_#000] flex items-center gap-1">
                        <span>🎉 HOORAY! IT'S FIXED! 🎉</span>
                      </div>
                    ) : selectedReport.status === "In Progress" || selectedReport.status === "Accepted" || selectedReport.status === "Assigned" ? (
                      <div className="bg-amber-400 text-slate-950 font-black text-[10px] sm:text-xs uppercase tracking-widest px-3 py-1.5 rounded-lg border-2 border-slate-950 shadow-[4px_4px_0px_#000] flex items-center gap-1 animate-pulse">
                        <span>🛠️ COOP CREW WORKING! 🛠️</span>
                      </div>
                    ) : (
                      <div className="bg-rose-500 text-white font-black text-[10px] sm:text-xs uppercase tracking-widest px-3 py-1.5 rounded-lg border-2 border-slate-950 shadow-[4px_4px_0px_#000] flex items-center gap-1">
                        <span>🚨 BROKEN! NEEDS REPAIR 🚨</span>
                      </div>
                    )}
                  </div>

                  {/* Floating AI Category & Severity */}
                  <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                    <div>
                      <span className="font-mono text-[9px] font-bold text-[#00C2FF] uppercase tracking-wider">[ CIVIC_FILE: {selectedReport.id} ]</span>
                      <h3 className="font-display text-base font-extrabold text-white leading-snug line-clamp-2 mt-0.5">{selectedReport.title}</h3>
                    </div>
                    <div className="bg-slate-900/90 backdrop-blur-sm border border-white/10 rounded-xl px-3 py-1.5 text-left shrink-0 min-w-[125px]">
                      <span className="text-[8px] font-black text-white/60 block uppercase tracking-wider mb-1">
                        🚨 Danger Meter
                      </span>
                      <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden border border-white/5 flex">
                        <div 
                          className={`h-full rounded-full ${
                            selectedReport.severity > 70 ? "bg-rose-500" :
                            selectedReport.severity > 40 ? "bg-amber-400" : "bg-emerald-400"
                          }`}
                          style={{ width: `${selectedReport.severity}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-black font-mono text-white block mt-1 text-right">
                        {selectedReport.severity}% BAD
                      </span>
                    </div>
                  </div>
                </div>

                {/* Body Content */}
                <div className="p-5 flex-1 space-y-4 max-h-[480px] overflow-y-auto">
                  
                  {/* Detailed Description */}
                  <div>
                    <h5 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Citizen Narrative</h5>
                    <p className="text-xs text-slate-200 leading-relaxed font-medium bg-white/5 p-3 rounded-xl border border-white/5">
                      "{selectedReport.description}"
                    </p>
                  </div>

                  {/* Extract Parameters Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white/5 rounded-2xl p-4 border border-white/10">
                    <div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase block">Contractor</span>
                      <span className="text-xs font-bold text-white block truncate">{selectedReport.contractor}</span>
                    </div>
                    <div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase block">Est. Cost</span>
                      <span className="text-xs font-extrabold text-white block font-mono">${selectedReport.estimatedCost.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase block">Assigned Dept.</span>
                      <span className="text-xs font-bold text-white block truncate">{selectedReport.department}</span>
                    </div>
                    <div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase block">Reporter Name</span>
                      <span className="text-xs font-bold text-slate-300 block truncate">{selectedReport.reporterName}</span>
                    </div>
                  </div>

                  {/* AI Metadata Analytics bar (sentiment, emergency flag) */}
                  <div className="flex flex-wrap gap-2 pt-1 border-t border-white/5">
                    <span className="inline-flex items-center gap-1 rounded-lg bg-[#00C2FF]/10 border border-[#00C2FF]/20 px-2.5 py-1 text-[10px] font-bold text-[#00C2FF]">
                      <Activity className="h-3.5 w-3.5" />
                      Sentiment: {selectedReport.sentimentScore}
                    </span>
                    {selectedReport.isEmergency && (
                      <span className="inline-flex items-center gap-1 rounded-lg bg-rose-500/10 border border-rose-500/20 px-2.5 py-1 text-[10px] font-bold text-rose-400 animate-pulse">
                        <AlertTriangle className="h-3.5 w-3.5" />
                        Critical Emergency Triggered
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 text-[10px] font-bold text-emerald-400">
                      <CheckCircle className="h-3.5 w-3.5" />
                      Duplication vector clean
                    </span>
                  </div>

                  {/* Connected Workflow timeline tracker (8 stages) */}
                  <div>
                    <h5 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-3">SLA Audit & Execution Logs</h5>
                    <div className="space-y-3.5 border-l border-white/10 pl-4 relative">
                      {selectedReport.history.map((log, lidx) => (
                        <div key={lidx} className="relative">
                          {/* Pulsing state connector bubble */}
                          <div className={`absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full ring-4 ring-[#0A0E1A] ${
                            lidx === selectedReport.history.length - 1 ? "bg-[#00C2FF] animate-ping" : "bg-white/20"
                          }`} />
                          <div className={`absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full ${
                            lidx === selectedReport.history.length - 1 ? "bg-[#00C2FF]" : "bg-white/20"
                          }`} />
                          
                          <div className="flex items-start justify-between">
                            <span className="text-[11px] font-bold text-white">{log.status}</span>
                            <span className="font-mono text-[9px] text-slate-400">
                              {new Date(log.timestamp).toLocaleDateString()} at {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-[10.5px] text-slate-300 mt-0.5 font-medium">{log.message}</p>
                          <span className="text-[9px] text-[#00C2FF] font-mono mt-0.5 block">Update authorized by: {log.updatedBy}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

                {/* Role-Based Operations Panel (Actions footer) */}
                <div className="border-t border-white/5 bg-[#0F1422]/90 p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
                  <div className="flex items-center gap-2">
                    {activeRole === "Citizen" && <User className="h-4 w-4 text-emerald-400" />}
                    {activeRole === "Government" && <Building className="h-4 w-4 text-blue-400" />}
                    {activeRole === "Contractor" && <HardHat className="h-4 w-4 text-amber-400" />}
                    {activeRole === "Administrator" && <Shield className="h-4 w-4 text-purple-400" />}
                    <span className="text-[11px] font-bold text-white">
                      Perspective Action ({activeRole})
                    </span>
                  </div>

                  <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
                    
                    {/* Citizen Interactions */}
                    {activeRole === "Citizen" && (
                      <>
                        <button
                          onClick={() => handleWorkflowAction("upvote")}
                          className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold text-white hover:bg-white/10 cursor-pointer transition-colors"
                        >
                          <ThumbsUp className="h-3.5 w-3.5 text-[#00C2FF]" />
                          <span>Upvote ({selectedReport.upvotes})</span>
                        </button>
                        {selectedReport.status === "Completed" && (
                          <button
                            onClick={() => handleWorkflowAction("confirm_repair")}
                            className="flex items-center gap-1.5 rounded-xl bg-emerald-500 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-600 cursor-pointer"
                          >
                            <CheckCircle className="h-3.5 w-3.5" />
                            <span>Confirm Repair</span>
                          </button>
                        )}
                      </>
                    )}

                    {/* Government Interactions */}
                    {activeRole === "Government" && (
                      <>
                        {selectedReport.status === "Reported" && (
                          <button
                            onClick={() => handleWorkflowAction("verify")}
                            className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-blue-500 cursor-pointer transition-colors"
                          >
                            <Shield className="h-3.5 w-3.5" />
                            <span>Verify Report</span>
                          </button>
                        )}
                        {selectedReport.status === "Verified" && (
                          <button
                            onClick={() => handleWorkflowAction("assign")}
                            className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-indigo-500 cursor-pointer transition-colors"
                          >
                            <Briefcase className="h-3.5 w-3.5" />
                            <span>Assign Contractor</span>
                          </button>
                        )}
                        {selectedReport.status !== "Reported" && selectedReport.status !== "Verified" && (
                          <span className="text-[10px] font-bold text-slate-400 italic">Work Order assigned & active</span>
                        )}
                      </>
                    )}

                    {/* Contractor Interactions */}
                    {activeRole === "Contractor" && (
                      <>
                        {selectedReport.status === "Assigned" && (
                          <button
                            onClick={() => handleWorkflowAction("accept")}
                            className="flex items-center gap-1.5 rounded-xl bg-[#F59E0B] px-3.5 py-2 text-xs font-bold text-white hover:bg-amber-500 cursor-pointer transition-colors"
                          >
                            <HardHat className="h-3.5 w-3.5" />
                            <span>Accept Dispatch</span>
                          </button>
                        )}
                        {selectedReport.status === "Accepted" && (
                          <button
                            onClick={() => handleWorkflowAction("start_repair")}
                            className="flex items-center gap-1.5 rounded-xl bg-[#1D9BF0] px-3.5 py-2 text-xs font-bold text-white hover:bg-[#00C2FF] cursor-pointer transition-colors"
                          >
                            <Clock className="h-3.5 w-3.5" />
                            <span>Deploy Field Crew</span>
                          </button>
                        )}
                        {selectedReport.status === "In Progress" && (
                          <button
                            onClick={() => handleWorkflowAction("complete")}
                            className="flex items-center gap-1.5 rounded-xl bg-emerald-500 px-3.5 py-2 text-xs font-bold text-white hover:bg-emerald-600 cursor-pointer transition-colors"
                          >
                            <CheckCircle className="h-3.5 w-3.5" />
                            <span>Submit Proof of Work</span>
                          </button>
                        )}
                        {selectedReport.status === "Completed" || selectedReport.status === "Citizen Confirmed" ? (
                          <span className="text-[10px] font-bold text-emerald-400 italic">Task completed successfully</span>
                        ) : null}
                      </>
                    )}

                    {/* Admin Interactions */}
                    {activeRole === "Administrator" && (
                      <>
                        <button
                          onClick={() => handleWorkflowAction("force_complete")}
                          className="rounded-xl border border-rose-500/20 px-3 py-2 text-xs font-bold text-rose-400 hover:bg-rose-500/10 cursor-pointer transition-colors"
                        >
                          Direct Complete
                        </button>
                        <button
                          onClick={() => handleWorkflowAction("archive")}
                          className="rounded-xl bg-slate-800 px-3 py-2 text-xs font-bold text-white hover:bg-slate-700 cursor-pointer transition-colors"
                        >
                          Archive File
                        </button>
                      </>
                    )}

                  </div>
                </div>

              </div>
            ) : (
              <div className="rounded-3xl border border-dashed border-white/10 p-12 text-center h-full flex flex-col items-center justify-center bg-white/5">
                <Database className="h-8 w-8 text-slate-500 mb-2" />
                <span className="text-xs text-slate-400">Select any report from the side checklist to view analytical telemetry and history tracks.</span>
              </div>
            )}
          </div>

        </motion.div>
      )}

      {activeTab === "analytics" && (
        <motion.div
          key="analytics"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="space-y-8"
        >
          
          {/* Top charts grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Pie Chart: Categories Distribution */}
            <div className="rounded-2xl border border-white/5 bg-[#0F1422]/60 p-5 shadow-xl">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Volume Allocation by Hazard Category</h4>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {categoryDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: "#0A0E1A", borderColor: "rgba(255,255,255,0.1)", borderRadius: "12px", color: "#fff" }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-4">
                {categoryDistribution.map((entry, idx) => (
                  <div key={idx} className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                    <span className="text-[10px] text-slate-300 font-medium truncate">{entry.name} ({entry.value})</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bar Chart: Department Budgets */}
            <div className="rounded-2xl border border-white/5 bg-[#0F1422]/60 p-5 shadow-xl lg:col-span-2">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Municipal Fiscal Audit ($) — Allocated vs spent</h4>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={departmentBudgetData}>
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94A3B8' }} stroke="rgba(255,255,255,0.1)" />
                    <YAxis tick={{ fontSize: 10, fill: '#94A3B8' }} stroke="rgba(255,255,255,0.1)" />
                    <Tooltip contentStyle={{ backgroundColor: "#0A0E1A", borderColor: "rgba(255,255,255,0.1)", borderRadius: "12px", color: "#fff" }} />
                    <Bar dataKey="allocated" fill="rgba(255,255,255,0.1)" radius={[4, 4, 0, 0]} name="Allocated Budget ($)" />
                    <Bar dataKey="spent" fill="#00C2FF" radius={[4, 4, 0, 0]} name="Expended Budget ($)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>

          {/* Area Chart: Monthly Trend */}
          <div className="rounded-2xl border border-white/5 bg-[#0F1422]/60 p-5 shadow-xl">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">SLA Resolution Rate (%) — Target vs actual</h4>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlySlaTrend}>
                  <defs>
                    <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#94A3B8' }} stroke="rgba(255,255,255,0.1)" />
                  <YAxis tick={{ fontSize: 10, fill: '#94A3B8' }} stroke="rgba(255,255,255,0.1)" />
                  <Tooltip contentStyle={{ backgroundColor: "#0A0E1A", borderColor: "rgba(255,255,255,0.1)", borderRadius: "12px", color: "#fff" }} />
                  <Area type="monotone" dataKey="target" stroke="rgba(255,255,255,0.3)" strokeDasharray="5 5" fill="none" name="City Target (%)" />
                  <Area type="monotone" dataKey="actual" stroke="#10B981" fillOpacity={1} fill="url(#colorActual)" name="Actual Resolved (%)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

        </motion.div>
      )}

      {activeTab === "gamification" && (
        <motion.div
          key="gamification"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
          
          {/* Left Column: Player Stats card (1 col) */}
          <div className="space-y-6">
            
            {/* Personal Stats Card */}
            <div className="rounded-3xl border border-[#E2E8F0] bg-[#0F172A] p-6 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 h-32 w-32 bg-[#1D9BF0]/15 blur-2xl rounded-full" />
              
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-[#00C2FF]">
                  <Award className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold">Elena Rostova</h4>
                  <p className="text-[10px] text-white/60 font-mono">Civic ID: #SF-8204-ER</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                  <span className="text-[9px] text-white/50 block uppercase font-bold">Total Points</span>
                  <span className="text-xl font-bold font-mono text-[#00C2FF]">1,180</span>
                </div>
                <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                  <span className="text-[9px] text-white/50 block uppercase font-bold">Wards Rank</span>
                  <span className="text-xl font-bold font-mono text-emerald-400">#2</span>
                </div>
              </div>

              {/* Progress Slider */}
              <div className="space-y-1.5 mb-6">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-white/70">Level 9 (Inspector)</span>
                  <span className="text-white">1,180 / 1,500 XP</span>
                </div>
                <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-[#1D9BF0] to-[#00C2FF] rounded-full" style={{ width: "78%" }} />
                </div>
              </div>

              {/* Badges checklist */}
              <div className="space-y-2">
                <span className="text-[9px] text-white/40 block font-bold uppercase tracking-wider">Unlocked Badges</span>
                <div className="flex flex-wrap gap-1.5">
                  {["Sewer Sentinel", "Pothole Patrol", "Audit Verified", "Quick Responder"].map((badge) => (
                    <span key={badge} className="inline-flex items-center rounded-lg bg-white/10 px-2 py-1 text-[9px] font-bold text-white border border-white/5">
                      🎖️ {badge}
                    </span>
                  ))}
                </div>
              </div>

            </div>

            {/* Monthly challenges */}
            <div className="rounded-2xl border border-white/5 bg-[#0F1422]/60 p-5 shadow-xl space-y-4">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-[#00C2FF]" />
                Active Volunteer Challenges
              </h4>
              
              {[
                { title: "Summer Park Cleanliness Drive", desc: "Report 3 illegal dumping sites on paths.", progress: "2 / 3", done: false },
                { title: "Residential Grid Patrol", desc: "Verify streetlight outrages in ward 5.", progress: "Completed", done: true },
                { title: "Water Savers Alliance", desc: "Detect clean water leaks with exact GPS tags.", progress: "0 / 1", done: false },
              ].map((chal, cidx) => (
                <div key={cidx} className="p-3 bg-white/5 border border-white/5 rounded-xl space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">{chal.title}</span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${chal.done ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" : "bg-blue-500/20 text-blue-300 border border-blue-500/30"}`}>
                      {chal.progress}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-medium">{chal.desc}</p>
                </div>
              ))}
            </div>

          </div>

          {/* Right Column: Global Wards Leaderboard (2 cols) */}
          <div className="lg:col-span-2 rounded-3xl border border-white/5 bg-[#0F1422]/60 p-6 shadow-xl">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-6">Wards Leaderboard — Top Contributing Citizens</h4>
            
            <div className="space-y-3.5">
              {leaderBoard.map((row) => (
                <div
                  key={row.rank}
                  className="flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl transition-all"
                >
                  <div className="flex items-center gap-4">
                    {/* Rank Indicator */}
                    <span className={`font-mono text-sm font-bold flex h-8 w-8 items-center justify-center rounded-xl shrink-0 ${
                      row.rank === 1 ? "bg-amber-500/20 text-amber-300 border border-amber-500/30" :
                      row.rank === 2 ? "bg-slate-500/20 text-slate-300 border border-slate-500/30" :
                      row.rank === 3 ? "bg-[#00C2FF]/20 text-[#00C2FF] border border-[#00C2FF]/30" : "bg-white/5 border border-white/10 text-slate-400"
                    }`}>
                      #{row.rank}
                    </span>
                    
                    <div>
                      <span className="text-xs font-bold text-white block">{row.name}</span>
                      <span className="text-[10px] font-semibold text-[#00C2FF]">{row.badge}</span>
                    </div>
                  </div>

                  <div className="text-right flex items-center gap-6">
                    <div>
                      <span className="text-[9px] text-slate-400 uppercase block font-bold">Level</span>
                      <span className="text-xs font-bold font-mono text-white">{row.level}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 uppercase block font-bold">Submissions</span>
                      <span className="text-xs font-bold font-mono text-white">{row.reports}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 uppercase block font-bold">Total XP</span>
                      <span className="text-xs font-bold font-mono text-emerald-400">+{row.points}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </motion.div>
      )}
      </AnimatePresence>

    </section>
  );
}
