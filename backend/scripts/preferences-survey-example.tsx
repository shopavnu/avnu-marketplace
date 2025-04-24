import React, { useState } from 'react';
import { gql, useMutation } from '@apollo/client';
import { useAuth } from '../hooks/useAuth';

// GraphQL mutation for submitting the preferences survey
const SUBMIT_PREFERENCES_SURVEY = gql`
  mutation SubmitPreferencesSurvey($surveyData: UserPreferencesSurveyInput!) {
    submitPreferencesSurvey(surveyData: $surveyData)
  }
`;

// Enums matching the backend
enum ShoppingFrequency {
  RARELY = 'rarely',
  OCCASIONALLY = 'occasionally',
  MONTHLY = 'monthly',
  WEEKLY = 'weekly',
  DAILY = 'daily'
}

enum PriceSensitivity {
  BUDGET = 'budget',
  VALUE = 'value',
  BALANCED = 'balanced',
  PREMIUM = 'premium',
  LUXURY = 'luxury'
}

/**
 * User Preferences Survey Component
 * 
 * This component allows new users to set their initial preferences
 * to enable personalized search results from the start.
 */
export const UserPreferencesSurvey: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const [submitSurvey, { loading, error, data }] = useMutation(SUBMIT_PREFERENCES_SURVEY);
  
  // Form state
  const [preferredCategories, setPreferredCategories] = useState<string[]>([]);
  const [preferredBrands, setPreferredBrands] = useState<string[]>([]);
  const [priceRangeMin, setPriceRangeMin] = useState<number>(0);
  const [priceRangeMax, setPriceRangeMax] = useState<number>(1000);
  const [shoppingFrequency, setShoppingFrequency] = useState<ShoppingFrequency>(ShoppingFrequency.MONTHLY);
  const [priceSensitivity, setPriceSensitivity] = useState<PriceSensitivity>(PriceSensitivity.BALANCED);
  const [preferredAttributes, setPreferredAttributes] = useState<string[]>([]);
  const [reviewImportance, setReviewImportance] = useState<number>(5);
  const [submitted, setSubmitted] = useState<boolean>(false);
  
  // Available options for selection
  const availableCategories = [
    'Electronics', 'Home & Kitchen', 'Fashion', 'Books', 'Beauty', 
    'Sports', 'Toys', 'Automotive', 'Health', 'Garden', 'Office'
  ];
  
  const availableBrands = [
    'Apple', 'Samsung', 'Sony', 'LG', 'Nike', 'Adidas', 'Amazon Basics',
    'Logitech', 'Bose', 'Philips', 'Dyson', 'KitchenAid', 'Levi\'s'
  ];
  
  const availableAttributes = [
    'Eco-friendly', 'High-quality', 'Durable', 'Lightweight', 'Compact',
    'Wireless', 'Energy-efficient', 'Waterproof', 'Handmade', 'Organic',
    'Fast shipping', 'Free returns', 'Warranty'
  ];
  
  // Handle category selection
  const handleCategoryToggle = (category: string) => {
    if (preferredCategories.includes(category)) {
      setPreferredCategories(preferredCategories.filter(c => c !== category));
    } else {
      setPreferredCategories([...preferredCategories, category]);
    }
  };
  
  // Handle brand selection
  const handleBrandToggle = (brand: string) => {
    if (preferredBrands.includes(brand)) {
      setPreferredBrands(preferredBrands.filter(b => b !== brand));
    } else {
      setPreferredBrands([...preferredBrands, brand]);
    }
  };
  
  // Handle attribute selection
  const handleAttributeToggle = (attribute: string) => {
    if (preferredAttributes.includes(attribute)) {
      setPreferredAttributes(preferredAttributes.filter(a => a !== attribute));
    } else {
      setPreferredAttributes([...preferredAttributes, attribute]);
    }
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (preferredCategories.length === 0) {
      alert('Please select at least one category');
      return;
    }
    
    if (preferredBrands.length === 0) {
      alert('Please select at least one brand');
      return;
    }
    
    if (priceRangeMin >= priceRangeMax) {
      alert('Minimum price must be less than maximum price');
      return;
    }
    
    try {
      // Submit survey data
      const result = await submitSurvey({
        variables: {
          surveyData: {
            preferredCategories,
            preferredBrands,
            priceRangeMin,
            priceRangeMax,
            shoppingFrequency,
            priceSensitivity,
            preferredAttributes,
            reviewImportance,
            additionalPreferences: {
              // Any additional preferences can be added here
              onboardingCompleted: true,
              onboardingTimestamp: Date.now()
            }
          }
        }
      });
      
      if (result.data.submitPreferencesSurvey) {
        setSubmitted(true);
      }
    } catch (err) {
      console.error('Error submitting preferences survey:', err);
    }
  };
  
  if (!isAuthenticated) {
    return (
      <div className="preferences-survey-container">
        <h2>Please log in to set your preferences</h2>
        <p>You need to be logged in to save your preferences.</p>
      </div>
    );
  }
  
  if (submitted) {
    return (
      <div className="preferences-survey-container">
        <h2>Thank you for your preferences!</h2>
        <p>Your shopping experience is now personalized based on your preferences.</p>
        <button 
          className="primary-button"
          onClick={() => window.location.href = '/'}
        >
          Start Shopping
        </button>
      </div>
    );
  }
  
  return (
    <div className="preferences-survey-container">
      <h2>Welcome to Avnu Marketplace!</h2>
      <p>Tell us about your preferences to get personalized recommendations.</p>
      
      <form onSubmit={handleSubmit} className="preferences-form">
        {/* Categories Section */}
        <section className="form-section">
          <h3>What categories are you interested in?</h3>
          <p className="section-description">Select all that apply</p>
          
          <div className="options-grid">
            {availableCategories.map(category => (
              <div 
                key={category}
                className={`option-item ${preferredCategories.includes(category) ? 'selected' : ''}`}
                onClick={() => handleCategoryToggle(category)}
              >
                {category}
              </div>
            ))}
          </div>
        </section>
        
        {/* Brands Section */}
        <section className="form-section">
          <h3>Which brands do you prefer?</h3>
          <p className="section-description">Select all that apply</p>
          
          <div className="options-grid">
            {availableBrands.map(brand => (
              <div 
                key={brand}
                className={`option-item ${preferredBrands.includes(brand) ? 'selected' : ''}`}
                onClick={() => handleBrandToggle(brand)}
              >
                {brand}
              </div>
            ))}
          </div>
        </section>
        
        {/* Price Range Section */}
        <section className="form-section">
          <h3>What's your typical price range?</h3>
          
          <div className="price-range-inputs">
            <div className="input-group">
              <label htmlFor="priceRangeMin">Minimum ($)</label>
              <input
                type="number"
                id="priceRangeMin"
                min="0"
                value={priceRangeMin}
                onChange={(e) => setPriceRangeMin(Number(e.target.value))}
              />
            </div>
            
            <div className="input-group">
              <label htmlFor="priceRangeMax">Maximum ($)</label>
              <input
                type="number"
                id="priceRangeMax"
                min="0"
                value={priceRangeMax}
                onChange={(e) => setPriceRangeMax(Number(e.target.value))}
              />
            </div>
          </div>
        </section>
        
        {/* Shopping Frequency Section */}
        <section className="form-section">
          <h3>How often do you shop online?</h3>
          
          <div className="radio-options">
            {Object.values(ShoppingFrequency).map(frequency => (
              <label key={frequency} className="radio-option">
                <input
                  type="radio"
                  name="shoppingFrequency"
                  value={frequency}
                  checked={shoppingFrequency === frequency}
                  onChange={() => setShoppingFrequency(frequency as ShoppingFrequency)}
                />
                <span className="radio-label">
                  {frequency.charAt(0).toUpperCase() + frequency.slice(1)}
                </span>
              </label>
            ))}
          </div>
        </section>
        
        {/* Price Sensitivity Section */}
        <section className="form-section">
          <h3>How would you describe your price sensitivity?</h3>
          
          <div className="radio-options">
            {Object.values(PriceSensitivity).map(sensitivity => (
              <label key={sensitivity} className="radio-option">
                <input
                  type="radio"
                  name="priceSensitivity"
                  value={sensitivity}
                  checked={priceSensitivity === sensitivity}
                  onChange={() => setPriceSensitivity(sensitivity as PriceSensitivity)}
                />
                <span className="radio-label">
                  {sensitivity.charAt(0).toUpperCase() + sensitivity.slice(1)}
                </span>
              </label>
            ))}
          </div>
        </section>
        
        {/* Product Attributes Section */}
        <section className="form-section">
          <h3>What product attributes are important to you?</h3>
          <p className="section-description">Select all that apply</p>
          
          <div className="options-grid">
            {availableAttributes.map(attribute => (
              <div 
                key={attribute}
                className={`option-item ${preferredAttributes.includes(attribute) ? 'selected' : ''}`}
                onClick={() => handleAttributeToggle(attribute)}
              >
                {attribute}
              </div>
            ))}
          </div>
        </section>
        
        {/* Review Importance Section */}
        <section className="form-section">
          <h3>How important are product reviews to you?</h3>
          
          <div className="slider-container">
            <input
              type="range"
              min="1"
              max="10"
              value={reviewImportance}
              onChange={(e) => setReviewImportance(Number(e.target.value))}
              className="slider"
            />
            <div className="slider-labels">
              <span>Not important</span>
              <span>Very important</span>
            </div>
            <div className="slider-value">
              {reviewImportance}/10
            </div>
          </div>
        </section>
        
        {/* Submit Button */}
        <div className="form-actions">
          <button 
            type="submit" 
            className="submit-button"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Preferences'}
          </button>
        </div>
        
        {error && (
          <div className="error-message">
            Error: {error.message}
          </div>
        )}
      </form>
    </div>
  );
};

export default UserPreferencesSurvey;
