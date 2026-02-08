// 🎛️ ADMIN PANEL MELHORADO - Com Carregamento Automático + Upload Manual
// Este painel oferece DUAS formas de carregar conteúdo:
// 1. 🔄 Carregamento automático de arquivo fixo (playlist.m3u na pasta public)
// 2. 📤 Upload manual de arquivo

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  X,
  Film,
  Tv,
  Shield,
  Send,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Trash2,
  List,
  Download,
  RefreshCw,
  Link as LinkIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useContent, M3UItem } from "@/contexts/ContentContext";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Progress } from "@/components/ui/progress";
import { AutoPlaylistLoader } from "@/services/AutoPlaylistLoader";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

type UploadType = "movie" | "series";

interface AdminPanelProps {
  onClose: () => void;
}

interface UploadProgress {
  status: "idle" | "processing" | "done" | "error";
  message: string;
  progress: number;
  total: number;
  itemsLoaded: number;
}

const MAX_PREVIEW_ITEMS = 50_000;

const AdminPanel = ({ onClose }: AdminPanelProps) => {
  const { isAdmin } = useAuth();
  const {
    previewContent,
    setPreviewContent,
    publishContent,
    hasUnpublished,
    publishedContent,
  } = useContent();
  const { toast } = useToast();

  const workerRef = useRef<Worker | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [uploadType, setUploadType] = useState<UploadType>("movie");
  const [externalUrl, setExternalUrl] = useState("");
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({
    status: "idle",
    message: "",
    progress: 0,
    total: 0,
    itemsLoaded: 0,
  });

  // 🔐 Segurança
  useEffect(() => {
    if (!isAdmin) {
      toast({
        title: "Acesso Negado",
        description: "Você não tem permissão para acessar esta área",
        variant: "destructive",
      });
      onClose();
    }
  }, [isAdmin, onClose, toast]);

  // 🚀 Worker para upload manual
  useEffect(() => {
    workerRef.current = new Worker("/m3u-parser.worker.js");

    workerRef.current.onmessage = (e) => {
      const { status, items, message, progress, total, totalItems } = e.data;

      if (status === "progress") {
        setUploadProgress({
          status: "processing",
          message: message || "Processando...",
          progress: progress || 0,
          total: total || 0,
          itemsLoaded: 0,
        });
      }

      if (status === "batch") {
        setPreviewContent((current: M3UItem[]) => {
          const newItems = items.filter(
            (item: M3UItem) => !current.some((i) => i.id === item.id)
          );
          const merged = [...current, ...newItems];

          if (merged.length > MAX_PREVIEW_ITEMS) {
            return merged.slice(merged.length - MAX_PREVIEW_ITEMS);
          }

          return merged;
        });

        setUploadProgress((prev) => ({
          ...prev,
          status: "processing",
          message: `Carregando itens... ${(
            prev.itemsLoaded + items.length
          ).toLocaleString()}`,
          progress: progress || prev.progress,
          total: total || prev.total,
          itemsLoaded: prev.itemsLoaded + items.length,
        }));
      }

      if (status === "done") {
        setUploadProgress({
          status: "done",
          message:
            message ||
            `✅ ${(totalItems || 0).toLocaleString()} itens carregados!`,
          progress: total || 100,
          total: total || 100,
          itemsLoaded: totalItems || 0,
        });

        toast({
          title: "Upload concluído!",
          description: message,
        });

        setTimeout(() => {
          setUploadProgress({
            status: "idle",
            message: "",
            progress: 0,
            total: 0,
            itemsLoaded: 0,
          });
        }, 3000);
      }

      if (status === "error") {
        setUploadProgress({
          status: "error",
          message: message || "Erro ao processar arquivo",
          progress: 0,
          total: 0,
          itemsLoaded: 0,
        });

        toast({
          title: "Erro no upload",
          description: message,
          variant: "destructive",
        });
      }
    };

    return () => workerRef.current?.terminate();
  }, [setPreviewContent, toast]);

  // 📤 Upload manual
  const handleManualUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !workerRef.current) return;

    const isLargeScale = uploadType === "series";

    setUploadProgress({
      status: "processing",
      message: isLargeScale
        ? "Série detectada — processando em grande escala..."
        : "Iniciando upload...",
      progress: 0,
      total: 0,
      itemsLoaded: 0,
    });

    workerRef.current.postMessage({
      file,
      type: uploadType,
      largeScale: isLargeScale,
    });

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // 🔄 Carregamento automático de arquivo fixo
  const handleAutoLoad = async () => {
    setUploadProgress({
      status: "processing",
      message: "🔄 Procurando arquivo fixo (playlist.m3u, .txt, .zip)...",
      progress: 0,
      total: 0,
      itemsLoaded: 0,
    });

    try {
      const result = await AutoPlaylistLoader.loadAutoPlaylist();

      if (!result) {
        setUploadProgress({
          status: "error",
          message: "❌ Nenhum arquivo fixo encontrado na pasta public/",
          progress: 0,
          total: 0,
          itemsLoaded: 0,
        });

        toast({
          title: "Arquivo não encontrado",
          description: "Coloque um arquivo 'playlist.m3u' na pasta 'public/'",
          variant: "destructive",
        });

        setTimeout(() => {
          setUploadProgress({
            status: "idle",
            message: "",
            progress: 0,
            total: 0,
            itemsLoaded: 0,
          });
        }, 3000);

        return;
      }

      // Adicionar ao preview
      setPreviewContent((current) => {
        const newItems = result.content.filter(
          (item) => !current.some((i) => i.id === item.id)
        );
        return [...current, ...newItems];
      });

      setUploadProgress({
        status: "done",
        message: `✅ ${result.content.length.toLocaleString()} itens carregados de ${result.source}`,
        progress: 100,
        total: 100,
        itemsLoaded: result.content.length,
      });

      toast({
        title: "Carregamento automático concluído!",
        description: `${result.content.length} itens carregados`,
      });

      setTimeout(() => {
        setUploadProgress({
          status: "idle",
          message: "",
          progress: 0,
          total: 0,
          itemsLoaded: 0,
        });
      }, 3000);

    } catch (error: any) {
      setUploadProgress({
        status: "error",
        message: `❌ Erro: ${error.message}`,
        progress: 0,
        total: 0,
        itemsLoaded: 0,
      });

      toast({
        title: "Erro no carregamento",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // 🌐 Carregar de URL externa
  const handleExternalUrl = async () => {
    if (!externalUrl.trim()) {
      toast({
        title: "URL vazia",
        description: "Digite uma URL válida",
        variant: "destructive",
      });
      return;
    }

    setUploadProgress({
      status: "processing",
      message: `🌐 Baixando de: ${externalUrl}`,
      progress: 0,
      total: 0,
      itemsLoaded: 0,
    });

    try {
      const result = await AutoPlaylistLoader.loadFromExternalUrl(externalUrl);

      if (!result) {
        throw new Error("Erro ao carregar URL");
      }

      setPreviewContent((current) => {
        const newItems = result.content.filter(
          (item) => !current.some((i) => i.id === item.id)
        );
        return [...current, ...newItems];
      });

      setUploadProgress({
        status: "done",
        message: `✅ ${result.content.length.toLocaleString()} itens carregados`,
        progress: 100,
        total: 100,
        itemsLoaded: result.content.length,
      });

      toast({
        title: "URL carregada!",
        description: `${result.content.length} itens carregados`,
      });

      setTimeout(() => {
        setUploadProgress({
          status: "idle",
          message: "",
          progress: 0,
          total: 0,
          itemsLoaded: 0,
        });
        setExternalUrl("");
      }, 3000);

    } catch (error: any) {
      setUploadProgress({
        status: "error",
        message: `❌ ${error.message}`,
        progress: 0,
        total: 0,
        itemsLoaded: 0,
      });

      toast({
        title: "Erro ao carregar URL",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleClearPreview = () => {
    if (confirm("Tem certeza que deseja limpar todos os itens não publicados?")) {
      setPreviewContent([]);
      toast({
        title: "Preview limpo",
        description: "Todos os itens não publicados foram removidos",
      });
    }
  };

  const handlePublish = () => {
    publishContent();
    toast({
      title: "Publicado!",
      description: "Conteúdo publicado com sucesso",
    });
  };

  // Estatísticas
  const totalPreview = previewContent.length;
  const totalPublished = publishedContent.length;
  const totalUnpublished = previewContent.filter(
    (item) => !publishedContent.some((p) => p.id === item.id)
  ).length;

  const moviesInPreview = previewContent.filter((i) => i.source === "movie").length;
  const seriesInPreview = previewContent.filter((i) => i.source === "series").length;

  const progressPercentage =
    uploadProgress.total > 0
      ? Math.floor((uploadProgress.progress / uploadProgress.total) * 100)
      : 0;

  if (!isAdmin) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-start justify-center overflow-y-auto p-4"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", duration: 0.5 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-background border border-border rounded-2xl shadow-2xl w-full max-w-4xl my-8"
        >
          {/* HEADER */}
          <div className="sticky top-0 bg-background/95 backdrop-blur-sm border-b border-border rounded-t-2xl p-6 flex justify-between items-center z-10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-yellow-500" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Painel Administrativo</h2>
                <p className="text-sm text-muted-foreground">
                  Carregamento Automático + Upload Manual
                </p>
              </div>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="hover:bg-destructive/10 hover:text-destructive"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* CONTEÚDO */}
          <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
            {/* PROGRESSO */}
            {uploadProgress.status !== "idle" && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-secondary/30 rounded-lg p-6 border-2 border-primary/20"
              >
                <div className="flex items-center gap-3 mb-4">
                  {uploadProgress.status === "processing" && (
                    <Loader2 className="w-5 h-5 text-primary animate-spin" />
                  )}
                  {uploadProgress.status === "done" && (
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  )}
                  {uploadProgress.status === "error" && (
                    <AlertCircle className="w-5 h-5 text-red-500" />
                  )}
                  <span className="font-semibold">{uploadProgress.message}</span>
                </div>

                {uploadProgress.status === "processing" && (
                  <>
                    <Progress value={progressPercentage} className="mb-2" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>
                        {uploadProgress.itemsLoaded.toLocaleString()} itens carregados
                      </span>
                      <span>{progressPercentage}%</span>
                    </div>
                  </>
                )}
              </motion.div>
            )}

            {/* ESTATÍSTICAS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-secondary/30 rounded-lg p-6 space-y-3">
                <div className="flex justify-between">
                  <h3 className="font-semibold flex items-center gap-2">
                    <List className="w-4 h-4" />
                    Preview
                  </h3>
                  {totalPreview > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleClearPreview}
                      className="text-red-500"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Limpar
                    </Button>
                  )}
                </div>
                <div className="text-sm space-y-2">
                  <div className="flex justify-between">
                    <span>Filmes</span>
                    <span className="font-bold">{moviesInPreview.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Séries</span>
                    <span className="font-bold">{seriesInPreview.toLocaleString()}</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between font-semibold">
                    <span>Total</span>
                    <span className="text-yellow-500">
                      {totalPreview.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-secondary/30 rounded-lg p-6 space-y-3">
                <h3 className="font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Publicado
                </h3>
                <div className="text-sm space-y-2">
                  <div className="flex justify-between">
                    <span>Filmes</span>
                    <span className="font-bold">
                      {publishedContent.filter((i) => i.source === "movie").length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Séries</span>
                    <span className="font-bold">
                      {publishedContent.filter((i) => i.source === "series").length}
                    </span>
                  </div>
                  <div className="border-t pt-2 flex justify-between font-semibold">
                    <span>Total</span>
                    <span className="text-primary">{totalPublished.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* TABS: AUTO-LOAD vs UPLOAD */}
            <Tabs defaultValue="auto" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="auto">
                  <Download className="w-4 h-4 mr-2" />
                  Carregamento Automático
                </TabsTrigger>
                <TabsTrigger value="manual">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Manual
                </TabsTrigger>
              </TabsList>

              {/* TAB: CARREGAMENTO AUTOMÁTICO */}
              <TabsContent value="auto" className="space-y-4">
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    Como funciona?
                  </h3>
                  <ul className="text-sm space-y-1 text-muted-foreground list-disc list-inside">
                    <li>Coloque um arquivo na pasta <code className="bg-secondary px-1 rounded">public/</code> com o nome <code className="bg-secondary px-1 rounded">playlist.m3u</code></li>
                    <li>Formatos aceitos: .m3u, .m3u8, .txt, .zip</li>
                    <li>Clique em "Carregar Arquivo Fixo" abaixo</li>
                  </ul>
                </div>

                <Button
                  onClick={handleAutoLoad}
                  disabled={uploadProgress.status === "processing"}
                  className="w-full"
                  size="lg"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Carregar Arquivo Fixo (playlist.m3u)
                </Button>

                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-3">Ou carregar de URL externa:</h3>
                  <div className="flex gap-2">
                    <Input
                      placeholder="https://exemplo.com/playlist.m3u"
                      value={externalUrl}
                      onChange={(e) => setExternalUrl(e.target.value)}
                      disabled={uploadProgress.status === "processing"}
                    />
                    <Button
                      onClick={handleExternalUrl}
                      disabled={uploadProgress.status === "processing" || !externalUrl.trim()}
                    >
                      <LinkIcon className="w-4 h-4 mr-2" />
                      Carregar
                    </Button>
                  </div>
                </div>
              </TabsContent>

              {/* TAB: UPLOAD MANUAL */}
              <TabsContent value="manual" className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Selecione a Categoria</h3>
                  <div className="flex gap-2 mb-4">
                    <Button
                      variant={uploadType === "movie" ? "default" : "secondary"}
                      onClick={() => setUploadType("movie")}
                      disabled={uploadProgress.status === "processing"}
                    >
                      <Film className="w-4 h-4 mr-2" />
                      Filmes
                    </Button>
                    <Button
                      variant={uploadType === "series" ? "default" : "secondary"}
                      onClick={() => setUploadType("series")}
                      disabled={uploadProgress.status === "processing"}
                    >
                      <Tv className="w-4 h-4 mr-2" />
                      Séries
                    </Button>
                  </div>
                </div>

                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".zip,.m3u,.m3u8,.txt"
                    onChange={handleManualUpload}
                    className="hidden"
                    disabled={uploadProgress.status === "processing"}
                  />
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadProgress.status === "processing"}
                    className="w-full"
                    size="lg"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Selecionar Arquivo (.zip, .m3u, .txt)
                  </Button>
                </div>
              </TabsContent>
            </Tabs>

            {/* PUBLICAR */}
            {hasUnpublished && uploadProgress.status !== "processing" && (
              <div className="pt-4 border-t border-border">
                <Button onClick={handlePublish} size="lg" className="w-full">
                  <Send className="w-4 h-4 mr-2" />
                  Publicar Todo o Conteúdo ({totalUnpublished.toLocaleString()})
                </Button>
              </div>
            )}
          </div>

          {/* FOOTER */}
          <div className="sticky bottom-0 bg-background/95 backdrop-blur-sm border-t border-border rounded-b-2xl p-4 flex justify-end">
            <Button variant="secondary" onClick={onClose}>
              Fechar Painel
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AdminPanel;