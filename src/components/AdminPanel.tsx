import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Upload, Check, AlertCircle, Eye, Send, FileText, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useContent } from "@/contexts/ContentContext";
import { parseM3U, M3UItem } from "@/lib/m3u-parser";
import { useToast } from "@/hooks/use-toast";

const AdminPanel = ({ onClose }: { onClose: () => void }) => {
  const { previewContent, setPreviewContent, publishContent, hasUnpublished } = useContent();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [parsing, setParsing] = useState(false);
  const [parsedItems, setParsedItems] = useState<M3UItem[]>([]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setParsing(true);

    try {
      let m3uContent: string;

      if (file.name.endsWith(".m3u") || file.name.endsWith(".m3u8")) {
        m3uContent = await file.text();
      } else if (file.name.endsWith(".zip")) {
        // For ZIP, we'd need JSZip - for now show message
        toast({
          title: "ZIP detectado",
          description: "Suporte a ZIP em breve. Por favor envie o .m3u diretamente.",
          variant: "destructive",
        });
        setParsing(false);
        return;
      } else {
        toast({ title: "Formato inválido", description: "Envie um arquivo .m3u ou .m3u8", variant: "destructive" });
        setParsing(false);
        return;
      }

      const items = parseM3U(m3uContent);
      if (items.length === 0) {
        toast({ title: "Arquivo vazio", description: "Nenhum conteúdo encontrado no arquivo .m3u", variant: "destructive" });
      } else {
        setParsedItems(items);
        setPreviewContent(items);
        toast({
          title: "Upload concluído!",
          description: `${items.length} itens carregados para preview.`,
        });
      }
    } catch {
      toast({ title: "Erro ao processar", description: "Não foi possível ler o arquivo.", variant: "destructive" });
    }

    setParsing(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handlePublish = () => {
    publishContent();
    toast({
      title: "Publicado!",
      description: `${previewContent.length} itens publicados para todos os usuários.`,
    });
  };

  // Group items by category
  const categories = parsedItems.reduce<Record<string, M3UItem[]>>((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed inset-0 z-[90] bg-background/95 backdrop-blur-sm overflow-y-auto"
    >
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-foreground">Painel Administrativo</h2>
          <button onClick={onClose} className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center hover:bg-secondary/80">
            <X className="w-5 h-5 text-foreground" />
          </button>
        </div>

        {/* Upload Section */}
        <div className="glass-card rounded-xl p-6 mb-6">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Upload className="w-5 h-5 text-primary" />
            Upload de Conteúdo
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Envie um arquivo .m3u ou .m3u8 para importar conteúdo. O conteúdo será carregado em modo preview apenas para você.
          </p>

          <input
            ref={fileInputRef}
            type="file"
            accept=".m3u,.m3u8,.zip"
            onChange={handleFileUpload}
            className="hidden"
          />

          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={parsing}
            className="btn-primary-gradient gap-2"
          >
            <FileText className="w-4 h-4" />
            {parsing ? "Processando..." : "Selecionar Arquivo .m3u"}
          </Button>
        </div>

        {/* Preview Section */}
        {parsedItems.length > 0 && (
          <div className="glass-card rounded-xl p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Eye className="w-5 h-5 text-primary" />
                Preview ({parsedItems.length} itens)
              </h3>
              {hasUnpublished && (
                <span className="flex items-center gap-1 text-sm text-yellow-500">
                  <AlertCircle className="w-4 h-4" />
                  Não publicado
                </span>
              )}
            </div>

            <div className="space-y-4 max-h-96 overflow-y-auto">
              {Object.entries(categories).map(([cat, items]) => (
                <div key={cat}>
                  <h4 className="text-sm font-semibold text-primary mb-2">{cat} ({items.length})</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {items.slice(0, 8).map(item => (
                      <div key={item.id} className="bg-secondary rounded-lg p-2">
                        <img src={item.image} alt={item.title} className="w-full aspect-[2/3] object-cover rounded mb-1" />
                        <p className="text-xs text-foreground truncate">{item.title}</p>
                      </div>
                    ))}
                    {items.length > 8 && (
                      <div className="bg-secondary rounded-lg p-2 flex items-center justify-center">
                        <p className="text-xs text-muted-foreground">+{items.length - 8} mais</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Publish Button */}
        {hasUnpublished && (
          <div className="glass-card rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <Send className="w-5 h-5 text-primary" />
                  Publicar para Usuários
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Torne o conteúdo visível para todos os usuários do StreamMax.
                </p>
              </div>
              <Button onClick={handlePublish} className="btn-primary-gradient gap-2">
                <Check className="w-4 h-4" />
                Publicar para Usuários
              </Button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default AdminPanel;
