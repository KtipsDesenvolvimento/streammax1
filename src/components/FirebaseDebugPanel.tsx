// 🔍 DEBUG PANEL - Verificar status do Firebase
// Cole este componente no Dashboard para ver o que está acontecendo

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useContent } from "@/contexts/ContentContext";
import { FirebaseBackend } from "@/services/firebase-backend";
import { RefreshCw, Database, AlertCircle, CheckCircle2 } from "lucide-react";

export const FirebaseDebugPanel = () => {
  const { publishedContent, publishedMovies, publishedSeries } = useContent();
  const [firebaseData, setFirebaseData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const checkFirebase = async () => {
    setLoading(true);
    try {
      const data = await FirebaseBackend.loadPublishedContent();
      setFirebaseData(data);
      console.log("🔍 [DEBUG] Dados do Firebase:", data);
    } catch (error) {
      console.error("🔍 [DEBUG] Erro:", error);
    } finally {
      setLoading(false);
    }
  };

  const forceReload = () => {
    window.location.reload();
  };

  useEffect(() => {
    checkFirebase();
  }, []);

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-background border-2 border-primary rounded-lg p-4 shadow-2xl max-w-md">
      <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
        <Database className="w-5 h-5" />
        Firebase Debug
      </h3>

      <div className="space-y-2 text-sm">
        <div className="bg-secondary p-2 rounded">
          <div className="font-semibold mb-1">📊 Estado Atual (React):</div>
          <div className="pl-3 space-y-1">
            <div>Total: {publishedContent.length}</div>
            <div>🎬 Filmes: {publishedMovies.length}</div>
            <div>📺 Séries: {publishedSeries.length}</div>
          </div>
        </div>

        <div className="bg-secondary p-2 rounded">
          <div className="font-semibold mb-1">🔥 Firebase (Último Check):</div>
          {firebaseData ? (
            <div className="pl-3 space-y-1">
              <div className="flex items-center gap-2">
                {firebaseData.length > 0 ? (
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-yellow-500" />
                )}
                <span>Total: {firebaseData.length}</span>
              </div>
              <div>🎬 Filmes: {firebaseData.filter((i: any) => i.source === 'movie').length}</div>
              <div>📺 Episódios: {firebaseData.filter((i: any) => i.source === 'series').length}</div>
            </div>
          ) : (
            <div className="pl-3 text-muted-foreground">Carregando...</div>
          )}
        </div>

        {publishedContent.length !== firebaseData?.length && (
          <div className="bg-yellow-500/20 text-yellow-500 p-2 rounded flex items-start gap-2">
            <AlertCircle className="w-4 h-4 mt-0.5" />
            <div className="text-xs">
              <div className="font-semibold">Diferença detectada!</div>
              <div>React: {publishedContent.length} vs Firebase: {firebaseData?.length || 0}</div>
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-2 mt-3">
        <Button 
          size="sm" 
          variant="secondary"
          onClick={checkFirebase}
          disabled={loading}
        >
          {loading ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4" />
          )}
          Recheck
        </Button>
        
        <Button 
          size="sm"
          variant="outline"
          onClick={forceReload}
        >
          Reload Page
        </Button>
      </div>
    </div>
  );
};