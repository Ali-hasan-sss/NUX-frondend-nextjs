"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { fetchRestaurants } from "@/features/public/restaurants/publicRestaurantsThunks";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, X } from "lucide-react";

interface RestaurantAutocompleteProps {
  label?: string;
  placeholder?: string;
  onSelect: (restaurant: any) => void;
  selectedRestaurant?: any;
  onClear?: () => void;
  disabled?: boolean;
  className?: string;
}

export function RestaurantAutocomplete({
  label = "Search Restaurant",
  placeholder = "Type restaurant name to search...",
  onSelect,
  selectedRestaurant,
  onClear,
  disabled = false,
  className = "",
}: RestaurantAutocompleteProps) {
  const dispatch = useAppDispatch();
  const { restaurants, loading } = useAppSelector((s) => s.publicRestaurants);

  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load restaurants when component mounts
  useEffect(() => {
    dispatch(fetchRestaurants({ limit: 100 }));
  }, [dispatch]);

  // Debounced search function
  const debouncedSearch = useCallback(
    (query: string) => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }

      debounceTimeoutRef.current = setTimeout(() => {
        if (query.trim().length > 0) {
          setIsSearching(true);
          dispatch(
            fetchRestaurants({
              limit: 100,
              search: query.trim(),
            })
          );
          setIsSearching(false);
        }
      }, 500); // 500ms delay
    },
    [dispatch]
  );

  // Load restaurants when search query changes (with debounce)
  useEffect(() => {
    if (searchQuery.trim().length > 0) {
      debouncedSearch(searchQuery);
    }
  }, [searchQuery, debouncedSearch]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  // Update loading state based on Redux state

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Handle search input change
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    onClear?.();

    if (value.trim().length > 0) {
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  // Handle restaurant selection
  const handleRestaurantSelect = (restaurant: any) => {
    onSelect(restaurant);
    setSearchQuery(restaurant.name);
    setShowSuggestions(false);
  };

  // Clear selection
  const handleClearSelection = () => {
    onClear?.();
    setSearchQuery("");
    setShowSuggestions(false);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {label && <Label htmlFor="searchRestaurant">{label}</Label>}
      <div className="relative" ref={searchRef}>
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          id="searchRestaurant"
          placeholder={placeholder}
          value={searchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
          onFocus={() => {
            if (searchQuery.trim().length > 0) {
              setShowSuggestions(true);
            }
          }}
          className="pl-10 pr-10"
          disabled={disabled}
        />
        {selectedRestaurant && (
          <button
            type="button"
            onClick={handleClearSelection}
            className="absolute right-3 top-3 h-4 w-4 text-muted-foreground hover:text-foreground"
            disabled={disabled}
          >
            <X className="h-4 w-4" />
          </button>
        )}

        {/* Suggestions Dropdown */}
        {showSuggestions && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
            {isSearching ? (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="ml-2 text-sm">Searching...</span>
              </div>
            ) : restaurants.length === 0 ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                {searchQuery.trim().length > 0
                  ? "No restaurants found matching your search"
                  : "Start typing to search restaurants"}
              </div>
            ) : (
              restaurants.map((restaurant) => (
                <button
                  key={restaurant.id}
                  type="button"
                  onClick={() => handleRestaurantSelect(restaurant)}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                  disabled={disabled}
                >
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs">
                        {restaurant.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {restaurant.name}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {restaurant.address}
                      </p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        )}
      </div>

      {/* Selected Restaurant Display */}
      {selectedRestaurant && (
        <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-md">
          <div className="flex items-center space-x-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="text-xs bg-green-100 text-green-700">
                {selectedRestaurant.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="text-sm font-medium text-green-900">
                {selectedRestaurant.name}
              </p>
              <p className="text-xs text-green-600">
                {selectedRestaurant.address}
              </p>
            </div>
            <Badge
              variant="outline"
              className="text-green-700 border-green-300"
            >
              Selected
            </Badge>
          </div>
        </div>
      )}
    </div>
  );
}
