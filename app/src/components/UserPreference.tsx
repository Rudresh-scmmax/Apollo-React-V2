import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaSave, FaCheck } from 'react-icons/fa';
import { useBusinessAPI } from '../services/BusinessProvider';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface UserPreferences {
  material: string;
  region: string;
  currency: string;
  negotiationStyle: string;
}

const UserPreferencesPage: React.FC = () => {
  const { getUserPreferences, updateUserPreferences, getCurrencyMaster } = useBusinessAPI();
  const queryClient = useQueryClient();
  
  const [preferences, setPreferences] = useState<UserPreferences>({
    material: 'glycerine',
    region: 'north-america',
    currency: 'USD',
    negotiationStyle: 'balanced',
  });

  const [isSaved, setIsSaved] = useState(false);

  // Fetch user preferences
  const { data: userPrefs, isLoading } = useQuery({
    queryKey: ['userPreferences'],
    queryFn: getUserPreferences,
  });

  // Fetch currencies from API
  const { data: currencies, isLoading: currenciesLoading } = useQuery({
    queryKey: ['currencyMaster'],
    queryFn: getCurrencyMaster,
  });

  // Update preferences when API data loads
  useEffect(() => {
    if (userPrefs?.user_prefered_currency) {
      setPreferences(prev => ({
        ...prev,
        currency: userPrefs.user_prefered_currency
      }));
    }
  }, [userPrefs]);

  // Update preferences mutation
  const updatePreferencesMutation = useMutation({
    mutationFn: updateUserPreferences,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userPreferences'] });
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    },
    onError: (error) => {
      console.error('Failed to save preferences:', error);
    }
  });

  const materials = [
    { value: 'glycerine', label: 'Glycerine' },
    { value: 'phenol', label: 'Phenol' },
    { value: 'acetic-acid', label: 'Acetic Acid' },
    { value: 'acetone', label: 'Acetone' },
    { value: 'methanol', label: 'Methanol' },
  ];

  const regions = [
    { value: 'north-america', label: 'North America' },
    { value: 'south-america', label: 'South America' },
    { value: 'europe', label: 'Europe' },
    { value: 'asia', label: 'Asia' },
    { value: 'middle-east', label: 'Middle East' },
    { value: 'africa', label: 'Africa' },
    { value: 'oceania', label: 'Oceania' },
  ];

  // Transform API currencies to component format
  const currencyOptions = currencies?.map(currency => ({
    value: currency.currency_code,
    label: `${currency.currency_code} - ${currency.currency_name}`
  })) || [];

  const negotiationStyles = [
    {
      value: 'conservative',
      label: 'Conservative',
      description: 'Cautious approach, prioritize long-term relationships',
    },
    {
      value: 'balanced',
      label: 'Balanced',
      description: 'Moderate approach balancing firmness and flexibility',
    },
    {
      value: 'aggressive',
      label: 'Aggressive',
      description: 'Bold approach, maximize value and competitive advantage',
    },
  ];

  const handleChange = (field: keyof UserPreferences, value: string) => {
    setPreferences((prev) => ({ ...prev, [field]: value }));
    setIsSaved(false);
  };

  const handleSave = () => {
    updatePreferencesMutation.mutate({
      user_prefered_currency: preferences.currency
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">User Preferences</h1>
          <p className="text-gray-600">Customize your trading and negotiation settings</p>
          {(isLoading || currenciesLoading) && (
            <div className="text-sm text-blue-600 mt-2">Loading preferences...</div>
          )}
        </div>

        {/* Preferences Card */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="p-6 sm:p-8 space-y-8">
            {/* Material Selection */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-700">Primary Material</label>
              <select
                value={preferences.material}
                onChange={(e) => handleChange('material', e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#a0bf3f] focus:border-transparent transition-all outline-none"
              >
                {materials.map((material) => (
                  <option key={material.value} value={material.value}>
                    {material.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Region Selection */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-700">Region</label>
              <select
                value={preferences.region}
                onChange={(e) => handleChange('region', e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#a0bf3f] focus:border-transparent transition-all outline-none"
              >
                {regions.map((region) => (
                  <option key={region.value} value={region.value}>
                    {region.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Currency Selection */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-700">Currency</label>
              <select
                value={preferences.currency}
                onChange={(e) => handleChange('currency', e.target.value)}
                disabled={currenciesLoading}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#a0bf3f] focus:border-transparent transition-all outline-none disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {currenciesLoading ? (
                  <option>Loading currencies...</option>
                ) : (
                  currencyOptions.map((currency) => (
                    <option key={currency.value} value={currency.value}>
                      {currency.label}
                    </option>
                  ))
                )}
              </select>
            </div>

            {/* Negotiation Style */}
            <div className="space-y-4">
              <label className="block text-sm font-semibold text-gray-700">Negotiation Style</label>
              <div className="space-y-3">
                {negotiationStyles.map((style) => (
                  <motion.div key={style.value} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                    <label
                      className={`flex items-start p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        preferences.negotiationStyle === style.value
                          ? 'border-[#a0bf3f] bg-[#e4f0bb]'
                          : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="negotiationStyle"
                        value={style.value}
                        checked={preferences.negotiationStyle === style.value}
                        onChange={(e) => handleChange('negotiationStyle', e.target.value)}
                        className="mt-1 h-4 w-4 text-[#a0bf3f] focus:ring-[#a0bf3f]"
                      />
                      <div className="ml-3 flex-1">
                        <div className="text-sm font-semibold text-gray-900">{style.label}</div>
                        <div className="text-xs text-gray-600 mt-1">{style.description}</div>
                      </div>
                    </label>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Save Button */}
            <div className="pt-6 border-t border-gray-200">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSave}
                disabled={updatePreferencesMutation.isPending}
                className={`w-full py-3 px-6 rounded-lg font-semibold text-white transition-all shadow-md ${
                  isSaved
                    ? 'bg-green-600 hover:bg-green-700'
                    : updatePreferencesMutation.isPending
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-[#a0bf3f] to-[#8bad34] hover:from-[#8bad34] hover:to-[#799d2a]'
                }`}
              >
                <span className="flex items-center justify-center">
                  {isSaved ? (
                    <>
                      <FaCheck className="mr-2" /> Preferences Saved!
                    </>
                  ) : updatePreferencesMutation.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <FaSave className="mr-2" /> Save Preferences
                    </>
                  )}
                </span>
              </motion.button>
            </div>
          </div>
        </div>

        {/* Info Card */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-6 bg-[#e4f0bb] border border-[#a0bf3f] rounded-xl p-4"
        >
          <p className="text-sm text-[#557a1a]">
            <strong>Note:</strong> These preferences will be used as defaults for your negotiations and material selections. You can always override them on a per-transaction basis.
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default UserPreferencesPage;
