import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useContent } from "@/contexts/ContentContext";
import { useAuth } from "@/contexts/AuthContext";
import { Filter, Grid3x3, List, Search } from "lucide-react";
import DashboardHeader from "@/components/DashboardHeader";
import SeriesCard from "@/components/SeriesCard";
import Footer from "@/components/Footer";
import AdminPanel from "@/components/AdminPanel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const SeriesPage = () => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const { publishedSeries } = useContent();
  
  const [showAdmin, setShowAdmin] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "episodes" | "rating">("name");

  // Filtrar e ordenar séries
  const filteredSeries = useMemo(() => {
    let result = [...publishedSeries];

    // Busca
    if (searchTerm) {
      const query = searchTerm.toLowerCase();
      result = result.filter(series => 
        series.seriesName.toLowerCase().includes(query)
      );
    }

    // Ordenação
    result.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.seriesName.localeCompare(b.seriesName);
        case "episodes":
          return b.totalEpisodes - a.totalEpisodes;
        case "rating":
          return (b.rating || 0) - (a.rating || 0);
        default:
          return 0;
      }
    });

    return result;
  }, [publishedSeries, searchTerm, sortBy]);

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader onOpenAdmin={() => setShowAdmin(true)} />
      
      <div className="pt-20 px-4 pb-12">
        <div className="container mx-auto">
          {/* Header Melhorado */}
          <div className="mb-8">
            <button
              onClick={() => navigate("/")}
              className="text-sm text-primary hover:underline mb-4"
            >
              ← Voltar
            </button>
            
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold mb-2">Séries</h1>
                <p className="text-sm md:text-base text-muted-foreground">
                  {filteredSeries.length} {filteredSeries.length === 1 ? 'série disponível' : 'séries disponíveis'}
                </p>
              </div>

              {/* Controles de visualização */}
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

            {/* Barra de busca e filtros */}
            <div className="flex flex-col md:flex-row gap-3 mb-6">
              {/* Busca local */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar série..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Ordenação */}
              <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                <Button
                  variant={sortBy === "name" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSortBy("name")}
                  className="whitespace-nowrap"
                >
                  A-Z
                </Button>
                <Button
                  variant={sortBy === "episodes" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSortBy("episodes")}
                  className="whitespace-nowrap"
                >
                  Mais Episódios
                </Button>
                <Button
                  variant={sortBy === "rating" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSortBy("rating")}
                  className="whitespace-nowrap"
                >
                  Avaliação
                </Button>
              </div>
            </div>
          </div>

          {/* Grid de séries */}
          {filteredSeries.length === 0 ? (
            <div className="py-20 text-center">
              <p className="text-muted-foreground text-lg">
                {searchTerm 
                  ? `Nenhuma série encontrada para "${searchTerm}"` 
                  : "Nenhuma série disponível no momento"
                }
              </p>
            </div>
          ) : (
            <div className={
              viewMode === "grid" 
                ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4"
                : "flex flex-col gap-4"
            }>
              {filteredSeries.map((series, index) => (
                <SeriesCard
                  key={series.normalizedName}
                  series={series}
                  delay={index * 0.03}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />

      {/* Admin Panel */}
      {showAdmin && isAdmin && (
        <AdminPanel onClose={() => setShowAdmin(false)} />
      )}
    </div>
  );
};

export default SeriesPage;