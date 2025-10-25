// ===============================
// FILE: src/components/emotion.js
// Purpose:
// - Central emotion definitions, theming, and mood scoring.
// - Produces a "bliss score" per day in [-100 .. 100] derived from emotional valence.
// - Maps that score to semantic color buckets for UI.
//
// Exports:
//   popularEmotions, allEmotions, emotionMap, colorMap
//   baseScore, triadWeights, scoreEmotion, scoreTriad,
//   dailyBlissScore, blissBucketClass, blissOpacity
// ===============================

// Common / quick-pick emotions for UI chips etc.
export const popularEmotions = [
  { emoji: "😊", label: "Happy", value: "Happy" },
  { emoji: "😔", label: "Sad", value: "Sad" },
  { emoji: "😩", label: "Anxious", value: "Anxious" },
  { emoji: "😣", label: "Angry", value: "Angry" },
  { emoji: "😴", label: "Tired", value: "Tired" },
  { emoji: "😍", label: "Excited", value: "Excited" },
];

// Full list of selectable emotions
export const allEmotions = [
  { value: "Frustrated", label: "Frustrated", emoji: "😤" },
  { value: "Calm", label: "Calm", emoji: "😌" },
  { value: "Confused", label: "Confused", emoji: "😕" },
  { value: "Lonely", label: "Lonely", emoji: "😔" },
  { value: "Hopeful", label: "Hopeful", emoji: "🙏" },
  { value: "Guilty", label: "Guilty", emoji: "😞" },
  { value: "Proud", label: "Proud", emoji: "🏆" },
  { value: "Scared", label: "Scared", emoji: "😨" },
  { value: "Relieved", label: "Relieved", emoji: "😅" },
  { value: "Bored", label: "Bored", emoji: "🙄" },
  { value: "Jealous", label: "Jealous", emoji: "😒" },
  { value: "Grateful", label: "Grateful", emoji: "🙏" },
  { value: "Admiration", label: "Admiration", emoji: "👏" },
  { value: "Adoration", label: "Adoration", emoji: "😍" },
  {
    value: "Aesthetic Appreciation",
    label: "Aesthetic Appreciation",
    emoji: "🎨",
  },
  { value: "Amusement", label: "Amusement", emoji: "😂" },
  { value: "Awe", label: "Awe", emoji: "😲" },
  { value: "Awkwardness", label: "Awkwardness", emoji: "😬" },
  { value: "Craving", label: "Craving", emoji: "🤤" },
  {
    value: "Empathic Pain",
    label: "Empathic Pain",
    emoji: "💔",
  },
  { value: "Entrancement", label: "Entrancement", emoji: "😯" },
  { value: "Horror", label: "Horror", emoji: "👻" },
  { value: "Nostalgia", label: "Nostalgia", emoji: "📸" },
  { value: "Romance", label: "Romance", emoji: "💕" },
  {
    value: "Satisfaction",
    label: "Satisfaction",
    emoji: "👍",
  },
  {
    value: "Sexual Desire",
    label: "Sexual Desire",
    emoji: "🔥",
  },
  { value: "Serenity", label: "Serenity", emoji: "😌" },
  { value: "Ecstasy", label: "Ecstasy", emoji: "😂" },
  {
    value: "Pensiveness",
    label: "Pensiveness",
    emoji: "🤔",
  },
  { value: "Grief", label: "Grief", emoji: "😭" },
  {
    value: "Acceptance",
    label: "Acceptance",
    emoji: "🤝",
  },
  { value: "Loathing", label: "Loathing", emoji: "🤮" },
  {
    value: "Apprehension",
    label: "Apprehension",
    emoji: "😟",
  },
  { value: "Terror", label: "Terror", emoji: "😱" },
  {
    value: "Annoyance",
    label: "Annoyance",
    emoji: "😒",
  },
  { value: "Rage", label: "Rage", emoji: "😤" },
  {
    value: "Distraction",
    label: "Distraction",
    emoji: "😵",
  },
  { value: "Amazement", label: "Amazement", emoji: "🤩" },
  { value: "Interest", label: "Interest", emoji: "👀" },
  {
    value: "Vigilance",
    label: "Vigilance",
    emoji: "🕵️",
  },
  { value: "Love", label: "Love", emoji: "😍" },
  {
    value: "Optimism",
    label: "Optimism",
    emoji: "🌟",
  },
  {
    value: "Submission",
    label: "Submission",
    emoji: "🙇",
  },
  {
    value: "Disapproval",
    label: "Disapproval",
    emoji: "👎",
  },
  { value: "Remorse", label: "Remorse", emoji: "😞" },
  {
    value: "Contempt",
    label: "Contempt",
    emoji: "😏",
  },
  {
    value: "Aggressiveness",
    label: "Aggressiveness",
    emoji: "💥",
  },
  {
    value: "I'm not sure (Overwhelmed)",
    label: "I'm not sure (Overwhelmed)",
    emoji: "😩",
  },
  {
    value: "I'm not sure (Numb)",
    label: "I'm not sure (Numb)",
    emoji: "😶",
  },
  {
    value: "I'm not sure (Mixed)",
    label: "I'm not sure (Mixed)",
    emoji: "😕",
  },
];

// Map emotion label → emoji (quick lookup downstream)
export const emotionMap = {
  Happy: "😊",
  Sad: "😔",
  Anxious: "😩",
  Angry: "😣",
  Tired: "😴",
  Excited: "😍",

  Frustrated: "😤",
  Calm: "😌",
  Confused: "😕",
  Lonely: "😔",
  Hopeful: "🙏",
  Guilty: "😞",
  Proud: "🏆",
  Scared: "😨",
  Relieved: "😅",
  Bored: "🙄",
  Jealous: "😒",
  Grateful: "🙏",

  Admiration: "👏",
  Adoration: "😍",
  "Aesthetic Appreciation": "🎨",
  Amusement: "😂",
  Awe: "😲",
  Awkwardness: "😬",
  Craving: "🤤",
  "Empathic Pain": "💔",
  Entrancement: "😯",
  Horror: "👻",
  Nostalgia: "📸",
  Romance: "💕",
  Satisfaction: "👍",
  "Sexual Desire": "🔥",
  Serenity: "😌",
  Ecstasy: "😂",
  Pensiveness: "🤔",
  Grief: "😭",
  Acceptance: "🤝",
  Loathing: "🤮",
  Apprehension: "😟",
  Terror: "😱",
  Annoyance: "😒",
  Rage: "😤",
  Distraction: "😵",
  Amazement: "🤩",
  Interest: "👀",
  Vigilance: "🕵️",
  Love: "😍",
  Optimism: "🌟",
  Submission: "🙇",
  Disapproval: "👎",
  Remorse: "😞",
  Contempt: "😏",
  Aggressiveness: "💥",

  "I'm not sure (Overwhelmed)": "😩",
  "I'm not sure (Numb)": "😶",
  "I'm not sure (Mixed)": "😕",
};

// Map emotion label → Tailwind gradient (used for chips/cards/etc.)
// NOTE: all colors are Tailwind defaults (no invalid `brown-*`)
export const colorMap = {
  Happy: "from-yellow-500 to-orange-400",
  Sad: "from-blue-600 to-indigo-500",
  Anxious: "from-purple-600 to-pink-500",
  Angry: "from-red-500 to-orange-500",
  Tired: "from-gray-600 to-gray-400",
  Excited: "from-pink-500 to-red-400",

  Frustrated: "from-orange-600 to-red-500",
  Calm: "from-green-500 to-teal-400",
  Confused: "from-indigo-500 to-purple-400",
  Lonely: "from-blue-700 to-gray-500",
  Hopeful: "from-yellow-400 to-green-400",
  Guilty: "from-gray-500 to-red-400",
  Proud: "from-amber-400 to-yellow-500",
  Scared: "from-violet-600 to-indigo-500",
  Relieved: "from-teal-500 to-cyan-400",
  Bored: "from-gray-500 to-slate-400",
  Jealous: "from-green-600 to-lime-500",
  Grateful: "from-amber-400 to-yellow-300",

  Admiration: "from-blue-500 to-cyan-400",
  Adoration: "from-pink-600 to-rose-500",
  "Aesthetic Appreciation": "from-indigo-400 to-purple-300",
  Amusement: "from-yellow-500 to-lime-400",
  Awe: "from-cyan-500 to-blue-400",
  Awkwardness: "from-rose-400 to-pink-300",
  Craving: "from-orange-500 to-amber-400",
  "Empathic Pain": "from-red-600 to-rose-500",
  Entrancement: "from-violet-500 to-indigo-400",
  Horror: "from-gray-800 to-black",
  Nostalgia: "from-amber-600 to-stone-500", // replaced invalid `to-brown-500`
  Romance: "from-rose-500 to-pink-400",
  Satisfaction: "from-green-500 to-lime-400",
  "Sexual Desire": "from-red-600 to-pink-500",
  Serenity: "from-cyan-400 to-teal-300",
  Ecstasy: "from-yellow-400 to-orange-300",
  Pensiveness: "from-blue-500 to-indigo-400",
  Grief: "from-gray-700 to-blue-600",
  Acceptance: "from-green-400 to-teal-300",
  Loathing: "from-lime-600 to-green-500",
  Apprehension: "from-orange-500 to-amber-500",
  Terror: "from-red-700 to-black",
  Annoyance: "from-orange-600 to-red-400",
  Rage: "from-red-600 to-orange-500",
  Distraction: "from-purple-500 to-violet-400",
  Amazement: "from-cyan-400 to-blue-300",
  Interest: "from-lime-500 to-green-400",
  Vigilance: "from-amber-500 to-yellow-400",
  Love: "from-pink-500 to-rose-400",
  Optimism: "from-yellow-500 to-amber-400",
  Submission: "from-gray-500 to-slate-400",
  Disapproval: "from-red-500 to-rose-400",
  Remorse: "from-blue-600 to-indigo-500",
  Contempt: "from-gray-600 to-black",
  Aggressiveness: "from-red-500 to-orange-400",

  "I'm not sure (Overwhelmed)": "from-purple-600 to-violet-500",
  "I'm not sure (Numb)": "from-gray-500 to-slate-500",
  "I'm not sure (Mixed)": "from-indigo-500 to-purple-400",
};

// ===============================
// Emotion Valence Model
// ===============================
//
// baseScore: approximate valence (pleasant ↔ unpleasant)
// Scale is roughly: -3 = extremely unpleasant, +3 = extremely pleasant
// This aligns with common affect models (e.g. circumplex valence).
//
// We'll use these to derive a "bliss score" per thought/day.
//
// NOTE: We include "Excited" and "Angry" because they are in popularEmotions.
// NOTE: "Nostalgia" is given slight net-positive (often restorative).
//
export const baseScore = {
  // Strong positive / high pleasant affect
  Ecstasy: 3,
  Happy: 2.5,
  Excited: 2.2,
  Love: 2.5,
  Optimism: 2.2,
  Proud: 2.2,
  Gratitude: 2.2,
  Grateful: 2.2,
  Admiration: 2,
  Adoration: 2,
  Amazement: 2,
  Satisfaction: 1.8,
  Serenity: 1.8,
  Relieved: 1.5,
  Hopeful: 1.5,
  Interest: 1.2,
  Acceptance: 1.0,
  Calm: 1.0,

  // Mixed / reflective / low-intensity states
  Nostalgia: 0.5, // bittersweet but generally mood-supportive
  Pensiveness: 0.2,
  Bored: -0.2,
  Distraction: -0.2,

  // Mild negative
  Tired: -0.6,
  Confused: -0.6,
  Awkwardness: -0.7,
  Annoyance: -0.8,
  Apprehension: -1.0,
  Anxious: -1.4,
  Guilty: -1.4,
  Jealous: -1.4,
  Lonely: -1.6,
  Sad: -1.8,
  Frustrated: -1.8,

  // Strong negative / high distress
  Angry: -2.2,
  Disapproval: -2.0,
  Contempt: -2.0,
  Loathing: -2.3,
  Scared: -2.3,
  Rage: -2.5,
  Aggressiveness: -2.6,
  Grief: -2.8,
  Horror: -3.0,
  Terror: -3.0,

  // "I'm not sure" buckets (self-reported unclear state)
  "I'm not sure (Overwhelmed)": -0.8,
  "I'm not sure (Numb)": 0,
  "I'm not sure (Mixed)": 0,
};

// Weighting for primary / secondary / tertiary moods
export const triadWeights = [1.0, 0.6, 0.3];

// Score a single emotion by label
export function scoreEmotion(label) {
  if (!label) return 0;
  return (
    baseScore[label] ??
    baseScore[
      label.charAt(0).toUpperCase() + label.slice(1)
    ] ??
    0
  );
}

// Score a triad of moods (e.g. ["Happy","Calm","Tired"]) → [-3..3]
// Applies triadWeights and clamps to avoid extremes >3 or <-3
export function scoreTriad(mood = []) {
  const vals = mood
    .slice(0, 3)
    .map((m, i) => scoreEmotion(m) * triadWeights[i]);

  const raw = vals.reduce((a, b) => a + b, 0);
  return Math.max(-3, Math.min(3, raw));
}

// Given a day's list of thoughts [{ mood: [...] }, ...],
// average their triad scores to create a daily bliss score in [-100..100].
export function dailyBlissScore(thoughts = []) {
  if (!Array.isArray(thoughts) || thoughts.length === 0)
    return 0;

  const triads = thoughts.map((t) =>
    scoreTriad(t.mood || [])
  );
  const avg =
    triads.reduce((a, b) => a + b, 0) / triads.length; // avg in [-3..3]

  return Math.round((avg / 3) * 100); // scale to [-100..100]
}

// ===============================
// Visual mapping for daily bliss score
// ===============================
//
// We want emotionally readable colors at a glance:
// - Very negative: crisis/distress → deep red
// - Negative: low mood / anxious → red/orange
// - Neutral: dull gray
// - Mild positive: okay/stable → teal (recovery/safety)
// - Positive: good → green
// - Very positive: great/joy → lime/yellow-green
//
// These are Tailwind background utility classes.
//
export function blissBucketClass(score) {
  // score ∈ [-100 .. 100]

  if (score <= -60) {
    // crisis / overwhelmed / really bad day
    return "bg-red-900";
  }

  if (score <= -30) {
    // low mood / anxious / drained
    return "bg-red-700";
  }

  if (score <= 10) {
    // meh / numb / mixed / flat
    return "bg-gray-600";
  }

  if (score <= 40) {
    // okay / coping / somewhat stable
    return "bg-teal-600";
  }

  if (score <= 70) {
    // good / proud / hopeful
    return "bg-green-600";
  }

  // excellent / connected / energized
  return "bg-lime-500";
}

// Opacity helper so we can layer these colors subtly (ex: tinted cards)
// Higher absolute score => higher opacity
export function blissOpacity(score) {
  const abs = Math.min(100, Math.abs(score));
  return 0.25 + (abs / 100) * 0.6; // 0.25 .. 0.85
}
