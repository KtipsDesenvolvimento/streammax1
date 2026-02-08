// 🎯 Tipos compartilhados do sistema

/**
 * Item básico de conteúdo (M3U)
 */
export interface M3UItem {
  id: string;
  title: string;
  image: string;
  category: string;
  url: string;
  source: 'movie' | 'series';
}

/**
 * Filme para exibição
 */
export interface Movie {
  id: string;
  title: string;
  image: string;
  url: string;
  category?: string;
  year?: string;
  duration?: string;
  rating?: string;
}

/**
 * Episódio parseado
 */
export interface ParsedEpisode {
  seriesName: string;
  season: number;
  episode: number;
  episodeTitle?: string;
  originalTitle: string;
  url: string;
  image?: string;
  id: string;
}

/**
 * Série agrupada
 */
export interface GroupedSeries {
  seriesName: string;
  normalizedName: string;
  episodes: ParsedEpisode[];
  totalSeasons: number;
  totalEpisodes: number;
}

/**
 * Série enriquecida (com dados do TMDb)
 */
export interface EnrichedSeries extends GroupedSeries {
  tmdbId: number | null;
  poster: string;
  backdrop: string;
  overview: string;
  firstAirDate: string;
  rating: number;
}

/**
 * Props do player de vídeo
 */
export interface VideoPlayerProps {
  url: string;
  title: string;
  onClose: () => void;
}

/**
 * Metadados do conteúdo
 */
export interface ContentMetadata {
  totalMovies: number;
  totalSeries: number;
  totalEpisodes: number;
  lastUpdated: string;
}