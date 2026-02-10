import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Play,
  Plus,
  ThumbsUp,
  Volume2,
  VolumeX,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useContent } from "@/contexts/ContentContext";
import { useAuth } from "@/contexts/AuthContext";
import { groupEpisodesByseason } from "@/utils/seriesParser";
import { tmdb } from "@/services/tmdb";

import VideoPlayer from "@/components/VideoPlayer";
import DashboardHeader from "@/components/DashboardHeader";
import AdminPanel from "@/components/AdminPanel";
import Footer from "@/components/Footer";

const SeriesDetails = () => {
  const { seriesName } = useParams<{ seriesName: string }>();
  const navigate = useNavigate();

  const { isAdmin } = useAuth();
  const { publishedSeries, enrichSeries } = useContent();

  const [selectedSeason, setSelectedSeason] = useState(1);
  const [isMuted, setIsMuted] = useState(true);
  const [showAdmin, setShowAdmin] = useState(false);

  const [playerMovie, setPlayerMovie] = useState<{
    url: string;
    title: string;
  } | null>(null);

  const [isLoadingTMDb, setIsLoadingTMDb] = useState(false);

  const decodedSeriesName = decodeURIComponent(seriesName || "");

  const series = publishedSeries.find(
    (s) =>
      s.normalizedName.toLowerCase() === decodedSeriesName.toLowerCase() ||
      s.seriesName.toLowerCase() === decodedSeriesName.toLowerCase()
  );

  // 🎬 TMDB ENRICH
  useEffect(() => {
    if (!series || series.tmdbId || isLoadingTMDb) return;

    const fetchTMDbData = async () => {
      setIsLoadingTMDb(true);
      try {
        const results = await tmdb.searchSeriesWithCache(series.seriesName);
        if (results.length > 0) {
          const data = results[0];
          enrichSeries(series, {
            tmdbId: data.id,
            poster: tmdb.getImageUrl(data.poster_path),
            backdrop: tmdb.getBackdropUrl(data.backdrop_path),
            overview: data.overview,
            firstAirDate: data.first_air_date,
            rating: data.vote_average,
          });
        }
      } catch (err) {
        console.error("Erro TMDb:", err);
      } finally {
        setIsLoadingTMDb(false);
      }
    };

    fetchTMDbData();
  }, [series, enrichSeries, isLoadingTMDb]);

  // ❌ Série não encontrada
  if (!series) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardHeader
          activeTab="series"
          onChangeTab={(tab) => {
            if (tab === "movies") navigate("/movies");
          }}
          onOpenAdmin={() => setShowAdmin(true)}
        />

        <div className="flex min-h-screen items-center justify-center">
          <Button onClick={() => navigate("/series")}>
            Ver todas as séries
          </Button>
        </div>
      </div>
    );
  }

  // 🎞️ Episódios
  const seasonGroups = groupEpisodesByseason(series.episodes);
  const currentSeasonEpisodes =
    seasonGroups.find((s) => s.season === selectedSeason)?.episodes || [];

  const backdropUrl =
    series.backdrop || series.episodes[0]?.image || "";

  const handlePlayEpisode = (episode: any) => {
    if (!episode.url) return;

    setPlayerMovie({
      url: episode.url,
      title: `${series.seriesName} - S${String(
        episode.season
      ).padStart(2, "0")}E${String(episode.episode).padStart(2, "0")}`,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader
        activeTab="series"
        onChangeTab={(tab) => {
          if (tab === "movies") navigate("/movies");
        }}
        onOpenAdmin={() => setShowAdmin(true)}
      />

      {/* 🎬 HERO */}
      <div
        className="relative h-[80vh] bg-cover bg-center"
        style={{ backgroundImage: `url(${backdropUrl})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-background to-transparent" />

        <div className="relative z-10 flex h-full items-end pb-20 px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl"
          >
            <Button
              variant="ghost"
              onClick={() => navigate("/series")}
              className="mb-4 gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </Button>

            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              {series.seriesName}
            </h1>

            <div className="flex gap-3 mb-6">
              <Button
                onClick={() => handlePlayEpisode(series.episodes[0])}
                className="gap-2"
              >
                <Play className="w-5 h-5 fill-current" />
                Assistir
              </Button>

              <Button variant="secondary">
                <Plus />
              </Button>

              <Button variant="secondary">
                <ThumbsUp />
              </Button>
            </div>
          </motion.div>

          <button
            onClick={() => setIsMuted(!isMuted)}
            className="absolute bottom-32 right-6"
          >
            {isMuted ? <VolumeX /> : <Volume2 />}
          </button>
        </div>
      </div>

      {/* 📺 EPISÓDIOS */}
      <div className="container mx-auto px-4 py-10">
        <div className="flex justify-between mb-6">
          <h2 className="text-2xl font-bold">Episódios</h2>

          <Select
            value={String(selectedSeason)}
            onValueChange={(v) => setSelectedSeason(Number(v))}
          >
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {seasonGroups.map((s) => (
                <SelectItem key={s.season} value={String(s.season)}>
                  Temporada {s.season}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3">
          {currentSeasonEpisodes.map((ep) => (
            <div
              key={ep.id}
              onClick={() => handlePlayEpisode(ep)}
              className="flex gap-4 bg-secondary/30 p-3 rounded-lg cursor-pointer hover:bg-secondary/50"
            >
              <img
                src={ep.image || backdropUrl}
                className="w-40 h-24 object-cover rounded"
              />
              <div>
                <h3 className="font-semibold">
                  {ep.episode}. {ep.episodeTitle || "Episódio"}
                </h3>
                <p className="text-sm text-muted-foreground">
                  Temporada {ep.season}
                </p>
              </div>
            </div>
          ))}
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

export default SeriesDetails;
