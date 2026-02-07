// --- INÍCIO: src/contexts/ContentContext.tsx ---
import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
  useMemo,
  useEffect,
} from "react";
import { groupEpisodesBySeries, type GroupedSeries } from "@/utils/seriesParser";
import { usePersistedState, UploadHistoryManager, dateUtils } from "@/hooks/usePersistence";

export interface M3UItem {
  id: string;
  title: string;
  image?: string;
  category: string;
  url: string;
  source?: string; // 'movie' ou 'series'
}

// Nova interface para série enriquecida com dados do TMDb
export interface EnrichedSeries extends GroupedSeries {
  tmdbId?: number;
  poster?: string;
  backdrop?: string;
  overview?: string;
  firstAirDate?: string;
  rating?: number;
}

// Metadata sobre o conteúdo
export interface ContentMetadata {
  lastUpdated: string;
  totalMovies: number;
  totalSeries: number;
  totalEpisodes: number;
}

interface ContentContextType {
  // Conteúdo bruto
  previewContent: M3UItem[];
  publishedContent: M3UItem[];
  
  // Filmes separados
  previewMovies: M3UItem[];
  publishedMovies: M3UItem[];
  
  // Séries organizadas
  previewSeries: EnrichedSeries[];
  publishedSeries: EnrichedSeries[];
  
  // Metadata
  metadata: ContentMetadata;
  
  // Funções
  setPreviewContent: React.Dispatch<React.SetStateAction<M3UItem[]>>;
  publishContent: () => void;
  hasUnpublished: boolean;
  
  // Enriquecer séries com dados do TMDb
  enrichSeries: (series: GroupedSeries, tmdbData: any) => void;
  
  // Limpar dados
  clearAllData: () => void;
  clearPreview: () => void;
  
  // Histórico
  getUploadHistory: () => Promise<any[]>;
  
  // Auto-save status
  isAutoSaving: boolean;
  lastSaved: string | null;
}

const ContentContext = createContext<ContentContextType | null>(null);

// Chaves de persistência
const KEYS = {
  PREVIEW: "streammax_preview_content",
  PUBLISHED: "streammax_published_content",
  SERIES_DATA: "streammax_enriched_series",
  METADATA: "streammax_metadata",
};

export const ContentProvider = ({ children }: { children: ReactNode }) => {
  // Estados com persistência automática
  const [previewContent, setPreviewContent] = usePersistedState<M3UItem[]>(
    KEYS.PREVIEW,
    []
  );

  const [publishedContent, setPublishedContent] = usePersistedState<M3UItem[]>(
    KEYS.PUBLISHED,
    []
  );

  const [enrichedSeriesData, setEnrichedSeriesData] = usePersistedState<Record<string, any>>(
    KEYS.SERIES_DATA,
    {}
  );

  const [metadata, setMetadata] = usePersistedState<ContentMetadata>(
    KEYS.METADATA,
    {
      lastUpdated: new Date().toISOString(),
      totalMovies: 0,
      totalSeries: 0,
      totalEpisodes: 0,
    }
  );

  // Estado de auto-save
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);

  // Separar filmes do preview
  const previewMovies = useMemo(
    () => previewContent.filter((item) => item.source === "movie"),
    [previewContent]
  );

  // Separar filmes publicados
  const publishedMovies = useMemo(
    () => publishedContent.filter((item) => item.source === "movie"),
    [publishedContent]
  );

  // Agrupar séries do preview
  const previewSeries = useMemo(() => {
    const seriesItems = previewContent.filter((item) => item.source === "series");
    const grouped = groupEpisodesBySeries(seriesItems);
    
    // Enriquecer com dados do TMDb salvos
    return grouped.map((series) => {
      const tmdbData = enrichedSeriesData[series.normalizedName];
      return {
        ...series,
        tmdbId: tmdbData?.tmdbId,
        poster: tmdbData?.poster,
        backdrop: tmdbData?.backdrop,
        overview: tmdbData?.overview,
        firstAirDate: tmdbData?.firstAirDate,
        rating: tmdbData?.rating,
      };
    });
  }, [previewContent, enrichedSeriesData]);

  // Agrupar séries publicadas
  const publishedSeries = useMemo(() => {
    const seriesItems = publishedContent.filter((item) => item.source === "series");
    const grouped = groupEpisodesBySeries(seriesItems);
    
    // Enriquecer com dados do TMDb salvos
    return grouped.map((series) => {
      const tmdbData = enrichedSeriesData[series.normalizedName];
      return {
        ...series,
        tmdbId: tmdbData?.tmdbId,
        poster: tmdbData?.poster,
        backdrop: tmdbData?.backdrop,
        overview: tmdbData?.overview,
        firstAirDate: tmdbData?.firstAirDate,
        rating: tmdbData?.rating,
      };
    });
  }, [publishedContent, enrichedSeriesData]);

  // Atualizar metadata quando conteúdo mudar
  useEffect(() => {
    const totalEpisodesPreview = previewSeries.reduce(
      (sum, series) => sum + series.totalEpisodes,
      0
    );

    const totalEpisodesPublished = publishedSeries.reduce(
      (sum, series) => sum + series.totalEpisodes,
      0
    );

    setMetadata({
      lastUpdated: new Date().toISOString(),
      totalMovies: publishedMovies.length,
      totalSeries: publishedSeries.length,
      totalEpisodes: totalEpisodesPublished,
    });
  }, [publishedMovies, publishedSeries, setMetadata]);

  // Enriquecer série com dados do TMDb
  const enrichSeries = useCallback(
    (series: GroupedSeries, tmdbData: any) => {
      setIsAutoSaving(true);
      
      setEnrichedSeriesData((prev) => ({
        ...prev,
        [series.normalizedName]: tmdbData,
      }));

      setLastSaved(dateUtils.format(new Date()));
      
      setTimeout(() => setIsAutoSaving(false), 500);
    },
    [setEnrichedSeriesData]
  );

  // Publicar conteúdo
  const publishContent = useCallback(() => {
    setIsAutoSaving(true);
    
    // Mescla preview com publicado, evitando duplicatas
    setPublishedContent((current) => {
      const currentIds = new Set(current.map(item => item.id));
      const newItems = previewContent.filter(item => !currentIds.has(item.id));
      return [...current, ...newItems];
    });

    // Adicionar ao histórico
    UploadHistoryManager.addUpload({
      uploadedAt: new Date().toISOString(),
      totalItems: previewContent.length,
      type: previewContent.some((i) => i.source === "series") ? "series" : "movie",
      fileName: "M3U Upload",
    });

    setLastSaved(dateUtils.format(new Date()));
    setTimeout(() => setIsAutoSaving(false), 500);
  }, [previewContent, setPublishedContent]);

  // Limpar apenas preview
  const clearPreview = useCallback(() => {
    setPreviewContent([]);
  }, [setPreviewContent]);

  // Limpar todos os dados
  const clearAllData = useCallback(() => {
    setPreviewContent([]);
    setPublishedContent([]);
    setEnrichedSeriesData({});
    setMetadata({
      lastUpdated: new Date().toISOString(),
      totalMovies: 0,
      totalSeries: 0,
      totalEpisodes: 0,
    });
  }, [setPreviewContent, setPublishedContent, setEnrichedSeriesData, setMetadata]);

  // Obter histórico de uploads
  const getUploadHistory = useCallback(async () => {
    return UploadHistoryManager.getHistory();
  }, []);

  // Verificar se há conteúdo não publicado
  const hasUnpublished = useMemo(() => {
    const publishedIds = new Set(publishedContent.map(i => i.id));
    return previewContent.some(item => !publishedIds.has(item.id));
  }, [previewContent, publishedContent]);

  // Log de inicialização (debug)
  useEffect(() => {
    console.log("📦 ContentContext inicializado com persistência");
    console.log("📊 Dados carregados:", {
      preview: previewContent.length,
      published: publishedContent.length,
      series: Object.keys(enrichedSeriesData).length,
    });
  }, []);

  return (
    <ContentContext.Provider
      value={{
        previewContent,
        publishedContent,
        previewMovies,
        publishedMovies,
        previewSeries,
        publishedSeries,
        metadata,
        setPreviewContent,
        publishContent,
        hasUnpublished,
        enrichSeries,
        clearAllData,
        clearPreview,
        getUploadHistory,
        isAutoSaving,
        lastSaved,
      }}
    >
      {children}
    </ContentContext.Provider>
  );
};

export const useContent = () => {
  const context = useContext(ContentContext);
  if (!context) {
    throw new Error("useContent must be used within ContentProvider");
  }
  return context;
};
// --- FIM: src/contexts/ContentContext.tsx ---