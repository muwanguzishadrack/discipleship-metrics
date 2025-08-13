import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { ChevronDown, LogOut, Settings, UserCircle, Menu, X } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "../../contexts/AuthContext";
import { toast } from "sonner";

export function Topbar() {
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, signOut } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Signed out successfully');
    } catch (error) {
      toast.error('Failed to sign out');
    }
  };

  const userDisplayName = user?.user_metadata?.name || user?.email?.split('@')[0] || 'User';
  const userEmail = user?.email || '';
  const userInitials = userDisplayName.split(' ').map((n: string) => n[0]).join('').toUpperCase();

  return (
    <header className={`sticky top-0 z-50 w-full transition-all duration-200 ${isScrolled ? 'backdrop-blur-md bg-gradient-to-r from-[#13192b]/80 to-[#1c2334]/80' : ''}`}>
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Left: Mobile Menu Button + Logo */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden p-2 text-white hover:bg-gray-700"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <Link to="/" className="flex items-center space-x-2">
            <Logo className="h-8 w-8" />
            <span className="text-lg sm:text-xl text-white">
              <span className="font-bold">Discipleship</span>
              <span className="font-normal" style={{color: '#eca84b'}}>Metrics</span>
            </span>
          </Link>
        </div>

        {/* Center: Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          <Link to="/reports" className={`${location.pathname === '/reports' ? 'text-white' : 'text-gray-300'} hover:text-white transition-colors text-sm font-medium`}>
            Reports
          </Link>
          <Link to="/analytics" className={`${location.pathname === '/analytics' ? 'text-white' : 'text-gray-300'} hover:text-white transition-colors text-sm font-medium`}>
            Analytics
          </Link>
          <Link to="/settings" className={`${location.pathname === '/settings' ? 'text-white' : 'text-gray-300'} hover:text-white transition-colors text-sm font-medium`}>
            Settings
          </Link>
        </nav>

        {/* Right: User Profile */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* User Profile */}
          <DropdownMenu onOpenChange={setIsProfileOpen}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-2 text-white rounded-lg focus:ring-0 focus:ring-offset-0 hover:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="" alt={userDisplayName} />
                  <AvatarFallback className="bg-gray-700 text-white text-sm">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden sm:flex flex-col items-start text-sm">
                  <span className="font-medium text-white">{userDisplayName}</span>
                  <span className="text-xs text-gray-300">{userEmail}</span>
                </div>
                <ChevronDown className={`ml-1 sm:ml-2 h-4 w-4 text-gray-300 transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{userDisplayName}</p>
                  <p className="text-xs leading-none text-muted-foreground">{userEmail}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <UserCircle className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Mobile Slide-In Menu */}
      <>
        {/* Backdrop */}
        <div 
          className={`fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity duration-300 ${
            isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
          onClick={() => setIsMobileMenuOpen(false)}
        />
        
        {/* Slide-in Menu */}
        <div className={`fixed top-0 left-0 h-full w-80 max-w-[80vw] bg-gradient-to-b from-[#13192b] to-[#1c2334] z-50 transform transition-transform duration-300 ease-in-out md:hidden ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
            {/* Menu Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-600/50">
              <div className="flex items-center space-x-2">
                <Logo className="h-8 w-8" />
                <span className="text-lg text-white">
                  <span className="font-bold">Discipleship</span>
                  <span className="font-normal" style={{color: '#eca84b'}}>Metrics</span>
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="p-2 text-white hover:bg-gray-700/50 rounded-full"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            {/* Menu Items */}
            <nav className="py-6 px-2 space-y-1">
              <Link 
                to="/dashboard" 
                className={`flex items-center px-4 py-4 ${location.pathname === '/dashboard' ? 'text-white' : 'text-gray-300'} hover:text-white hover:bg-gray-700/50 rounded-lg transition-all duration-200 text-base font-medium group`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Dashboard
              </Link>
              <Link 
                to="/reports" 
                className={`flex items-center px-4 py-4 ${location.pathname === '/reports' ? 'text-white' : 'text-gray-300'} hover:text-white hover:bg-gray-700/50 rounded-lg transition-all duration-200 text-base font-medium group`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Reports
              </Link>
              <Link 
                to="/analytics" 
                className={`flex items-center px-4 py-4 ${location.pathname === '/analytics' ? 'text-white' : 'text-gray-300'} hover:text-white hover:bg-gray-700/50 rounded-lg transition-all duration-200 text-base font-medium group`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Analytics
              </Link>
              <Link 
                to="/settings" 
                className={`flex items-center px-4 py-4 ${location.pathname === '/settings' ? 'text-white' : 'text-gray-300'} hover:text-white hover:bg-gray-700/50 rounded-lg transition-all duration-200 text-base font-medium group`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Settings
              </Link>
            </nav>
            
            {/* Logout Button */}
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <Button
                variant="ghost"
                onClick={handleSignOut}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-700 text-white border border-gray-500 hover:bg-gray-600 hover:text-white rounded-lg text-base font-medium focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none"
              >
                <LogOut className="h-5 w-5" />
                Logout
              </Button>
            </div>
          </div>
      </>
    </header>
  );
}