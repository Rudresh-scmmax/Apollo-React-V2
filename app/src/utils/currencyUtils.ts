/**
 * Currency and user preference utility functions
 */

interface UserPreferences {
  currency?: {
    currency_id: number;
    currency_code: string;
    currency_name: string;
  } | null;
  location?: {
    location_id: number;
    location_name: string;
  } | null;
  material?: {
    material_id: string;
    material_description: string;
    material_type_id?: number;
    material_status?: string;
    base_uom_id?: number;
    user_defined_material_desc?: string | null;
    material_category?: string;
    cas_no?: string | null;
    unspsc_code?: string | null;
    hsn_code?: string | null;
    uom_symbol?: string | null;
  } | null;
  uom?: {
    uom_id: number;
    uom_name: string;
    uom_symbol: string;
  } | null;
}

/**
 * Get user's preferred currency code from localStorage
 * @returns Currency code (e.g., "USD", "INR") or "USD" as default
 */
export const getUserCurrency = (): string => {
  try {
    const stored = localStorage.getItem('user_preferences');
    if (stored) {
      const prefs: UserPreferences = JSON.parse(stored);
      if (prefs.currency?.currency_code) {
        return prefs.currency.currency_code;
      }
    }
  } catch (e) {
    console.error('Error reading user preferences:', e);
  }
  return 'USD';
};

/**
 * Get user's preferred currency symbol
 * @param currencyCode - Optional currency code, defaults to user preference
 * @returns Currency symbol (e.g., "$", "₹")
 */
export const getCurrencySymbol = (currencyCode?: string): string => {
  const currency = currencyCode || getUserCurrency();
  
  const symbolMap: Record<string, string> = {
    'USD': '$',
    'INR': '₹',
    'EUR': '€',
    'GBP': '£',
    'JPY': '¥',
    'CNY': '¥',
    'AUD': 'A$',
    'CAD': 'C$',
  };
  
  return symbolMap[currency.toUpperCase()] || currency;
};

/**
 * Format price with currency symbol
 * @param amount - Price amount
 * @param currencyCode - Optional currency code, defaults to user preference
 * @returns Formatted price string (e.g., "$100.00" or "₹100.00")
 */
export const formatPrice = (amount: number | string, currencyCode?: string): string => {
  const symbol = getCurrencySymbol(currencyCode);
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(numAmount)) return '--';
  
  return `${symbol}${numAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

/**
 * Format price with currency UOM (e.g., "/tonne")
 * @param amount - Price amount
 * @param uom - Optional UOM suffix (e.g., "/tonne", "/MT"), defaults to user preference
 * @param currencyCode - Optional currency code, defaults to user preference
 * @returns Formatted price string (e.g., "$100.00/tonne" or "₹100.00/tonne")
 */
export const formatPriceWithUnit = (
  amount: number | string,
  uom?: string,
  currencyCode?: string
): string => {
  const currency = currencyCode || getUserCurrency();
  const symbol = getCurrencySymbol(currency);
  const userUom = uom || `/${getUserUom()}`;
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(numAmount)) return '--';
  
  return `${symbol}${numAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}${userUom}`;
};

/**
 * Get user's preferred region from localStorage
 * @returns Region name or empty string if not set
 */
export const getUserRegion = (): string => {
  try {
    const stored = localStorage.getItem('user_preferences');
    if (stored) {
      const prefs: UserPreferences = JSON.parse(stored);
      return prefs.location?.location_name || '';
    }
  } catch (e) {
    console.error('Error reading user preferences:', e);
  }
  return '';
};

/**
 * Get user's preferred material from localStorage
 * Uses material from API response, defaults to Glycerine (100724-000000) if not set
 * @returns Material ID (e.g., "100724-000000") or "100724-000000" as default
 */
export const getUserMaterial = (): string => {
  try {
    const stored = localStorage.getItem('user_preferences');
    if (stored) {
      const prefs: UserPreferences = JSON.parse(stored);
      // Return material_id from API response, or default to Glycerine
      return prefs.material?.material_id || '100724-000000';
    }
  } catch (e) {
    console.error('Error reading user preferences:', e);
  }
  // Default to Glycerine if no preferences are stored
  return '100724-000000';
};

/**
 * Get user's preferred material object from localStorage
 * @returns Material object from user preferences or null if not set
 */
export const getUserMaterialObject = (): UserPreferences['material'] | null => {
  try {
    const stored = localStorage.getItem('user_preferences');
    if (stored) {
      const prefs: UserPreferences = JSON.parse(stored);
      return prefs.material || null;
    }
  } catch (e) {
    console.error('Error reading user preferences:', e);
  }
  return null;
};

/**
 * Get UOM symbol from localStorage
 * Checks appState.material.globalSelectedMaterial.uom_symbol first,
 * then falls back to user_preferences.material.uom_symbol
 * @returns UOM symbol (e.g., "kg", "MT") or null if not found
 */
export const getUserUom = (): string | null => {
  try {
    // First check appState (global selected material)
    const appState = localStorage.getItem('appState');
    if (appState) {
      const state = JSON.parse(appState);
      if (state?.material?.globalSelectedMaterial?.uom_symbol) {
        return state.material.globalSelectedMaterial.uom_symbol;
      }
    }

    // Fall back to user preferences
    const stored = localStorage.getItem('user_preferences');
    if (stored) {
      const prefs: UserPreferences = JSON.parse(stored);
      if (prefs.material?.uom_symbol) {
        return prefs.material.uom_symbol;
      }
      // Also check uom object in preferences
      if (prefs.uom?.uom_symbol) {
        return prefs.uom.uom_symbol;
      }
    }
  } catch (e) {
    console.error('Error reading UOM symbol from localStorage:', e);
  }
  return null;
};



/**
 * Store user preferences in localStorage
 * @param preferences - User preferences object
 */
export const setUserPreferences = (preferences: UserPreferences): void => {
  try {
    localStorage.setItem('user_preferences', JSON.stringify(preferences));
  } catch (e) {
    console.error('Error storing user preferences:', e);
  }
};

/**
 * Get full user preferences from localStorage
 * @returns User preferences object or null
 */
export const getUserPreferences = (): UserPreferences | null => {
  try {
    const stored = localStorage.getItem('user_preferences');
    if (stored) {
      return JSON.parse(stored) as UserPreferences;
    }
  } catch (e) {
    console.error('Error reading user preferences:', e);
  }
  return null;
};

