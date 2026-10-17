import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Menu } from "lucide-react";
import Sidebar from "../components/Sidebar";

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-full bg-[#F6F8FA]">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="lg:hidden sticky top-0 z-10 bg-white border-b border-[#E2E8F0] flex items-center justify-between px-4 py-3">
          <span className="font-bold text-[#0F172A]">BatiPro</span>
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-[#475569] hover:text-[#0F172A] transition-colors"
          >
            <Menu size={20} />
          </button>
        </header>

        <Outlet />
      </div>
    </div>
  );
}