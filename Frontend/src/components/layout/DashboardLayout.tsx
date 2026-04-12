import { Outlet, useNavigate } from 'react-router-dom';
import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';
import { Menu, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useTheme } from 'next-themes';
import { Sun, Moon } from 'lucide-react';

export function DashboardLayout() {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();

  // ✅ GET USER FROM LOCAL STORAGE
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  // ✅ GET INITIALS FROM USERNAME
  const getInitials = (name: string = "") => {
    return name
      .split(" ")
      .map(word => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // ✅ RANDOM COLOR BASED ON USERNAME
  const getAvatarColor = (name: string = "") => {
    const colors = [
      "bg-red-500",
      "bg-green-500",
      "bg-blue-500",
      "bg-yellow-500",
      "bg-purple-500",
      "bg-pink-500",
      "bg-indigo-500",
    ];

    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }

    return colors[Math.abs(hash) % colors.length];
  };

  // ✅ LOGOUT
  const handleLogout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />

        <SidebarInset className="flex-1">
          
          {/* Header */}
          <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b bg-background/95 backdrop-blur px-4 lg:px-6">
            
            <div className="flex items-center gap-4">
              <SidebarTrigger className="-ml-1">
                <Menu className="h-5 w-5" />
              </SidebarTrigger>
            </div>

            <div className="flex items-center gap-4">
              <Button variant = "ghost" size = "icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
                {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="" alt="User" />
                      <AvatarFallback
                        className={`${getAvatarColor(user?.username || "U")} text-white`}
                      >
                        {getInitials(user?.username || "User")}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent className="w-56 bg-popover" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">
                        {user?.username || "User"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {user?.email || "No Email"}
                      </p>
                    </div>
                  </DropdownMenuLabel>

                  <DropdownMenuSeparator />

                  <DropdownMenuSeparator />

                  {/* LOGOUT */}
                  <DropdownMenuItem 
                    className="text-destructive"
                    onClick={handleLogout}
                  >
                    Logout
                  </DropdownMenuItem>

                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          {/* Main */}
          <main className="flex-1 p-4 lg:p-6">
            <Outlet />
          </main>

        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}