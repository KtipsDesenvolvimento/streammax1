// 🔥 CONTENT CONTEXT - Sistema COMPLETO de Gerenciamento de Conteúdo
// Este arquivo gerencia filmes, séries e persistência no Firebase

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
  useMemo,
  useEffect,
  useRef,
} from "react";
import { groupEpisodesBySeries, type GroupedSeries } from "@/utils/seriesParser";
import { UploadHistoryManager, dateUtils } from "@/hooks/usePersistence";
import { FirebaseBackend } from "@/services/firebase-backend";

export interface M3UItem {
  id: string;
  title: string;
  image?: string;
  category: string;
  url: string;
  source?: string; // 'movie' ou 'series'
}

export interface EnrichedSeries extends GroupedSeries {
  tmdbId?: number;
  poster?: string;
  backdrop?: string;
  overview?: string;
  firstAirDate?: string;
  rating?: number;
}

export interface ContentMetadata {
  lastUpdated: string;
  totalMovies: number;
  totalSeries: number;
  totalEpisodes: number;
}

interface ContentContextType {
  previewContent: M3UItem[];
  publishedContent: M3UItem[];
  previewMovies: M3UItem[];
  publishedMovies: M3UItem[];
  previewSeries: EnrichedSeries[];
  publishedSeries: EnrichedSeries[];
  metadata: ContentMetadata;
  setPreviewContent: React.Dispatch<React.SetStateAction<M3UItem[]>>;
  publishContent: () => void;
  hasUnpublished: boolean;
  enrichSeries: (series: GroupedSeries, tmdbData: any) => void;
  clearAllData: () => void;
  clearPreview: () => void;
  getUploadHistory: () => Promise<any[]>;
  isAutoSaving: boolean;
  lastSaved: string | null;
  isLoading: boolean;
}

const ContentContext = createContext<ContentContextType | null>(null);

export const ContentProvider = ({ children }: { children: ReactNode }) => {
  // Estados principais
  const [previewContent, setPreviewContent] = useState<M3UItem[]>([]);
  const [publishedContent, setPublishedContent] = useState<M3UItem[]>([]);
  const [enrichedSeriesData, setEnrichedSeriesData] = useState<Record<string, any>>({});
  const [metadata, setMetadata] = useState<ContentMetadata>({
    lastUpdated: new Date().toISOString(),
    totalMovies: 0,
    totalSeries: 0,
    totalEpisodes: 0,
  });

  // Estado de controle
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const initialLoadDone = useRef(false);
  const isLoadingData = useRef(true);

  // 🔥 CARREGAR DADOS DO FIREBASE - PRIMEIRA CARGA
  useEffect(() => {
    if (initialLoadDone.current) {
      console.log("⏭️ [CONTEXT] Carregamento inicial já feito, pulando...");
      return;
    }
    
    const loadData = async () => {
      isLoadingData.current = true;
      setIsLoading(true);
      console.log("📥 [CONTEXT] ========== INICIANDO CARREGAMENTO ==========");
      
      try {
        // Carregar todos os dados em paralelo
        const [content, seriesData, meta] = await Promise.all([
          FirebaseBackend.loadPublishedContent(),
          FirebaseBackend.loadEnrichedSeriesData(),
          FirebaseBackend.loadMetadata()
        ]);

        console.log("📥 [CONTEXT] Dados recebidos:");
        console.log("  📦 Conteúdo:", content?.length || 0, "itens");
        console.log("  📺 Séries TMDb:", Object.keys(seriesData || {}).length);
        console.log("  📊 Metadata:", meta);

        // ✅ APLICAR CONTEÚDO PUBLICADO
        if (content && Array.isArray(content)) {
          if (content.length > 0) {
            console.log("✅ [CONTEXT] Aplicando conteúdo ao estado:");
            console.log("  🎬 Filmes:", content.filter(i => i.source === 'movie').length);
            console.log("  📺 Episódios:", content.filter(i => i.source === 'series').length);
            console.log("  📌 Primeiro item:", content[0]);
            
            setPublishedContent(content);
          } else {
            console.log("ℹ️ [CONTEXT] Array vazio - primeira vez sem dados");
            setPublishedContent([]);
          }
        } else {
          console.warn("⚠️ [CONTEXT] Dados não são um array válido!");
          setPublishedContent([]);
        }
        
        // Aplicar dados de séries
        if (seriesData && Object.keys(seriesData).length > 0) {
          setEnrichedSeriesData(seriesData);
        }
        
        // Aplicar metadata
        if (meta) {
          setMetadata(meta);
        }
        
        initialLoadDone.current = true;
        console.log("✅ [CONTEXT] ========== CARREGAMENTO CONCLUÍDO ==========");
        
      } catch (error) {
        console.error("❌ [CONTEXT] Erro ao carregar:", error);
        setPublishedContent([]);
      } finally {
        setIsLoading(false);
        isLoadingData.current = false;
      }
    };

    loadData();
  }, []);

  // Separar filmes do preview
  const previewMovies = useMemo(
    () => previewContent.filter((item) => item.source === "movie"),
    [previewContent]
  );

  // Separar filmes publicados
  const publishedMovies = useMemo(() => {
    const movies = publishedContent.filter((item) => item.source === "movie");
    console.log("🎬 [CONTEXT] Filmes publicados:", movies.length);
    return movies;
  }, [publishedContent]);

  // Agrupar séries do preview
  const previewSeries = useMemo(() => {
    const seriesItems = previewContent.filter((item) => item.source === "series");
    const grouped = groupEpisodesBySeries(seriesItems);
    
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
    
    console.log("📺 [CONTEXT] Séries publicadas:", grouped.length);
    
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

  // 🔥 SALVAR NO FIREBASE QUANDO PUBLICAR
  useEffect(() => {
    // Não salvar durante carregamento inicial
    if (isLoadingData.current || !initialLoadDone.current) {
      console.log("⏭️ [CONTEXT] Ignorando save - carregamento inicial");
      return;
    }
    
    // Não salvar se vazio (exceto se for limpeza intencional)
    if (publishedContent.length === 0) {
      console.log("⏭️ [CONTEXT] Conteúdo vazio, não salvando");
      return;
    }

    const saveData = async () => {
      console.log("💾 [CONTEXT] Iniciando save automático...");
      console.log("💾 [CONTEXT] Total de itens:", publishedContent.length);
      setIsAutoSaving(true);
      
      try {
        const success = await FirebaseBackend.savePublishedContent(publishedContent);
        
        if (success) {
          setLastSaved(dateUtils.format(new Date()));
          console.log("✅ [CONTEXT] Save automático concluído!");
        } else {
          console.error("❌ [CONTEXT] Falha no save automático");
        }
      } catch (error) {
        console.error("❌ [CONTEXT] Erro ao salvar:", error);
      } finally {
        setTimeout(() => setIsAutoSaving(false), 500);
      }
    };
    
    saveData();
  }, [publishedContent]);

  // 🔥 SALVAR DADOS DE SÉRIES
  useEffect(() => {
    if (isLoadingData.current || !initialLoadDone.current) return;
    if (Object.keys(enrichedSeriesData).length === 0) return;

    const saveData = async () => {
      try {
        await FirebaseBackend.saveEnrichedSeriesData(enrichedSeriesData);
        console.log("✅ [CONTEXT] Dados de séries salvos");
      } catch (error) {
        console.error("❌ [CONTEXT] Erro ao salvar dados de séries");
      }
    };
    
    const timeout = setTimeout(saveData, 1000);
    return () => clearTimeout(timeout);
  }, [enrichedSeriesData]);

  // Atualizar metadata
  useEffect(() => {
    const totalEpisodesPublished = publishedSeries.reduce(
      (sum, series) => sum + series.totalEpisodes,
      0
    );

    const newMetadata = {
      lastUpdated: new Date().toISOString(),
      totalMovies: publishedMovies.length,
      totalSeries: publishedSeries.length,
      totalEpisodes: totalEpisodesPublished,
    };
    
    setMetadata(newMetadata);
    
    if (!isLoadingData.current && initialLoadDone.current && publishedContent.length > 0) {
      FirebaseBackend.saveMetadata(newMetadata);
    }
  }, [publishedMovies, publishedSeries, publishedContent.length]);

  // Enriquecer série com TMDb
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
    []
  );

  // Publicar conteúdo
  const publishContent = useCallback(() => {
    console.log("📤 [CONTEXT] Publicando conteúdo...");
    console.log("📤 [CONTEXT] Preview tem", previewContent.length, "itens");
    setIsAutoSaving(true);
    
    setPublishedContent((current) => {
      const currentIds = new Set(current.map(item => item.id));
      const newItems = previewContent.filter(item => !currentIds.has(item.id));
      const merged = [...current, ...newItems];
      
      console.log("📤 [CONTEXT] Total após merge:", merged.length);
      console.log("📤 [CONTEXT] Novos itens:", newItems.length);
      
      return merged;
    });

    UploadHistoryManager.addUpload({
      uploadedAt: new Date().toISOString(),
      totalItems: previewContent.length,
      type: previewContent.some((i) => i.source === "series") ? "series" : "movie",
      fileName: "M3U Upload",
    });

    setLastSaved(dateUtils.format(new Date()));
    setTimeout(() => setIsAutoSaving(false), 500);
  }, [previewContent]);

  // Limpar preview
  const clearPreview = useCallback(() => {
    setPreviewContent([]);
  }, []);

  // Limpar todos os dados
  const clearAllData = useCallback(async () => {
    console.log("🗑️ [CONTEXT] Limpando todos os dados...");
    
    setPreviewContent([]);
    setPublishedContent([]);
    setEnrichedSeriesData({});
    setMetadata({
      lastUpdated: new Date().toISOString(),
      totalMovies: 0,
      totalSeries: 0,
      totalEpisodes: 0,
    });
    
    try {
      await FirebaseBackend.clearAllData();
      console.log("✅ [CONTEXT] Dados limpos no Firebase");
    } catch (error) {
      console.error("❌ [CONTEXT] Erro ao limpar Firebase");
    }
  }, []);

  // Histórico
  const getUploadHistory = useCallback(async () => {
    return UploadHistoryManager.getHistory();
  }, []);

  // Verificar se há não publicados
  const hasUnpublished = useMemo(() => {
    const publishedIds = new Set(publishedContent.map(i => i.id));
    return previewContent.some(item => !publishedIds.has(item.id));
  }, [previewContent, publishedContent]);

  // Log para debug
  useEffect(() => {
    console.log("📊 [CONTEXT] Estado atual:");
    console.log("  🎬 Filmes publicados:", publishedMovies.length);
    console.log("  📺 Séries publicadas:", publishedSeries.length);
    console.log("  📦 Total publicado:", publishedContent.length);
  }, [publishedMovies.length, publishedSeries.length, publishedContent.length]);

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
        isLoading,
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