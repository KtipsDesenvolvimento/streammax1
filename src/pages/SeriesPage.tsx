import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useContent } from "@/contexts/ContentContext";
import { useAuth } from "@/contexts/AuthContext";
import { Grid3x3, List, Search } from "lucide-react";
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

  const [activeTab] = useState<"movies" | "series">("series");
  const [showAdmin, setShowAdmin] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "episodes" | "rating">(
    "name"
  );

  const filteredSeries = useMemo(() => {
    let result = [...publishedSeries];

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      result = result.filter((s) =>
        s.seriesName.toLowerCase().includes(q)
      );
    }

    result.sort((a, b) => {
      if (sortBy === "episodes")
        return b.totalEpisodes - a.totalEpisodes;
      if (sortBy === "rating")
        return (b.rating || 0) - (a.rating || 0);
      return a.seriesName.localeCompare(b.seriesName);
    });

    return result;
  }, [publishedSeries, searchTerm, sortBy]);

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

            <div className="flex flex-col md:flex-row md:justify-between gap-4 mb-6">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">
                  Séries
                </h1>
                <p className="text-muted-foreground">
                  {filteredSeries.length} série
                  {filteredSeries.length !== 1 && "s"} disponível
                  {filteredSeries.length !== 1 && "is"}
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={viewMode === "grid" ? "default" : "outline"}
                  onClick={() => setViewMode("grid")}
                  className="hidden md:flex"
                >
                  <Grid3x3 className="w-4 h-4 mr-2" />
                  Grade
                </Button>
                <Button
                  size="sm"
                  variant={viewMode === "list" ? "default" : "outline"}
                  onClick={() => setViewMode("list")}
                  className="hidden md:flex"
                >
                  <List className="w-4 h-4 mr-2" />
                  Lista
                </Button>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-3 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar série..."
                  className="pl-10"
                />
              </div>

              <div className="flex gap-2 overflow-x-auto">
                <Button
                  size="sm"
                  variant={sortBy === "name" ? "default" : "outline"}
                  onClick={() => setSortBy("name")}
                >
                  A–Z
                </Button>
                <Button
                  size="sm"
                  variant={
                    sortBy === "episodes" ? "default" : "outline"
                  }
                  onClick={() => setSortBy("episodes")}
                >
                  Mais episódios
                </Button>
                <Button
                  size="sm"
                  variant={
                    sortBy === "rating" ? "default" : "outline"
                  }
                  onClick={() => setSortBy("rating")}
                >
                  Avaliação
                </Button>
              </div>
            </div>
          </div>

          {filteredSeries.length === 0 ? (
            <div className="py-20 text-center text-muted-foreground">
              Nenhuma série encontrada
            </div>
          ) : (
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3"
                  : "flex flex-col gap-4"
              }
            >
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

      {showAdmin && isAdmin && (
        <AdminPanel onClose={() => setShowAdmin(false)} />
      )}
    </div>
  );
};

export default SeriesPage;
