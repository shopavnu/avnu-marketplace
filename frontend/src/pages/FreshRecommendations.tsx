import React, { useState } from 'react';
import PersonalizedRecommendations from '../components/recommendations/PersonalizedRecommendations';
import { useSession } from '../hooks/useSession';

/**
 * A page that demonstrates the fresh recommendations feature
 */
const FreshRecommendationsPage: React.FC = () => {
  const [excludePurchased, setExcludePurchased] = useState<boolean>(true);
  const [freshness, setFreshness] = useState<number>(0.7);
  const { trackInteraction } = useSession();

  // Track page view
  React.useEffect(() => {
    trackInteraction('view', {
      entityType: 'page',
      entityId: 'fresh-recommendations',
      timestamp: new Date().toISOString()
    });
  }, [trackInteraction]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Fresh Recommendations</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Recommendation Settings</h2>
        
        <div className="mb-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={excludePurchased}
              onChange={(e) => setExcludePurchased(e.target.checked)}
              className="mr-2"
            />
            Exclude products I've already purchased
          </label>
          <p className="text-gray-600 text-sm mt-1">
            When enabled, products you've already purchased won't appear in recommendations.
          </p>
        </div>
        
        <div className="mb-4">
          <label className="block mb-2">
            Freshness: {Math.round(freshness * 100)}%
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={freshness}
            onChange={(e) => setFreshness(parseFloat(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between text-sm text-gray-600">
            <span>Familiar</span>
            <span>Balanced</span>
            <span>Fresh</span>
          </div>
          <p className="text-gray-600 text-sm mt-1">
            Adjust to control how many new products you see versus products related to your past interests.
          </p>
        </div>
      </div>
      
      <PersonalizedRecommendations
        limit={12}
        title="Recommended for You"
        fallbackTitle="Trending Products"
        showRefreshButton={true}
        excludePurchased={excludePurchased}
        freshness={freshness}
      />
      
      <div className="mt-12 bg-blue-50 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-2">About Fresh Recommendations</h2>
        <p className="mb-4">
          Our recommendation system now balances showing you products related to your interests
          with introducing you to new, diverse items you might not have discovered otherwise.
        </p>
        <p className="mb-4">
          <strong>Freshness:</strong> Controls the balance between showing you new products versus
          products similar to ones you've viewed before. A higher freshness value means more new discoveries.
        </p>
        <p>
          <strong>Exclude Purchases:</strong> When enabled, products you've already purchased
          won't appear in your recommendations, making room for new items to discover.
        </p>
      </div>
    </div>
  );
};

export default FreshRecommendationsPage;
