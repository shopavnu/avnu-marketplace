import { FC } from 'react';
import { UserGroupIcon, MapPinIcon, HeartIcon } from '@heroicons/react/24/outline';

interface DemographicTargetingProps {
  ageRanges: string[];
  genders: string[];
  interests: string[];
  locations: string[];
  selectedAgeRanges: string[];
  selectedGenders: string[];
  selectedInterests: string[];
  selectedLocations: string[];
  onCheckboxChange: (field: string, value: string) => void;
}

const DemographicTargeting: FC<DemographicTargetingProps> = ({
  ageRanges,
  genders,
  interests,
  locations,
  selectedAgeRanges,
  selectedGenders,
  selectedInterests,
  selectedLocations,
  onCheckboxChange
}) => {
  return (
    <div className="space-y-8">
      {/* Age Ranges */}
      <div>
        <div className="flex items-center mb-4">
          <UserGroupIcon className="h-5 w-5 text-gray-400 mr-2" />
          <h3 className="text-sm font-medium text-gray-700">Age Ranges</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {ageRanges.map((age: string) => (
            <div key={age} className="flex items-center">
              <input
                type="checkbox"
                id={`age-${age}`}
                checked={selectedAgeRanges.includes(age)}
                onChange={() => onCheckboxChange('selectedAgeRanges', age)}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor={`age-${age}`} className="ml-2 text-sm text-gray-700">
                {age}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Genders */}
      <div>
        <div className="flex items-center mb-4">
          <UserGroupIcon className="h-5 w-5 text-gray-400 mr-2" />
          <h3 className="text-sm font-medium text-gray-700">Gender</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {genders.map((gender: string) => (
            <div key={gender} className="flex items-center">
              <input
                type="checkbox"
                id={`gender-${gender}`}
                checked={selectedGenders.includes(gender)}
                onChange={() => onCheckboxChange('selectedGenders', gender)}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor={`gender-${gender}`} className="ml-2 text-sm text-gray-700">
                {gender}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Interests */}
      <div>
        <div className="flex items-center mb-4">
          <HeartIcon className="h-5 w-5 text-gray-400 mr-2" />
          <h3 className="text-sm font-medium text-gray-700">Interests</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {interests.map((interest: string) => (
            <div key={interest} className="flex items-center">
              <input
                type="checkbox"
                id={`interest-${interest.replace(/\s+/g, '-').toLowerCase()}`}
                checked={selectedInterests.includes(interest)}
                onChange={() => onCheckboxChange('selectedInterests', interest)}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor={`interest-${interest.replace(/\s+/g, '-').toLowerCase()}`} className="ml-2 text-sm text-gray-700">
                {interest}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Locations */}
      <div>
        <div className="flex items-center mb-4">
          <MapPinIcon className="h-5 w-5 text-gray-400 mr-2" />
          <h3 className="text-sm font-medium text-gray-700">Locations</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {locations.map((location: string) => (
            <div key={location} className="flex items-center">
              <input
                type="checkbox"
                id={`location-${location.replace(/\s+/g, '-').toLowerCase()}`}
                checked={selectedLocations.includes(location)}
                onChange={() => onCheckboxChange('selectedLocations', location)}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor={`location-${location.replace(/\s+/g, '-').toLowerCase()}`} className="ml-2 text-sm text-gray-700">
                {location}
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DemographicTargeting;
