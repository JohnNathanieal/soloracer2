import test from 'node:test';
import assert from 'node:assert/strict';
import { generateShareContent } from './shareUtils';
import { NewsStory } from '../types/impact';

const mockStory: NewsStory = {
  id: 'story-test-1',
  headline: 'Monsoon Flooding Alert along Canal Road',
  category: 'environmental',
  urgency: 'Urgent',
  locationName: 'Thrissur Central',
  coordinates: { lat: 10.52, lng: 76.21 },
  summary: 'Debris blocked drainage.',
  fullContent: ['Content'],
  sourceAgency: 'Civic Watch',
  timestamp: '10 mins ago',
  readingTimeMinutes: 2,
  pointsReward: 50,
  imageUrl: 'https://example.com/img.jpg',
  geofenceRadiusKm: 15,
  helpYourself: {
    title: 'Flood Precautions',
    summary: 'Stay safe',
    checklist: [],
    emergencyContacts: [],
  },
  helpCommunity: {},
  quiz: [],
};

test('generateShareContent formats Twitter and WhatsApp links correctly', () => {
  const content = generateShareContent(mockStory, 50, ['Signed Petition'], 'https://impactpulse.app');

  assert.ok(content.text.includes('Monsoon Flooding Alert along Canal Road'));
  assert.ok(content.text.includes('+50 civic points'));
  assert.ok(content.text.includes('Thrissur Central'));
  assert.ok(content.text.includes('Signed Petition'));

  // Twitter link format
  assert.ok(content.twitterUrl.startsWith('https://twitter.com/intent/tweet?text='));
  assert.ok(content.twitterUrl.includes('hashtags=ImpactPulse'));

  // WhatsApp link format
  assert.ok(content.whatsappUrl.startsWith('https://api.whatsapp.com/send?text='));
  assert.ok(content.whatsappUrl.includes(encodeURIComponent('Monsoon Flooding Alert')));
});
