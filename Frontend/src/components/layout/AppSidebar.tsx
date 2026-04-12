import { 
  LayoutDashboard, 
  PlusCircle, 
  FileText, 
  LogOut,
  Briefcase,
  Menu,
  Sparkles
} from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

const navItems = [
  {
    title: 'Dashboard',
    url: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Add Job',
    url: '/add-job',
    icon: PlusCircle,
  },
  {
    title: 'Resumes',
    url: '/resumes',
    icon: FileText,
  },
  {
    title: 'Resume Analyzer',
    url: '/resume-analyzer',
    icon: Sparkles,
  },
];

export function AppSidebar() {
  const navigate = useNavigate();
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';

  const handleLogout = () => {
    // Placeholder for logout logic
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    navigate('/login');
  };

  return (
    <Sidebar 
      className="border-r border-sidebar-border"
      collapsible="icon"
    >
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sidebar-primary">
            <Briefcase className="h-5 w-5 text-sidebar-primary-foreground" />
          </div>
          {!collapsed && (
            <div className="animate-slide-in-left">
              <h1 className="font-bold text-sidebar-foreground">JobTracker</h1>
              <p className="text-xs text-sidebar-muted">Smart Applications</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <Separator className="bg-sidebar-border" />

      <SidebarContent className="p-2">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url}
                      className={({ isActive }) => cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sidebar-foreground transition-all',
                        'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                        isActive && 'bg-sidebar-accent text-sidebar-primary font-medium'
                      )}
                    >
                      <item.icon className="h-5 w-5" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        <Separator className="bg-sidebar-border mb-4" />
        <Button
          variant="ghost"
          onClick={handleLogout}
          className={cn(
            'w-full justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
            collapsed && 'justify-center px-2'
          )}
        >
          <LogOut className="h-5 w-5" />
          {!collapsed && <span>Logout</span>}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
