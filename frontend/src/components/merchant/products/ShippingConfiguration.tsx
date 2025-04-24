import { useState } from 'react';
import { 
  TruckIcon,
  PlusIcon,
  XMarkIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';

interface ShippingRule {
  id: string;
  minWeight?: number;
  maxWeight?: number;
  price: number;
  locations: string[];
}

interface ShippingConfiguration {
  freeShippingThreshold: number;
  enableFreeShipping: boolean;
  requiresShipping: boolean;
  weight: number;
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
  shippingClass: string;
  specialHandling: string[];
  shippingRules: ShippingRule[];
}

interface ShippingConfigurationProps {
  productId: string;
  initialConfig: ShippingConfiguration;
  onSave: (productId: string, config: ShippingConfiguration) => void;
}

const ShippingConfiguration = ({ 
  productId, 
  initialConfig, 
  onSave 
}: ShippingConfigurationProps) => {
  const [config, setConfig] = useState<ShippingConfiguration>(initialConfig);
  const [newRuleMinWeight, setNewRuleMinWeight] = useState<string>('');
  const [newRuleMaxWeight, setNewRuleMaxWeight] = useState<string>('');
  const [newRulePrice, setNewRulePrice] = useState<string>('');
  const [newRuleLocation, setNewRuleLocation] = useState<string>('');
  const [newRuleLocations, setNewRuleLocations] = useState<string[]>([]);
  const [newSpecialHandling, setNewSpecialHandling] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  
  // Available shipping classes
  const shippingClasses = [
    { id: 'standard', name: 'Standard Shipping' },
    { id: 'bulky', name: 'Bulky Items' },
    { id: 'fragile', name: 'Fragile Items' },
    { id: 'express', name: 'Express Shipping' },
    { id: 'international', name: 'International Shipping' }
  ];
  
  // Common special handling options
  const specialHandlingOptions = [
    'Fragile',
    'Refrigeration Required',
    'Hazardous Materials',
    'Oversized',
    'Signature Required',
    'Insurance Required'
  ];
  
  // Handle input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    
    if (name === 'enableFreeShipping') {
      const checkbox = e.target as HTMLInputElement;
      setConfig(prev => ({
        ...prev,
        enableFreeShipping: checkbox.checked
      }));
    } else if (name === 'requiresShipping') {
      const checkbox = e.target as HTMLInputElement;
      setConfig(prev => ({
        ...prev,
        requiresShipping: checkbox.checked
      }));
    } else if (name === 'freeShippingThreshold' || name === 'weight') {
      setConfig(prev => ({
        ...prev,
        [name]: parseFloat(value) || 0
      }));
    } else if (name.startsWith('dimensions.')) {
      const dimension = name.split('.')[1];
      setConfig(prev => ({
        ...prev,
        dimensions: {
          ...prev.dimensions,
          [dimension]: parseFloat(value) || 0
        }
      }));
    } else {
      setConfig(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  
  // Add a new location to the new rule
  const handleAddRuleLocation = () => {
    if (!newRuleLocation.trim()) return;
    
    if (!newRuleLocations.includes(newRuleLocation.trim())) {
      setNewRuleLocations(prev => [...prev, newRuleLocation.trim()]);
    }
    
    setNewRuleLocation('');
  };
  
  // Remove a location from the new rule
  const handleRemoveRuleLocation = (location: string) => {
    setNewRuleLocations(prev => prev.filter(loc => loc !== location));
  };
  
  // Add a new shipping rule
  const handleAddShippingRule = () => {
    if (newRuleLocations.length === 0 || !newRulePrice) return;
    
    const newRule: ShippingRule = {
      id: `rule-${Date.now()}`,
      price: parseFloat(newRulePrice) || 0,
      locations: [...newRuleLocations]
    };
    
    if (newRuleMinWeight) {
      newRule.minWeight = parseFloat(newRuleMinWeight);
    }
    
    if (newRuleMaxWeight) {
      newRule.maxWeight = parseFloat(newRuleMaxWeight);
    }
    
    setConfig(prev => ({
      ...prev,
      shippingRules: [...prev.shippingRules, newRule]
    }));
    
    // Reset form
    setNewRuleMinWeight('');
    setNewRuleMaxWeight('');
    setNewRulePrice('');
    setNewRuleLocations([]);
  };
  
  // Remove a shipping rule
  const handleRemoveShippingRule = (ruleId: string) => {
    setConfig(prev => ({
      ...prev,
      shippingRules: prev.shippingRules.filter(rule => rule.id !== ruleId)
    }));
  };
  
  // Add a special handling option
  const handleAddSpecialHandling = () => {
    if (!newSpecialHandling.trim()) return;
    
    if (!config.specialHandling.includes(newSpecialHandling.trim())) {
      setConfig(prev => ({
        ...prev,
        specialHandling: [...prev.specialHandling, newSpecialHandling.trim()]
      }));
    }
    
    setNewSpecialHandling('');
  };
  
  // Remove a special handling option
  const handleRemoveSpecialHandling = (option: string) => {
    setConfig(prev => ({
      ...prev,
      specialHandling: prev.specialHandling.filter(opt => opt !== option)
    }));
  };
  
  // Save configuration
  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(productId, config);
      // Show success message (in a real app)
    } catch (error) {
      console.error('Error saving shipping configuration:', error);
      // Show error message (in a real app)
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
        <h3 className="text-lg font-medium leading-6 text-gray-900">Shipping Configuration</h3>
        <p className="mt-1 text-sm text-gray-500">
          Configure shipping options and pricing for this product.
        </p>
      </div>
      
      <div className="px-4 py-5 sm:p-6 space-y-6">
        {/* Basic Shipping Settings */}
        <div>
          <h4 className="text-base font-medium text-gray-900 mb-4">Basic Settings</h4>
          
          <div className="space-y-4">
            {/* Requires Shipping */}
            <div className="relative flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="requiresShipping"
                  name="requiresShipping"
                  type="checkbox"
                  checked={config.requiresShipping}
                  onChange={handleInputChange}
                  className="focus:ring-sage h-4 w-4 text-sage border-gray-300 rounded"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="requiresShipping" className="font-medium text-gray-700">
                  This product requires shipping
                </label>
                <p className="text-gray-500">
                  Uncheck this for digital or service products that don't require shipping.
                </p>
              </div>
            </div>
            
            {config.requiresShipping && (
              <>
                {/* Free Shipping Threshold */}
                <div className="relative flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="enableFreeShipping"
                      name="enableFreeShipping"
                      type="checkbox"
                      checked={config.enableFreeShipping}
                      onChange={handleInputChange}
                      className="focus:ring-sage h-4 w-4 text-sage border-gray-300 rounded"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="enableFreeShipping" className="font-medium text-gray-700">
                      Enable free shipping threshold
                    </label>
                    <p className="text-gray-500">
                      Customers get free shipping when they spend over a certain amount.
                    </p>
                  </div>
                </div>
                
                {config.enableFreeShipping && (
                  <div className="ml-7">
                    <label htmlFor="freeShippingThreshold" className="block text-sm font-medium text-gray-700">
                      Free Shipping Threshold ($)
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">$</span>
                      </div>
                      <input
                        type="number"
                        name="freeShippingThreshold"
                        id="freeShippingThreshold"
                        min="0"
                        step="0.01"
                        value={config.freeShippingThreshold}
                        onChange={handleInputChange}
                        className="focus:ring-sage focus:border-sage block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
                        placeholder="0.00"
                      />
                    </div>
                    <p className="mt-2 text-sm text-gray-500">
                      Orders over this amount qualify for free shipping.
                    </p>
                  </div>
                )}
                
                {/* Weight & Dimensions */}
                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                  <div className="sm:col-span-2">
                    <label htmlFor="weight" className="block text-sm font-medium text-gray-700">
                      Weight (kg)
                    </label>
                    <div className="mt-1">
                      <input
                        type="number"
                        name="weight"
                        id="weight"
                        min="0"
                        step="0.01"
                        value={config.weight}
                        onChange={handleInputChange}
                        className="shadow-sm focus:ring-sage focus:border-sage block w-full sm:text-sm border-gray-300 rounded-md"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                  
                  <div className="sm:col-span-4">
                    <label htmlFor="dimensions" className="block text-sm font-medium text-gray-700">
                      Dimensions (cm)
                    </label>
                    <div className="mt-1 grid grid-cols-3 gap-3">
                      <div>
                        <label htmlFor="dimensions.length" className="sr-only">Length</label>
                        <div className="relative rounded-md shadow-sm">
                          <input
                            type="number"
                            name="dimensions.length"
                            id="dimensions.length"
                            min="0"
                            step="0.1"
                            value={config.dimensions.length}
                            onChange={handleInputChange}
                            className="focus:ring-sage focus:border-sage block w-full sm:text-sm border-gray-300 rounded-md"
                            placeholder="Length"
                          />
                          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                            <span className="text-gray-500 sm:text-sm">L</span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <label htmlFor="dimensions.width" className="sr-only">Width</label>
                        <div className="relative rounded-md shadow-sm">
                          <input
                            type="number"
                            name="dimensions.width"
                            id="dimensions.width"
                            min="0"
                            step="0.1"
                            value={config.dimensions.width}
                            onChange={handleInputChange}
                            className="focus:ring-sage focus:border-sage block w-full sm:text-sm border-gray-300 rounded-md"
                            placeholder="Width"
                          />
                          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                            <span className="text-gray-500 sm:text-sm">W</span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <label htmlFor="dimensions.height" className="sr-only">Height</label>
                        <div className="relative rounded-md shadow-sm">
                          <input
                            type="number"
                            name="dimensions.height"
                            id="dimensions.height"
                            min="0"
                            step="0.1"
                            value={config.dimensions.height}
                            onChange={handleInputChange}
                            className="focus:ring-sage focus:border-sage block w-full sm:text-sm border-gray-300 rounded-md"
                            placeholder="Height"
                          />
                          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                            <span className="text-gray-500 sm:text-sm">H</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Shipping Class */}
                <div>
                  <label htmlFor="shippingClass" className="block text-sm font-medium text-gray-700">
                    Shipping Class
                  </label>
                  <select
                    id="shippingClass"
                    name="shippingClass"
                    value={config.shippingClass}
                    onChange={handleInputChange}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-sage focus:border-sage sm:text-sm rounded-md"
                  >
                    <option value="">Select a shipping class</option>
                    {shippingClasses.map((cls) => (
                      <option key={cls.id} value={cls.id}>
                        {cls.name}
                      </option>
                    ))}
                  </select>
                  <p className="mt-2 text-sm text-gray-500">
                    Shipping classes help you group products with similar shipping requirements.
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
        
        {/* Special Handling */}
        {config.requiresShipping && (
          <div className="pt-6 border-t border-gray-200">
            <h4 className="text-base font-medium text-gray-900 mb-4">Special Handling</h4>
            
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2 mb-4">
                {specialHandlingOptions.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => {
                      if (config.specialHandling.includes(option)) {
                        handleRemoveSpecialHandling(option);
                      } else {
                        setConfig(prev => ({
                          ...prev,
                          specialHandling: [...prev.specialHandling, option]
                        }));
                      }
                    }}
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      config.specialHandling.includes(option)
                        ? 'bg-sage text-white'
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
              
              <div className="flex rounded-md shadow-sm">
                <input
                  type="text"
                  name="newSpecialHandling"
                  id="newSpecialHandling"
                  value={newSpecialHandling}
                  onChange={(e) => setNewSpecialHandling(e.target.value)}
                  className="flex-1 min-w-0 block w-full px-3 py-2 rounded-l-md focus:ring-sage focus:border-sage sm:text-sm border-gray-300"
                  placeholder="Add custom handling requirement"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddSpecialHandling();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={handleAddSpecialHandling}
                  className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 text-gray-500 sm:text-sm hover:bg-gray-100"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Weight-Based Shipping Rules */}
        {config.requiresShipping && (
          <div className="pt-6 border-t border-gray-200">
            <h4 className="text-base font-medium text-gray-900 mb-4">Shipping Rules</h4>
            
            <div className="space-y-4">
              {/* Add New Rule Form */}
              <div className="bg-gray-50 p-4 rounded-md">
                <h5 className="text-sm font-medium text-gray-700 mb-3">Add New Shipping Rule</h5>
                
                <div className="grid grid-cols-1 gap-y-4 gap-x-4 sm:grid-cols-6">
                  <div className="sm:col-span-3">
                    <label htmlFor="newRuleMinWeight" className="block text-sm font-medium text-gray-700">
                      Min Weight (kg)
                    </label>
                    <input
                      type="number"
                      name="newRuleMinWeight"
                      id="newRuleMinWeight"
                      min="0"
                      step="0.01"
                      value={newRuleMinWeight}
                      onChange={(e) => setNewRuleMinWeight(e.target.value)}
                      className="mt-1 shadow-sm focus:ring-sage focus:border-sage block w-full sm:text-sm border-gray-300 rounded-md"
                      placeholder="0.00"
                    />
                  </div>
                  
                  <div className="sm:col-span-3">
                    <label htmlFor="newRuleMaxWeight" className="block text-sm font-medium text-gray-700">
                      Max Weight (kg)
                    </label>
                    <input
                      type="number"
                      name="newRuleMaxWeight"
                      id="newRuleMaxWeight"
                      min="0"
                      step="0.01"
                      value={newRuleMaxWeight}
                      onChange={(e) => setNewRuleMaxWeight(e.target.value)}
                      className="mt-1 shadow-sm focus:ring-sage focus:border-sage block w-full sm:text-sm border-gray-300 rounded-md"
                      placeholder="0.00"
                    />
                  </div>
                  
                  <div className="sm:col-span-2">
                    <label htmlFor="newRulePrice" className="block text-sm font-medium text-gray-700">
                      Shipping Price ($)
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">$</span>
                      </div>
                      <input
                        type="number"
                        name="newRulePrice"
                        id="newRulePrice"
                        min="0"
                        step="0.01"
                        value={newRulePrice}
                        onChange={(e) => setNewRulePrice(e.target.value)}
                        className="focus:ring-sage focus:border-sage block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                  
                  <div className="sm:col-span-4">
                    <label htmlFor="newRuleLocation" className="block text-sm font-medium text-gray-700">
                      Locations
                    </label>
                    <div className="mt-1 flex rounded-md shadow-sm">
                      <div className="relative flex items-stretch flex-grow focus-within:z-10">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <GlobeAltIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                        </div>
                        <input
                          type="text"
                          name="newRuleLocation"
                          id="newRuleLocation"
                          value={newRuleLocation}
                          onChange={(e) => setNewRuleLocation(e.target.value)}
                          className="focus:ring-sage focus:border-sage block w-full rounded-none rounded-l-md pl-10 sm:text-sm border-gray-300"
                          placeholder="Country, region, or 'Global'"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddRuleLocation();
                            }
                          }}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleAddRuleLocation}
                        className="-ml-px relative inline-flex items-center space-x-2 px-4 py-2 border border-gray-300 text-sm font-medium rounded-r-md text-gray-700 bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-sage focus:border-sage"
                      >
                        <PlusIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                        <span>Add</span>
                      </button>
                    </div>
                  </div>
                </div>
                
                {newRuleLocations.length > 0 && (
                  <div className="mt-3">
                    <h6 className="text-xs font-medium text-gray-700 mb-2">Selected Locations:</h6>
                    <div className="flex flex-wrap gap-2">
                      {newRuleLocations.map((location) => (
                        <span
                          key={location}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          {location}
                          <button
                            type="button"
                            onClick={() => handleRemoveRuleLocation(location)}
                            className="ml-1.5 inline-flex items-center justify-center h-4 w-4 rounded-full text-blue-400 hover:text-blue-600 focus:outline-none"
                          >
                            <XMarkIcon className="h-3 w-3" aria-hidden="true" />
                            <span className="sr-only">Remove {location}</span>
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="mt-4 flex justify-end">
                  <button
                    type="button"
                    onClick={handleAddShippingRule}
                    disabled={newRuleLocations.length === 0 || !newRulePrice}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-sage hover:bg-sage/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sage disabled:opacity-50"
                  >
                    <PlusIcon className="-ml-0.5 mr-2 h-4 w-4" aria-hidden="true" />
                    Add Rule
                  </button>
                </div>
              </div>
              
              {/* Existing Rules */}
              {config.shippingRules.length > 0 ? (
                <div className="mt-4 bg-white border border-gray-200 rounded-md overflow-hidden">
                  <ul className="divide-y divide-gray-200">
                    {config.shippingRules.map((rule) => (
                      <li key={rule.id} className="px-4 py-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h6 className="text-sm font-medium text-gray-900">
                              ${rule.price.toFixed(2)} Shipping
                              {rule.minWeight !== undefined && rule.maxWeight !== undefined && (
                                <span className="ml-2 text-gray-500">
                                  ({rule.minWeight}kg - {rule.maxWeight}kg)
                                </span>
                              )}
                              {rule.minWeight !== undefined && rule.maxWeight === undefined && (
                                <span className="ml-2 text-gray-500">
                                  (Over {rule.minWeight}kg)
                                </span>
                              )}
                              {rule.minWeight === undefined && rule.maxWeight !== undefined && (
                                <span className="ml-2 text-gray-500">
                                  (Up to {rule.maxWeight}kg)
                                </span>
                              )}
                            </h6>
                            <div className="mt-1 flex flex-wrap gap-1">
                              {rule.locations.map((location) => (
                                <span
                                  key={location}
                                  className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
                                >
                                  {location}
                                </span>
                              ))}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveShippingRule(rule.id)}
                            className="inline-flex items-center p-1 border border-transparent rounded-full text-red-600 hover:bg-red-100 focus:outline-none"
                          >
                            <XMarkIcon className="h-5 w-5" aria-hidden="true" />
                            <span className="sr-only">Remove rule</span>
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="text-center py-4 text-sm text-gray-500">
                  No shipping rules defined yet. Add your first rule above.
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Save Button */}
        <div className="pt-6 border-t border-gray-200 flex justify-end">
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-sage hover:bg-sage/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sage disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <TruckIcon className="animate-pulse -ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                Saving...
              </>
            ) : (
              <>
                <TruckIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                Save Shipping Settings
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShippingConfiguration;
