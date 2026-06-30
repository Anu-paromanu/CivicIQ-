import React, { useState } from "react";
import { Check, Shield, Sparkles, Zap, Building, ArrowRight, HelpCircle, Flame } from "lucide-react";

export default function Pricing() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("annual");
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const plans = [
    {
      id: "citizen",
      name: "Citizen Basic",
      description: "For active citizens, neighborhood groups, and volunteers.",
      priceMonthly: 0,
      priceAnnual: 0,
      icon: Shield,
      iconColor: "text-blue-400",
      iconBg: "bg-blue-400/10 border-blue-400/20",
      ctaText: "Start Reporting Free",
      features: [
        "Unlimited smart report uploads",
        "8-stage real-time issue status tracker",
        "Public GIS heatmaps access",
        "Community voting & commenting",
        "Standard email/web alerts",
        "Basic search and filtering",
      ],
      notIncluded: [
        "Server-side automated AI triage",
        "Department custom workflows",
        "Contractor dispatch & RFP management",
        "License plate & face face-blur privacy masks",
      ],
    },
    {
      id: "municipality",
      name: "Smart Municipality",
      description: "For city departments, town councils, and district planners.",
      priceMonthly: 499,
      priceAnnual: 399,
      icon: Sparkles,
      iconColor: "text-[#00F0FF]",
      iconBg: "bg-[#00F0FF]/10 border-[#00F0FF]/20",
      ctaText: "Activate Municipal Suite",
      popular: true,
      features: [
        "Everything in Citizen Basic",
        "AI-Powered auto-triage (severity 1-100)",
        "Gemini automated cost and materials estimation",
        "Custom GIS overlay layers & admin dashboard",
        "Auto-routing to departments & dispatch hubs",
        "Unlimited admin & staff seats",
        "99.9% Uptime SLA and 4-hour support response",
      ],
      notIncluded: [
        "Automated contractor bidding (RFP engine)",
        "Legacy 311 integration webhooks",
        "Auto-blur privacy masks for public photos",
      ],
    },
    {
      id: "enterprise",
      name: "Enterprise Dispatch",
      description: "For major metropolises, regional associations, and tier-1 contractors.",
      priceMonthly: 1499,
      priceAnnual: 1199,
      icon: Zap,
      iconColor: "text-purple-400",
      iconBg: "bg-purple-400/10 border-purple-400/20",
      ctaText: "Contact Government Sales",
      features: [
        "Everything in Smart Municipality",
        "Automated RFP contractor matching engine",
        "Legacy 311 system webhooks & two-way sync",
        "Auto-scrubbing privacy masks (faces & license plates)",
        "Bi-directional REST API integration",
        "Dedicated database instance with Cloud SQL",
        "99.99% uptime guarantee with direct phone support",
      ],
      notIncluded: [],
    },
  ];

  const handleSelectPlan = (planId: string, planName: string) => {
    setSelectedPlan(planId);
    setSuccessMessage(`Thank you for choosing ${planName}! Our civic integration team is configuring your environment.`);
    setTimeout(() => {
      setSuccessMessage(null);
    }, 6000);
  };

  return (
    <section id="pricing" className="py-24 bg-[#0B0F19] border-t border-b border-white/5 relative overflow-hidden">
      {/* Visual background lights */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 h-96 w-96 rounded-full bg-[#1D9BF0]/5 blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 h-96 w-96 rounded-full bg-[#00F0FF]/5 blur-[120px] pointer-events-none" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="font-mono text-xs font-bold text-[#00C2FF] uppercase tracking-[0.22em] block mb-3">
            TRANSPARENT MUNICIPAL SAAS PRICING
          </span>
          <h2 className="font-display text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl mb-4 leading-tight">
            Plans Scaled for Communities <br />
            <span className="bg-gradient-to-r from-[#1D9BF0] via-[#00F0FF] to-white bg-clip-text text-transparent">
              of Every Size
            </span>
          </h2>
          <p className="text-sm sm:text-base text-slate-300 font-medium leading-relaxed max-w-2xl mx-auto">
            From active citizens improving their neighborhood to regional governments coordinating thousands of staff members and contractors. Clear, honest, contract-free pricing.
          </p>

          {/* Toggle Button */}
          <div className="flex items-center justify-center gap-4 mt-10">
            <span className={`text-xs font-bold transition-colors ${billingCycle === "monthly" ? "text-white" : "text-slate-400"}`}>
              Billed Monthly
            </span>
            <button
              onClick={() => setBillingCycle(billingCycle === "monthly" ? "annual" : "monthly")}
              className="relative h-6 w-11 rounded-full bg-white/5 border border-white/10 p-0.5 transition-colors focus:outline-none"
            >
              <span
                className={`block h-4.5 w-4.5 rounded-full bg-[#00F0FF] shadow-md transition-transform duration-300 ${
                  billingCycle === "annual" ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
            <div className="flex items-center gap-2">
              <span className={`text-xs font-bold transition-colors ${billingCycle === "annual" ? "text-white" : "text-slate-400"}`}>
                Billed Annually
              </span>
              <span className="inline-flex items-center rounded-full bg-gradient-to-r from-[#1D9BF0]/10 to-[#00F0FF]/10 border border-[#00F0FF]/25 px-2 py-0.5 text-[9px] font-black text-[#00F0FF] uppercase tracking-wide">
                Save 20%
              </span>
            </div>
          </div>
        </div>

        {/* Dynamic Success Alert Message */}
        {successMessage && (
          <div className="max-w-3xl mx-auto mb-8 animate-in fade-in slide-in-from-top duration-300">
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-center">
              <div className="flex items-center justify-center gap-2.5">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                  <Check className="h-3.5 w-3.5 stroke-[2.5]" />
                </div>
                <p className="text-xs font-bold text-white leading-tight">{successMessage}</p>
              </div>
            </div>
          </div>
        )}

        {/* Pricing Matrix Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch mb-16">
          {plans.map((plan) => {
            const IconComponent = plan.icon;
            const currentPrice = billingCycle === "annual" ? plan.priceAnnual : plan.priceMonthly;
            const isSelected = selectedPlan === plan.id;

            // Brand/theme variables depending on the specific plan
            const planThemes = {
              citizen: {
                hoverBg: "hover:bg-[#0A1428]/90",
                hoverBorder: "hover:border-blue-500/40",
                hoverShadow: "hover:shadow-[0_25px_50px_rgba(29,155,240,0.15)]",
                btnStyle: "group-hover:bg-blue-500 group-hover:text-[#070A13] group-hover:border-transparent group-hover:shadow-[0_4px_20px_rgba(59,130,246,0.4)]",
                textAccent: "group-hover:text-blue-300"
              },
              municipality: {
                hoverBg: "hover:bg-[#0D1C2F]/90",
                hoverBorder: "hover:border-[#00F0FF]/60",
                hoverShadow: "hover:shadow-[0_30px_60px_rgba(0,240,255,0.2)]",
                btnStyle: "group-hover:shadow-[0_8px_30px_rgba(0,240,255,0.5)] group-hover:scale-[1.02]",
                textAccent: "group-hover:text-[#00F0FF]"
              },
              enterprise: {
                hoverBg: "hover:bg-[#15112B]/90",
                hoverBorder: "hover:border-purple-500/40",
                hoverShadow: "hover:shadow-[0_25px_50px_rgba(168,85,247,0.15)]",
                btnStyle: "group-hover:bg-purple-500 group-hover:text-[#070A13] group-hover:border-transparent group-hover:shadow-[0_4px_20px_rgba(168,85,247,0.4)]",
                textAccent: "group-hover:text-purple-300"
              }
            }[plan.id as "citizen" | "municipality" | "enterprise"] || {
              hoverBg: "hover:bg-[#0A0E1A]",
              hoverBorder: "hover:border-white/10",
              hoverShadow: "",
              btnStyle: "",
              textAccent: ""
            };

            return (
              <div
                key={plan.id}
                className={`relative flex flex-col justify-between rounded-3xl border p-8 transition-all duration-500 group cursor-pointer ${
                  plan.popular
                    ? `bg-[#0C1222] border-[#00F0FF]/40 shadow-[0_20px_50px_rgba(0,240,255,0.08)] scale-102 z-10 ${planThemes.hoverBg} ${planThemes.hoverBorder} ${planThemes.hoverShadow} hover:-translate-y-2`
                    : `bg-[#070A13]/90 border-white/5 shadow-xl ${planThemes.hoverBg} ${planThemes.hoverBorder} ${planThemes.hoverShadow} hover:-translate-y-2`
                } ${isSelected ? "ring-2 ring-[#00F0FF]/80 border-transparent bg-[#0F182D]" : ""}`}
              >
                {/* Popular Ribbon / Active indicator */}
                {plan.popular && (
                  <div className="absolute top-0 right-1/2 translate-x-1/2 -translate-y-1/2 flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#1D9BF0] to-[#00F0FF] px-4 py-1 text-[9px] font-black text-[#070A13] uppercase tracking-wider shadow-[0_4px_15px_rgba(0,240,255,0.3)] transition-transform duration-500 group-hover:scale-105">
                    <Flame className="h-3 w-3 animate-pulse" />
                    <span>Most Popular for Cities</span>
                  </div>
                )}

                {isSelected && (
                  <div className="absolute top-0 right-1/2 translate-x-1/2 -translate-y-1/2 flex items-center gap-1 rounded-full bg-emerald-500 px-4 py-1 text-[9px] font-black text-white uppercase tracking-wider shadow-lg">
                    <span>Plan Selected</span>
                  </div>
                )}

                <div>
                  {/* Icon & Title */}
                  <div className="flex items-center gap-3.5 mb-5">
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-all duration-500 ${plan.iconBg} group-hover:scale-110`}>
                      <IconComponent className={`h-5 w-5 ${plan.iconColor}`} />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-white transition-colors duration-300">{plan.name}</h3>
                      <p className={`text-[10px] font-bold uppercase tracking-wider transition-colors duration-300 ${
                        plan.id === "citizen" ? "text-blue-400" : plan.id === "municipality" ? "text-[#00F0FF]" : "text-purple-400"
                      }`}>
                        {plan.id === "citizen" ? "Public Domain" : plan.id === "municipality" ? "Authorized SaaS" : "Regional Framework"}
                      </p>
                    </div>
                  </div>

                  {/* Pricing Info */}
                  <div className="mb-6 pb-6 border-b border-white/5 text-left">
                    {plan.priceMonthly === 0 ? (
                      <div className="flex items-baseline">
                        <span className="text-4xl font-black text-white tracking-tight">$0</span>
                        <span className="text-xs text-slate-400 font-bold ml-2">forever free</span>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <div className="flex items-baseline">
                          <span className="text-4xl font-black text-white tracking-tight transition-colors duration-300">${currentPrice}</span>
                          <span className="text-xs text-slate-400 font-bold ml-2">/ month</span>
                        </div>
                        <p className="text-[10px] text-slate-500 font-bold">
                          {billingCycle === "annual" ? `Billed annually ($${currentPrice * 12}/yr)` : "Billed month-to-month"}
                        </p>
                      </div>
                    )}
                    <p className="text-xs text-slate-300 font-medium leading-relaxed mt-3.5">
                      {plan.description}
                    </p>
                  </div>

                  {/* Included Features List */}
                  <div className="space-y-4">
                    <p className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest text-left">
                      Included Capabilities
                    </p>
                    <ul className="space-y-3">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-3 text-left">
                          <div className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 mt-0.5 transition-colors duration-300`}>
                            <Check className="h-3 w-3 stroke-[2.5]" />
                          </div>
                          <span className="text-xs font-medium text-slate-200 leading-tight transition-colors duration-300 group-hover:text-white">{feature}</span>
                        </li>
                      ))}

                      {/* Not Included Features */}
                      {plan.notIncluded.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-3 text-left opacity-45">
                          <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-white/5 text-slate-500 mt-0.5">
                            <span className="text-[9px] font-bold">×</span>
                          </div>
                          <span className="text-xs font-medium text-slate-400 leading-tight line-through">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Plan CTA Button */}
                <div className="mt-8 pt-6 border-t border-white/5">
                  <button
                    onClick={() => handleSelectPlan(plan.id, plan.name)}
                    className={`flex w-full items-center justify-center gap-2 rounded-xl py-3 text-xs font-extrabold uppercase tracking-wider transition-all duration-500 cursor-pointer ${
                      plan.popular
                        ? `bg-gradient-to-r from-[#1D9BF0] to-[#00F0FF] text-[#070A13] shadow-md ${planThemes.btnStyle}`
                        : `bg-white/5 text-white border border-white/10 hover:border-white/20 ${planThemes.btnStyle}`
                    } active:scale-98`}
                  >
                    <span>{plan.ctaText}</span>
                    <ArrowRight className="h-3.5 w-3.5 stroke-[2.5] transition-transform duration-300 group-hover:translate-x-1" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Pricing FAQ or Guarantee Box */}
        <div className="max-w-4xl mx-auto rounded-2xl border border-white/5 bg-[#070A13]/80 p-6 md:p-8 text-center flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 text-left">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#00F0FF]/10 text-[#00F0FF] border border-[#00F0FF]/25">
              <HelpCircle className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-extrabold text-white">Have custom municipal security or deployment requirements?</h4>
              <p className="text-xs text-slate-400 font-medium leading-relaxed mt-1">
                We support custom on-premise cloud deployments, specialized database clusters, and integration with proprietary dispatch tooling.
              </p>
            </div>
          </div>
          <button
            onClick={() => handleSelectPlan("enterprise", "Custom Enterprise Setup")}
            className="rounded-xl border border-white/10 hover:border-white/25 bg-white/5 hover:bg-white/10 text-white font-extrabold text-xs px-5 py-3 shrink-0 uppercase tracking-wide transition-all active:scale-95 cursor-pointer"
          >
            Request Custom RFQ
          </button>
        </div>

      </div>
    </section>
  );
}
