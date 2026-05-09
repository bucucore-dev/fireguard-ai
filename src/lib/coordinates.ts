/**
 * Coordinate utilities for EPSG:4326 (WGS 84)
 * Standard geographic coordinate system used by GPS, Google Maps, OpenStreetMap
 */

export interface Coordinates {
  latitude: number;
  longitude: number;
}

/**
 * Validate if coordinates are within valid range
 * Latitude: -90 to +90
 * Longitude: -180 to +180
 */
export function validateCoordinates(lat: number, lng: number): boolean {
  if (typeof lat !== 'number' || typeof lng !== 'number') {
    return false;
  }
  
  if (isNaN(lat) || isNaN(lng)) {
    return false;
  }
  
  if (lat < -90 || lat > 90) {
    return false;
  }
  
  if (lng < -180 || lng > 180) {
    return false;
  }
  
  return true;
}

/**
 * Check if coordinates are likely for Indonesia
 * Indonesia bounds (approximate):
 * Latitude: -11 to +6
 * Longitude: +95 to +141
 */
export function isIndonesiaCoordinates(lat: number, lng: number): boolean {
  return lat >= -11 && lat <= 6 && lng >= 95 && lng <= 141;
}

/**
 * Format coordinates for display
 * Example: "6.208800°S, 106.845600°E"
 */
export function formatCoordinates(lat: number, lng: number): string {
  const latDir = lat >= 0 ? 'N' : 'S';
  const lngDir = lng >= 0 ? 'E' : 'W';
  
  return `${Math.abs(lat).toFixed(6)}°${latDir}, ${Math.abs(lng).toFixed(6)}°${lngDir}`;
}

/**
 * Format coordinates for Google Maps URL
 * Example: "-6.208800,106.845600"
 */
export function formatForGoogleMaps(lat: number, lng: number): string {
  return `${lat.toFixed(6)},${lng.toFixed(6)}`;
}

/**
 * Get Google Maps URL for coordinates
 */
export function getGoogleMapsUrl(lat: number, lng: number, zoom: number = 15): string {
  return `https://www.google.com/maps/@${lat},${lng},${zoom}z`;
}

/**
 * Get OpenStreetMap URL for coordinates
 */
export function getOpenStreetMapUrl(lat: number, lng: number, zoom: number = 15): string {
  return `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}&zoom=${zoom}`;
}

/**
 * Parse coordinates from string
 * Supports formats:
 * - "-6.208800, 106.845600"
 * - "-6.208800,106.845600"
 * - "lat:-6.208800,lng:106.845600"
 */
export function parseCoordinates(input: string): Coordinates | null {
  // Remove spaces and split by comma
  const cleaned = input.replace(/\s+/g, '');
  
  // Try format: "lat,lng"
  const simple = cleaned.match(/^(-?\d+\.?\d*),(-?\d+\.?\d*)$/);
  if (simple) {
    const lat = parseFloat(simple[1]);
    const lng = parseFloat(simple[2]);
    if (validateCoordinates(lat, lng)) {
      return { latitude: lat, longitude: lng };
    }
  }
  
  // Try format: "lat:X,lng:Y"
  const labeled = cleaned.match(/lat:(-?\d+\.?\d*),lng:(-?\d+\.?\d*)/i);
  if (labeled) {
    const lat = parseFloat(labeled[1]);
    const lng = parseFloat(labeled[2]);
    if (validateCoordinates(lat, lng)) {
      return { latitude: lat, longitude: lng };
    }
  }
  
  return null;
}

/**
 * Calculate distance between two coordinates (in meters)
 * Uses Haversine formula
 */
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371e3; // Earth radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lng2 - lng1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
}

/**
 * Format distance for display
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)}m`;
  }
  return `${(meters / 1000).toFixed(2)}km`;
}

/**
 * Get coordinate precision description
 */
export function getCoordinatePrecision(decimals: number): string {
  const precisions: Record<number, string> = {
    0: '±111 km',
    1: '±11.1 km',
    2: '±1.1 km',
    3: '±110 m',
    4: '±11 m',
    5: '±1.1 m',
    6: '±0.11 m',
    7: '±1.1 cm',
    8: '±1.1 mm',
  };
  
  return precisions[decimals] || 'Unknown';
}

/**
 * Round coordinates to specified decimal places
 */
export function roundCoordinates(
  lat: number,
  lng: number,
  decimals: number = 6
): Coordinates {
  const factor = Math.pow(10, decimals);
  return {
    latitude: Math.round(lat * factor) / factor,
    longitude: Math.round(lng * factor) / factor,
  };
}

/**
 * Check if coordinates are swapped (common mistake)
 * Returns true if coordinates seem to be in wrong order
 */
export function areCoordinatesSwapped(lat: number, lng: number): boolean {
  // For Indonesia:
  // Correct: lat is negative (-11 to +6), lng is positive (+95 to +141)
  // Swapped: lat is positive and large (95-141), lng is negative or small
  
  // If lat is in longitude range and lng is in latitude range, likely swapped
  if (Math.abs(lat) > 90 || Math.abs(lng) > 180) {
    return false; // Invalid anyway
  }
  
  // Check if lat looks like longitude and vice versa
  const latLooksLikeLng = Math.abs(lat) > 90;
  const lngLooksLikeLat = Math.abs(lng) <= 90;
  
  return latLooksLikeLng || (lat > 50 && lng < 50);
}

/**
 * Auto-correct swapped coordinates
 */
export function correctSwappedCoordinates(
  lat: number,
  lng: number
): { corrected: Coordinates; wasSwapped: boolean } {
  if (areCoordinatesSwapped(lat, lng)) {
    return {
      corrected: { latitude: lng, longitude: lat },
      wasSwapped: true,
    };
  }
  
  return {
    corrected: { latitude: lat, longitude: lng },
    wasSwapped: false,
  };
}

/**
 * Validate and suggest corrections for coordinates
 */
export function validateAndSuggest(lat: number, lng: number): {
  valid: boolean;
  errors: string[];
  suggestions: string[];
} {
  const errors: string[] = [];
  const suggestions: string[] = [];
  
  // Check if valid
  if (!validateCoordinates(lat, lng)) {
    errors.push('Coordinates out of valid range');
    
    if (lat < -90 || lat > 90) {
      errors.push(`Latitude must be between -90 and +90 (got ${lat})`);
    }
    
    if (lng < -180 || lng > 180) {
      errors.push(`Longitude must be between -180 and +180 (got ${lng})`);
    }
  }
  
  // Check if swapped
  if (areCoordinatesSwapped(lat, lng)) {
    suggestions.push('Coordinates may be swapped. Try switching latitude and longitude.');
  }
  
  // Check if in Indonesia (if applicable)
  if (validateCoordinates(lat, lng) && !isIndonesiaCoordinates(lat, lng)) {
    suggestions.push('Coordinates are outside Indonesia. Please verify.');
  }
  
  // Check precision
  const latDecimals = (lat.toString().split('.')[1] || '').length;
  const lngDecimals = (lng.toString().split('.')[1] || '').length;
  
  if (latDecimals < 4 || lngDecimals < 4) {
    suggestions.push(`Low precision (${Math.min(latDecimals, lngDecimals)} decimals). Consider using 6 decimals for ±0.11m accuracy.`);
  }
  
  return {
    valid: errors.length === 0,
    errors,
    suggestions,
  };
}
