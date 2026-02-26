"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import { cn } from "@/lib/utils";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Close mobile sidebar on resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setMobileSidebarOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Mobile overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-30 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar - desktop */}
      <div className="hidden lg:block fixed left-0 top-0 h-full z-20 print:hidden">
        <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      </div>

      {/* Sidebar - mobile */}
      <div
        className={cn(
          "fixed left-0 top-0 h-full z-40 lg:hidden sidebar-transition",
          mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <Sidebar collapsed={false} onToggle={() => setMobileSidebarOpen(false)} />
      </div>

      {/* Topbar */}
      <div
        className={cn(
          "sidebar-transition print:hidden",
          collapsed ? "lg:pl-16" : "lg:pl-64"
        )}
      >
        <Topbar onMenuToggle={() => setMobileSidebarOpen(!mobileSidebarOpen)} />
      </div>

      {/* Main Content */}
      <main
        className={cn(
          "pt-16 min-h-screen sidebar-transition print:pt-0 print:bg-white",
          collapsed ? "lg:pl-16 lg:print:pl-0" : "lg:pl-64 lg:print:pl-0"
        )}
      >
        <div className="p-6 print:p-0">{children}</div>
      </main>
    </div>
  );
}
