import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef } from "react";
import MovieCard from "./MovieCard";

interface Movie {
  id: number | string;
  title: string;
  image: string;
  year: string;
  duration: string;
  rating: string;
  url?: string;
}

interface ContentRowProps {
  title: string;
  movies: Movie[];
  onPlay?: (movie: Movie) => void;
}

const ContentRow = ({ title, movies, onPlay }: ContentRowProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  if (movies.length === 0) return null;

  return (
    <div className="mb-8">
      <h2 className="text-xl font-bold text-foreground mb-4 px-4 md:px-0">{title}</h2>
      
      <div className="relative group">
        <button
          onClick={() => scroll("left")}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-full bg-gradient-to-r from-background to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
        >
          <ChevronLeft className="w-8 h-8 text-foreground" />
        </button>

        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto scrollbar-hide px-4 md:px-0 pb-2"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {movies.map((movie, index) => (
            <div key={movie.id} className="flex-shrink-0 w-[140px] md:w-[180px]">
              <MovieCard
                title={movie.title}
                image={movie.image}
                year={movie.year}
                duration={movie.duration}
                rating={movie.rating}
                delay={index * 0.05}
                onPlay={() => onPlay?.(movie)}
              />
            </div>
          ))}
        </div>

        <button
          onClick={() => scroll("right")}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-full bg-gradient-to-l from-background to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
        >
          <ChevronRight className="w-8 h-8 text-foreground" />
        </button>
      </div>
    </div>
  );
};

export default ContentRow;
