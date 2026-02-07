import { motion } from "framer-motion";
import { Play, Info, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import heroBg from "@/assets/hero-bg.jpg";

const FeaturedHero = () => {
  const [isMuted, setIsMuted] = useState(true);

  return (
    <div className="relative h-[70vh] md:h-[85vh] w-full overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroBg})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/30" />
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex items-center">
        <div className="container mx-auto px-4 md:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl"
          >
            {/* Logo/Title */}
            <div className="mb-4">
              <span className="text-primary font-bold text-sm tracking-wider">DESTAQUE</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-extrabold text-foreground mb-4 leading-tight">
              A Última Fronteira
            </h1>
            
            <div className="flex items-center gap-3 mb-4 text-sm text-muted-foreground">
              <span className="text-green-500 font-semibold">98% Match</span>
              <span>2025</span>
              <span className="border border-muted-foreground px-1 text-xs">16+</span>
              <span>2h 24min</span>
              <span className="border border-muted-foreground px-1 text-xs">4K</span>
            </div>
            
            <p className="text-muted-foreground text-base md:text-lg mb-6 line-clamp-3 md:line-clamp-4">
              Em um futuro distópico, um grupo de sobreviventes embarca em uma jornada épica 
              através de territórios devastados para encontrar o último refúgio da humanidade. 
              Uma aventura eletrizante que desafia os limites da coragem e esperança.
            </p>

            <div className="flex items-center gap-3">
              <Button className="btn-primary-gradient text-primary-foreground h-12 px-8 font-semibold text-base gap-2">
                <Play className="w-5 h-5 fill-current" />
                Assistir
              </Button>
              <Button variant="secondary" className="h-12 px-8 font-semibold text-base gap-2 bg-secondary/80 hover:bg-secondary">
                <Info className="w-5 h-5" />
                Mais Informações
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Mute Button */}
        <button
          onClick={() => setIsMuted(!isMuted)}
          className="absolute right-4 md:right-8 bottom-32 w-10 h-10 rounded-full border border-muted-foreground flex items-center justify-center hover:border-foreground transition-colors"
        >
          {isMuted ? (
            <VolumeX className="w-5 h-5 text-foreground" />
          ) : (
            <Volume2 className="w-5 h-5 text-foreground" />
          )}
        </button>

        {/* Age Rating */}
        <div className="absolute right-4 md:right-8 bottom-20 bg-secondary/80 px-4 py-1 border-l-2 border-foreground">
          <span className="text-foreground text-sm font-medium">16+</span>
        </div>
      </div>
    </div>
  );
};

export default FeaturedHero;
