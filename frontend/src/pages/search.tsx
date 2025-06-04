import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import SearchBarWithSuggestions from "@/components/search/SearchBarWithSuggestions";

export default function SearchPage() {
  const router = useRouter();
  const { q } = router.query;
  const [searchQuery, setSearchQuery] = useState<string>((q as string) || "");
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("recentSearches");
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse recent searches", e);
      }
    }
  }, []);

  // Redirect to optimized-search page
  useEffect(() => {
    if (searchQuery) {
      router.push(`/optimized-search?q=${encodeURIComponent(searchQuery)}`);
    }
  }, [searchQuery, router]);

  // Handle search submission
  const handleSearch = (query: string) => {
    if (!query.trim()) return;

    // Add to recent searches
    setRecentSearches((prev) => {
      const updated = [query, ...prev.filter((item) => item !== query)].slice(
        0,
        5,
      );
      localStorage.setItem("recentSearches", JSON.stringify(updated));
      return updated;
    });

    // Redirect to optimized-search page
    router.push(`/optimized-search?q=${encodeURIComponent(query)}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold mb-6">Search</h1>

      {/* Search Bar */}
      <div className="mb-8">
        <SearchBarWithSuggestions
          value={searchQuery}
          onChange={setSearchQuery}
          onSearch={handleSearch}
          recentSearches={recentSearches}
          placeholder="Search for products, brands, or merchants..."
        />
      </div>

      {/* Redirect message */}
      <div className="text-center py-8">
        <p className="text-gray-500">
          Redirecting to optimized search experience...
        </p>
      </div>
    </div>
  );
}
