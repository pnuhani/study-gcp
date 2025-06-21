/**
 * PhoneInput Component
 * -------------------
 * A reusable phone input component with country code dropdown
 * Provides a clean interface for entering phone numbers with proper country code selection
 */

import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import PhoneIcon from '@mui/icons-material/Phone';

// Comprehensive list of countries with their codes
const COUNTRIES = [
  { code: '+1', name: 'United States', flag: '🇺🇸', countryCode: 'US' },
  { code: '+1', name: 'Canada', flag: '🇨🇦', countryCode: 'CA' },
  { code: '+44', name: 'United Kingdom', flag: '🇬🇧', countryCode: 'GB' },
  { code: '+91', name: 'India', flag: '🇮🇳', countryCode: 'IN' },
  { code: '+86', name: 'China', flag: '🇨🇳', countryCode: 'CN' },
  { code: '+81', name: 'Japan', flag: '🇯🇵', countryCode: 'JP' },
  { code: '+49', name: 'Germany', flag: '🇩🇪', countryCode: 'DE' },
  { code: '+33', name: 'France', flag: '🇫🇷', countryCode: 'FR' },
  { code: '+39', name: 'Italy', flag: '🇮🇹', countryCode: 'IT' },
  { code: '+34', name: 'Spain', flag: '🇪🇸', countryCode: 'ES' },
  { code: '+7', name: 'Russia', flag: '🇷🇺', countryCode: 'RU' },
  { code: '+55', name: 'Brazil', flag: '🇧🇷', countryCode: 'BR' },
  { code: '+52', name: 'Mexico', flag: '🇲🇽', countryCode: 'MX' },
  { code: '+61', name: 'Australia', flag: '🇦🇺', countryCode: 'AU' },
  { code: '+82', name: 'South Korea', flag: '🇰🇷', countryCode: 'KR' },
  { code: '+90', name: 'Turkey', flag: '🇹🇷', countryCode: 'TR' },
  { code: '+971', name: 'United Arab Emirates', flag: '🇦🇪', countryCode: 'AE' },
  { code: '+966', name: 'Saudi Arabia', flag: '🇸🇦', countryCode: 'SA' },
  { code: '+27', name: 'South Africa', flag: '🇿🇦', countryCode: 'ZA' },
  { code: '+65', name: 'Singapore', flag: '🇸🇬', countryCode: 'SG' },
  { code: '+31', name: 'Netherlands', flag: '🇳🇱', countryCode: 'NL' },
  { code: '+46', name: 'Sweden', flag: '🇸🇪', countryCode: 'SE' },
  { code: '+47', name: 'Norway', flag: '🇳🇴', countryCode: 'NO' },
  { code: '+45', name: 'Denmark', flag: '🇩🇰', countryCode: 'DK' },
  { code: '+358', name: 'Finland', flag: '🇫🇮', countryCode: 'FI' },
  { code: '+41', name: 'Switzerland', flag: '🇨🇭', countryCode: 'CH' },
  { code: '+43', name: 'Austria', flag: '🇦🇹', countryCode: 'AT' },
  { code: '+32', name: 'Belgium', flag: '🇧🇪', countryCode: 'BE' },
  { code: '+351', name: 'Portugal', flag: '🇵🇹', countryCode: 'PT' },
  { code: '+48', name: 'Poland', flag: '🇵🇱', countryCode: 'PL' },
  { code: '+420', name: 'Czech Republic', flag: '🇨🇿', countryCode: 'CZ' },
  { code: '+36', name: 'Hungary', flag: '🇭🇺', countryCode: 'HU' },
  { code: '+40', name: 'Romania', flag: '🇷🇴', countryCode: 'RO' },
  { code: '+30', name: 'Greece', flag: '🇬🇷', countryCode: 'GR' },
  { code: '+385', name: 'Croatia', flag: '🇭🇷', countryCode: 'HR' },
  { code: '+381', name: 'Serbia', flag: '🇷🇸', countryCode: 'RS' },
  { code: '+380', name: 'Ukraine', flag: '🇺🇦', countryCode: 'UA' },
  { code: '+374', name: 'Armenia', flag: '🇦🇲', countryCode: 'AM' },
  { code: '+995', name: 'Georgia', flag: '🇬🇪', countryCode: 'GE' },
  { code: '+62', name: 'Indonesia', flag: '🇮🇩', countryCode: 'ID' },
  { code: '+60', name: 'Malaysia', flag: '🇲🇾', countryCode: 'MY' },
  { code: '+66', name: 'Thailand', flag: '🇹🇭', countryCode: 'TH' },
  { code: '+84', name: 'Vietnam', flag: '🇻🇳', countryCode: 'VN' },
  { code: '+63', name: 'Philippines', flag: '🇵🇭', countryCode: 'PH' },
  { code: '+880', name: 'Bangladesh', flag: '🇧🇩', countryCode: 'BD' },
  { code: '+94', name: 'Sri Lanka', flag: '🇱🇰', countryCode: 'LK' },
  { code: '+92', name: 'Pakistan', flag: '🇵🇰', countryCode: 'PK' },
  { code: '+977', name: 'Nepal', flag: '🇳🇵', countryCode: 'NP' },
  { code: '+98', name: 'Iran', flag: '🇮🇷', countryCode: 'IR' },
  { code: '+964', name: 'Iraq', flag: '🇮🇶', countryCode: 'IQ' },
  { code: '+972', name: 'Israel', flag: '🇮🇱', countryCode: 'IL' },
  { code: '+962', name: 'Jordan', flag: '🇯🇴', countryCode: 'JO' },
  { code: '+961', name: 'Lebanon', flag: '🇱🇧', countryCode: 'LB' },
  { code: '+965', name: 'Kuwait', flag: '🇰🇼', countryCode: 'KW' },
  { code: '+968', name: 'Oman', flag: '🇴🇲', countryCode: 'OM' },
  { code: '+974', name: 'Qatar', flag: '🇶🇦', countryCode: 'QA' },
  { code: '+973', name: 'Bahrain', flag: '🇧🇭', countryCode: 'BH' },
  { code: '+20', name: 'Egypt', flag: '🇪🇬', countryCode: 'EG' },
  { code: '+212', name: 'Morocco', flag: '🇲🇦', countryCode: 'MA' },
  { code: '+213', name: 'Algeria', flag: '🇩🇿', countryCode: 'DZ' },
  { code: '+216', name: 'Tunisia', flag: '🇹🇳', countryCode: 'TN' },
  { code: '+218', name: 'Libya', flag: '🇱🇾', countryCode: 'LY' },
  { code: '+234', name: 'Nigeria', flag: '🇳🇬', countryCode: 'NG' },
  { code: '+233', name: 'Ghana', flag: '🇬🇭', countryCode: 'GH' },
  { code: '+254', name: 'Kenya', flag: '🇰🇪', countryCode: 'KE' },
  { code: '+256', name: 'Uganda', flag: '🇺🇬', countryCode: 'UG' },
  { code: '+255', name: 'Tanzania', flag: '🇹🇿', countryCode: 'TZ' },
  { code: '+251', name: 'Ethiopia', flag: '🇪🇹', countryCode: 'ET' },
  { code: '+54', name: 'Argentina', flag: '🇦🇷', countryCode: 'AR' },
  { code: '+56', name: 'Chile', flag: '🇨🇱', countryCode: 'CL' },
  { code: '+57', name: 'Colombia', flag: '🇨🇴', countryCode: 'CO' },
  { code: '+51', name: 'Peru', flag: '🇵🇪', countryCode: 'PE' },
  { code: '+58', name: 'Venezuela', flag: '🇻🇪', countryCode: 'VE' },
  { code: '+593', name: 'Ecuador', flag: '🇪🇨', countryCode: 'EC' },
  { code: '+595', name: 'Paraguay', flag: '🇵🇾', countryCode: 'PY' },
  { code: '+598', name: 'Uruguay', flag: '🇺🇾', countryCode: 'UY' },
  { code: '+591', name: 'Bolivia', flag: '🇧🇴', countryCode: 'BO' },
  { code: '+64', name: 'New Zealand', flag: '🇳🇿', countryCode: 'NZ' },
  { code: '+679', name: 'Fiji', flag: '🇫🇯', countryCode: 'FJ' },
];

export default function PhoneInput({ 
  value = '', 
  onChange, 
  placeholder = 'Enter phone number',
  className = '',
  disabled = false,
  required = false,
  id = 'phone-input',
  label = 'Phone Number',
  showLabel = true,
  error = '',
  defaultCountry = '+1' // Default to US
}) {
  const [selectedCountry, setSelectedCountry] = useState(
    COUNTRIES.find(country => country.code === defaultCountry) || COUNTRIES[0]
  );
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);

  // Parse existing value to separate country code and number
  useEffect(() => {
    if (value) {
      // Try to match the value with existing country codes
      const matchedCountry = COUNTRIES.find(country => 
        value.startsWith(country.code)
      );
      
      if (matchedCountry) {
        setSelectedCountry(matchedCountry);
        setPhoneNumber(value.substring(matchedCountry.code.length).trim());
      } else {
        // If no match found, assume it's a full number and use default country
        setPhoneNumber(value);
      }
    }
  }, [value]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle phone number input change
  const handlePhoneNumberChange = (e) => {
    const newNumber = e.target.value;
    setPhoneNumber(newNumber);
    
    // Combine country code and phone number
    const fullNumber = `${selectedCountry.code} ${newNumber}`.trim();
    onChange(fullNumber);
  };

  // Handle country selection
  const handleCountrySelect = (country) => {
    setSelectedCountry(country);
    setIsDropdownOpen(false);
    setSearchTerm('');
    
    // Update the full number with new country code
    const fullNumber = `${country.code} ${phoneNumber}`.trim();
    onChange(fullNumber);
  };

  // Filter countries based on search term
  const filteredCountries = COUNTRIES.filter(country =>
    country.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    country.code.includes(searchTerm)
  );

  return (
    <div className="relative" style={{ 
      zIndex: isDropdownOpen ? 100 : 'auto',
      overflow: 'visible'
    }}>
      {showLabel && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="flex">
        {/* Phone Icon */}
        <div className="flex items-center px-3 py-3 bg-gray-100 border border-r-0 border-gray-300 rounded-l-md">
          <PhoneIcon className="h-5 w-5 text-[#3a5a78]" />
        </div>

        {/* Country Code Dropdown */}
        <div className="relative" ref={dropdownRef} style={{ 
          zIndex: isDropdownOpen ? 99998 : 'auto',
          overflow: 'visible'
        }}>
          <button
            ref={buttonRef}
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            disabled={disabled}
            className="flex items-center px-3 py-3 bg-gray-50 border border-r-0 border-gray-300 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#3a5a78] focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-w-[120px] justify-between"
          >
            <div className="flex items-center">
              <span className="mr-2">{selectedCountry.flag}</span>
              <span className="text-sm font-medium text-gray-700">
                {selectedCountry.code}
              </span>
            </div>
            <svg
              className={`w-4 h-4 text-gray-500 transition-transform ${
                isDropdownOpen ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Dropdown Menu - Using a portal-like approach */}
          {isDropdownOpen && (
            <div 
              className="fixed bg-white border border-gray-300 rounded-md shadow-xl"
              style={{
                zIndex: 99999,
                width: '320px',
                left: buttonRef.current ? buttonRef.current.getBoundingClientRect().left : 0,
                top: buttonRef.current ? buttonRef.current.getBoundingClientRect().bottom + 4 : 0,
                transform: 'translateZ(0)',
                willChange: 'transform',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                maxHeight: '400px'
              }}>
              {/* Search Input */}
              <div className="p-3 border-b border-gray-200 bg-gray-50">
                <input
                  type="text"
                  placeholder="Search countries..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3a5a78] text-sm"
                  autoFocus
                />
              </div>
              
              {/* Countries List */}
              <div 
                className="overflow-y-auto overflow-x-hidden"
                style={{
                  maxHeight: '320px',
                  minHeight: '200px'
                }}>
                {filteredCountries.length > 0 ? (
                  filteredCountries.map((country) => (
                    <button
                      key={`${country.countryCode}-${country.code}`}
                      type="button"
                      onClick={() => handleCountrySelect(country)}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 focus:bg-gray-100 focus:outline-none flex items-center space-x-3 transition-colors"
                    >
                      <span className="text-lg">{country.flag}</span>
                      <span className="flex-1 text-sm text-gray-900">{country.name}</span>
                      <span className="text-sm text-gray-500 font-medium">{country.code}</span>
                    </button>
                  ))
                ) : (
                  <div className="px-4 py-3 text-sm text-gray-500 text-center">
                    No countries found
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Phone Number Input */}
        <input
          id={id}
          type="tel"
          value={phoneNumber}
          onChange={handlePhoneNumberChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={`flex-1 px-4 py-3 border border-gray-300 rounded-r-md focus:outline-none focus:ring-2 focus:ring-[#3a5a78] disabled:opacity-50 disabled:cursor-not-allowed ${
            error ? 'border-red-500' : 'border-gray-300'
          } ${className}`}
        />
      </div>

      {/* Error Message */}
      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}

      {/* Helper Text */}
      {!error && (
        <p className="mt-1 text-xs text-gray-500">
          Select your country and enter your phone number
        </p>
      )}
    </div>
  );
}

PhoneInput.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  className: PropTypes.string,
  disabled: PropTypes.bool,
  required: PropTypes.bool,
  id: PropTypes.string,
  label: PropTypes.string,
  showLabel: PropTypes.bool,
  error: PropTypes.string,
  defaultCountry: PropTypes.string,
}; 