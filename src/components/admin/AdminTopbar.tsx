import { Bell, Globe, Moon, Sun, User, Search, Shield, Lock, LogOut } from "lucide-react";
import { useState } from "react";
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

export function AdminTopbar() {
  const [darkMode, setDarkMode] = useState(false);
  const navigate = useNavigate();

  const toggleDark = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle("dark");
  };

  return (
    <header className="h-16 border-b border-border bg-card flex items-center justify-between px-4 shrink-0">
      <div className="flex items-center gap-3">
        <SidebarTrigger className="text-muted-foreground" />
        <div className="hidden md:flex items-center gap-2 bg-muted rounded-lg px-3 py-2 w-64">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input
            placeholder="Search..."
            className="bg-transparent border-none outline-none text-sm text-foreground placeholder:text-muted-foreground flex-1"
          />
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
