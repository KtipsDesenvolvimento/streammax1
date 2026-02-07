import { useState, useMemo } from "react";
import DashboardHeader from "@/components/DashboardHeader";
import FeaturedHero from "@/components/FeaturedHero";
import ContentRow from "@/components/ContentRow";
import Footer from "@/components/Footer";
import VideoPlayer from "@/components/VideoPlayer";
import AdminPanel from "@/components/AdminPanel";
import { useAuth } from "@/contexts/AuthContext";
import { useContent } from "@/contexts/ContentContext";

// Default movie data (static content)
const defaultMovies = {
  continueWatching: [
    { id: 1, title: "Stranger Things", image: "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?w=300&h=450&fit=crop", year: "2024", duration: "50min", rating: "96", url: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8" },
    { id: 2, title: "The Crown", image: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=300&h=450&fit=crop", year: "2023", duration: "58min", rating: "92", url: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8" },
    { id: 3, title: "Dark", image: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=300&h=450&fit=crop", year: "2024", duration: "1h 2min", rating: "98", url: "" },
    { id: 4, title: "Money Heist", image: "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=300&h=450&fit=crop", year: "2024", duration: "47min", rating: "94", url: "" },
    { id: 5, title: "Breaking Bad", image: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=300&h=450&fit=crop", year: "2023", duration: "55min", rating: "99", url: "" },
    { id: 6, title: "The Witcher", image: "https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?w=300&h=450&fit=crop", year: "2024", duration: "1h", rating: "91", url: "" },
  ],
  trending: [
    { id: 7, title: "Duna: Parte 2", image: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=300&h=450&fit=crop", year: "2025", duration: "2h 46min", rating: "97", url: "" },
    { id: 8, title: "Oppenheimer", image: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=300&h=450&fit=crop", year: "2024", duration: "3h", rating: "95", url: "" },
    { id: 9, title: "Barbie", image: "https://images.unsplash.com/photo-1560109947-543149eceb16?w=300&h=450&fit=crop", year: "2024", duration: "1h 54min", rating: "88", url: "" },
    { id: 10, title: "Avatar 3", image: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=300&h=450&fit=crop", year: "2025", duration: "3h 12min", rating: "93", url: "" },
    { id: 11, title: "Spider-Man", image: "https://images.unsplash.com/photo-1635805737707-575885ab0820?w=300&h=450&fit=crop", year: "2024", duration: "2h 28min", rating: "96", url: "" },
    { id: 12, title: "Inception", image: "https://images.unsplash.com/photo-1500462918059-b1a0cb512f1d?w=300&h=450&fit=crop", year: "2023", duration: "2h 28min", rating: "98", url: "" },
  ],
  topRated: [
    { id: 13, title: "The Shawshank Redemption", image: "https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?w=300&h=450&fit=crop", year: "1994", duration: "2h 22min", rating: "99", url: "" },
    { id: 14, title: "The Godfather", image: "https://images.unsplash.com/photo-1542204165-65bf26472b9b?w=300&h=450&fit=crop", year: "1972", duration: "2h 55min", rating: "98", url: "" },
    { id: 15, title: "Pulp Fiction", image: "https://images.unsplash.com/photo-1594908900066-3f47337549d8?w=300&h=450&fit=crop", year: "1994", duration: "2h 34min", rating: "97", url: "" },
    { id: 16, title: "Fight Club", image: "https://images.unsplash.com/photo-1533488765986-dfa2a9939acd?w=300&h=450&fit=crop", year: "1999", duration: "2h 19min", rating: "96", url: "" },
    { id: 17, title: "Interstellar", image: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=300&h=450&fit=crop", year: "2014", duration: "2h 49min", rating: "98", url: "" },
    { id: 18, title: "The Matrix", image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=300&h=450&fit=crop", year: "1999", duration: "2h 16min", rating: "95", url: "" },
  ],
  action: [
    { id: 19, title: "John Wick 5", image: "https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?w=300&h=450&fit=crop", year: "2025", duration: "2h 15min", rating: "94", url: "" },
    { id: 20, title: "Mission Impossible", image: "https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?w=300&h=450&fit=crop", year: "2024", duration: "2h 43min", rating: "92", url: "" },
    { id: 21, title: "Top Gun", image: "https://images.unsplash.com/photo-1474302770737-173ee21bab63?w=300&h=450&fit=crop", year: "2024", duration: "2h 10min", rating: "96", url: "" },
    { id: 22, title: "Mad Max", image: "https://images.unsplash.com/photo-1509281373149-e957c6296406?w=300&h=450&fit=crop", year: "2024", duration: "2h 28min", rating: "95", url: "" },
    { id: 23, title: "Fast X", image: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=300&h=450&fit=crop", year: "2024", duration: "2h 21min", rating: "88", url: "" },
    { id: 24, title: "Extraction 3", image: "https://images.unsplash.com/photo-1551817958-c5b51e7b4a33?w=300&h=450&fit=crop", year: "2025", duration: "2h 5min", rating: "91", url: "" },
  ],
};

const Dashboard = () => {
  const { isAdmin } = useAuth();
  const { previewContent, publishedContent } = useContent();
  const [playerMovie, setPlayerMovie] = useState<{ url: string; title: string } | null>(null);
  const [showAdmin, setShowAdmin] = useState(false);

  // Admin sees preview content, user sees published content
  const uploadedContent = isAdmin ? previewContent : publishedContent;

  // Group uploaded content by category
  const uploadedCategories = useMemo(() => {
    const cats: Record<string, typeof uploadedContent> = {};
    uploadedContent.forEach(item => {
      if (!cats[item.category]) cats[item.category] = [];
      cats[item.category].push(item);
    });
    return cats;
  }, [uploadedContent]);

  const handlePlay = (movie: { url?: string; title: string }) => {
    setPlayerMovie({ url: movie.url || "", title: movie.title });
  };

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader onOpenAdmin={() => setShowAdmin(true)} />
      
      <main>
        <FeaturedHero />
        
        <div className="relative z-10 -mt-32 pb-12">
          <div className="container mx-auto">
            <ContentRow title="Continuar Assistindo" movies={defaultMovies.continueWatching} onPlay={handlePlay} />
            <ContentRow title="Em Alta" movies={defaultMovies.trending} onPlay={handlePlay} />

            {/* Uploaded content rows */}
            {Object.entries(uploadedCategories).map(([category, items]) => (
              <ContentRow
                key={category}
                title={category}
                movies={items.map(i => ({ ...i, id: i.id as string | number }))}
                onPlay={handlePlay}
              />
            ))}

            <ContentRow title="Mais Bem Avaliados" movies={defaultMovies.topRated} onPlay={handlePlay} />
            <ContentRow title="Ação & Aventura" movies={defaultMovies.action} onPlay={handlePlay} />
          </div>
        </div>
      </main>
      
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
