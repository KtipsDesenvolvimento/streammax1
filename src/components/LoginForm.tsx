import { useState } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    // Simular delay de rede
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    const success = login(email, password);
    
    if (success) {
      toast({
        title: "Login realizado!",
        description: "Bem-vindo de volta ao StreamMax.",
      });
    } else {
      toast({
        title: "Credenciais inválidas",
        description: "E-mail ou senha incorretos. Tente novamente.",
        variant: "destructive",
      });
    }
    
    setIsLoading(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      id="login"
      className="glass-card rounded-2xl p-8 w-full max-w-md mx-auto"
    >
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-2">Entrar</h2>
        <p className="text-muted-foreground">Acesse sua conta para continuar</p>
      </div>

      {/* Demo credentials hint */}
      <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 mb-6 text-center space-y-1">
        <p className="text-xs text-muted-foreground">
          <span className="text-primary font-semibold">Admin:</span> admin@admin.com / admin123
        </p>
        <p className="text-xs text-muted-foreground">
          <span className="text-primary font-semibold">Usuário:</span> user@user.com / user123
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">E-mail</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10 bg-secondary border-border focus:border-primary h-12"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Senha</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10 pr-10 bg-secondary border-border focus:border-primary h-12"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" className="rounded border-border bg-secondary" />
            <span className="text-muted-foreground">Lembrar de mim</span>
          </label>
          <a href="#" className="text-primary hover:underline">
            Esqueceu a senha?
          </a>
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full h-12 btn-primary-gradient text-primary-foreground font-semibold text-base"
        >
          {isLoading ? "Entrando..." : "Entrar"}
        </Button>

        <p className="text-center text-muted-foreground text-sm">
          Não tem uma conta?{" "}
          <a href="#plans" className="text-primary hover:underline font-medium">
            Assine agora
          </a>
        </p>
      </form>
    </motion.div>
  );
};

export default LoginForm;
