import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { useContent } from "@/contexts/ContentContext";
import { useAuth } from "@/contexts/AuthContext";
import DashboardHeader from "@/components/DashboardHeader";
import MovieCard from "@/components/MovieCard";
import Footer from "@/components/Footer";
import VideoPlayer from "@/components/VideoPlayer";
import AdminPanel from "@/components/AdminPanel";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const MoviesPage = () => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const { publishedMovies, isLoading } = useContent();

  const [playerMovie, setPlayerMovie] = useState<{
    url: string;
    title: string;
  } | null>(null);
  const [showAdmin, setShowAdmin] = useState(false);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("recent");
  const [showFilters, setShowFilters] = useState(false);

  console.log("🎬 MoviesPage - Total de filmes:", publishedMovies.length);

  // Filtrar e ordenar filmes
  const filteredMovies = useMemo(() => {
    let result = [...publishedMovies];

    // Busca
    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter((movie) =>
        movie.title.toLowerCase().includes(searchLower)
      );
    }

    // Ordenação
    switch (sortBy) {
      case "title":
        result.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "recent":
      default:
        result.reverse(); // Mais recentes primeiro
        break;
    }

    return result;
  }, [publishedMovies, search, sortBy]);

  // Hero movie (primeiro da lista)
  const heroMovie = filteredMovies[0];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">Carregando filmes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <DashboardHeader onOpenAdmin={() => setShowAdmin(true)} />

      {/* 🎬 HERO SECTION */}
      {heroMovie && (
        <div className="relative h-[70vh] w-full">
          {/* Background */}
          <div className="absolute inset-0">
            <img
              src={heroMovie.image || "https://via.placeholder.com/1920x1080"}
              alt={heroMovie.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
          </div>

          {/* Content */}
          <div className="relative h-full flex items-end pb-16">
            <div className="container mx-auto px-4 md:px-8">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-2xl"
              >
                <h1 className="text-4xl md:text-6xl font-black text-white mb-4 drop-shadow-2xl">
                  {heroMovie.title}
                </h1>

                {heroMovie.category && (
                  <span className="inline-block bg-red-600 text-white px-3 py-1 rounded text-sm font-bold mb-4">
                    {heroMovie.category}
                  </span>
                )}

                <div className="flex items-center gap-3">
                  <Button
                    onClick={() =>
                      setPlayerMovie({ url: heroMovie.url, title: heroMovie.title })
                    }
                    size="lg"
                    className="bg-white text-black hover:bg-white/90 font-bold"
                  >
                    ▶ Assistir Agora
                  </Button>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      )}

      {/* 🔍 SEARCH & FILTERS */}
      <div className="relative z-10 -mt-10">
        <div className="container mx-auto px-4 md:px-8">
          <div className="bg-black/80 backdrop-blur-sm rounded-lg p-4 border border-gray-800">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="search"
                  placeholder="Buscar filmes..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 bg-gray-900 border-gray-700 text-white placeholder:text-gray-400"
                />
              </div>

              {/* Sort */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full md:w-48 bg-gray-900 border-gray-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Mais Recentes</SelectItem>
                  <SelectItem value="title">Ordem Alfabética</SelectItem>
                </SelectContent>
              </Select>

              {/* Filters Toggle */}
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="border-gray-700 text-white hover:bg-gray-800"
              >
                <SlidersHorizontal className="w-5 h-5 mr-2" />
                Filtros
              </Button>
            </div>

            {/* Results Count */}
            {search && (
              <div className="mt-3 flex items-center justify-between">
                <p className="text-sm text-gray-400">
                  {filteredMovies.length} filme{filteredMovies.length !== 1 ? "s" : ""} encontrado
                  {filteredMovies.length !== 1 ? "s" : ""}
                </p>
                <button
                  onClick={() => setSearch("")}
                  className="text-sm text-gray-400 hover:text-white flex items-center gap-1"
                >
                  <X className="w-4 h-4" />
                  Limpar busca
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 📚 MOVIES GRID */}
      <div className="container mx-auto px-4 md:px-8 py-12">
        {filteredMovies.length === 0 ? (
          <div className="text-center py-20">
            <h2 className="text-2xl font-bold text-white mb-4">
              {search ? "Nenhum filme encontrado" : "Nenhum filme disponível"}
            </h2>
            <p className="text-gray-400 mb-6">
              {search
                ? `Não encontramos filmes para "${search}"`
                : "Adicione filmes pelo painel admin"}
            </p>
            {!search && isAdmin && (
              <Button onClick={() => setShowAdmin(true)} size="lg">
                Abrir Painel Admin
              </Button>
            )}
          </div>
        ) : (
          <>
            <h2 className="text-2xl font-bold text-white mb-6">
              {search ? "Resultados da Busca" : "Todos os Filmes"}
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {filteredMovies.map((movie, index) => (
                <motion.div
                  key={movie.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.02 }}
                >
                  <MovieCard
                    title={movie.title}
                    image={movie.image || "https://via.placeholder.com/300x450?text=Sem+Poster"}
                    year=""
                    duration=""
                    rating=""
                    delay={0}
                    onPlay={() => {
                      console.log("▶️ Reproduzindo filme:", movie.title);
                      setPlayerMovie({ url: movie.url, title: movie.title });
                    }}
                  />
                </motion.div>
              ))}
            </div>
          </>
        )}
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

export default MoviesPage;