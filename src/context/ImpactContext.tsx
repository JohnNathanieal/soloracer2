import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  NewsStory,
  CityPreset,
  Voucher,
  RedeemedVoucher,
  ClaimHistoryItem,
  WalletState,
  IssueCategory,
} from '../types/impact';
import { CITY_PRESETS, MOCK_NEWS_STORIES } from '../data/newsStories';
import { MOCK_VOUCHERS } from '../data/vouchers';
import {
  getUserLevel,
  UserLevelInfo,
  checkDailyPointLimit,
  processVoucherRedemption,
} from '../utils/impactLogic';
import { fireConfettiReward } from '../utils/confetti';

interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message: string;
}

interface ImpactContextType {
  // Theme
  isDarkMode: boolean;
  toggleDarkMode: () => void;

  // Active view tab
  activeTab: 'feed' | 'rewards' | 'wallet' | 'leaderboard';
  setActiveTab: (tab: 'feed' | 'rewards' | 'wallet' | 'leaderboard') => void;

  // Location Engine
  userLocation: {
    name: string;
    lat: number;
    lng: number;
    isGps: boolean;
  };
  gpsStatus: 'idle' | 'requesting' | 'granted' | 'denied';
  requestGeolocation: () => void;
  selectCityPreset: (city: CityPreset) => void;
  isLocationPickerOpen: boolean;
  setIsLocationPickerOpen: (open: boolean) => void;

  // Feed Filter & Search
  selectedCategory: IssueCategory;
  setSelectedCategory: (cat: IssueCategory) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // Data
  newsStories: NewsStory[];
  vouchers: Voucher[];

  // Modals
  activeStoryForModal: NewsStory | null;
  openActionModal: (story: NewsStory) => void;
  closeActionModal: () => void;

  isWalletModalOpen: boolean;
  setIsWalletModalOpen: (open: boolean) => void;

  latestRedeemedVoucher: RedeemedVoucher | null;
  setLatestRedeemedVoucher: (v: RedeemedVoucher | null) => void;

  // Wallet & Gamification
  wallet: WalletState;
  userLevel: UserLevelInfo;
  claimArticlePoints: (story: NewsStory, completedTasks: string[]) => { success: boolean; error?: string };
  signPetition: (storyId: string, petitionId: string) => void;
  submitVolunteerPledge: (storyId: string, pledgeOption: string) => void;
  redeemVoucher: (voucher: Voucher) => { success: boolean; error?: string; redeemed?: RedeemedVoucher };
  resetWalletData: () => void;

  // Toasts
  toasts: ToastMessage[];
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;
}

const LOCAL_STORAGE_WALLET_KEY = 'impactpulse_wallet_v1';
const LOCAL_STORAGE_THEME_KEY = 'impactpulse_theme';
const LOCAL_STORAGE_LOCATION_KEY = 'impactpulse_location';

function getTodayDateString(): string {
  return new Date().toISOString().split('T')[0];
}

const DEFAULT_INITIAL_WALLET: WalletState = {
  points: 150, // Welcome bonus so user starts as Level 2 Local Hero and can test redeeming
  claimedArticleIds: [],
  claimHistory: [],
  redeemedVouchers: [],
  dailyPointsDate: getTodayDateString(),
  dailyPointsEarned: 0,
  signedPetitionIds: [],
  volunteerPledges: [],
};

const ImpactContext = createContext<ImpactContextType | undefined>(undefined);

export const ImpactProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Theme state
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_THEME_KEY);
      if (saved !== null) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_THEME_KEY, isDarkMode ? 'dark' : 'light');
      if (isDarkMode) {
        document.documentElement.classList.add('dark');
        document.documentElement.setAttribute('data-theme', 'dark');
        document.body.classList.add('dark');
        document.documentElement.style.colorScheme = 'dark';
      } else {
        document.documentElement.classList.remove('dark');
        document.documentElement.setAttribute('data-theme', 'light');
        document.body.classList.remove('dark');
        document.documentElement.style.colorScheme = 'light';
      }
    } catch {
      // ignore
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode((prev) => !prev);

  // Active view tab
  const [activeTab, setActiveTab] = useState<'feed' | 'rewards' | 'wallet' | 'leaderboard'>('feed');

  // Location Engine
  const [userLocation, setUserLocation] = useState<{
    name: string;
    lat: number;
    lng: number;
    isGps: boolean;
  }>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_LOCATION_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    // Default to Thrissur
    const defaultCity = CITY_PRESETS[0];
    return {
      name: `${defaultCity.name}, ${defaultCity.state}`,
      lat: defaultCity.lat,
      lng: defaultCity.lng,
      isGps: false,
    };
  });

  const [gpsStatus, setGpsStatus] = useState<'idle' | 'requesting' | 'granted' | 'denied'>('idle');
  const [isLocationPickerOpen, setIsLocationPickerOpen] = useState(false);

  // Geolocation request handler
  const requestGeolocation = () => {
    if (!navigator.geolocation) {
      setGpsStatus('denied');
      addToast({
        type: 'warning',
        title: 'Geolocation Unsupported',
        message: 'Your browser does not support GPS geolocation. Using manual city selection.',
      });
      return;
    }

    setGpsStatus('requesting');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const newLoc = {
          name: 'My Device GPS Location',
          lat: Math.round(latitude * 10000) / 10000,
          lng: Math.round(longitude * 10000) / 10000,
          isGps: true,
        };
        setUserLocation(newLoc);
        setGpsStatus('granted');
        try {
          localStorage.setItem(LOCAL_STORAGE_LOCATION_KEY, JSON.stringify(newLoc));
        } catch {
          // ignore
        }
        addToast({
          type: 'success',
          title: 'GPS Location Synced',
          message: `Coordinates verified: ${newLoc.lat}°N, ${newLoc.lng}°E`,
        });
      },
      (err) => {
        console.warn('Geolocation denied or failed:', err);
        setGpsStatus('denied');
        addToast({
          type: 'info',
          title: 'GPS Access Declined / Unavailable',
          message: 'Using preset city location. You can switch cities anytime from the header.',
        });
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  // Attempt browser geolocation on startup as requested
  useEffect(() => {
    if (!userLocation.isGps) {
      requestGeolocation();
    }
  }, []);

  const selectCityPreset = (city: CityPreset) => {
    const newLoc = {
      name: `${city.name}, ${city.state}`,
      lat: city.lat,
      lng: city.lng,
      isGps: false,
    };
    setUserLocation(newLoc);
    setGpsStatus('idle');
    try {
      localStorage.setItem(LOCAL_STORAGE_LOCATION_KEY, JSON.stringify(newLoc));
    } catch {
      // ignore
    }
    setIsLocationPickerOpen(false);
    addToast({
      type: 'info',
      title: 'Region Switched',
      message: `Active region is now ${city.name}, ${city.state}. Local feeds updated!`,
    });
  };

  // Feed Filter & Search
  const [selectedCategory, setSelectedCategory] = useState<IssueCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals & Active Story
  const [activeStoryForModal, setActiveStoryForModal] = useState<NewsStory | null>(null);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [latestRedeemedVoucher, setLatestRedeemedVoucher] = useState<RedeemedVoucher | null>(null);

  const openActionModal = (story: NewsStory) => {
    setActiveStoryForModal(story);
  };

  const closeActionModal = () => {
    setActiveStoryForModal(null);
  };

  // Persistent Wallet State
  const [wallet, setWallet] = useState<WalletState>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_WALLET_KEY);
      if (saved) {
        const parsed: WalletState = JSON.parse(saved);
        const today = getTodayDateString();
        // Check daily rollover
        if (parsed.dailyPointsDate !== today) {
          parsed.dailyPointsDate = today;
          parsed.dailyPointsEarned = 0;
        }
        return parsed;
      }
    } catch (e) {
      console.warn('Failed to parse saved wallet:', e);
    }
    return DEFAULT_INITIAL_WALLET;
  });

  // Save wallet changes
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_WALLET_KEY, JSON.stringify(wallet));
    } catch (e) {
      console.error('Failed to save wallet to localStorage:', e);
    }
  }, [wallet]);

  // Derived user level
  const userLevel = getUserLevel(wallet.points);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const addToast = (toast: Omit<ToastMessage, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { ...toast, id }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Claim points for an article after passing anti-foulplay verification
  const claimArticlePoints = (
    story: NewsStory,
    completedTasks: string[]
  ): { success: boolean; error?: string } => {
    // 1. Check if already claimed
    if (wallet.claimedArticleIds.includes(story.id)) {
      return { success: false, error: 'You have already claimed points for this story.' };
    }

    // 2. Check daily point limit (500 pts max/day)
    const today = getTodayDateString();
    const rateCheck = checkDailyPointLimit(
      today,
      wallet.dailyPointsDate,
      wallet.dailyPointsEarned,
      story.pointsReward,
      500
    );

    if (!rateCheck.allowed) {
      return { success: false, error: rateCheck.reason };
    }

    const effectiveDailyEarned =
      today === wallet.dailyPointsDate ? wallet.dailyPointsEarned : 0;

    const newClaimItem: ClaimHistoryItem = {
      articleId: story.id,
      articleHeadline: story.headline,
      category: story.category,
      pointsEarned: story.pointsReward,
      claimedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      completedTasks,
    };

    setWallet((prev) => ({
      ...prev,
      points: prev.points + story.pointsReward,
      claimedArticleIds: [...prev.claimedArticleIds, story.id],
      claimHistory: [newClaimItem, ...prev.claimHistory],
      dailyPointsDate: today,
      dailyPointsEarned: effectiveDailyEarned + story.pointsReward,
    }));

    fireConfettiReward();
    addToast({
      type: 'success',
      title: `+${story.pointsReward} Civic Points Earned!`,
      message: `Action verified. Your impact wallet has been credited!`,
    });

    return { success: true };
  };

  // Sign digital petition
  const signPetition = (storyId: string, petitionId: string) => {
    if (wallet.signedPetitionIds.includes(petitionId)) {
      addToast({
        type: 'info',
        title: 'Already Signed',
        message: 'You have already signed this community petition.',
      });
      return;
    }

    setWallet((prev) => ({
      ...prev,
      signedPetitionIds: [...prev.signedPetitionIds, petitionId],
    }));

    addToast({
      type: 'success',
      title: 'Petition Signature Verified',
      message: 'Your voice has been added to the official civic record!',
    });
  };

  // Submit volunteer pledge
  const submitVolunteerPledge = (storyId: string, pledgeOption: string) => {
    setWallet((prev) => ({
      ...prev,
      volunteerPledges: [
        ...prev.volunteerPledges.filter((p) => p.storyId !== storyId),
        { storyId, optionSelected: pledgeOption, timestamp: new Date().toISOString() },
      ],
    }));

    addToast({
      type: 'success',
      title: 'Pledge Recorded',
      message: 'Thank you for your active commitment to our community!',
    });
  };

  // Redeem voucher
  const redeemVoucher = (
    voucher: Voucher
  ): { success: boolean; error?: string; redeemed?: RedeemedVoucher } => {
    const result = processVoucherRedemption(wallet.points, voucher.pointsCost, voucher.brand);

    if (!result.success || !result.code) {
      return { success: false, error: result.error };
    }

    // Set expiry 90 days out
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + 90);
    const expiryStr = expiry.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    const redeemedItem: RedeemedVoucher = {
      id: Math.random().toString(36).substring(2, 9),
      voucherId: voucher.id,
      title: voucher.title,
      brand: voucher.brand,
      pointsSpent: voucher.pointsCost,
      valueDisplay: voucher.valueDisplay,
      code: result.code,
      redeemedAt: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      }),
      expiryDate: expiryStr,
    };

    setWallet((prev) => ({
      ...prev,
      points: result.newBalance,
      redeemedVouchers: [redeemedItem, ...prev.redeemedVouchers],
    }));

    setLatestRedeemedVoucher(redeemedItem);
    fireConfettiReward();

    addToast({
      type: 'success',
      title: 'Voucher Redeemed Successfully!',
      message: `${voucher.valueDisplay} from ${voucher.brand} code generated.`,
    });

    return { success: true, redeemed: redeemedItem };
  };

  // Reset wallet data for demo convenience
  const resetWalletData = () => {
    setWallet(DEFAULT_INITIAL_WALLET);
    addToast({
      type: 'info',
      title: 'Demo Wallet Reset',
      message: 'Points and history have been restored to initial demo state.',
    });
  };

  return (
    <ImpactContext.Provider
      value={{
        isDarkMode,
        toggleDarkMode,
        activeTab,
        setActiveTab,
        userLocation,
        gpsStatus,
        requestGeolocation,
        selectCityPreset,
        isLocationPickerOpen,
        setIsLocationPickerOpen,
        selectedCategory,
        setSelectedCategory,
        searchQuery,
        setSearchQuery,
        newsStories: MOCK_NEWS_STORIES,
        vouchers: MOCK_VOUCHERS,
        activeStoryForModal,
        openActionModal,
        closeActionModal,
        isWalletModalOpen,
        setIsWalletModalOpen,
        latestRedeemedVoucher,
        setLatestRedeemedVoucher,
        wallet,
        userLevel,
        claimArticlePoints,
        signPetition,
        submitVolunteerPledge,
        redeemVoucher,
        resetWalletData,
        toasts,
        addToast,
        removeToast,
      }}
    >
      {children}
    </ImpactContext.Provider>
  );
};

export function useImpact(): ImpactContextType {
  const context = useContext(ImpactContext);
  if (!context) {
    throw new Error('useImpact must be used within an ImpactProvider');
  }
  return context;
}
