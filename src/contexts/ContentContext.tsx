import { createContext, useContext, useState, ReactNode, useCallback } from "react";
import { M3UItem } from "@/lib/m3u-parser";

interface ContentContextType {
  /** Content only admin sees (preview after upload) */
  previewContent: M3UItem[];
  /** Content published to all users */
  publishedContent: M3UItem[];
  /** Upload new content (admin preview only) */
  setPreviewContent: (items: M3UItem[]) => void;
  /** Publish preview content to users */
  publishContent: () => void;
  /** Whether there's unpublished content */
  hasUnpublished: boolean;
}

const ContentContext = createContext<ContentContextType | null>(null);

export const ContentProvider = ({ children }: { children: ReactNode }) => {
  const [previewContent, setPreviewContentState] = useState<M3UItem[]>([]);
  const [publishedContent, setPublishedContent] = useState<M3UItem[]>([]);

  const setPreviewContent = useCallback((items: M3UItem[]) => {
    setPreviewContentState(items);
  }, []);

  const publishContent = useCallback(() => {
    setPublishedContent([...previewContent]);
  }, [previewContent]);

  const hasUnpublished = previewContent.length > 0 && 
    JSON.stringify(previewContent) !== JSON.stringify(publishedContent);

  return (
    <ContentContext.Provider value={{
      previewContent,
      publishedContent,
      setPreviewContent,
      publishContent,
      hasUnpublished,
    }}>
      {children}
    </ContentContext.Provider>
  );
};

export const useContent = () => {
  const context = useContext(ContentContext);
  if (context === null) {
    throw new Error("useContent must be used within a ContentProvider");
  }
  return context;
};
