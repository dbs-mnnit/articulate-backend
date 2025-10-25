export const generateTags = (text) => {
  // Levenshtein distance function for fuzzy matching
  const levenshteinDistance = (str1, str2) => {
    const len1 = str1.length;
    const len2 = str2.length;
    const matrix = Array(len2 + 1).fill().map(() => Array(len1 + 1).fill(0));

    for (let i = 0; i <= len1; i++) matrix[0][i] = i;
    for (let j = 0; j <= len2; j++) matrix[j][0] = j;

    for (let j = 1; j <= len2; j++) {
      for (let i = 1; i <= len1; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1, // deletion
          matrix[j - 1][i] + 1, // insertion
          matrix[j - 1][i - 1] + indicator // substitution
        );
      }
    }
    return matrix[len2][len1];
  };

  // Comprehensive keyword map for emotions compiled from multiple sources
  const keywords = {
    happy: ['happy', 'joyful', 'glad', 'cheerful', 'content', 'delighted', 'ecstatic', 'blissful', 'elated', 'gleeful', 'merry', 'radiant', 'amused', 'excited', 'enthusiastic', 'optimistic', 'proud', 'satisfied', 'grateful', 'hopeful', 'inspired', 'lively', 'playful', 'rejuvenated', 'thrilled', 'euphoric', 'jubilant', 'exhilarated', 'appreciative', 'fulfilled', 'jovial', 'pleased', 'upbeat', 'vivacious'],
    sad: ['sad', 'depressed', 'unhappy', 'miserable', 'sorrowful', 'down', 'blue', 'heartbroken', 'melancholy', 'gloomy', 'despondent', 'woeful', 'dejected', 'discouraged', 'dispirited', 'grieving', 'heavy-hearted', 'mournful', 'weepy', 'anguished', 'bereaved', 'despairing', 'forlorn', 'grief-stricken', 'inconsolable', 'disappointed', 'dismal', 'distraught', 'drained', 'empty', 'exhausted', 'helpless', 'hopeless', 'lonely', 'neglected', 'pitiful', 'regretful', 'rejected', 'resigned', 'uncared for', 'unappreciated', 'unloved', 'unwanted', 'wounded'],
    angry: ['angry', 'mad', 'furious', 'irritated', 'enraged', 'annoyed', 'aggravated', 'hostile', 'outraged', 'livid', 'incensed', 'wrathful', 'affronted', 'antagonized', 'bristling', 'exasperated', 'indignant', 'offended', 'resentful', 'riled', 'sarcastic', 'appalled', 'belligerent', 'bitter', 'contemptuous', 'disgusted', 'hateful', 'loathing', 'menacing', 'seething', 'spiteful', 'vengeful', 'vicious', 'vindictive', 'abused', 'agitated', 'anguished', 'betrayed', 'coerced', 'controlled', 'deceived', 'defensive', 'despised', 'dismayed', 'displeased', 'dominated', 'exploited', 'frustrated', 'fuming', 'harassed', 'humiliated', 'patronized', 'peeved', 'pissed off', 'provoked', 'rebellious', 'repulsed', 'ridiculed', 'sab otaged', 'smothered', 'strangled', 'throttled', 'upset'],
    anxious: ['anxious', 'worried', 'nervous', 'tense', 'stressed', 'panicky', 'apprehensive', 'fearful', 'uneasy', 'restless', 'jittery', 'edgy', 'alert', 'cautious', 'disconcerted', 'disquieted', 'hesitant', 'insecure', 'leery', 'pensive', 'shy', 'timid', 'watchful', 'afraid', 'alarmed', 'distrustful', 'disturbed', 'jumpy', 'perturbed', 'rattled', 'shaky', 'suspicious', 'unnerved', 'unsettled', 'wary', 'dissociated', 'dread', 'frenzied', 'horrified', 'immobile', 'panicked', 'paralyzed', 'petrified', 'phobic', 'shocked', 'terrorized', 'appalled', 'apprehensive', 'awed', 'constricted', 'concerned', 'desperate', 'directionless', 'distracted', 'doubtful', 'flustered', 'frantic', 'full of dread', 'guarded', 'horrified', 'immobilized', 'impatient', 'intimidated', 'overwhelmed', 'panicky', 'reluctant', 'shaken', 'skeptical', 'startled', 'stunned', 'threatened', 'tormented', 'trapped', 'troubled', 'uncertain', 'uncomfortable', 'undecided', 'vulnerable'],
    tired: ['tired', 'exhausted', 'weary', 'fatigued', 'drained', 'sleepy', 'worn out', 'lethargic', 'listless', 'apathetic', 'dispirited', 'downtrodden', 'fed up', 'flat', 'helpless', 'humorless', 'indifferent', 'isolated', 'pessimistic', 'purposeless', 'sullen', 'bereft', 'constant irritated', 'crushed', 'depressed', 'desolate', 'desperate', 'empty', 'fatalistic', 'gloomy', 'hibernating', 'hopeless', 'immobile', 'inactive', 'inward-focused', 'joyless', 'miserable', 'morbid', 'overwhelmed', 'passionless', 'pleasureless'],
    excited: ['excited', 'enthusiastic', 'exhilarated', 'thrilled', 'eager', 'zealous', 'aroused', 'passionate', 'invigorated', 'lively', 'energetic', 'amused', 'blissful', 'cheerful', 'delighted', 'ecstatic', 'elated', 'enjoyment', 'euphoric', 'gaiety', 'gladness', 'glee', 'happiness', 'jolliness', 'joviality', 'joy', 'jubilation', 'satisfaction', 'enthralled', 'rapture', 'hope', 'optimism', 'pride', 'triumph', 'relief', 'enthusiasm', 'excitement', 'exhilaration', 'thrill', 'zeal', 'zest'],
    calm: ['calm', 'peaceful', 'relaxed', 'serene', 'tranquil', 'content', 'composed', 'unruffled', 'assured', 'confident', 'encouraged', 'energized', 'fulfilled', 'good', 'gratified', 'marvelous', 'resolved', 'respected', 'terrific', 'valued'],
    ashamed: ['ashamed', 'guilty', 'embarrassed', 'humiliated', 'chagrined', 'contrite', 'culpable', 'penitent', 'regretful', 'remorseful', 'sorry', 'abashed', 'disgraced', 'mortified', 'shamefaced', 'belittled', 'condemned', 'demoralized', 'disgrace', 'disheartened', 'humbled', 'inadequate', 'pitiful', 'wounded'],
    jealous: ['jealous', 'envious', 'covetous', 'possessive', 'resentful', 'green with envy', 'ambitious', 'amorous', 'bonded', 'committed', 'desirous', 'devoted', 'disrespected', 'distrustful', 'driven', 'equitable', 'generous', 'guarded', 'lonely', 'loving', 'loyal', 'motivated', 'prosperous', 'romantic', 'secure', 'self-preserving', 'threatened', 'wary', 'affluent', 'ardent', 'avaricious', 'fixated', 'deprived', 'gluttonous', 'grasping', 'greedy', 'longing', 'lustful', 'obsessed', 'passionate', 'voracious'],
    depressed: ['depressed', 'despondent', 'hopeless', 'despairing', 'miserable', 'morose', 'bereft', 'crushed', 'devastated', 'doomed', 'gutted', 'nihilistic', 'numbed', 'tormented', 'agonized', 'anguished', 'bleak', 'death-seeking', 'emancipated', 'freed', 'frozen', 'liberated', 'reckless', 'self-destructive', 'suicidal', 'tortured', 'transformed'],
    surprised: ['surprised', 'amazed', 'astonished', 'shocked', 'startled', 'stunned', 'flabbergasted', 'alarm', 'fright', 'horror', 'hysteria', 'mortification', 'panic', 'shock', 'terror', 'amazement', 'astonishment'],
    disgusted: ['disgusted', 'revulsed', 'repulsed', 'nauseated', 'appalled', 'abhorrent', 'contempt', 'disgust', 'revulsion'],
    contempt: ['contempt', 'scorn', 'disdain', 'derision', 'sneer', 'arrogant', 'condescending'],
    remorse: ['remorse', 'regret', 'contrite', 'penitent', 'apologetic', 'guilt', 'shame'],
    disapproval: ['disapprove', 'criticize', 'condemn', 'reject', 'censure', 'displeasure', 'dismay'],
    aggressiveness: ['aggressive', 'hostile', 'belligerent', 'combative', 'assertive', 'menacing', 'violent'],
    unsure: ['unsure', 'overwhelmed', 'numb', 'mixed', 'uncertain', 'indecisive', 'hesitant', 'ambivalent', 'baffled', 'bewildered', 'bothered', 'confused', 'disorganized', 'foggy', 'misunderstood', 'perplexed', 'puzzled', 'stagnant', 'torn', 'unsettled'],
    general: []
  };

  // Tokenize text into words, removing punctuation and normalizing
  const words = text
    .toLowerCase()
    .replace(/[^\w\s]/g, '') // Remove punctuation
    .split(/\s+/)
    .filter(word => word.length > 2); // Ignore very short words

  const tags = new Set();

  // Fuzzy matching for each word in text against keywords
  for (const word of words) {
    for (const [category, keywordList] of Object.entries(keywords)) {
      for (const keyword of keywordList) {
        // Only compare words of similar length to optimize performance
        if (Math.abs(word.length - keyword.length) <= 2) {
          const distance = levenshteinDistance(word, keyword);
          // Allow edits up to 2 or 25% of the longer word's length
          const maxEdits = Math.min(2, Math.floor(Math.max(word.length, keyword.length) * 0.25));
          if (distance <= maxEdits) {
            tags.add(category);
            break; // Move to next word once a match is found
          }
        }
      }
    }
  }

  return tags.size > 0 ? Array.from(tags) : ['general'];
};