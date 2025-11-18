import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { FaSave, FaCheck } from 'react-icons/fa';
import { useBusinessAPI } from '../services/BusinessProvider';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import MaterialSelect from '../common/MaterialSelect';
import RegionSelector from '../common/RegionSelector';
import CurrencySelect from '../common/CurrencySelect';
import UomSelect from '../common/UomSelect';
import type { Material } from '../services/BusinessProvider';

interface UserPreferences {
  material: string;
  region: string;
  currency: string;
  uom: number | null;
  negotiationStyle: string;
}

// Default values
const DEFAULT_CURRENCY = 'USD';
const DEFAULT_CURRENCY_ID = 3;
const DEFAULT_REGION = 'Asia-Pacific';
const DEFAULT_MATERIAL_ID = '100724-000000';
const DEFAULT_UOM_ID = 4; // tonne

const UserPreferencesPage: React.FC = () => {
  const {
    getUserPreferences,
    updateUserPreferences,
    getCurrencyMaster,
    getUomMaster,
    getMaterials,
    getAllRegions,
  } = useBusinessAPI();
  const queryClient = useQueryClient();
  
  const [preferences, setPreferences] = useState<UserPreferences>({
    material: DEFAULT_MATERIAL_ID,
    region: DEFAULT_REGION,
    currency: DEFAULT_CURRENCY,
    uom: DEFAULT_UOM_ID,
    negotiationStyle: 'balanced',
  });

  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<string>('');
  const [isSaved, setIsSaved] = useState(false);
  const [locationId, setLocationId] = useState<number | null>(null);
  const [materialId, setMaterialId] = useState<string | null>(null);

  // Fetch user preferences
  const { data: userPrefs, isLoading } = useQuery({
    queryKey: ['userPreferences'],
    queryFn: getUserPreferences,
  });

  // Fetch materials
  const { data: materials, isLoading: materialsLoading } = useQuery<Material[]>({
    queryKey: ['materials'],
    queryFn: getMaterials,
  });

  // Fetch all regions
  const { data: regions, isLoading: regionsLoading } = useQuery<
    { location_id: number; location_name: string }[]
  >({
    queryKey: ['regions'],
    queryFn: getAllRegions,
  });

  // Fetch currencies from API
  const { data: currencies, isLoading: currenciesLoading } = useQuery<
    { currency_id?: number; currency_code: string; currency_name: string }[]
  >({
    queryKey: ['currencyMaster'],
    queryFn: getCurrencyMaster,
  });

  // Fetch UOMs from API
  const { data: uoms, isLoading: uomsLoading } = useQuery<
    { uom_id: number; uom_name: string; uom_symbol: string }[]
  >({
    queryKey: ['uomMaster'],
    queryFn: getUomMaster,
  });

  // Update preferences when API data loads
  useEffect(() => {
    if (!userPrefs) return;

    // Handle currency preference
    if (userPrefs.currency && currencies && currencies.length > 0) {
      const apiCurrency = userPrefs.currency;
      // Try multiple matching strategies
      let matchedCurrency = currencies.find(
        (c) => c.currency_code.toUpperCase().trim() === apiCurrency.currency_name.toUpperCase().trim()
      );
      
      if (!matchedCurrency) {
        matchedCurrency = currencies.find(
          (c) => c.currency_name.toLowerCase().trim() === apiCurrency.currency_name.toLowerCase().trim()
        );
      }
      
      if (!matchedCurrency) {
        matchedCurrency = currencies.find(
          (c) => c.currency_name.toLowerCase().includes(apiCurrency.currency_name.toLowerCase()) ||
                 c.currency_code.toUpperCase() === apiCurrency.currency_name.toUpperCase()
        );
      }
      
      if (matchedCurrency) {
        setPreferences(prev => ({
          ...prev,
          currency: matchedCurrency.currency_code
        }));
      } else {
        // Use default if no match found
        setPreferences(prev => ({
          ...prev,
          currency: DEFAULT_CURRENCY
        }));
      }
    } else if (currencies && currencies.length > 0 && !userPrefs.currency) {
      // No API preference, use default
      setPreferences(prev => ({
        ...prev,
        currency: DEFAULT_CURRENCY
      }));
    }

    // Handle location preference
    if (userPrefs.location && regions && regions.length > 0) {
      const apiLocation = userPrefs.location;
      const matchedRegion = regions.find(r => r.location_id === apiLocation.location_id);
      if (matchedRegion) {
        setSelectedRegion(matchedRegion.location_name);
        setLocationId(apiLocation.location_id);
        setPreferences(prev => ({
          ...prev,
          region: matchedRegion.location_name
        }));
      }
    } else if (regions && regions.length > 0 && !userPrefs.location) {
      // No API preference, use default
      const defaultRegion = regions.find(r => r.location_name === DEFAULT_REGION) || regions[0];
      if (defaultRegion) {
        setSelectedRegion(defaultRegion.location_name);
        setPreferences(prev => ({
          ...prev,
          region: defaultRegion.location_name
        }));
      }
    }

    // Handle material preference
    if (userPrefs.material && materials && materials.length > 0) {
      const apiMaterial = userPrefs.material;
      const matchedMaterial = materials.find(m => m.material_id === apiMaterial.material_id);
      if (matchedMaterial) {
        setSelectedMaterial(matchedMaterial);
        setMaterialId(apiMaterial.material_id);
        setPreferences(prev => ({
          ...prev,
          material: apiMaterial.material_id
        }));
      }
    } else if (materials && materials.length > 0 && !userPrefs.material) {
      // No API preference, use default
      const defaultMaterial = materials.find(m => m.material_id === DEFAULT_MATERIAL_ID) || materials[0];
      if (defaultMaterial) {
        setSelectedMaterial(defaultMaterial);
        setMaterialId(defaultMaterial.material_id);
        setPreferences(prev => ({
          ...prev,
          material: defaultMaterial.material_id,
          uom: defaultMaterial.base_uom_id || prev.uom
        }));
      }
    }

    // Handle UOM preference
    if (userPrefs.uom && uoms && uoms.length > 0) {
      const apiUom = userPrefs.uom;
      const matchedUom = uoms.find(u => u.uom_id === apiUom.uom_id);
      if (matchedUom) {
        setPreferences(prev => ({
          ...prev,
          uom: apiUom.uom_id
        }));
      }
    } else if (uoms && uoms.length > 0 && !userPrefs.uom) {
      // No API preference, use default
      const defaultUom = uoms.find(u => u.uom_id === DEFAULT_UOM_ID) || uoms[0];
      if (defaultUom) {
        setPreferences(prev => ({
          ...prev,
          uom: defaultUom.uom_id
        }));
      }
    }
  }, [userPrefs, currencies, regions, materials, uoms]);


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

  const handleChange = (field: keyof UserPreferences, value: string | number | null) => {
    setPreferences((prev) => ({ ...prev, [field]: value }));
    setIsSaved(false);
  };

  const handleSave = () => {
    // Get currency_id from selected currency
    let targetCurrencyId: number | null = null;
    if (currencies && preferences.currency) {
      const selectedCurrency = currencies.find((c) => c.currency_code === preferences.currency);
      if (selectedCurrency?.currency_id) {
        targetCurrencyId = selectedCurrency.currency_id;
      } else if (userPrefs?.currency?.currency_id) {
        // Use currency_id from API if currency master doesn't have it
        targetCurrencyId = userPrefs.currency.currency_id;
      } else {
        // Fallback to default
        targetCurrencyId = DEFAULT_CURRENCY_ID;
      }
    } else if (userPrefs?.currency?.currency_id) {
      // If no currency selected but API has one, use it
      targetCurrencyId = userPrefs.currency.currency_id;
    }

    // Get location_id from selected region
    let targetLocationId: number | null = null;
    if (regions && preferences.region) {
      const selectedRegion = regions.find((r) => r.location_name === preferences.region);
      if (selectedRegion) {
        targetLocationId = selectedRegion.location_id;
      } else if (locationId) {
        targetLocationId = locationId;
      }
    }

    // Get material_id
    const targetMaterialId = preferences.material || materialId || null;

    // Get uom_id
    const targetUomId = preferences.uom || null;

    // Build update payload
    const updatePayload: {
      currency_id?: number | null;
      location_id?: number | null;
      material_id?: string | null;
      uom_id?: number | null;
    } = {};

    if (targetCurrencyId) {
      updatePayload.currency_id = targetCurrencyId;
    }
    if (targetLocationId) {
      updatePayload.location_id = targetLocationId;
    }
    if (targetMaterialId) {
      updatePayload.material_id = targetMaterialId;
    }
    if (targetUomId) {
      updatePayload.uom_id = targetUomId;
    }

    updatePreferencesMutation.mutate(updatePayload);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">User Preferences</h1>
          <p className="text-gray-600">Customize your trading and negotiation settings</p>
          {(isLoading || currenciesLoading || uomsLoading) && (
            <div className="text-sm text-blue-600 mt-2">Loading preferences...</div>
          )}
        </div>

        {/* Preferences Card */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="p-6 sm:p-8 space-y-8">
            {/* Material Selection */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-700">Primary Material</label>
              {materialsLoading ? (
                <div className="text-sm text-gray-500">Loading materials...</div>
              ) : (
                <div className="user-pref-material-select w-full">
                  <MaterialSelect
                    materials={materials || []}
                    selectedMaterial={selectedMaterial}
                    onSelect={(material) => {
                      setSelectedMaterial(material);
                      setMaterialId(material?.material_id || null);
                      handleChange('material', material?.material_id || '');
                    }}
                    placeholder="Select Material"
                  />
                </div>
              )}
            </div>

            {/* Region Selection */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-700">Region</label>
              {regionsLoading ? (
                <div className="text-sm text-gray-500">Loading regions...</div>
              ) : (
                <RegionSelector
                  regions={regions}
                  selectedRegion={selectedRegion}
                  setSelectedRegion={(regionName) => {
                    setSelectedRegion(regionName);
                    const region = regions?.find(r => r.location_name === regionName);
                    if (region) {
                      setLocationId(region.location_id);
                    }
                    handleChange('region', regionName);
                  }}
                />
              )}
            </div>

            {/* Currency Selection */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-700">Currency</label>
              {currenciesLoading || isLoading ? (
                <div className="text-sm text-gray-500">Loading currencies...</div>
              ) : (
                <CurrencySelect
                  currencies={currencies || []}
                  selectedCurrency={preferences.currency}
                  onChange={(value) => handleChange('currency', value)}
                  loading={currenciesLoading}
                />
              )}
            </div>

            {/* UOM Selection */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-700">Unit of Measurement (UOM)</label>
              {uomsLoading ? (
                <div className="text-sm text-gray-500">Loading UOMs...</div>
              ) : (
                <UomSelect
                  uoms={uoms || []}
                  selectedUom={preferences.uom}
                  onChange={(uomId) => handleChange('uom', uomId)}
                  loading={uomsLoading}
                />
              )}
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
      <style>
        {`
          .user-pref-material-select > div {
            width: 100% !important;
          }
        `}
      </style>
    </div>
  );
};

export default UserPreferencesPage;
