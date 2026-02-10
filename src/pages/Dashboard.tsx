import { useState, useMemo } from "react";
import { useContent } from "@/contexts/ContentContext";
import { useAuth } from "@/contexts/AuthContext";
import FeaturedHero from "@/components/FeaturedHero";
import ContentRow from "@/components/ContentRow";
import SeriesRow from "@/components/SeriesRow";
import DashboardHeader from "@/components/DashboardHeader";
import VideoPlayer from "@/components/VideoPlayer";
import AdminPanel from "@/components/AdminPanel";
import Footer from "@/components/Footer";
import { Loader2 } from "lucide-react";
import type { Movie } from "@/types/content";

const FALLBACK_IMAGE = "/placeholder.jpg";

const Dashboard = () => {
  const { isAdmin } = useAuth();
  const { publishedMovies, publishedSeries, isLoading } = useContent();

  const [showAdmin, setShowAdmin] = useState(false);
  const [playerMovie, setPlayerMovie] = useState<{
    url: string;
    title: string;
  } | null>(null);

  const movies: Movie[] = useMemo(
    () =>
      publishedMovies.map((item) => ({
        id: item.id,
        title: item.title,
        image: item.image || FALLBACK_IMAGE,
        url: item.url,
        category: item.category,
      })),
    [publishedMovies]
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin w-10 h-10 text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader
        onOpenAdmin={(e?: React.MouseEvent) => {
          e?.stopPropagation();
          setShowAdmin(true);
        }}
      />

      <FeaturedHero
        movie={movies[0] || null}
        onPlay={() =>
          movies[0] &&
          setPlayerMovie({ url: movies[0].url, title: movies[0].title })
        }
      />

      <div className="container mx-auto">
        {movies.map((movie) => (
          <ContentRow
            key={movie.id}
            title={movie.category}
            movies={[movie]}
            onPlay={() =>
              setPlayerMovie({ url: movie.url, title: movie.title })
            }
          />
        ))}

        {publishedSeries.length > 0 && (
          <SeriesRow title="Séries" series={publishedSeries} />
        )}
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

export default Dashboard;
