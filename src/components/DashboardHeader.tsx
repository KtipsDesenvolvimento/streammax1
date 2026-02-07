import { motion } from "framer-motion";
import { Play, Search, Bell, ChevronDown, LogOut, Settings, LayoutDashboard } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface DashboardHeaderProps {
  onOpenAdmin?: () => void;
}

const DashboardHeader = ({ onOpenAdmin }: DashboardHeaderProps) => {
  const { user, logout, isAdmin } = useAuth();

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-background via-background/80 to-transparent"
    >
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <Play className="w-5 h-5 text-primary-foreground fill-current" />
            </div>
            <span className="text-xl font-bold text-foreground hidden md:block">StreamMax</span>
          </div>
          
          <nav className="hidden lg:flex items-center gap-6">
            <a href="#" className="text-foreground font-medium">Início</a>
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Séries</a>
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Filmes</a>
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Bombando</a>
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Minha Lista</a>
            {isAdmin && (
              <>
                <a
                  href="#"
                  onClick={(e) => { e.preventDefault(); onOpenAdmin?.(); }}
                  className="text-primary hover:text-primary/80 transition-colors font-medium flex items-center gap-1"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Gerenciamento
                </a>
                <a href="#" className="text-primary hover:text-primary/80 transition-colors font-medium flex items-center gap-1">
                  <Settings className="w-4 h-4" />
                  Configurações
                </a>
              </>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <button className="text-foreground hover:text-muted-foreground transition-colors">
            <Search className="w-5 h-5" />
          </button>
          
          <button className="text-foreground hover:text-muted-foreground transition-colors relative">
            <Bell className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full text-xs flex items-center justify-center text-primary-foreground">
              3
            </span>
          </button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2">
                <div className="w-8 h-8 rounded bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                  <span className="text-primary-foreground text-sm font-bold">
                    {user?.name.charAt(0)}
                  </span>
                </div>
                <ChevronDown className="w-4 h-4 text-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-card border-border">
              <div className="px-2 py-2 border-b border-border">
                <p className="text-sm font-medium text-foreground">{user?.name}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
                {isAdmin && (
                  <span className="text-xs text-primary font-semibold">Administrador</span>
                )}
              </div>
              {isAdmin && (
                <DropdownMenuItem
                  onClick={onOpenAdmin}
                  className="text-muted-foreground hover:text-foreground cursor-pointer gap-2"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Gerenciamento
                </DropdownMenuItem>
              )}
              <DropdownMenuItem className="text-muted-foreground hover:text-foreground cursor-pointer">
                Gerenciar Perfis
              </DropdownMenuItem>
              <DropdownMenuItem className="text-muted-foreground hover:text-foreground cursor-pointer">
                Conta
              </DropdownMenuItem>
              <DropdownMenuItem className="text-muted-foreground hover:text-foreground cursor-pointer">
                Central de Ajuda
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={logout}
                className="text-primary hover:text-primary cursor-pointer gap-2"
              >
                <LogOut className="w-4 h-4" />
                Sair do StreamMax
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </motion.header>
  );
};

export default DashboardHeader;
