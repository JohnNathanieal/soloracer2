import React, { useState, useEffect } from 'react';
import {
  X,
  Shield,
  Users,
  CheckCircle2,
  Clock,
  Sparkles,
  MapPin,
  Lock,
  Unlock,
  AlertCircle,
  Phone,
  Share2,
  FileCheck2,
  Check,
  CheckSquare,
  Square,
  Radio,
} from 'lucide-react';
import { useImpact } from '../context/ImpactContext';
import { calculateDistanceKm, evaluateQuiz, checkDailyPointLimit } from '../utils/impactLogic';
import { NewsStory } from '../types/impact';
import { SocialShareSection } from './SocialShareSection';

interface ActionModalContentProps {
  story: NewsStory;
  onClose: () => void;
}

const ActionModalContent: React.FC<ActionModalContentProps> = ({ story, onClose }) => {
  const {
    userLocation,
    wallet,
    claimArticlePoints,
    signPetition,
    submitVolunteerPledge,
    addToast,
  } = useImpact();

  const isAlreadyClaimed = wallet.claimedArticleIds.includes(story.id);

  // Social Share toggle state
  const [showShareSection, setShowShareSection] = useState(isAlreadyClaimed);

  // Track switcher: 'yourself' | 'community' | 'verify'
  const [activeTrack, setActiveTrack] = useState<'yourself' | 'community' | 'verify'>('yourself');

  // Interactive Personal Checklist state
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  // Petition state
  const isPetitionSigned = wallet.signedPetitionIds.includes(story.helpCommunity.petition?.id || '');
  const [petitionName, setPetitionName] = useState('');
  const [petitionEmail, setPetitionEmail] = useState('');

  // Volunteer Pledge state
  const existingPledge = wallet.volunteerPledges.find((p) => p.storyId === story.id);
  const [selectedPledge, setSelectedPledge] = useState<string>(existingPledge?.optionSelected || '');

  // 1. Reading Time-Lock (15 seconds minimum)
  const [secondsRemaining, setSecondsRemaining] = useState<number>(() => (isAlreadyClaimed ? 0 : 15));
  const isReadingTimeComplete = secondsRemaining === 0;

  useEffect(() => {
    if (isAlreadyClaimed || secondsRemaining <= 0) return;

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isAlreadyClaimed]);

  // 2. Geofence Radius Check (real distance calculation)
  const realDistanceKm = calculateDistanceKm(
    userLocation.lat,
    userLocation.lng,
    story.coordinates.lat,
    story.coordinates.lng
  );
  // Optional override for remote demo testing
  const [simulateProximity, setSimulateProximity] = useState(false);
  const isGeofenceVerified =
    realDistanceKm <= story.geofenceRadiusKm || simulateProximity || isAlreadyClaimed;

  // 3. 2-Question Verification Quiz Guard
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(isAlreadyClaimed);

  const correctAnswersArray = story.quiz.map((q) => q.correctIndex);
  const quizEvaluation = evaluateQuiz(quizAnswers, correctAnswersArray);
  const isQuizPassed = isAlreadyClaimed || (quizSubmitted && quizEvaluation.passed);

  // 4. Rate Limiter (500 pts daily limit)
  const todayStr = new Date().toISOString().split('T')[0];
  const rateLimitCheck = checkDailyPointLimit(
    todayStr,
    wallet.dailyPointsDate,
    wallet.dailyPointsEarned,
    story.pointsReward,
    500
  );

  // Overall claim eligibility
  const canClaimPoints =
    !isAlreadyClaimed &&
    isReadingTimeComplete &&
    isGeofenceVerified &&
    isQuizPassed &&
    rateLimitCheck.allowed;

  // Handlers
  const toggleChecklist = (id: string) => {
    setCheckedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSignPetitionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!story.helpCommunity.petition) return;
    signPetition(story.id, story.helpCommunity.petition.id);
  };

  const handlePledgeSubmit = (option: string) => {
    setSelectedPledge(option);
    submitVolunteerPledge(story.id, option);
  };

  const handleShareHotline = () => {
    if (!story.helpCommunity.verifiedHotline) return;
    const { title, number, whatsappMessage } = story.helpCommunity.verifiedHotline;
    const fullText = `${title}: ${number} - ${whatsappMessage}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(fullText);
      addToast({
        type: 'success',
        title: 'Hotline Copied',
        message: 'Verified emergency tip-line info copied to clipboard.',
      });
    }
  };

  const handleAnswerSelect = (questionIndex: number, optionIndex: number) => {
    setQuizAnswers((prev) => ({ ...prev, [questionIndex]: optionIndex }));
    setQuizSubmitted(false);
  };

  const handleValidateQuiz = () => {
    setQuizSubmitted(true);
    if (quizEvaluation.passed) {
      addToast({
        type: 'success',
        title: 'Comprehension Verified (2/2 Correct)',
        message: 'Anti-foulplay quiz completed successfully!',
      });
    } else {
      addToast({
        type: 'warning',
        title: 'Quiz Review Required',
        message: `You got ${quizEvaluation.score}/${quizEvaluation.total} correct. Review and try again!`,
      });
    }
  };

  const handleFinalClaim = () => {
    const completedTasks = Object.keys(checkedItems).filter((k) => checkedItems[k]);
    if (isPetitionSigned) completedTasks.push('Signed Petition');
    if (selectedPledge) completedTasks.push(`Pledged: ${selectedPledge.slice(0, 30)}...`);

    const result = claimArticlePoints(story, completedTasks);
    if (!result.success) {
      addToast({
        type: 'error',
        title: 'Claim Denied',
        message: result.error || 'Verification criteria not met.',
      });
    } else {
      setShowShareSection(true);
    }
  };

  return (
    <div
      className="w-full max-w-3xl my-6 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="action-modal-headline"
    >
      {/* Top Header */}
      <div className="relative p-5 sm:p-6 bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white shrink-0">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1.5 pr-6">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/30 text-emerald-300 border border-emerald-400/30">
                {story.category.replace('_', ' ').toUpperCase()}
              </span>
              <span className="text-xs font-medium text-slate-300 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                {story.locationName}
              </span>
            </div>
            <h2 id="action-modal-headline" className="text-lg sm:text-xl font-extrabold leading-snug">
              {story.headline}
            </h2>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => setShowShareSection((prev) => !prev)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                showShareSection
                  ? 'bg-emerald-500 text-white shadow-xs'
                  : 'bg-white/15 hover:bg-white/25 text-white'
              }`}
              title="Share this civic action on WhatsApp or Twitter"
              aria-label="Share this civic action on WhatsApp or Twitter"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Share</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors shrink-0"
              aria-label="Close action modal"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Reward & Anti-Foulplay Banner in Header */}
        <div className="mt-4 pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-300">Action Reward:</span>
            <span className="font-extrabold text-emerald-300 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              +{story.pointsReward} Civic Points
            </span>
          </div>

          {/* Reading Timer Live Badge */}
          <div className="flex items-center gap-1.5 font-mono">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            {isReadingTimeComplete ? (
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <Check className="w-3 h-3" /> Minimum Reading Time Met
              </span>
            ) : (
              <span className="text-amber-300 font-semibold animate-pulse">
                Proof-of-Reading Lock: {secondsRemaining}s
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Dual Track Tab Navigation */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 p-2 gap-2 shrink-0">
        <button
          onClick={() => setActiveTrack('yourself')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTrack === 'yourself'
              ? 'bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 shadow-xs border border-slate-200 dark:border-slate-700'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Shield className="w-4 h-4 text-emerald-500" />
          <span>Track 1: Help Yourself</span>
        </button>

        <button
          onClick={() => setActiveTrack('community')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTrack === 'community'
              ? 'bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 shadow-xs border border-slate-200 dark:border-slate-700'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Users className="w-4 h-4 text-teal-500" />
          <span>Track 2: Help Community</span>
        </button>

        <button
          onClick={() => setActiveTrack('verify')}
          className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTrack === 'verify'
              ? 'bg-emerald-600 text-white shadow-xs'
              : isQuizPassed
              ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300'
              : 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
          }`}
        >
          <FileCheck2 className="w-4 h-4" />
          <span className="hidden sm:inline">Proof & Quiz</span>
          <span className="sm:hidden">Verify</span>
          {isQuizPassed && <Check className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Scrollable Modal Content */}
      <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
        {/* Social Media Sharing Showcase (Twitter / WhatsApp / Copy) */}
        {(showShareSection || isAlreadyClaimed) && (
          <SocialShareSection
            story={story}
            isCompleted={isAlreadyClaimed}
            completedTasks={Object.keys(checkedItems).filter((k) => checkedItems[k])}
          />
        )}

        {/* TRACK 1: HELP YOURSELF */}
        {activeTrack === 'yourself' && (
          <div className="space-y-5 animate-in fade-in duration-200">
            {/* Summary card */}
            <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/80">
              <h3 className="font-bold text-slate-900 dark:text-white text-base mb-1">
                {story.helpYourself.title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                {story.helpYourself.summary}
              </p>
            </div>

            {/* Interactive Safety Checklist */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <CheckSquare className="w-4 h-4 text-emerald-500" />
                  Actionable Safety Protocol Checklist
                </h4>
                <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                  {Object.values(checkedItems).filter(Boolean).length} / {story.helpYourself.checklist.length} Completed
                </span>
              </div>

              <div className="space-y-2.5">
                {story.helpYourself.checklist.map((item) => {
                  const isChecked = !!checkedItems[item.id];
                  return (
                    <button
                      key={item.id}
                      onClick={() => toggleChecklist(item.id)}
                      className={`w-full text-left flex items-start gap-3 p-3.5 rounded-xl border transition-all ${
                        isChecked
                          ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-400 dark:border-emerald-700 text-slate-900 dark:text-white'
                          : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-800 hover:border-slate-300 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="mt-0.5 text-emerald-600 dark:text-emerald-400 shrink-0">
                        {isChecked ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5 text-slate-400" />}
                      </div>
                      <div className="flex-1">
                        <span className="inline-block text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 mr-2">
                          {item.category}
                        </span>
                        <span className={`text-xs sm:text-sm ${isChecked ? 'line-through text-slate-500 dark:text-slate-400' : ''}`}>
                          {item.text}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Emergency / Safety Contacts */}
            <div>
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2.5 flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                Verified Local Hotlines & Emergency Helplines
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {story.helpYourself.emergencyContacts.map((contact, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-800 flex flex-col justify-between"
                  >
                    <div>
                      <div className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white mb-0.5">
                        {contact.label}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mb-2">
                        {contact.actionNote}
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-700/60">
                      <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        {contact.phone}
                      </span>
                      <a
                        href={`tel:${contact.phone.replace(/[^0-9]/g, '')}`}
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors"
                      >
                        Call
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TRACK 2: HELP COMMUNITY */}
        {activeTrack === 'community' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Micro-Action 1: Digital Petition */}
            {story.helpCommunity.petition && (
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-800 shadow-xs">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60 px-2 py-0.5 rounded-md border border-teal-200 dark:border-teal-900">
                      Official Civic Petition
                    </span>
                    <h4 className="font-bold text-base text-slate-900 dark:text-white mt-1">
                      {story.helpCommunity.petition.title}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Addressed to: {story.helpCommunity.petition.department}
                    </p>
                  </div>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 italic mb-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
                  &ldquo;{story.helpCommunity.petition.statement}&rdquo;
                </p>

                {/* Signatures progress */}
                <div className="mb-4">
                  <div className="flex justify-between text-xs font-medium mb-1.5">
                    <span className="text-slate-700 dark:text-slate-300 font-bold">
                      {(story.helpCommunity.petition.currentSignatures + (isPetitionSigned ? 1 : 0)).toLocaleString()} Verified Signatures
                    </span>
                    <span className="text-slate-400">
                      Target: {story.helpCommunity.petition.targetSignatures.toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(
                          100,
                          Math.round(
                            ((story.helpCommunity.petition.currentSignatures + (isPetitionSigned ? 1 : 0)) /
                              story.helpCommunity.petition.targetSignatures) *
                              100
                          )
                        )}%`,
                      }}
                    ></div>
                  </div>
                </div>

                {/* Sign Action */}
                {isPetitionSigned ? (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Signature Recorded in Citizen Ledger ✓</span>
                  </div>
                ) : (
                  <form onSubmit={handleSignPetitionSubmit} className="space-y-2.5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Your Name / Citizen Alias"
                        value={petitionName}
                        onChange={(e) => setPetitionName(e.target.value)}
                        required
                        className="px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
                      />
                      <input
                        type="email"
                        placeholder="Citizen Email (for verification)"
                        value={petitionEmail}
                        onChange={(e) => setPetitionEmail(e.target.value)}
                        required
                        className="px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full py-2.5 px-4 rounded-xl font-bold text-xs bg-teal-600 hover:bg-teal-700 text-white transition-colors shadow-xs"
                    >
                      Sign Digital Petition Now
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* Micro-Action 2: Volunteer Pledge */}
            {story.helpCommunity.volunteerPledge && (
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-800 shadow-xs">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-1">
                  {story.helpCommunity.volunteerPledge.title}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                  {story.helpCommunity.volunteerPledge.description}
                </p>

                <div className="space-y-2">
                  {story.helpCommunity.volunteerPledge.pledgeOptions.map((option, idx) => {
                    const isSelected = selectedPledge === option;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handlePledgeSubmit(option)}
                        className={`w-full text-left p-3 rounded-xl border text-xs sm:text-sm transition-all flex items-start gap-2.5 ${
                          isSelected
                            ? 'bg-teal-50 dark:bg-teal-950/30 border-teal-500 text-teal-900 dark:text-teal-200 font-semibold'
                            : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <Radio className={`w-4 h-4 mt-0.5 shrink-0 ${isSelected ? 'text-teal-600' : 'text-slate-400'}`} />
                        <span>{option}</span>
                      </button>
                    );
                  })}
                </div>

                {selectedPledge && (
                  <div className="mt-3 text-xs text-teal-600 dark:text-teal-400 font-semibold flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5" />
                    <span>Pledge active on your civic profile.</span>
                  </div>
                )}
              </div>
            )}

            {/* Micro-Action 3: Share Verified Hotline */}
            {story.helpCommunity.verifiedHotline && (
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <div className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                    {story.helpCommunity.verifiedHotline.title}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    {story.helpCommunity.verifiedHotline.description}
                  </div>
                </div>
                <button
                  onClick={handleShareHotline}
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-90 transition-opacity"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Copy Hotline</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 3 / BOTTOM: PROOF-OF-ACTION & VERIFICATION GUARD (USP) */}
        {activeTrack === 'verify' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Anti-Foulplay Overview Banner */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 text-white">
              <div className="flex items-center gap-2.5 mb-1.5">
                <Shield className="w-5 h-5 text-emerald-400" />
                <h3 className="font-extrabold text-sm sm:text-base">
                  Anti-Foulplay Verification Guard (Proof-of-Action)
                </h3>
              </div>
              <p className="text-xs text-slate-300">
                To keep civic rewards authentic and prevent automated bot farming, points require reading time-lock completion, physical geofence validation, and a 2-question comprehension quiz.
              </p>
            </div>

            {/* 1. Reading Time-Lock Guard */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-500" />
                  <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                    1. Reading Time-Lock (15-Second Minimum Stay)
                  </span>
                </div>
                {isReadingTimeComplete ? (
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Verified
                  </span>
                ) : (
                  <span className="text-xs font-mono font-bold text-amber-500">
                    {secondsRemaining}s remaining
                  </span>
                )}
              </div>

              <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden mb-1.5">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-1000"
                  style={{ width: `${Math.round(((15 - secondsRemaining) / 15) * 100)}%` }}
                ></div>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Ensures real citizen engagement with safety guidelines before points unlock.
              </p>
            </div>

            {/* 2. Geofence Radius Check Simulator */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-500" />
                  <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                    2. Geofence Radius Check (Max {story.geofenceRadiusKm} km)
                  </span>
                </div>
                {isGeofenceVerified ? (
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> In Zone ({realDistanceKm} km)
                  </span>
                ) : (
                  <span className="text-xs font-bold text-amber-500 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> Outside Radius ({realDistanceKm} km)
                  </span>
                )}
              </div>

              <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-3">
                Verifies physical proximity using Haversine calculation between user coordinates (
                {userLocation.lat.toFixed(2)}°, {userLocation.lng.toFixed(2)}°) and incident location.
              </p>

              {/* Simulation toggle for easy reviewing */}
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs">
                <span className="text-slate-600 dark:text-slate-400 font-medium">
                  Demo Simulation Mode:
                </span>
                <button
                  onClick={() => setSimulateProximity((prev) => !prev)}
                  className={`px-3 py-1 rounded-md font-bold text-xs transition-colors ${
                    simulateProximity
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {simulateProximity ? 'Simulated In-Zone ✓' : 'Toggle Proximity Bypass'}
                </button>
              </div>
            </div>

            {/* 3. Verification Quiz Guard (2 questions) */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileCheck2 className="w-4 h-4 text-emerald-500" />
                  <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                    3. Verification Quiz Guard (2/2 Required)
                  </span>
                </div>
                {isQuizPassed && (
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Passed (2/2)
                  </span>
                )}
              </div>

              {story.quiz.map((q, qIndex) => {
                const selected = quizAnswers[qIndex];
                const hasAnswered = selected !== undefined;
                const isCorrect = hasAnswered && selected === q.correctIndex;
                const isWrong = quizSubmitted && hasAnswered && !isCorrect;

                return (
                  <div
                    key={qIndex}
                    className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2.5"
                  >
                    <div className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-white">
                      Q{qIndex + 1}: {q.question}
                    </div>

                    <div className="space-y-1.5">
                      {q.options.map((opt, optIndex) => {
                        const isOptionSelected = selected === optIndex;
                        return (
                          <button
                            key={optIndex}
                            type="button"
                            onClick={() => handleAnswerSelect(qIndex, optIndex)}
                            className={`w-full text-left p-2.5 rounded-lg text-xs transition-all flex items-center justify-between ${
                              isOptionSelected
                                ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-900 dark:text-emerald-200 border border-emerald-400 dark:border-emerald-600 font-semibold'
                                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700/60 hover:border-slate-300'
                            }`}
                          >
                            <span>{opt}</span>
                            {isOptionSelected && (
                              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {quizSubmitted && isWrong && (
                      <p className="text-[11px] text-rose-500 font-medium">
                        Incorrect. Tip: {q.explanation}
                      </p>
                    )}
                  </div>
                );
              })}

              <button
                type="button"
                onClick={handleValidateQuiz}
                className="w-full py-2 px-4 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white transition-colors"
              >
                Verify Quiz Answers
              </button>
            </div>

            {/* 4. Rate Limiter Info */}
            <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 flex items-center justify-between">
              <div>
                <span className="font-bold">Daily Earning Cap:</span> 500 pts max/day
              </div>
              <div className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                {wallet.dailyPointsEarned} / 500 pts earned today
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal Footer: Verification Checklist & Claim Button */}
      <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 shrink-0">
        {isAlreadyClaimed ? (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 w-full">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <span>Civic points claimed & verified for this story.</span>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => setShowShareSection((prev) => !prev)}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>{showShareSection ? 'Hide Share Options' : 'Share Action (WhatsApp / X)'}</span>
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-300 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Status summary pills */}
            <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-medium text-slate-500 dark:text-slate-400">
              <span className={`px-2 py-0.5 rounded-md ${isReadingTimeComplete ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-slate-200 text-slate-600'}`}>
                Timer {isReadingTimeComplete ? '✓' : `${secondsRemaining}s`}
              </span>
              <span className={`px-2 py-0.5 rounded-md ${isGeofenceVerified ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-slate-200 text-slate-600'}`}>
                GPS {isGeofenceVerified ? '✓' : 'Check'}
              </span>
              <span className={`px-2 py-0.5 rounded-md ${isQuizPassed ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-slate-200 text-slate-600'}`}>
                Quiz {isQuizPassed ? '✓' : 'Pending'}
              </span>
            </div>

            {/* Claim Points Button */}
            <button
              onClick={handleFinalClaim}
              disabled={!canClaimPoints}
              className={`w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-2xl font-black text-sm shadow-md transition-all ${
                canClaimPoints
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white hover:scale-105 active:scale-95 shadow-emerald-500/25 ring-2 ring-emerald-400/50 cursor-pointer animate-pulse'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed opacity-80'
              }`}
            >
              {canClaimPoints ? (
                <>
                  <Unlock className="w-4 h-4" />
                  <span>Claim +{story.pointsReward} Civic Points!</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Complete Verification ({!isReadingTimeComplete ? `Timer ${secondsRemaining}s` : !isGeofenceVerified ? 'Geofence' : 'Quiz'})</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export const ActionModal: React.FC = () => {
  const { activeStoryForModal, closeActionModal } = useImpact();

  if (!activeStoryForModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto">
      <ActionModalContent story={activeStoryForModal} onClose={closeActionModal} />
    </div>
  );
};
