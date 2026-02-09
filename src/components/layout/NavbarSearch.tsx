import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

export function NavbarSearch() {
  const [searchQuery, setSearchQuery] = useState("");
  const { t, direction } = useLanguage();
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  return (
    <form onSubmit={handleSearch} className="hidden md:flex items-center relative">
      <Search className={cn(
        "absolute h-4 w-4 text-muted-foreground pointer-events-none",
        direction === "rtl" ? "right-3" : "left-3"
      )} />
      <Input
        type="search"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder={t("products.search")}
        className={cn(
          "w-48 lg:w-64 h-9 bg-white/10 border-white/20 text-link placeholder:text-link/50 focus-visible:ring-primary/50 focus-visible:bg-white/15 transition-all",
          direction === "rtl" ? "pr-9 pl-3" : "pl-9 pr-3"
        )}
      />
    </form>
  );
}
