"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, User, Clock, ShoppingCart, LogIn, Shield, Search } from "lucide-react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { SpotlightSearch } from "./SpotlightSearch";

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();

  const navItems = [
    {
      name: "Trang chủ",
      href: "/",
      icon: Home,
    },
    {
      name: "Lịch sử",
      href: "/statistics",
      icon: Clock,
    },
    {
      name: "Tìm kiếm",
      action: () => window.dispatchEvent(new CustomEvent("open-spotlight")),
      icon: Search,
    },
    {
      name: "Gói cước",
      href: "/premium",
      icon: ShoppingCart,
    },
    {
      name: !session ? "Đăng nhập" : session.user.role === "ADMIN" ? "Tài khoản (Admin)" : "Tài khoản",
      href: session ? "/profile" : "/login",
      icon: !session ? LogIn : session.user.role === "ADMIN" ? Shield : User,
    },
  ];

  const hasMenu = navItems.some(item => item.href === pathname);
  if (!hasMenu) return null;

  return (
    <>
      <SpotlightSearch />
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
      {/* SVG filter for the liquid glass distortion */}
      <svg className="absolute w-0 h-0 pointer-events-none">
        <filter id="liquid-distort">
          <feTurbulence type="fractalNoise" baseFrequency="0.008 0.012" numOctaves="2" seed="7" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="8" />
        </filter>
      </svg>

      {/* Liquid Glass Container */}
      <div 
        className="relative flex items-center gap-1 p-2 rounded-[32px]"
        style={{
          background: 'rgba(255, 255, 255, 0.14)',
          backdropFilter: 'blur(18px) saturate(180%) url(#liquid-distort)',
          WebkitBackdropFilter: 'blur(18px) saturate(180%)',
          border: '1px solid rgba(255, 255, 255, 0.35)',
          boxShadow: '0 8px 24px rgba(20, 20, 40, 0.25), inset 0 1px 1px rgba(255, 255, 255, 0.6), inset 0 -1px 6px rgba(0, 0, 0, 0.12)'
        }}
      >
        {/* Soft specular sheen across the top */}
        <div 
          className="absolute inset-0 rounded-[32px] pointer-events-none"
          style={{
            background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.55) 0%, rgba(255, 255, 255, 0.08) 35%, rgba(255, 255, 255, 0) 60%)',
            mixBlendMode: 'overlay',
            zIndex: 0
          }}
        />

        {navItems.map((item, index) => {
          const isActive = item.href ? pathname === item.href : false;
          const Icon = item.icon;
          
          if (item.action) {
            return (
              <button
                key={`action-${index}`}
                onClick={item.action}
                className="relative z-10 w-14 h-14 flex items-center justify-center rounded-full transition-colors duration-250 cursor-pointer group hover:bg-white/10"
                style={{ color: 'rgba(40, 35, 60, 0.75)' }}
              >
                {/* Tooltip */}
                <div className="absolute -top-14 opacity-0 group-hover:opacity-100 group-hover:-translate-y-1 transition-all duration-300 pointer-events-none z-20">
                  <span className="bg-foreground text-background px-3 py-1.5 rounded-xl text-xs font-bold shadow-xl whitespace-nowrap">
                    {item.name}
                  </span>
                </div>
                <Icon className="w-6 h-6 relative z-10" strokeWidth={1.8} />
              </button>
            );
          }

          return (
            <button 
              key={item.href} 
              onClick={() => { window.location.href = item.href!; }}
              className="relative z-10 w-14 h-14 flex items-center justify-center rounded-full transition-colors duration-250 cursor-pointer group"
              style={{
                color: isActive ? '#fff' : 'rgba(40, 35, 60, 0.55)'
              }}
            >
              {/* Tooltip */}
              <div className="absolute -top-14 opacity-0 group-hover:opacity-100 group-hover:-translate-y-1 transition-all duration-300 pointer-events-none z-20">
                <span className="bg-foreground text-background px-3 py-1.5 rounded-xl text-xs font-bold shadow-xl whitespace-nowrap">
                  {item.name}
                </span>
              </div>

              {/* Water Drop Animated Background */}
              {isActive && (
                <motion.div
                  layoutId="blob"
                  className="absolute inset-0 z-[-1] rounded-full"
                  style={{
                    background: 'radial-gradient(circle at 35% 30%, #4a3fe0, #241b6b 80%)',
                    boxShadow: '0 4px 14px rgba(36, 27, 107, 0.55), inset 0 1px 2px rgba(255, 255, 255, 0.5)'
                  }}
                  transition={{ duration: 0.45, ease: [0.34, 1.56, 0.64, 1] }}
                />
              )}

              {/* Icon */}
              <Icon className="w-6 h-6 relative z-10" strokeWidth={1.8} />
            </button>
          );
        })}
      </div>
    </div>
    </>
  );
}
