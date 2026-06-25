import { 
  LayoutDashboard,
  Users,
  Bike,
  UserCog,
  MapPin,
  DollarSign,
  Clock,
  Bell,
  MessageSquare,
  FileText,
  Settings,
  type LucideIcon 
} from 'lucide-react';
import { Logo } from './logo/Logo';
import { cn } from '../lib/utils';

interface MenuItem {
  label: string;
  icon: LucideIcon;
  href: string;
  badge?: number;
}

const menuItems: MenuItem[] = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/' },
  { label: 'Chauffeurs', icon: Users, href: '/chauffeurs' },
  { label: 'Motos', icon: Bike, href: '/motos' },
  { label: 'Propriétaires', icon: UserCog, href: '/proprietaires' },
  { label: 'Courses', icon: MapPin, href: '/courses' },
  { label: 'Versements', icon: DollarSign, href: '/versements' },
  { label: 'Pointages', icon: Clock, href: '/pointages' },
  { label: 'Notifications', icon: Bell, href: '/notifications' },
  { label: 'Assistance', icon: MessageSquare, href: '/assistance' },
  { label: 'Contrats', icon: FileText, href: '/contrats' },
  { label: 'Rapports', icon: FileText, href: '/rapports' },
  { label: 'Paramètres', icon: Settings, href: '/parametres' },
];

export function Sidebar() {
  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen hidden lg:block">
      {/* Logo Section */}
      <div className="p-4 border-b border-gray-200">
        <Logo size="md" />
      </div>

      {/* Navigation */}
      <nav className="p-2 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href;
          
          return (
            <a
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg transition-colors',
                isActive 
                  ? 'bg-primary/10 text-primary font-medium' 
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              )}
            >
              <Icon size={18} strokeWidth={2} />
              <span className="font-medium">{item.label}</span>
              {item.badge && (
                <span className="ml-auto bg-primary text-white text-xs rounded-full px-2 py-0.5 min-w-5 text-center">
                  {item.badge}
                </span>
              )}
            </a>
          );
        })}
      </nav>
    </aside>
  );
}
