export type IssueCategory =
  | 'all'
  | 'environmental'
  | 'civic_safety'
  | 'community_support'
  | 'health_alert';

export type UrgencyLevel = 'Urgent' | 'High' | 'Moderate';

export interface LocationCoordinates {
  lat: number;
  lng: number;
}

export interface CityPreset {
  id: string;
  name: string;
  state: string;
  lat: number;
  lng: number;
}

export interface EmergencyContact {
  label: string;
  phone: string;
  actionNote: string;
}

export interface HelpYourselfPlan {
  title: string;
  summary: string;
  checklist: { id: string; text: string; category: string }[];
  emergencyContacts: EmergencyContact[];
}

export interface CommunityPetition {
  id: string;
  title: string;
  department: string;
  currentSignatures: number;
  targetSignatures: number;
  statement: string;
}

export interface VolunteerPledge {
  id: string;
  title: string;
  description: string;
  pledgeOptions: string[];
}

export interface VerifiedHotline {
  title: string;
  number: string;
  whatsappMessage: string;
  description: string;
}

export interface HelpCommunityPlan {
  petition?: CommunityPetition;
  volunteerPledge?: VolunteerPledge;
  verifiedHotline?: VerifiedHotline;
  civicReportTip?: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface NewsStory {
  id: string;
  headline: string;
  category: IssueCategory;
  urgency: UrgencyLevel;
  locationName: string;
  coordinates: LocationCoordinates;
  summary: string;
  fullContent: string[];
  sourceAgency: string;
  timestamp: string;
  readingTimeMinutes: number;
  pointsReward: number;
  imageUrl: string;
  helpYourself: HelpYourselfPlan;
  helpCommunity: HelpCommunityPlan;
  quiz: QuizQuestion[];
  geofenceRadiusKm: number;
}

export interface Voucher {
  id: string;
  title: string;
  brand: string;
  category: 'shopping' | 'food' | 'entertainment' | 'transit' | 'eco_charity';
  pointsCost: number;
  valueDisplay: string;
  description: string;
  partnerInfo: string;
  logoColor: string;
  badgeTag: string;
}

export interface RedeemedVoucher {
  id: string;
  voucherId: string;
  title: string;
  brand: string;
  pointsSpent: number;
  valueDisplay: string;
  code: string;
  redeemedAt: string;
  expiryDate: string;
}

export interface ClaimHistoryItem {
  articleId: string;
  articleHeadline: string;
  category: IssueCategory;
  pointsEarned: number;
  claimedAt: string;
  completedTasks: string[];
}

export interface WalletState {
  points: number;
  claimedArticleIds: string[];
  claimHistory: ClaimHistoryItem[];
  redeemedVouchers: RedeemedVoucher[];
  dailyPointsDate: string;
  dailyPointsEarned: number;
  signedPetitionIds: string[];
  volunteerPledges: { storyId: string; optionSelected: string; timestamp: string }[];
}
