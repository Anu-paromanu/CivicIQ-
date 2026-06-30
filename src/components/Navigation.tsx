import React, { useState, useEffect } from "react";
import { ArrowRight } from "lucide-react";
import { UserRole } from "../types";
import CivicIqLogo from "./CivicIqLogo";

interface NavigationProps {
  activeRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  onNavigateToDashboard: () => void;
  onOpenReportModal: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function Navigation({
  onNavigateToDashboard,
  onOpenReportModal,
  activeTab,
  setActiveTab,
}: NavigationProps) {

  const handleLinkClick = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    setActiveTab(id);
    if (id === "home") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (id === "dashboard") {
      onNavigateToDashboard();
    } else {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };



  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-[#070A13]/85 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          
          {/* Logo and Brand - Left */}
          <div className="flex items-center">
            <a 
              href="#home" 
              onClick={(e) => handleLinkClick("home", e)}
              className="flex items-center transition-opacity hover:opacity-90 cursor-pointer"
            >
              <CivicIqLogo size="md" showSubtext={false} variant="light" />
            </a>
          </div>

          {/* Core Navigation Links - Exact match with user's picture */}
          <nav className="hidden lg:flex items-center gap-7">
            <a 
              href="#" 
              onClick={(e) => handleLinkClick("home", e)}
              className={`text-[13px] font-medium transition-colors duration-200 py-1 ${
                activeTab === "home" ? "relative text-white" : "text-slate-300 hover:text-white"
              }`}
            >
              <span>Home</span>
              {activeTab === "home" && (
                <span className="absolute bottom-[-12px] left-0 right-0 h-[2px] rounded-full bg-[#1D9BF0]" />
              )}
            </a>
            <a 
              href="#solutions" 
              onClick={(e) => handleLinkClick("solutions", e)}
              className={`text-[13px] font-medium transition-colors duration-200 py-1 ${
                activeTab === "solutions" ? "relative text-white" : "text-slate-300 hover:text-white"
              }`}
            >
              <span>Solutions</span>
              {activeTab === "solutions" && (
                <span className="absolute bottom-[-12px] left-0 right-0 h-[2px] rounded-full bg-[#1D9BF0]" />
              )}
            </a>
            <button 
              onClick={(e) => handleLinkClick("dashboard", e)} 
              className={`text-[13px] font-medium transition-colors duration-200 py-1 cursor-pointer bg-transparent border-none outline-none ${
                activeTab === "dashboard" ? "relative text-white" : "text-slate-300 hover:text-white"
              }`}
            >
              <span>Dashboard</span>
              {activeTab === "dashboard" && (
                <span className="absolute bottom-[-12px] left-0 right-0 h-[2px] rounded-full bg-[#1D9BF0]" />
              )}
            </button>
            <a 
              href="#pricing" 
              onClick={(e) => handleLinkClick("pricing", e)}
              className={`text-[13px] font-medium transition-colors duration-200 py-1 ${
                activeTab === "pricing" ? "relative text-white" : "text-slate-300 hover:text-white"
              }`}
            >
              <span>Pricing</span>
              {activeTab === "pricing" && (
                <span className="absolute bottom-[-12px] left-0 right-0 h-[2px] rounded-full bg-[#1D9BF0]" />
              )}
            </a>

            <a 
              href="#about" 
              onClick={(e) => handleLinkClick("about", e)}
              className={`text-[13px] font-medium transition-colors duration-200 py-1 ${
                activeTab === "about" ? "relative text-white" : "text-slate-300 hover:text-white"
              }`}
            >
              <span>About Us</span>
              {activeTab === "about" && (
                <span className="absolute bottom-[-12px] left-0 right-0 h-[2px] rounded-full bg-[#1D9BF0]" />
              )}
            </a>
          </nav>

          {/* Action Controls - Get Started Pill */}
          <div className="flex items-center gap-4">
            <button
              onClick={onOpenReportModal}
              className="inline-flex items-center justify-center gap-1.5 rounded-full bg-gradient-to-r from-[#1D9BF0] to-[#00F0FF] px-5 py-2.5 text-xs font-bold text-[#070A13] hover:brightness-110 transition-all cursor-pointer active:scale-95 shadow-[0_4px_20px_rgba(29,155,240,0.25)]"
              id="get-started-cta"
            >
              <span>Get Started</span>
              <ArrowRight className="h-3.5 w-3.5 stroke-[2.5]" />
            </button>
          </div>

        </div>
      </div>
    </header>
  );
}

