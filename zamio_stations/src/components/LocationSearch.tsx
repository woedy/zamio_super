import React, { useState, useEffect, useRef } from 'react';
import { MapPin, ChevronDown } from 'lucide-react';
import api from '../lib/api';

interface LocationOption {
  value: string;
  label: string;
  type: string;
}

interface LocationSearchProps {
  value: string;
  onChange: (value: string, lat?: number, lng?: number) => void;
  placeholder?: string;
  error?: string;
  required?: boolean;
  className?: string;
}

const LocationSearch: React.FC<LocationSearchProps> = ({
  value,
  onChange,
  placeholder = "Search for your location...",
  error,
  required = false,
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState(value);
  const [suggestions, setSuggestions] = useState<LocationOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setSearchQuery(value);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const searchLocations = async (query: string) => {
    if (!query.trim() || query.length < 2) {
      setSuggestions([]);
      return;
    }

    setLoading(true);
    try {
      const response = await api.get(`/api/accounts/location-search/?query=${encodeURIComponent(query)}`);
      if (response.data.success && response.data.data.suggestions) {
        setSuggestions(response.data.data.suggestions);
      } else {
        setSuggestions([]);
      }
    } catch (error) {
      console.error('Failed to search locations:', error);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearchQuery(newValue);
    setIsOpen(true);

    // Clear existing timer
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    // Set new timer for debounced search
    const timer = setTimeout(() => {
      searchLocations(newValue);
    }, 300);
    setDebounceTimer(timer);
  };

  const handleInputFocus = () => {
    setIsOpen(true);
    if (searchQuery.length >= 2) {
      searchLocations(searchQuery);
    }
  };

  const handleOptionSelect = (option: LocationOption) => {
    setSearchQuery(option.label);
    onChange(option.value);
    setIsOpen(false);
    setSuggestions([]);
  };

  const handleInputBlur = () => {
    // Small delay to allow option selection
    setTimeout(() => {
      if (!dropdownRef.current?.contains(document.activeElement)) {
        setIsOpen(false);
      }
    }, 150);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <MapPin className="h-5 w-5 text-gray-400" />
        </div>
        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={`w-full pl-10 pr-10 py-3 rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 ${
            error ? 'border-red-500' : 'border-gray-300'
          }`}
          required={required}
        />
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
          {loading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
          ) : (
            <ChevronDown 
              className={`h-5 w-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            />
          )}
        </div>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white rounded-lg border border-gray-300 shadow-lg max-h-60 overflow-auto">
          {suggestions.length > 0 ? (
            <ul className="py-1">
              {suggestions.map((option, index) => (
                <li key={index}>
                  <button
                    type="button"
                    className="w-full text-left px-4 py-2 hover:bg-blue-50 transition-colors flex items-center space-x-2 text-gray-900"
                    onClick={() => handleOptionSelect(option)}
                  >
                    <MapPin className="h-4 w-4 flex-shrink-0 text-gray-400" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{option.label}</div>
                      <div className="text-xs text-gray-500 capitalize">{option.type}</div>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          ) : searchQuery.length >= 2 && !loading ? (
            <div className="px-4 py-3 text-sm text-gray-500">
              No locations found for "{searchQuery}"
            </div>
          ) : searchQuery.length < 2 && !loading ? (
            <div className="px-4 py-3 text-sm text-gray-500">
              Type at least 2 characters to search
            </div>
          ) : null}
        </div>
      )}

      {error && (
        <p className="mt-1 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
};

export default LocationSearch;