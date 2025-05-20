import { useEffect, useState } from 'react';
import { getUserProfile, saveUserProfile, toggleFavoriteBrand, toggleFavoriteProduct } from '@/utils/user';
import { defaultUserProfile, UserProfile, FreshnessPreference } from '@/types/user';
import { brands as dataBrands } from '@/data/brands';
import { products as dataProducts } from '@/data/products';
import { categories } from '@/data/categories';
import { causes } from '@/data/causes';

export default function SettingsPage() {
  const [profile, setProfile] = useState<UserProfile>(defaultUserProfile);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setProfile(getUserProfile());
  }, []);

  // Handlers
  const handleInterestChange = (interest: string) => {
    setProfile((prev) => {
      const exists = prev.interests.includes(interest);
      const updated = exists
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest];
      return { ...prev, interests: updated };
    });
  };

  const handleFreshnessChange = (freshness: FreshnessPreference) => {
    setProfile((prev) => ({ ...prev, freshnessPreference: freshness }));
  };

  const handleRemoveFavoriteBrand = (brandId: string) => {
    setProfile(toggleFavoriteBrand(brandId));
  };

  const handleRemoveFavoriteProduct = (productId: string) => {
    setProfile(toggleFavoriteProduct(productId));
  };

  const handleSave = () => {
    setSaving(true);
    saveUserProfile(profile);
    setTimeout(() => {
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }, 800);
  };

  // Render
  return (
    <div className="min-h-screen bg-warm-white py-12">
      <div className="max-w-3xl mx-auto px-4">
        <h1 className="font-montserrat text-3xl font-bold mb-8 text-charcoal">Personalization Settings</h1>
        {/* Interests */}
        <section className="mb-8">
          <h2 className="font-montserrat text-xl mb-3">Your Interests</h2>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                className={`px-4 py-2 rounded-full text-sm font-inter border transition-all ${profile.interests.includes(cat.id) ? 'bg-sage text-white border-sage' : 'bg-white text-charcoal border-neutral-gray'}`}
                onClick={() => handleInterestChange(cat.id)}
              >
                {cat.name}
              </button>
            ))}
            {causes.map((cause) => (
              <button
                key={cause.id}
                className={`px-4 py-2 rounded-full text-sm font-inter border transition-all ${profile.interests.includes(cause.id) ? 'bg-sage text-white border-sage' : 'bg-white text-charcoal border-neutral-gray'}`}
                onClick={() => handleInterestChange(cause.id)}
              >
                {cause.name}
              </button>
            ))}
          </div>
        </section>
        {/* Freshness Preference */}
        <section className="mb-8">
          <h2 className="font-montserrat text-xl mb-3">Discovery Freshness</h2>
          <div className="flex gap-4">
            {(['newest', 'popular', 'recommended'] as FreshnessPreference[]).map((option) => (
              <label key={option} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="freshness"
                  value={option}
                  checked={profile.freshnessPreference === option}
                  onChange={() => handleFreshnessChange(option)}
                  className="accent-sage"
                />
                <span className="font-inter text-charcoal capitalize">{option}</span>
              </label>
            ))}
          </div>
        </section>
        {/* Favorites */}
        <section className="mb-8">
          <h2 className="font-montserrat text-xl mb-3">Favorite Brands</h2>
          <div className="flex flex-wrap gap-3">
            {profile.favoriteBrands.length === 0 && <span className="text-neutral-gray">No favorite brands yet.</span>}
            {profile.favoriteBrands.map((brandId) => {
              const brand = dataBrands.find((b) => b.id === brandId);
              if (!brand) return null;
              return (
                <div key={brand.id} className="flex items-center gap-2 border rounded-lg px-3 py-1 bg-white">
                  <span>{brand.name}</span>
                  <button onClick={() => handleRemoveFavoriteBrand(brand.id)} className="text-sage hover:text-red-500">
                    &times;
                  </button>
                </div>
              );
            })}
          </div>
        </section>
        <section className="mb-8">
          <h2 className="font-montserrat text-xl mb-3">Favorite Products</h2>
          <div className="flex flex-wrap gap-3">
            {profile.favoriteProducts.length === 0 && <span className="text-neutral-gray">No favorite products yet.</span>}
            {profile.favoriteProducts.map((productId) => {
              const product = dataProducts.find((p) => p.id === productId);
              if (!product) return null;
              return (
                <div key={product.id} className="flex items-center gap-2 border rounded-lg px-3 py-1 bg-white">
                  <span>{product.title}</span>
                  <button onClick={() => handleRemoveFavoriteProduct(product.id)} className="text-sage hover:text-red-500">
                    &times;
                  </button>
                </div>
              );
            })}
          </div>
        </section>
        {/* Save Button */}
        <div className="mt-6">
          <button
            onClick={handleSave}
            className="bg-sage text-white px-8 py-3 rounded-full font-montserrat hover:bg-opacity-90 transition-all disabled:opacity-60"
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Preferences'}
          </button>
          {saved && <span className="ml-4 text-sage font-inter">Preferences saved!</span>}
        </div>
      </div>
    </div>
  );
}
