// 🎨 DASHBOARD - Interface Principal com Visual Original

import { useState, useMemo } from 'react';
import { useContent } from '@/contexts/ContentContext';
import { useAuth } from '@/contexts/AuthContext';
import FeaturedHero from '@/components/FeaturedHero';
import ContentRow from '@/components/ContentRow';
import SeriesRow from '@/components/SeriesRow';
import DashboardHeader from '@/components/DashboardHeader';
import VideoPlayer from '@/components/VideoPlayer';
import AdminPanel from '@/components/AdminPanel';
import Footer from '@/components/Footer';
import { Loader2 } from 'lucide-react';
import type { Movie } from '@/types/content';

const FALLBACK_IMAGE = '/placeholder.jpg';

const Dashboard = () => {
  const { isAdmin } = useAuth();
  const { publishedMovies, publishedSeries, isLoading } = useContent();

  const [playerMovie, setPlayerMovie] = useState<{
    url: string;
    title: string;
  } | null>(null);

  const [showAdmin, setShowAdmin] = useState(false);

  // 🔁 Adapter: M3UItem → Movie (UI)
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

  const featuredMovie: Movie | null = movies[0] || null;

  const moviesByCategory = useMemo(() => {
    return movies.reduce((acc, movie) => {
      const category = movie.category || 'Sem Categoria';
      if (!acc[category]) acc[category] = [];
      acc[category].push(movie);
      return acc;
    }, {} as Record<string, Movie[]>);
  }, [movies]);

  const handlePlay = (movie: Movie) => {
    setPlayerMovie({
      url: movie.url,
      title: movie.title,
    });
  };

  // 🔄 Loading
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Carregando catálogo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader onOpenAdmin={() => setShowAdmin(true)} />

      {/* 🎬 HERO */}
      <FeaturedHero
        movie={featuredMovie}
        onPlay={() => featuredMovie && handlePlay(featuredMovie)}
      />

      <div className="relative -mt-32 pb-12">
        <div className="container mx-auto">

          {/* 🎬 FILMES */}
          {Object.entries(moviesByCategory).map(([category, movies]) => (
            <ContentRow
              key={category}
              title={category}
              movies={movies.slice(0, 20)}
              onPlay={handlePlay}
              seeAllHref={`/category/${encodeURIComponent(category)}`}
            />
          ))}

          {/* 📺 SÉRIES */}
          {publishedSeries.length > 0 && (
            <SeriesRow
              title="Séries"
              series={publishedSeries.slice(0, 20)}
            />
          )}

          {/* 🚫 VAZIO */}
          {movies.length === 0 && publishedSeries.length === 0 && (
            <div className="py-20 text-center">
              <h2 className="text-2xl font-bold mb-4">
                Nenhum conteúdo disponível
              </h2>
              <p className="text-muted-foreground mb-8">
                {isAdmin
                  ? 'Faça upload de uma playlist para começar'
                  : 'Aguardando conteúdo do administrador'}
              </p>
            </div>
          )}
        </div>
      </div>

      <Footer />

      {/* ▶ Player */}
      {playerMovie && (
        <VideoPlayer
          url={playerMovie.url}
          title={playerMovie.title}
          onClose={() => setPlayerMovie(null)}
        />
      )}

      {/* 🛠 Admin */}
      {showAdmin && isAdmin && (
        <AdminPanel onClose={() => setShowAdmin(false)} />
      )}
    </div>
  );
};

export default Dashboard;
