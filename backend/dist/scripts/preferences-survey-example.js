"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserPreferencesSurvey = void 0;
const react_1 = __importStar(require("react"));
const client_1 = require("@apollo/client");
const useAuth_1 = require("../hooks/useAuth");
const SUBMIT_PREFERENCES_SURVEY = (0, client_1.gql) `
  mutation SubmitPreferencesSurvey($surveyData: UserPreferencesSurveyInput!) {
    submitPreferencesSurvey(surveyData: $surveyData)
  }
`;
var ShoppingFrequency;
(function (ShoppingFrequency) {
    ShoppingFrequency["RARELY"] = "rarely";
    ShoppingFrequency["OCCASIONALLY"] = "occasionally";
    ShoppingFrequency["MONTHLY"] = "monthly";
    ShoppingFrequency["WEEKLY"] = "weekly";
    ShoppingFrequency["DAILY"] = "daily";
})(ShoppingFrequency || (ShoppingFrequency = {}));
var PriceSensitivity;
(function (PriceSensitivity) {
    PriceSensitivity["BUDGET"] = "budget";
    PriceSensitivity["VALUE"] = "value";
    PriceSensitivity["BALANCED"] = "balanced";
    PriceSensitivity["PREMIUM"] = "premium";
    PriceSensitivity["LUXURY"] = "luxury";
})(PriceSensitivity || (PriceSensitivity = {}));
const UserPreferencesSurvey = () => {
    const { isAuthenticated, user } = (0, useAuth_1.useAuth)();
    const [submitSurvey, { loading, error, data }] = (0, client_1.useMutation)(SUBMIT_PREFERENCES_SURVEY);
    const [preferredCategories, setPreferredCategories] = (0, react_1.useState)([]);
    const [preferredBrands, setPreferredBrands] = (0, react_1.useState)([]);
    const [priceRangeMin, setPriceRangeMin] = (0, react_1.useState)(0);
    const [priceRangeMax, setPriceRangeMax] = (0, react_1.useState)(1000);
    const [shoppingFrequency, setShoppingFrequency] = (0, react_1.useState)(ShoppingFrequency.MONTHLY);
    const [priceSensitivity, setPriceSensitivity] = (0, react_1.useState)(PriceSensitivity.BALANCED);
    const [preferredAttributes, setPreferredAttributes] = (0, react_1.useState)([]);
    const [reviewImportance, setReviewImportance] = (0, react_1.useState)(5);
    const [submitted, setSubmitted] = (0, react_1.useState)(false);
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
    const handleCategoryToggle = (category) => {
        if (preferredCategories.includes(category)) {
            setPreferredCategories(preferredCategories.filter(c => c !== category));
        }
        else {
            setPreferredCategories([...preferredCategories, category]);
        }
    };
    const handleBrandToggle = (brand) => {
        if (preferredBrands.includes(brand)) {
            setPreferredBrands(preferredBrands.filter(b => b !== brand));
        }
        else {
            setPreferredBrands([...preferredBrands, brand]);
        }
    };
    const handleAttributeToggle = (attribute) => {
        if (preferredAttributes.includes(attribute)) {
            setPreferredAttributes(preferredAttributes.filter(a => a !== attribute));
        }
        else {
            setPreferredAttributes([...preferredAttributes, attribute]);
        }
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
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
                            onboardingCompleted: true,
                            onboardingTimestamp: Date.now()
                        }
                    }
                }
            });
            if (result.data.submitPreferencesSurvey) {
                setSubmitted(true);
            }
        }
        catch (err) {
            console.error('Error submitting preferences survey:', err);
        }
    };
    if (!isAuthenticated) {
        return (<div className="preferences-survey-container">
        <h2>Please log in to set your preferences</h2>
        <p>You need to be logged in to save your preferences.</p>
      </div>);
    }
    if (submitted) {
        return (<div className="preferences-survey-container">
        <h2>Thank you for your preferences!</h2>
        <p>Your shopping experience is now personalized based on your preferences.</p>
        <button className="primary-button" onClick={() => window.location.href = '/'}>
          Start Shopping
        </button>
      </div>);
    }
    return (<div className="preferences-survey-container">
      <h2>Welcome to Avnu Marketplace!</h2>
      <p>Tell us about your preferences to get personalized recommendations.</p>
      
      <form onSubmit={handleSubmit} className="preferences-form">
        
        <section className="form-section">
          <h3>What categories are you interested in?</h3>
          <p className="section-description">Select all that apply</p>
          
          <div className="options-grid">
            {availableCategories.map(category => (<div key={category} className={`option-item ${preferredCategories.includes(category) ? 'selected' : ''}`} onClick={() => handleCategoryToggle(category)}>
                {category}
              </div>))}
          </div>
        </section>
        
        
        <section className="form-section">
          <h3>Which brands do you prefer?</h3>
          <p className="section-description">Select all that apply</p>
          
          <div className="options-grid">
            {availableBrands.map(brand => (<div key={brand} className={`option-item ${preferredBrands.includes(brand) ? 'selected' : ''}`} onClick={() => handleBrandToggle(brand)}>
                {brand}
              </div>))}
          </div>
        </section>
        
        
        <section className="form-section">
          <h3>What's your typical price range?</h3>
          
          <div className="price-range-inputs">
            <div className="input-group">
              <label htmlFor="priceRangeMin">Minimum ($)</label>
              <input type="number" id="priceRangeMin" min="0" value={priceRangeMin} onChange={(e) => setPriceRangeMin(Number(e.target.value))}/>
            </div>
            
            <div className="input-group">
              <label htmlFor="priceRangeMax">Maximum ($)</label>
              <input type="number" id="priceRangeMax" min="0" value={priceRangeMax} onChange={(e) => setPriceRangeMax(Number(e.target.value))}/>
            </div>
          </div>
        </section>
        
        
        <section className="form-section">
          <h3>How often do you shop online?</h3>
          
          <div className="radio-options">
            {Object.values(ShoppingFrequency).map(frequency => (<label key={frequency} className="radio-option">
                <input type="radio" name="shoppingFrequency" value={frequency} checked={shoppingFrequency === frequency} onChange={() => setShoppingFrequency(frequency)}/>
                <span className="radio-label">
                  {frequency.charAt(0).toUpperCase() + frequency.slice(1)}
                </span>
              </label>))}
          </div>
        </section>
        
        
        <section className="form-section">
          <h3>How would you describe your price sensitivity?</h3>
          
          <div className="radio-options">
            {Object.values(PriceSensitivity).map(sensitivity => (<label key={sensitivity} className="radio-option">
                <input type="radio" name="priceSensitivity" value={sensitivity} checked={priceSensitivity === sensitivity} onChange={() => setPriceSensitivity(sensitivity)}/>
                <span className="radio-label">
                  {sensitivity.charAt(0).toUpperCase() + sensitivity.slice(1)}
                </span>
              </label>))}
          </div>
        </section>
        
        
        <section className="form-section">
          <h3>What product attributes are important to you?</h3>
          <p className="section-description">Select all that apply</p>
          
          <div className="options-grid">
            {availableAttributes.map(attribute => (<div key={attribute} className={`option-item ${preferredAttributes.includes(attribute) ? 'selected' : ''}`} onClick={() => handleAttributeToggle(attribute)}>
                {attribute}
              </div>))}
          </div>
        </section>
        
        
        <section className="form-section">
          <h3>How important are product reviews to you?</h3>
          
          <div className="slider-container">
            <input type="range" min="1" max="10" value={reviewImportance} onChange={(e) => setReviewImportance(Number(e.target.value))} className="slider"/>
            <div className="slider-labels">
              <span>Not important</span>
              <span>Very important</span>
            </div>
            <div className="slider-value">
              {reviewImportance}/10
            </div>
          </div>
        </section>
        
        
        <div className="form-actions">
          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? 'Saving...' : 'Save Preferences'}
          </button>
        </div>
        
        {error && (<div className="error-message">
            Error: {error.message}
          </div>)}
      </form>
    </div>);
};
exports.UserPreferencesSurvey = UserPreferencesSurvey;
exports.default = exports.UserPreferencesSurvey;
//# sourceMappingURL=preferences-survey-example.js.map