import { Brand } from "@/types/brand";
import { SectionType } from "@/data/sections";

// Enhanced Brand interface with additional properties
export interface EnhancedBrand extends Brand {
  featured?: boolean;
  new?: boolean;
  trending?: boolean;
  productCount?: number;
  foundedYear?: number;
  story?: string;
  sustainabilityCommitment?: string;
  certifications?: string[];
  socialMedia?: {
    instagram?: string;
    pinterest?: string;
    website?: string;
  };
  sectionTypes?: SectionType[];
}

export const brands: EnhancedBrand[] = [
  {
    id: "terra-clay",
    name: "Terra & Clay",
    description: "Handcrafted ceramics celebrating natural forms and textures",
    logo: "https://images.unsplash.com/photo-1493106641515-6b5631de4bb9?auto=format&q=80&fit=crop&w=400",
    coverImage:
      "https://images.unsplash.com/photo-1493106641515-6b5631de4bb9?auto=format&q=80&fit=crop&w=1200",
    values: ["handmade", "sustainable", "local", "small-batch"],
    location: "Portland, OR",
    rating: { average: 4.8, count: 150 },
    featured: true,
    trending: true,
    productCount: 24,
    foundedYear: 2015,
    story:
      "Founded by ceramicist Maya Chen after years of studying traditional techniques in Japan. Each piece is handcrafted in our Portland studio using locally sourced clay and non-toxic glazes.",
    sustainabilityCommitment:
      "We use locally sourced clay, lead-free glazes, and recycle all clay scraps. Our packaging is plastic-free and made from recycled materials.",
    certifications: ["Certified B Corp", "1% For The Planet"],
    socialMedia: {
      instagram: "@terraandclay",
      pinterest: "terraandclay",
      website: "www.terraandclay.com",
    },
    sectionTypes: [
      SectionType.FEATURED,
      SectionType.HANDMADE,
      SectionType.LOCAL,
      SectionType.SUSTAINABLE,
    ],
  },
  {
    id: "pure-living",
    name: "Pure Living",
    description: "Organic textiles for mindful living",
    logo: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&q=80&fit=crop&w=400",
    coverImage:
      "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&q=80&fit=crop&w=1200",
    values: ["organic", "sustainable", "ethical", "fair-trade"],
    location: "Austin, TX",
    rating: { average: 4.5, count: 210 },
    featured: true,
    trending: false,
    productCount: 42,
    foundedYear: 2012,
    story:
      "Pure Living was born from a desire to bring truly sustainable textiles into everyday homes. We partner directly with organic cotton farmers in India and Portugal to create beautiful, long-lasting home textiles.",
    sustainabilityCommitment:
      "All our products are GOTS certified organic and made in fair trade certified facilities. We use plastic-free packaging and carbon-neutral shipping.",
    certifications: [
      "GOTS Certified",
      "Fair Trade Certified",
      "OEKO-TEX Standard 100",
    ],
    socialMedia: {
      instagram: "@pureliving",
      pinterest: "purelivingorganic",
      website: "www.purelivingorganic.com",
    },
    sectionTypes: [
      SectionType.FEATURED,
      SectionType.SUSTAINABLE,
      SectionType.BESTSELLERS,
    ],
  },
  {
    id: "fiber-folk",
    name: "Fiber & Folk",
    description: "Contemporary fiber art and textiles",
    logo: "https://images.unsplash.com/photo-1615529182904-14819c35db37?auto=format&q=80&fit=crop&w=400",
    coverImage:
      "https://images.unsplash.com/photo-1615529182904-14819c35db37?auto=format&q=80&fit=crop&w=1200",
    values: ["handmade", "artisanal", "traditional", "women-owned"],
    location: "Santa Fe, NM",
    rating: { average: 4.9, count: 95 },
    featured: false,
    new: true,
    trending: true,
    productCount: 18,
    foundedYear: 2018,
    story:
      "Fiber & Folk is a women-owned collective of artisans preserving traditional fiber arts while creating contemporary designs. We work with natural fibers and traditional techniques from around the world.",
    sustainabilityCommitment:
      "We use natural fibers, plant-based dyes, and support traditional craft communities through fair partnerships and skill-sharing programs.",
    certifications: ["Women-Owned Business", "Nest Seal of Ethical Handcraft"],
    socialMedia: {
      instagram: "@fiberandfolk",
      pinterest: "fiberandfolk",
      website: "www.fiberandfolk.com",
    },
    sectionTypes: [
      SectionType.NEW_ARRIVALS,
      SectionType.HANDMADE,
      SectionType.TRENDING,
    ],
  },
  {
    id: "lumiere",
    name: "Lumière",
    description: "Modern lighting solutions with timeless materials",
    logo: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&q=80&fit=crop&w=400",
    coverImage:
      "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&q=80&fit=crop&w=1200",
    values: ["modern", "sustainable", "luxury", "energy-efficient"],
    location: "Brooklyn, NY",
    rating: { average: 4.7, count: 120 },
    featured: true,
    trending: false,
    productCount: 32,
    foundedYear: 2014,
    story:
      "Founded by former architect Jean Moreau, Lumière combines traditional metalworking techniques with modern, energy-efficient technology to create lighting that's both beautiful and sustainable.",
    sustainabilityCommitment:
      "All our lighting features energy-efficient LED technology, and we use recycled brass and glass in our manufacturing process. Our Brooklyn workshop runs on 100% renewable energy.",
    certifications: ["Energy Star Partner", "Made in USA Certified"],
    socialMedia: {
      instagram: "@lumiere_lighting",
      pinterest: "lumierelighting",
      website: "www.lumierelighting.com",
    },
    sectionTypes: [
      SectionType.FEATURED,
      SectionType.SUSTAINABLE,
      SectionType.BESTSELLERS,
    ],
  },
  {
    id: "forest-table",
    name: "Forest & Table",
    description: "Sustainable wood kitchenware and furniture",
    logo: "https://images.unsplash.com/photo-1545622783-b3e021430fee?auto=format&q=80&fit=crop&w=400",
    coverImage:
      "https://images.unsplash.com/photo-1545622783-b3e021430fee?auto=format&q=80&fit=crop&w=1200",
    values: ["sustainable", "handcrafted", "forest-conservation", "local"],
    location: "Seattle, WA",
    rating: { average: 4.8, count: 85 },
    featured: false,
    new: true,
    trending: true,
    productCount: 28,
    foundedYear: 2016,
    story:
      "Forest & Table was founded by woodworker James Tanner with a mission to create beautiful, functional wood products while supporting forest conservation. We use only sustainably harvested or reclaimed wood.",
    sustainabilityCommitment:
      "For every product sold, we plant a tree. We use only FSC-certified or reclaimed wood, and all our finishes are food-safe and plant-based.",
    certifications: [
      "FSC Certified",
      "1% For The Planet",
      "American Forest Foundation Partner",
    ],
    socialMedia: {
      instagram: "@forestandtable",
      pinterest: "forestandtable",
      website: "www.forestandtable.com",
    },
    sectionTypes: [
      SectionType.NEW_ARRIVALS,
      SectionType.HANDMADE,
      SectionType.LOCAL,
      SectionType.SUSTAINABLE,
    ],
  },
  {
    id: "nova-ceramics",
    name: "Nova Ceramics",
    description: "Contemporary ceramic homewares with minimalist design",
    logo: "https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&q=80&fit=crop&w=400",
    coverImage:
      "https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&q=80&fit=crop&w=1200",
    values: ["minimalist", "handmade", "sustainable", "small-batch"],
    location: "Los Angeles, CA",
    rating: { average: 4.6, count: 78 },
    featured: false,
    new: true,
    trending: true,
    productCount: 22,
    foundedYear: 2019,
    story:
      "Nova Ceramics was founded by designer Ana Diaz, who brings her minimalist aesthetic to functional ceramic pieces. Each item is handmade in our Los Angeles studio.",
    sustainabilityCommitment:
      "We use locally sourced clay and glazes, solar power in our studio, and minimal, recyclable packaging for all shipments.",
    certifications: ["California Green Business Network", "Handmade in USA"],
    socialMedia: {
      instagram: "@novaceramics",
      pinterest: "novaceramics",
      website: "www.novaceramics.com",
    },
    sectionTypes: [
      SectionType.NEW_ARRIVALS,
      SectionType.HANDMADE,
      SectionType.TRENDING,
    ],
  },
  {
    id: "evergreen-home",
    name: "Evergreen Home",
    description: "Sustainable furniture and home goods for conscious living",
    logo: "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?auto=format&q=80&fit=crop&w=400",
    coverImage:
      "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?auto=format&q=80&fit=crop&w=1200",
    values: ["sustainable", "eco-friendly", "ethical", "timeless"],
    location: "Minneapolis, MN",
    rating: { average: 4.7, count: 132 },
    featured: true,
    new: false,
    trending: false,
    productCount: 45,
    foundedYear: 2013,
    story:
      "Evergreen Home was founded with a mission to make sustainable furniture accessible to more homes. We use responsibly sourced materials and work with local craftspeople to create timeless pieces.",
    sustainabilityCommitment:
      "All our wood is FSC certified, we use zero-VOC finishes, and our upholstery fabrics are made from organic or recycled materials. We offer a take-back program for furniture at end-of-life.",
    certifications: [
      "FSC Certified",
      "Certified B Corp",
      "Sustainable Furnishings Council",
    ],
    socialMedia: {
      instagram: "@evergreenhome",
      pinterest: "evergreenhome",
      website: "www.evergreenhome.com",
    },
    sectionTypes: [
      SectionType.FEATURED,
      SectionType.SUSTAINABLE,
      SectionType.BESTSELLERS,
    ],
  },
  {
    id: "artisan-glass",
    name: "Artisan Glass",
    description: "Hand-blown glass objects for modern homes",
    logo: "https://images.unsplash.com/photo-1610701596461-2b2dee114601?auto=format&q=80&fit=crop&w=400",
    coverImage:
      "https://images.unsplash.com/photo-1610701596461-2b2dee114601?auto=format&q=80&fit=crop&w=1200",
    values: ["handmade", "artisanal", "traditional", "local"],
    location: "Seattle, WA",
    rating: { average: 4.9, count: 64 },
    featured: false,
    new: true,
    trending: true,
    productCount: 18,
    foundedYear: 2017,
    story:
      "Artisan Glass was founded by master glassblower Thomas Reed after 15 years of training in Italy and Seattle. Each piece is hand-blown using traditional techniques with contemporary designs.",
    sustainabilityCommitment:
      "We use recycled glass in many of our pieces and our studio is powered by renewable energy. All packaging is plastic-free and recyclable.",
    certifications: ["Made in USA", "Seattle Made"],
    socialMedia: {
      instagram: "@artisanglass",
      pinterest: "artisanglass",
      website: "www.artisanglass.com",
    },
    sectionTypes: [
      SectionType.NEW_ARRIVALS,
      SectionType.HANDMADE,
      SectionType.LOCAL,
      SectionType.TRENDING,
    ],
  },
];
