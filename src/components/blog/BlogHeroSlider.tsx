import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { BlogPost } from '@/types';

interface BlogHeroSliderProps {
  posts: BlogPost[];
}

export function BlogHeroSlider({ posts }: BlogHeroSliderProps) {
  const { language } = useLanguage();
  const [currentSlide, setCurrentSlide] = useState(0);
  const slidePosts = posts.slice(0, 5);

  useEffect(() => {
    if (slidePosts.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slidePosts.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slidePosts.length]);

  if (slidePosts.length === 0) return null;

  const goTo = (index: number) => setCurrentSlide(index);
  const prev = () => setCurrentSlide((c) => (c - 1 + slidePosts.length) % slidePosts.length);
  const next = () => setCurrentSlide((c) => (c + 1) % slidePosts.length);

  return (
    <div className="relative w-full overflow-hidden rounded-2xl" style={{ height: '420px' }}>
      {slidePosts.map((post, i) => {
        const title = language === 'ar' ? post.titleAr : post.title;
        const slug = post.slug || post.id;
        const date = new Date(post.date).toLocaleDateString(
          language === 'ar' ? 'ar-SA' : 'en-US',
          { year: 'numeric', month: '2-digit', day: '2-digit' }
        );

        return (
          <div
            key={post.id}
            className="absolute inset-0 transition-opacity duration-700"
            style={{ opacity: i === currentSlide ? 1 : 0, zIndex: i === currentSlide ? 1 : 0 }}
          >
            <Link to={`/blog/${slug}`} className="block w-full h-full relative">
              <img
                src={post.image}
                alt={title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 text-white">
                <span className="inline-block bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded mb-3">
                  {date}
                </span>
                <h2 className="text-xl md:text-2xl lg:text-3xl font-bold leading-tight line-clamp-2 drop-shadow-lg">
                  {title}
                </h2>
              </div>
            </Link>
          </div>
        );
      })}

      {/* Nav arrows */}
      <button
        onClick={prev}
        className="absolute left-3 top-1/2 -translate-y-1/2 z-10 bg-white/20 backdrop-blur-sm hover:bg-white/40 rounded-full p-2 text-white transition-colors"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        onClick={next}
        className="absolute right-3 top-1/2 -translate-y-1/2 z-10 bg-white/20 backdrop-blur-sm hover:bg-white/40 rounded-full p-2 text-white transition-colors"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 flex gap-2">
        {slidePosts.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className={`w-2.5 h-2.5 rounded-full transition-all ${
              i === currentSlide ? 'bg-primary scale-125' : 'bg-white/60 hover:bg-white'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
