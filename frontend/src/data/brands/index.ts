import { Brand } from '@/types/brand';

export const brands: Brand[] = [
  {
    id: "terra-clay",
    name: "Terra & Clay",
    description: "Handcrafted ceramics celebrating natural forms and textures",
    logo: "https://images.unsplash.com/photo-1493106641515-6b5631de4bb9?auto=format&q=80&fit=crop&w=400",
    coverImage: "https://images.unsplash.com/photo-1493106641515-6b5631de4bb9?auto=format&q=80&fit=crop&w=1200",
    values: ["handmade", "sustainable", "local"],
    location: "Portland, OR",
    rating: { average: 4.8, count: 150 } 
  },
  {
    id: "pure-living",
    name: "Pure Living",
    description: "Organic textiles for mindful living",
    logo: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&q=80&fit=crop&w=400",
    coverImage: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&q=80&fit=crop&w=1200",
    values: ["organic", "sustainable", "ethical"],
    location: "Austin, TX",
    rating: { average: 4.5, count: 210 } 
  },
  {
    id: "fiber-folk",
    name: "Fiber & Folk",
    description: "Contemporary fiber art and textiles",
    logo: "https://images.unsplash.com/photo-1615529182904-14819c35db37?auto=format&q=80&fit=crop&w=400",
    coverImage: "https://images.unsplash.com/photo-1615529182904-14819c35db37?auto=format&q=80&fit=crop&w=1200",
    values: ["handmade", "artisanal", "traditional"],
    location: "Santa Fe, NM",
    rating: { average: 4.9, count: 95 } 
  },
  {
    id: "lumiere",
    name: "Lumière",
    description: "Modern lighting solutions with timeless materials",
    logo: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&q=80&fit=crop&w=400",
    coverImage: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&q=80&fit=crop&w=1200",
    values: ["modern", "sustainable", "luxury"],
    location: "Brooklyn, NY" 
  }
];
