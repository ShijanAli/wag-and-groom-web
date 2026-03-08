import { Bell, Globe, Moon, Sun, User, Search, Shield, LogOut, LayoutDashboard, CalendarDays, Scissors, Users, UserCog, Star, Image, Tag, Lock, Settings, ChevronRight } from "lucide-react";
import { useState, useRef, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface MenuItem {
  label: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
  parent?: string;
  keywords?: string[];
}

const menuItems: MenuItem[] = [
  { label: "Dashboard", url: "/admin", icon: LayoutDashboard, keywords: ["home", "overview", "stats", "analytics"] },
  { label: "Bookings", url: "/admin/bookings", icon: CalendarDays, parent: "Main", keywords: ["appointments", "schedule", "reservation"] },
  { label: "Services", url: "/admin/services", icon: Scissors, parent: "Main", keywords: ["catalog", "pricing", "packages"] },
  { label: "Customers", url: "/admin/customers", icon: Users, parent: "Main", keywords: ["clients", "users", "accounts"] },
  { label: "Staff", url: "/admin/staff", icon: UserCog, parent: "Manage", keywords: ["team", "employees", "members"] },
  { label: "Reviews", url: "/admin/reviews", icon: Star, parent: "Manage", keywords: ["ratings", "feedback", "testimonials"] },
  { label: "Gallery", url: "/admin/gallery", icon: Image, parent: "Manage", keywords: ["photos", "images", "pictures"] },
  { label: "Promotions", url: "/admin/promotions", icon: Tag, parent: "Manage", keywords: ["promo", "discount", "coupon", "deals"] },
  { label: "Roles & Permissions", url: "/admin/roles", icon: Shield, parent: "System", keywords: ["access", "security", "permissions", "roles"] },
  { label: "Profile Settings", url: "/admin/profile", icon: User, parent: "System", keywords: ["account", "profile", "password", "settings"] },
];

export function AdminTopbar() {
  const [darkMode, setDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const toggleDark = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle("dark");
  };

  const results = useMemo(() => {
    if (!searchQuery.trim()) return menuItems;
    const q = searchQuery.toLowerCase();
    return menuItems.filter((item) =>
      item.label.toLowerCase().includes(q) ||
      item.parent?.toLowerCase().includes(q) ||
      item.keywords?.some((k) => k.includes(q))
    );
  }, [searchQuery]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [searchQuery]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter" && results[selectedIndex]) {
      e.preventDefault();
      navigateTo(results[selectedIndex].url);
    } else if (e.key === "Escape") {
      setShowResults(false);
      inputRef.current?.blur();
    }
  };

  const navigateTo = (url: string) => {
    navigate(url);
    setSearchQuery("");
    setShowResults(false);
    inputRef.current?.blur();
  };

  const highlightMatch = (text: string) => {
    if (!searchQuery.trim()) return text;
    const idx = text.toLowerCase().indexOf(searchQuery.toLowerCase());
    if (idx === -1) return text;
    return (
      <>
        {text.slice(0, idx)}
        <span className="text-primary font-semibold">{text.slice(idx, idx + searchQuery.length)}</span>
        {text.slice(idx + searchQuery.length)}
      </>
    );
  };

  return (
    <header className="h-16 border-b border-border bg-card flex items-center justify-between px-4 shrink-0">
      <div className="flex items-center gap-3">
        <SidebarTrigger className="text-muted-foreground" />

        {/* Search with suggestions */}
        <div ref={searchRef} className="relative hidden md:block">
          <div className="flex items-center gap-2 bg-muted rounded-lg px-3 py-2 w-72">
            <Search className="w-4 h-4 text-muted-foreground shrink-0" />
            <input
              ref={inputRef}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setShowResults(true)}
              onKeyDown={handleKeyDown}
              placeholder="Search menus..."
              className="bg-transparent border-none outline-none text-sm text-foreground placeholder:text-muted-foreground flex-1"
            />
            {searchQuery && (
              <button onClick={() => { setSearchQuery(""); inputRef.current?.focus(); }} className="text-muted-foreground hover:text-foreground text-xs">✕</button>
            )}
          </div>

          {showResults && (
            <div className="absolute top-full left-0 mt-1 w-80 bg-card border border-border rounded-xl shadow-lg overflow-hidden z-50">
              <div className="px-3 py-2 border-b border-border">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                  {searchQuery ? `${results.length} result${results.length !== 1 ? "s" : ""}` : "All menus"}
                </p>
              </div>
              <div className="max-h-80 overflow-y-auto py-1">
                {results.length === 0 ? (
                  <div className="px-4 py-6 text-center text-muted-foreground text-sm">
                    No menus found for "{searchQuery}"
                  </div>
                ) : (
                  results.map((item, i) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.url}
                        onClick={() => navigateTo(item.url)}
                        onMouseEnter={() => setSelectedIndex(i)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors ${
                          i === selectedIndex ? "bg-primary/10" : "hover:bg-muted/50"
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                          i === selectedIndex ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
                        }`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-card-foreground truncate">{highlightMatch(item.label)}</p>
                          {item.parent && (
                            <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                              {item.parent} <ChevronRight className="w-3 h-3" /> {item.label}
                            </p>
                          )}
                        </div>
                        {i === selectedIndex && (
                          <span className="text-[10px] text-muted-foreground border border-border rounded px-1.5 py-0.5">Enter</span>
                        )}
                      </button>
                    );
                  })
                )}
              </div>
              <div className="px-3 py-2 border-t border-border flex items-center gap-3 text-[10px] text-muted-foreground">
                <span className="flex items-center gap-1"><kbd className="border border-border rounded px-1">↑↓</kbd> Navigate</span>
                <span className="flex items-center gap-1"><kbd className="border border-border rounded px-1">↵</kbd> Open</span>
                <span className="flex items-center gap-1"><kbd className="border border-border rounded px-1">Esc</kbd> Close</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1">
        {/* Language Switcher */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="text-muted-foreground">
              <Globe className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Language</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>🇺🇸 English</DropdownMenuItem>
            <DropdownMenuItem>🇪🇸 Español</DropdownMenuItem>
            <DropdownMenuItem>🇫🇷 Français</DropdownMenuItem>
            <DropdownMenuItem>🇩🇪 Deutsch</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Dark Mode */}
        <Button variant="ghost" size="icon" onClick={toggleDark} className="text-muted-foreground">
          {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </Button>

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative text-muted-foreground">
              <Bell className="w-4 h-4" />
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full flex items-center justify-center">3</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="flex flex-col items-start gap-1 py-3">
              <span className="font-medium text-sm">New booking received</span>
              <span className="text-xs text-muted-foreground">Buddy — Dog Grooming — 2 min ago</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="flex flex-col items-start gap-1 py-3">
              <span className="font-medium text-sm">Review posted</span>
              <span className="text-xs text-muted-foreground">Sarah J. left a 5-star review — 1 hr ago</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="flex flex-col items-start gap-1 py-3">
              <span className="font-medium text-sm">Payment received</span>
              <span className="text-xs text-muted-foreground">$60.00 from Mike C. — 3 hrs ago</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Profile */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="text-muted-foreground">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                <User className="w-4 h-4 text-primary-foreground" />
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <p className="font-medium">Ryan Cooper</p>
              <p className="text-xs text-muted-foreground">admin@happypaws.com</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate("/admin/profile")}>
              <User className="w-4 h-4 mr-2" /> Profile Settings
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate("/admin/roles")}>
              <Shield className="w-4 h-4 mr-2" /> Roles & Permissions
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive" onClick={() => navigate("/")}>
              <LogOut className="w-4 h-4 mr-2" /> Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
