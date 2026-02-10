import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Play, Info, ChevronLeft, ChevronRight } from "lucide-react";
import { useContent } from "@/contexts/ContentContext";
import { useAuth } from "@/contexts/AuthContext";
import DashboardHeader from "@/components/DashboardHeader";
import MovieCard from "@/components/MovieCard";
import SeriesCard from "@/components/SeriesCard";
import Footer from "@/components/Footer";
import VideoPlayer from "@/components/VideoPlayer";
import AdminPanel from "@/components/AdminPanel";
import { Button } from "@/components/ui/button";

const Dashboard = () => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const { 
    publishedMovies, 
    publishedSeries, 
    isLoading,
    setPreviewContent,
    publishContent,
  } = useContent();

  const [showAdmin, setShowAdmin] = useState(false);
  const [playerMovie, setPlayerMovie] = useState<{ url: string; title: string } | null>(null);
  const [heroMovie, setHeroMovie] = useState<any>(null);
  const [isLoadingM3U, setIsLoadingM3U] = useState(false);

  // 🎬 CARREGAR FILMES.M3U AUTOMATICAMENTE
  useEffect(() => {
    const loadFilmesM3U = async () => {
      // Só carregar se não tiver filmes publicados
      if (publishedMovies.length > 0) {
        console.log("✅ [DASHBOARD] Já tem filmes publicados, não carregando M3U");
        return;
      }

      setIsLoadingM3U(true);
      console.log("📥 [DASHBOARD] Carregando /filmes.m3u...");

      try {
        const response = await fetch('/filmes.m3u');
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const text = await response.text();
        console.log("✅ [DASHBOARD] M3U carregado, processando...");

        // Parse M3U
        const lines = text.split('\n');
        const items: any[] = [];
        let currentItem: any = null;

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i].trim();

          if (line.startsWith('#EXTINF:')) {
            // Extrair informações
            const titleMatch = line.match(/,(.+)$/);
            const imageMatch = line.match(/tvg-logo="([^"]+)"/);
            const categoryMatch = line.match(/group-title="([^"]+)"/);

            currentItem = {
              id: `movie-${Date.now()}-${i}`,
              title: titleMatch ? titleMatch[1].trim() : 'Sem título',
              image: imageMatch ? imageMatch[1] : undefined,
              category: categoryMatch ? categoryMatch[1] : 'Filmes',
              source: 'movie',
            };
          } else if (line && !line.startsWith('#') && currentItem) {
            // URL do filme
            currentItem.url = line;
            items.push(currentItem);
            currentItem = null;
          }
        }

        console.log("✅ [DASHBOARD] Processado:", items.length, "filmes");

        if (items.length > 0) {
          // Adicionar ao preview
          setPreviewContent(items);
          
          // Publicar automaticamente
          setTimeout(() => {
            publishContent();
            console.log("✅ [DASHBOARD] Filmes publicados automaticamente");
          }, 500);
        }

      } catch (error) {
        console.error("❌ [DASHBOARD] Erro ao carregar filmes.m3u:", error);
      } finally {
        setIsLoadingM3U(false);
      }
    };

    loadFilmesM3U();
  }, [publishedMovies.length, setPreviewContent, publishContent]);

  // Selecionar filme hero (destaque)
  useEffect(() => {
    if (publishedMovies.length > 0 && !heroMovie) {
      // Pegar um filme aleatório para destaque
      const randomIndex = Math.floor(Math.random() * Math.min(publishedMovies.length, 10));
      setHeroMovie(publishedMovies[randomIndex]);
    }
  }, [publishedMovies, heroMovie]);

  // Scroll horizontal das listas
  const scrollList = (containerId: string, direction: 'left' | 'right') => {
    const container = document.getElementById(containerId);
    if (!container) return;

    const scrollAmount = container.clientWidth * 0.8;
    container.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
  };

  if (isLoading || isLoadingM3U) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">
            {isLoadingM3U ? "Carregando filmes..." : "Carregando conteúdo..."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <DashboardHeader onOpenAdmin={() => setShowAdmin(true)} />

      {/* 🎬 HERO SECTION - Filme em Destaque */}
      {heroMovie && (
        <div className="relative h-[90vh] w-full">
          {/* Background Image */}
          <div className="absolute inset-0">
            <img
              src={heroMovie.image || "https://via.placeholder.com/1920x1080?text=StreamMax"}
              alt={heroMovie.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
          </div>

          {/* Content */}
          <div className="relative h-full flex items-center">
            <div className="container mx-auto px-4 md:px-8">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="max-w-2xl"
              >
                {/* Logo/Title */}
                <h1 className="text-5xl md:text-7xl font-black text-white mb-4 drop-shadow-2xl">
                  {heroMovie.title}
                </h1>

                {/* Category Badge */}
                {heroMovie.category && (
                  <div className="mb-4">
                    <span className="inline-block bg-red-600 text-white px-3 py-1 rounded text-sm font-bold">
                      {heroMovie.category}
                    </span>
                  </div>
                )}

                {/* Buttons */}
                <div className="flex items-center gap-3">
                  <Button
                    onClick={() => setPlayerMovie({ url: heroMovie.url, title: heroMovie.title })}
                    size="lg"
                    className="bg-white text-black hover:bg-white/90 font-bold gap-2 px-8"
                  >
                    <Play className="w-6 h-6 fill-current" />
                    Assistir
                  </Button>

                  <Button
                    onClick={() => navigate("/movies")}
                    size="lg"
                    variant="secondary"
                    className="bg-gray-500/70 text-white hover:bg-gray-500/50 font-bold gap-2 px-6"
                  >
                    <Info className="w-5 h-5" />
                    Mais Informações
                  </Button>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      )}

      {/* 📚 CONTENT ROWS */}
      <div className="relative z-10 -mt-32 pb-20">
        <div className="container mx-auto px-4 md:px-8 space-y-12">
          
          {/* 🎬 FILMES POPULARES */}
          {publishedMovies.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-white">Filmes Populares</h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => scrollList('movies-list', 'left')}
                    className="w-10 h-10 rounded-full bg-black/50 hover:bg-black/80 flex items-center justify-center transition-colors"
                  >
                    <ChevronLeft className="w-6 h-6 text-white" />
                  </button>
                  <button
                    onClick={() => scrollList('movies-list', 'right')}
                    className="w-10 h-10 rounded-full bg-black/50 hover:bg-black/80 flex items-center justify-center transition-colors"
                  >
                    <ChevronRight className="w-6 h-6 text-white" />
                  </button>
                </div>
              </div>

              <div
                id="movies-list"
                className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-4"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {publishedMovies.slice(0, 20).map((movie, index) => (
                  <div key={movie.id} className="flex-shrink-0 w-48">
                    <MovieCard
                      title={movie.title}
                      image={movie.image || "https://via.placeholder.com/300x450?text=Sem+Poster"}
                      year=""
                      duration=""
                      rating=""
                      delay={index * 0.05}
                      onPlay={() => setPlayerMovie({ url: movie.url, title: movie.title })}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 📺 SÉRIES */}
          {publishedSeries.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-white">Séries em Alta</h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => scrollList('series-list', 'left')}
                    className="w-10 h-10 rounded-full bg-black/50 hover:bg-black/80 flex items-center justify-center transition-colors"
                  >
                    <ChevronLeft className="w-6 h-6 text-white" />
                  </button>
                  <button
                    onClick={() => scrollList('series-list', 'right')}
                    className="w-10 h-10 rounded-full bg-black/50 hover:bg-black/80 flex items-center justify-center transition-colors"
                  >
                    <ChevronRight className="w-6 h-6 text-white" />
                  </button>
                </div>
              </div>

              <div
                id="series-list"
                className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-4"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {publishedSeries.slice(0, 20).map((series, index) => (
                  <div key={series.normalizedName} className="flex-shrink-0 w-48">
                    <SeriesCard series={series} delay={index * 0.05} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 🎬 MAIS FILMES (se tiver muitos) */}
          {publishedMovies.length > 20 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-white">Continue Assistindo</h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => scrollList('more-movies-list', 'left')}
                    className="w-10 h-10 rounded-full bg-black/50 hover:bg-black/80 flex items-center justify-center transition-colors"
                  >
                    <ChevronLeft className="w-6 h-6 text-white" />
                  </button>
                  <button
                    onClick={() => scrollList('more-movies-list', 'right')}
                    className="w-10 h-10 rounded-full bg-black/50 hover:bg-black/80 flex items-center justify-center transition-colors"
                  >
                    <ChevronRight className="w-6 h-6 text-white" />
                  </button>
                </div>
              </div>

              <div
                id="more-movies-list"
                className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-4"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {publishedMovies.slice(20, 40).map((movie, index) => (
                  <div key={movie.id} className="flex-shrink-0 w-48">
                    <MovieCard
                      title={movie.title}
                      image={movie.image || "https://via.placeholder.com/300x450?text=Sem+Poster"}
                      year=""
                      duration=""
                      rating=""
                      delay={index * 0.05}
                      onPlay={() => setPlayerMovie({ url: movie.url, title: movie.title })}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* MENSAGEM SE VAZIO */}
          {publishedMovies.length === 0 && publishedSeries.length === 0 && (
            <div className="text-center py-20">
              <h2 className="text-2xl font-bold text-white mb-4">
                Nenhum conteúdo disponível
              </h2>
              <p className="text-gray-400 mb-6">
                Adicione filmes.m3u em /public/ ou faça upload pelo painel admin
              </p>
              {isAdmin && (
                <Button onClick={() => setShowAdmin(true)} size="lg">
                  Abrir Painel Admin
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      <Footer />

      {/* Video Player */}
      {playerMovie && (
        <VideoPlayer
          url={playerMovie.url}
          title={playerMovie.title}
          onClose={() => setPlayerMovie(null)}
        />
      )}

      {/* Admin Panel */}
      {showAdmin && isAdmin && (
        <AdminPanel onClose={() => setShowAdmin(false)} />
      )}
    </div>
  );
};

export default Dashboard;