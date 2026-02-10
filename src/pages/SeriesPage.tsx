import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useContent } from "@/contexts/ContentContext";
import { useAuth } from "@/contexts/AuthContext";
import DashboardHeader from "@/components/DashboardHeader";
import SeriesCard from "@/components/SeriesCard";
import Footer from "@/components/Footer";
import AdminPanel from "@/components/AdminPanel";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

const SeriesPage = () => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const { publishedSeries } = useContent();

  const [showAdmin, setShowAdmin] = useState(false);
  const [search, setSearch] = useState("");

  console.log("📺 SeriesPage - Total de séries:", publishedSeries.length);

  // Filtrar séries pela busca
  const filteredSeries = useMemo(() => {
    if (!search) return publishedSeries;
    
    const searchLower = search.toLowerCase();
    return publishedSeries.filter((s) =>
      s.seriesName.toLowerCase().includes(searchLower)
    );
  }, [publishedSeries, search]);

  return (
    <div className="min-h-screen bg-background">
      {/* ✅ CORRIGIDO: Removido activeTab e onChangeTab */}
      <DashboardHeader onOpenAdmin={() => setShowAdmin(true)} />

      <div className="pt-20 px-4 pb-12">
        <div className="container mx-auto">
          <button
            onClick={() => navigate("/")}
            className="text-sm text-primary hover:underline mb-4 flex items-center gap-2"
          >
            ← Voltar
          </button>

          <h1 className="text-3xl font-bold mb-6">Séries</h1>

          {/* Search Bar */}
          {publishedSeries.length > 0 && (
            <div className="mb-6 relative max-w-md">
              <Input
                type="search"
                placeholder="Buscar série..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            </div>
          )}

          {/* Results */}
          {publishedSeries.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground mb-4">
                Nenhuma série publicada ainda.
              </p>
              {isAdmin && (
                <button
                  onClick={() => setShowAdmin(true)}
                  className="text-primary hover:underline"
                >
                  Fazer upload de séries
                </button>
              )}
            </div>
          ) : filteredSeries.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground">
                Nenhuma série encontrada para "{search}"
              </p>
            </div>
          ) : (
            <>
              {search && (
                <p className="text-sm text-muted-foreground mb-4">
                  {filteredSeries.length} série{filteredSeries.length !== 1 ? "s" : ""} encontrada{filteredSeries.length !== 1 ? "s" : ""}
                </p>
              )}
              
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {filteredSeries.map((series, index) => (
                  <SeriesCard
                    key={series.normalizedName}
                    series={series}
                    delay={index * 0.03}
                  />
                ))}
              </div>
            </>
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