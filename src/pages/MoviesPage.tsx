import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useContent } from "@/contexts/ContentContext";
import { useAuth } from "@/contexts/AuthContext";
import { Grid3x3, List } from "lucide-react";
import DashboardHeader from "@/components/DashboardHeader";
import MovieCard from "@/components/MovieCard";
import Footer from "@/components/Footer";
import VideoPlayer from "@/components/VideoPlayer";
import AdminPanel from "@/components/AdminPanel";
import { Button } from "@/components/ui/button";

const MoviesPage = () => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const { publishedMovies } = useContent();

  const [activeTab] = useState<"movies" | "series">("movies");
  const [playerMovie, setPlayerMovie] = useState<{
    url: string;
    title: string;
  } | null>(null);
  const [showAdmin, setShowAdmin] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [filterCategory, setFilterCategory] = useState<string>("all");

  const categories = Array.from(
    new Set(publishedMovies.map((movie) => movie.category))
  ).sort();

  const filteredMovies =
    filterCategory === "all"
      ? publishedMovies
      : publishedMovies.filter(
          (movie) => movie.category === filterCategory
        );

  const handlePlay = (movie: { url: string; title: string }) => {
    setPlayerMovie(movie);
  };

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader
        isAdmin={isAdmin}
        activeTab={activeTab}
        onChangeTab={() => {}}
        onOpenAdmin={() => setShowAdmin(true)}
      />

      <div className="pt-20 px-4 pb-12">
        <div className="container mx-auto">
          <div className="mb-8">
            <button
              onClick={() => navigate("/")}
              className="text-sm text-primary hover:underline mb-4"
            >
              ← Voltar
            </button>

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold mb-2">
                  Filmes
                </h1>
                <p className="text-muted-foreground">
                  {filteredMovies.length} filme
                  {filteredMovies.length !== 1 && "s"} disponível
                  {filteredMovies.length !== 1 && "is"}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className="hidden md:flex"
                >
                  <Grid3x3 className="w-4 h-4 mr-2" />
                  Grade
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className="hidden md:flex"
                >
                  <List className="w-4 h-4 mr-2" />
                  Lista
                </Button>
              </div>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-2">
              <Button
                size="sm"
                variant={filterCategory === "all" ? "default" : "outline"}
                onClick={() => setFilterCategory("all")}
              >
                Todos
              </Button>
              {categories.map((category) => (
                <Button
                  key={category}
                  size="sm"
                  variant={
                    filterCategory === category ? "default" : "outline"
                  }
                  onClick={() => setFilterCategory(category)}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>

          {filteredMovies.length === 0 ? (
            <div className="py-20 text-center text-muted-foreground">
              Nenhum filme disponível
            </div>
          ) : (
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3"
                  : "flex flex-col gap-4"
              }
            >
              {filteredMovies.map((movie, index) => (
                <MovieCard
                  key={movie.id}
                  title={movie.title}
                  image={movie.image}
                  year=""
                  duration=""
                  rating=""
                  delay={index * 0.03}
                  onPlay={() =>
                    handlePlay({
                      url: movie.url,
                      title: movie.title,
                    })
                  }
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />

      {playerMovie && (
        <VideoPlayer
          url={playerMovie.url}
          title={playerMovie.title}
          onClose={() => setPlayerMovie(null)}
        />
      )}

      {showAdmin && isAdmin && (
        <AdminPanel onClose={() => setShowAdmin(false)} />
      )}
    </div>
  );
};

export default MoviesPage;
