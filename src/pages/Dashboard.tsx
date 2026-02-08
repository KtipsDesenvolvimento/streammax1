// 🎨 DASHBOARD - Interface Principal com Visual Original

import { useState, useEffect } from 'react';
import { useContent } from '@/contexts/ContentContext';
import { useAuth } from '@/contexts/AuthContext';
import FeaturedHero from '@/components/FeaturedHero';
import ContentRow from '@/components/ContentRow';
import SeriesRow from '@/components/SeriesRow';
import DashboardHeader from '@/components/DashboardHeader';
import VideoPlayer from '@/components/VideoPlayer';
import AdminPanel from '@/components/AdminPanel';
import Footer from '@/components/Footer';
import { groupEpisodesBySeries } from '@/utils/seriesParser';
import { Loader2 } from 'lucide-react';

const Dashboard = () => {
  const { isAdmin } = useAuth();
  const {
    publishedMovies,
    publishedSeries,
    loadingIndex,
    selectGrupo,
    currentGrupo,
  } = useContent();

  const [playerMovie, setPlayerMovie] = useState<{
    url: string;
    title: string;
  } | null>(null);
  const [showAdmin, setShowAdmin] = useState(false);

  // 🎯 Auto-carregar conteúdo inicial
  useEffect(() => {
    if (!currentGrupo) {
      // Carregar automaticamente filmes primeiro
      selectGrupo('filmes');
      
      // Depois carregar séries em background
      setTimeout(() => {
        selectGrupo('series');
      }, 1000);
    }
  }, [currentGrupo, selectGrupo]);

  // 📊 Organizar conteúdo
  const featuredMovie = publishedMovies[0] || null;
  
  // Agrupar filmes por categoria - garantir que tem url
  const moviesByCategory = publishedMovies
    .filter(movie => movie.url) // Só filmes com URL válida
    .reduce((acc, movie) => {
      const category = movie.category || 'Sem Categoria';
      if (!acc[category]) acc[category] = [];
      acc[category].push(movie);
      return acc;
    }, {} as Record<string, typeof publishedMovies>);

  // Agrupar séries
  const groupedSeries = groupEpisodesBySeries(publishedSeries);

  // 🎬 Handlers
  const handlePlay = (movie: { url: string; title: string }) => {
    setPlayerMovie(movie);
  };

  // 🔄 Loading State
  if (loadingIndex) {
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

      {/* Hero Section - Filme em Destaque */}
      <FeaturedHero 
        movie={featuredMovie}
        onPlay={() => featuredMovie && handlePlay({
          url: featuredMovie.url,
          title: featuredMovie.title
        })}
      />

      {/* Conteúdo Principal */}
      <div className="relative -mt-32 pb-12">
        <div className="container mx-auto">
          
          {/* 🎬 FILMES POR CATEGORIA */}
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
          {groupedSeries.length > 0 && (
            <SeriesRow
              title="Séries"
              series={groupedSeries.slice(0, 20).map(s => ({
                ...s,
                poster: s.episodes[0]?.image || '',
                backdrop: s.episodes[0]?.image || '',
                overview: '',
                firstAirDate: '',
                rating: 0,
                tmdbId: null
              }))}
            />
          )}

          {/* Estado vazio */}
          {publishedMovies.length === 0 && groupedSeries.length === 0 && (
            <div className="py-20 text-center">
              <h2 className="text-2xl font-bold mb-4">Nenhum conteúdo disponível</h2>
              <p className="text-muted-foreground mb-8">
                {isAdmin 
                  ? "Faça upload de uma playlist para começar" 
                  : "Aguardando conteúdo do administrador"}
              </p>
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