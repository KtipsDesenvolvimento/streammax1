import { useEffect, useRef, useState } from "react";
import { Upload, Film, Tv, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useContent } from "@/contexts/ContentContext";

type UploadType = "movie" | "series";

const AdminPanel = () => {
  const { user } = useAuth();
  const { publishContent, hasUnpublished } = useContent();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadType, setUploadType] = useState<UploadType>("movie");

  return (
    <div className="min-h-screen bg-background pt-20 px-4">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* HEADER */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center">
            <Shield className="text-yellow-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Painel Administrativo</h1>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </div>
        </div>

        {/* ABAS */}
        <div className="flex gap-2">
          <Button
            variant={uploadType === "movie" ? "default" : "secondary"}
            onClick={() => setUploadType("movie")}
          >
            <Film className="w-4 h-4 mr-2" />
            Filmes
          </Button>
          <Button
            variant={uploadType === "series" ? "default" : "secondary"}
            onClick={() => setUploadType("series")}
          >
            <Tv className="w-4 h-4 mr-2" />
            Séries
          </Button>
        </div>

        {/* UPLOAD */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".m3u,.m3u8,.zip"
          className="hidden"
        />

        <Button onClick={() => fileInputRef.current?.click()}>
          <Upload className="w-4 h-4 mr-2" />
          Upload {uploadType === "movie" ? "Filmes" : "Séries"}
        </Button>

        {hasUnpublished && (
          <Button onClick={publishContent} className="w-full">
            Publicar Conteúdo
          </Button>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
