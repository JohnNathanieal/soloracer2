import React from 'react';
import { X, Navigation, MapPin, Check, Info } from 'lucide-react';
import { useImpact } from '../context/ImpactContext';
import { CITY_PRESETS } from '../data/newsStories';

export const LocationPickerModal: React.FC = () => {
  const {
    isLocationPickerOpen,
    setIsLocationPickerOpen,
    userLocation,
    gpsStatus,
    requestGeolocation,
    selectCityPreset,
  } = useImpact();

  if (!isLocationPickerOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="location-modal-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h2 id="location-modal-title" className="text-lg font-bold text-slate-900 dark:text-white">
                Location Engine
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Calibrate proximity for local civic anti-foulplay verification
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsLocationPickerOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Close location dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {/* Real-time GPS detection button */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border border-emerald-200 dark:border-emerald-800/80">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="inline-block text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 mb-1">
                  Device Hardware GPS
                </span>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Query your browser&apos;s <code className="font-mono text-emerald-600 dark:text-emerald-400">navigator.geolocation</code> for live physical coordinates.
                </p>
              </div>
            </div>

            <button
              onClick={requestGeolocation}
              disabled={gpsStatus === 'requesting'}
              className="mt-3.5 w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-sm transition-all disabled:opacity-60"
            >
              <Navigation className={`w-4 h-4 ${gpsStatus === 'requesting' ? 'animate-spin' : ''}`} />
              <span>
                {gpsStatus === 'requesting'
                  ? 'Requesting Browser Geolocation...'
                  : userLocation.isGps
                  ? 'Re-calibrate GPS Location'
                  : 'Detect My Real Location'}
              </span>
            </button>

            {userLocation.isGps && (
              <div className="mt-2.5 flex items-center gap-1.5 text-xs text-emerald-700 dark:text-emerald-300 font-medium">
                <Check className="w-3.5 h-3.5" />
                <span>
                  Active coordinates: {userLocation.lat.toFixed(4)}° N, {userLocation.lng.toFixed(4)}° E
                </span>
              </div>
            )}
          </div>

          {/* Quick Regional Fallback Presets */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              Or Switch to Regional City Preset (For Testing)
            </label>
            <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
              {CITY_PRESETS.map((city) => {
                const isSelected =
                  !userLocation.isGps && userLocation.name.toLowerCase().includes(city.name.toLowerCase());
                return (
                  <button
                    key={city.id}
                    onClick={() => selectCityPreset(city)}
                    className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 font-semibold'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                          isSelected
                            ? 'bg-emerald-500 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                        }`}
                      >
                        {city.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-sm font-semibold">{city.name}</div>
                        <div className="text-xs text-slate-400 dark:text-slate-500">{city.state}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono text-slate-400">
                        {city.lat.toFixed(2)}°, {city.lng.toFixed(2)}°
                      </span>
                      {isSelected && <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-start gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
            <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <p>
              Proximity checks calculate real Haversine distance between your location and the incident coordinates to verify physical relevance.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            onClick={() => setIsLocationPickerOpen(false)}
            className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-sm transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
