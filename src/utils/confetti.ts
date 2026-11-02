import confetti from 'canvas-confetti';

export function fireConfettiReward() {
  try {
    // Left burst
    confetti({
      particleCount: 60,
      angle: 60,
      spread: 55,
      origin: { x: 0.1, y: 0.7 },
      colors: ['#10B981', '#3B82F6', '#F59E0B', '#EC4899', '#8B5CF6'],
    });

    // Right burst
    confetti({
      particleCount: 60,
      angle: 120,
      spread: 55,
      origin: { x: 0.9, y: 0.7 },
      colors: ['#10B981', '#3B82F6', '#F59E0B', '#EC4899', '#8B5CF6'],
    });

    // Center starburst
    setTimeout(() => {
      confetti({
        particleCount: 80,
        spread: 100,
        origin: { y: 0.6 },
        colors: ['#34D399', '#60A5FA', '#FBBF24'],
      });
    }, 200);
  } catch (err) {
    console.warn('Confetti trigger failed:', err);
  }
}
