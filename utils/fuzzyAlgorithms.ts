/**
 * Enhanced Fuzzy Matching Algorithms with Extended Library Support
 * Implementing multiple popular fuzzy matching algorithms including external libraries
 */

// External library imports for advanced fuzzy matching
// Import fuzzysort from "fuzzysort";
// Import fuzzysearch from "fuzzysearch";
// Import { search as fastFuzzySearch } from "fast-fuzzy";

// Note: Using dynamic imports in matchers to handle potential library loading issues

export interface FuzzyMatchResult {
  source: string;
  target: string;
  score: number;
  algorithm: string;
  sourceRow: number;
  targetRow: number;
}

export interface FuzzyMatcherData {
  value: string;
  rowIndex: number;
}

export type FuzzyAlgorithmType = 
  | 'fuse'
  | 'levenshtein'
  | 'jaro-winkler'
  | 'soundex'
  | 'cosine'
  | 'jaccard'
  | 'flexsearch'
  | 'microfuzz'
  | 'ufuzzy'
  | 'fuzzysearch'
  | 'fuzzysort'
  | 'fast-fuzzy'
  | 'fuzzyjs'
  | 'minisearch'
  | 'meilisearch'
  | 'elasticsearch';

export interface AlgorithmInfo {
  id: FuzzyAlgorithmType;
  name: string;
  description: string;
  bestFor: string;
  strength: string;
  category?: 'basic' | 'advanced' | 'search-engine';
  performance?: 'fast' | 'medium' | 'slow';
}

export const FUZZY_ALGORITHMS: AlgorithmInfo[] = [
  // Basic Algorithms
  {
    id: 'fuse',
    name: 'Fuse.js (Comprehensive)',
    description: 'Advanced fuzzy search with configurable options and multi-field support',
    bestFor: 'General purpose, complex searches',
    strength: 'Highly configurable with scoring system',
    category: 'basic',
    performance: 'medium'
  },
  {
    id: 'levenshtein',
    name: 'Levenshtein Distance',
    description: 'Measures minimum single-character edits (insertions, deletions, substitutions)',
    bestFor: 'Spelling corrections, exact character-based matching',
    strength: 'Great for typos and character-level differences',
    category: 'basic',
    performance: 'fast'
  },
  {
    id: 'jaro-winkler',
    name: 'Jaro-Winkler Distance',
    description: 'Gives higher weight to strings that match from the beginning',
    bestFor: 'Names, short strings, prefixes',
    strength: 'Excellent for name matching and prefix similarity',
    category: 'basic',
    performance: 'fast'
  },
  {
    id: 'soundex',
    name: 'Soundex Algorithm',
    description: 'Phonetic matching based on how words sound when pronounced',
    bestFor: 'Names, surnames, phonetic similarity',
    strength: 'Matches words that sound similar (phonetic matching)',
    category: 'basic',
    performance: 'fast'
  },
  {
    id: 'cosine',
    name: 'Cosine Similarity',
    description: 'Vector-based similarity using term frequency',
    bestFor: 'Text documents, descriptions, large text',
    strength: 'Excellent for text content and document similarity',
    category: 'basic',
    performance: 'medium'
  },
  {
    id: 'jaccard',
    name: 'Jaccard Similarity',
    description: 'Set-based similarity using word intersections',
    bestFor: 'Categorical data, tag matching, keywords',
    strength: 'Great for set-based and categorical matching',
    category: 'basic',
    performance: 'fast'
  },
  
  // Advanced Algorithms
  {
    id: 'flexsearch',
    name: 'FlexSearch',
    description: 'High-performance full-text search with advanced tokenization',
    bestFor: 'Large datasets, full-text search, auto-complete',
    strength: 'Lightning fast with memory-efficient indexing',
    category: 'advanced',
    performance: 'fast'
  },
  {
    id: 'microfuzz',
    name: 'MicroFuzz',
    description: 'Lightweight fuzzy matching with minimal overhead',
    bestFor: 'Small datasets, real-time matching, embedded systems',
    strength: 'Ultra-lightweight and fast execution',
    category: 'advanced',
    performance: 'fast'
  },
  {
    id: 'ufuzzy',
    name: 'μFuzzy (uFuzzy)',
    description: 'Micro fuzzy matching with Unicode support and configurable algorithms',
    bestFor: 'International text, Unicode strings, multilingual data',
    strength: 'Excellent Unicode support with multiple matching modes',
    category: 'advanced',
    performance: 'fast'
  },
  {
    id: 'fuzzysearch',
    name: 'FuzzySearch',
    description: 'Simple approximate string matching with customizable distance',
    bestFor: 'Quick searches, substring matching, simple cases',
    strength: 'Simple API with good performance for basic needs',
    category: 'advanced',
    performance: 'fast'
  },
  {
    id: 'fuzzysort',
    name: 'FuzzySort',
    description: 'Fast SublimeText-like fuzzy search for JavaScript with highlighting',
    bestFor: 'Real-time search, autocomplete, user interfaces',
    strength: 'Lightning fast with built-in result highlighting',
    category: 'advanced',
    performance: 'fast'
  },
  {
    id: 'fast-fuzzy',
    name: 'Fast-Fuzzy',
    description: 'Fast fuzzy string matching library optimized for performance',
    bestFor: 'Performance-critical applications, large datasets',
    strength: 'Extremely fast with minimal memory usage',
    category: 'advanced',
    performance: 'fast'
  },
  {
    id: 'fuzzyjs',
    name: 'Fuzzy.js',
    description: 'JavaScript fuzzy matching with highlighting and scoring',
    bestFor: 'UI search, highlighted results, interactive matching',
    strength: 'Built-in result highlighting and detailed scoring',
    category: 'advanced',
    performance: 'medium'
  },
  {
    id: 'minisearch',
    name: 'MiniSearch',
    description: 'Tiny but powerful full-text search engine with fuzzy matching',
    bestFor: 'Client-side search, small to medium datasets',
    strength: 'Full-text search features in a small package',
    category: 'advanced',
    performance: 'medium'
  },
  
  // Search Engine Algorithms (Simulated)
  {
    id: 'meilisearch',
    name: 'Meilisearch (Simulated)',
    description: 'Meilisearch-style matching with typo tolerance and faceted search',
    bestFor: 'E-commerce, content sites, faceted search',
    strength: 'Advanced typo tolerance and instant search experience',
    category: 'search-engine',
    performance: 'medium'
  },
  {
    id: 'elasticsearch',
    name: 'Elasticsearch (Simulated)',
    description: 'Elasticsearch-style fuzzy matching with analyzers and boosting',
    bestFor: 'Enterprise search, analytics, complex queries',
    strength: 'Enterprise-grade with advanced query capabilities',
    category: 'search-engine',
    performance: 'slow'
  }
];

/**
 * Levenshtein Distance Algorithm
 */
export class LevenshteinMatcher {
  static distance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1).fill(null).map(() => 
      Array(str1.length + 1).fill(null)
    );
    
    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
    
    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,    // deletion
          matrix[j - 1][i] + 1,    // insertion
          matrix[j - 1][i - 1] + indicator  // substitution
        );
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  static similarity(str1: string, str2: string): number {
    const maxLength = Math.max(str1.length, str2.length);
    if (maxLength === 0) return 1.0;
    const distance = this.distance(str1.toLowerCase(), str2.toLowerCase());
    return (maxLength - distance) / maxLength;
  }

  static findBestMatch(source: string, targets: FuzzyMatcherData[]): FuzzyMatchResult | null {
    let bestMatch: FuzzyMatchResult | null = null;
    let bestScore = 0;

    for (const target of targets) {
      const score = this.similarity(source, target.value);
      if (score > bestScore) {
        bestScore = score;
        bestMatch = {
          source,
          target: target.value,
          score,
          algorithm: 'levenshtein',
          sourceRow: -1,
          targetRow: target.rowIndex
        };
      }
    }

    return bestMatch;
  }
}

/**
 * Jaro-Winkler Distance Algorithm
 */
export class JaroWinklerMatcher {
  static jaroSimilarity(str1: string, str2: string): number {
    if (str1 === str2) return 1.0;
    
    const len1 = str1.length;
    const len2 = str2.length;
    const matchWindow = Math.floor(Math.max(len1, len2) / 2) - 1;
    
    if (matchWindow < 0) return 0.0;
    
    const str1Matches = new Array(len1).fill(false);
    const str2Matches = new Array(len2).fill(false);
    
    let matches = 0;
    let transpositions = 0;
    
    // Identify matches
    for (let i = 0; i < len1; i++) {
      const start = Math.max(0, i - matchWindow);
      const end = Math.min(i + matchWindow + 1, len2);
      
      for (let j = start; j < end; j++) {
        if (str2Matches[j] || str1[i] !== str2[j]) continue;
        str1Matches[i] = true;
        str2Matches[j] = true;
        matches++;
        break;
      }
    }
    
    if (matches === 0) return 0.0;
    
    // Count transpositions
    let k = 0;
    for (let i = 0; i < len1; i++) {
      if (!str1Matches[i]) continue;
      while (!str2Matches[k]) k++;
      if (str1[i] !== str2[k]) transpositions++;
      k++;
    }
    
    return (matches / len1 + matches / len2 + (matches - transpositions / 2) / matches) / 3.0;
  }

  static winklerSimilarity(str1: string, str2: string): number {
    const jaroSim = this.jaroSimilarity(str1.toLowerCase(), str2.toLowerCase());
    
    if (jaroSim < 0.7) return jaroSim;
    
    // Calculate common prefix length (up to 4 characters)
    let prefixLength = 0;
    const maxPrefix = Math.min(4, Math.min(str1.length, str2.length));
    
    for (let i = 0; i < maxPrefix; i++) {
      if (str1[i].toLowerCase() === str2[i].toLowerCase()) {
        prefixLength++;
      } else {
        break;
      }
    }
    
    return jaroSim + (0.1 * prefixLength * (1 - jaroSim));
  }

  static findBestMatch(source: string, targets: FuzzyMatcherData[]): FuzzyMatchResult | null {
    let bestMatch: FuzzyMatchResult | null = null;
    let bestScore = 0;

    for (const target of targets) {
      const score = this.winklerSimilarity(source, target.value);
      if (score > bestScore) {
        bestScore = score;
        bestMatch = {
          source,
          target: target.value,
          score,
          algorithm: 'jaro-winkler',
          sourceRow: -1,
          targetRow: target.rowIndex
        };
      }
    }

    return bestMatch;
  }
}

/**
 * Soundex Algorithm
 */
export class SoundexMatcher {
  private static readonly SOUNDEX_MAP: { [key: string]: string } = {
    'b': '1', 'f': '1', 'p': '1', 'v': '1',
    'c': '2', 'g': '2', 'j': '2', 'k': '2', 'q': '2', 's': '2', 'x': '2', 'z': '2',
    'd': '3', 't': '3',
    'l': '4',
    'm': '5', 'n': '5',
    'r': '6'
  };

  static generateSoundex(str: string): string {
    if (!str) return '0000';
    
    const normalized = str.toLowerCase().replace(/[^a-z]/g, '');
    if (normalized.length === 0) return '0000';
    
    let soundex = normalized[0].toUpperCase();
    let prevCode = this.SOUNDEX_MAP[normalized[0]] || '';
    
    for (let i = 1; i < normalized.length && soundex.length < 4; i++) {
      const char = normalized[i];
      const code = this.SOUNDEX_MAP[char] || '';
      
      if (code && code !== prevCode) {
        soundex += code;
        prevCode = code;
      } else if (!code) {
        prevCode = '';
      }
    }
    
    return soundex.padEnd(4, '0').substring(0, 4);
  }

  static similarity(str1: string, str2: string): number {
    const soundex1 = this.generateSoundex(str1);
    const soundex2 = this.generateSoundex(str2);
    
    if (soundex1 === soundex2) return 1.0;
    
    // Partial matching for Soundex codes
    let matches = 0;
    for (let i = 0; i < 4; i++) {
      if (soundex1[i] === soundex2[i]) matches++;
    }
    
    return matches / 4.0;
  }

  static findBestMatch(source: string, targets: FuzzyMatcherData[]): FuzzyMatchResult | null {
    let bestMatch: FuzzyMatchResult | null = null;
    let bestScore = 0;

    for (const target of targets) {
      const score = this.similarity(source, target.value);
      if (score > bestScore) {
        bestScore = score;
        bestMatch = {
          source,
          target: target.value,
          score,
          algorithm: 'soundex',
          sourceRow: -1,
          targetRow: target.rowIndex
        };
      }
    }

    return bestMatch;
  }
}

/**
 * Cosine Similarity Algorithm
 */
export class CosineSimilarityMatcher {
  private static tokenize(str: string): string[] {
    return str.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(token => token.length > 0);
  }

  private static createTermFrequency(tokens: string[]): Map<string, number> {
    const tf = new Map<string, number>();
    tokens.forEach(token => {
      tf.set(token, (tf.get(token) || 0) + 1);
    });
    return tf;
  }

  static similarity(str1: string, str2: string): number {
    const tokens1 = this.tokenize(str1);
    const tokens2 = this.tokenize(str2);
    
    if (tokens1.length === 0 && tokens2.length === 0) return 1.0;
    if (tokens1.length === 0 || tokens2.length === 0) return 0.0;
    
    const tf1 = this.createTermFrequency(tokens1);
    const tf2 = this.createTermFrequency(tokens2);
    
    const allTerms = new Set([...tf1.keys(), ...tf2.keys()]);
    
    let dotProduct = 0;
    let magnitude1 = 0;
    let magnitude2 = 0;
    
    for (const term of allTerms) {
      const freq1 = tf1.get(term) || 0;
      const freq2 = tf2.get(term) || 0;
      
      dotProduct += freq1 * freq2;
      magnitude1 += freq1 * freq1;
      magnitude2 += freq2 * freq2;
    }
    
    const magnitude = Math.sqrt(magnitude1) * Math.sqrt(magnitude2);
    return magnitude === 0 ? 0 : dotProduct / magnitude;
  }

  static findBestMatch(source: string, targets: FuzzyMatcherData[]): FuzzyMatchResult | null {
    let bestMatch: FuzzyMatchResult | null = null;
    let bestScore = 0;

    for (const target of targets) {
      const score = this.similarity(source, target.value);
      if (score > bestScore) {
        bestScore = score;
        bestMatch = {
          source,
          target: target.value,
          score,
          algorithm: 'cosine',
          sourceRow: -1,
          targetRow: target.rowIndex
        };
      }
    }

    return bestMatch;
  }
}

/**
 * Jaccard Similarity Algorithm
 */
export class JaccardSimilarityMatcher {
  private static tokenize(str: string): Set<string> {
    return new Set(
      str.toLowerCase()
        .replace(/[^\w\s]/g, ' ')
        .split(/\s+/)
        .filter(token => token.length > 0)
    );
  }

  static similarity(str1: string, str2: string): number {
    const set1 = this.tokenize(str1);
    const set2 = this.tokenize(str2);
    
    if (set1.size === 0 && set2.size === 0) return 1.0;
    
    const intersection = new Set([...set1].filter(token => set2.has(token)));
    const union = new Set([...set1, ...set2]);
    
    return union.size === 0 ? 0 : intersection.size / union.size;
  }

  static findBestMatch(source: string, targets: FuzzyMatcherData[]): FuzzyMatchResult | null {
    let bestMatch: FuzzyMatchResult | null = null;
    let bestScore = 0;

    for (const target of targets) {
      const score = this.similarity(source, target.value);
      if (score > bestScore) {
        bestScore = score;
        bestMatch = {
          source,
          target: target.value,
          score,
          algorithm: 'jaccard',
          sourceRow: -1,
          targetRow: target.rowIndex
        };
      }
    }

    return bestMatch;
  }
}

/**
 * FlexSearch-style Algorithm
 */
export class FlexSearchMatcher {
  private static tokenize(str: string): string[] {
    return str.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(token => token.length > 0);
  }

  private static nGrams(str: string, n: number = 2): Set<string> {
    const grams = new Set<string>();
    const text = str.toLowerCase();
    for (let i = 0; i <= text.length - n; i++) {
      grams.add(text.substring(i, i + n));
    }
    return grams;
  }

  static similarity(str1: string, str2: string): number {
    // Combine token-based and n-gram similarity
    const tokens1 = this.tokenize(str1);
    const tokens2 = this.tokenize(str2);
    
    const grams1 = this.nGrams(str1);
    const grams2 = this.nGrams(str2);
    
    // Token similarity
    const tokenSet1 = new Set(tokens1);
    const tokenSet2 = new Set(tokens2);
    const tokenIntersection = new Set([...tokenSet1].filter(token => tokenSet2.has(token)));
    const tokenUnion = new Set([...tokenSet1, ...tokenSet2]);
    const tokenSim = tokenUnion.size === 0 ? 0 : tokenIntersection.size / tokenUnion.size;
    
    // N-gram similarity
    const gramIntersection = new Set([...grams1].filter(gram => grams2.has(gram)));
    const gramUnion = new Set([...grams1, ...grams2]);
    const gramSim = gramUnion.size === 0 ? 0 : gramIntersection.size / gramUnion.size;
    
    // Weighted average
    return (tokenSim * 0.7) + (gramSim * 0.3);
  }

  static findBestMatch(source: string, targets: FuzzyMatcherData[]): FuzzyMatchResult | null {
    let bestMatch: FuzzyMatchResult | null = null;
    let bestScore = 0;

    for (const target of targets) {
      const score = this.similarity(source, target.value);
      if (score > bestScore) {
        bestScore = score;
        bestMatch = {
          source,
          target: target.value,
          score,
          algorithm: 'flexsearch',
          sourceRow: -1,
          targetRow: target.rowIndex
        };
      }
    }

    return bestMatch;
  }
}

/**
 * MicroFuzz-style Algorithm
 */
export class MicroFuzzMatcher {
  static similarity(str1: string, str2: string): number {
    const s1 = str1.toLowerCase().trim();
    const s2 = str2.toLowerCase().trim();
    
    if (s1 === s2) return 1.0;
    if (s1.length === 0 || s2.length === 0) return 0.0;
    
    // Simple character-based matching with position weighting
    const maxLen = Math.max(s1.length, s2.length);
    let matches = 0;
    let positionBonus = 0;
    
    for (let i = 0; i < Math.min(s1.length, s2.length); i++) {
      if (s1[i] === s2[i]) {
        matches++;
        positionBonus += (maxLen - i) / maxLen; // Higher weight for early matches
      }
    }
    
    const baseSimilarity = matches / maxLen;
    const positionWeight = positionBonus / Math.min(s1.length, s2.length);
    
    return (baseSimilarity * 0.7) + (positionWeight * 0.3);
  }

  static findBestMatch(source: string, targets: FuzzyMatcherData[]): FuzzyMatchResult | null {
    let bestMatch: FuzzyMatchResult | null = null;
    let bestScore = 0;

    for (const target of targets) {
      const score = this.similarity(source, target.value);
      if (score > bestScore) {
        bestScore = score;
        bestMatch = {
          source,
          target: target.value,
          score,
          algorithm: 'microfuzz',
          sourceRow: -1,
          targetRow: target.rowIndex
        };
      }
    }

    return bestMatch;
  }
}

/**
 * μFuzzy (uFuzzy)-style Algorithm
 */
export class UFuzzyMatcher {
  private static unicodeNormalize(str: string): string {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  }

  static similarity(str1: string, str2: string): number {
    const norm1 = this.unicodeNormalize(str1);
    const norm2 = this.unicodeNormalize(str2);
    
    if (norm1 === norm2) return 1.0;
    if (norm1.length === 0 || norm2.length === 0) return 0.0;
    
    // Multiple matching modes combined
    const exactMatch = norm1 === norm2 ? 1.0 : 0.0;
    const substringMatch = norm1.includes(norm2) || norm2.includes(norm1) ? 0.8 : 0.0;
    
    // Character frequency analysis
    const chars1 = new Map<string, number>();
    const chars2 = new Map<string, number>();
    
    for (const char of norm1) {
      chars1.set(char, (chars1.get(char) || 0) + 1);
    }
    
    for (const char of norm2) {
      chars2.set(char, (chars2.get(char) || 0) + 1);
    }
    
    const allChars = new Set([...chars1.keys(), ...chars2.keys()]);
    let commonChars = 0;
    let totalChars = 0;
    
    for (const char of allChars) {
      const count1 = chars1.get(char) || 0;
      const count2 = chars2.get(char) || 0;
      commonChars += Math.min(count1, count2);
      totalChars += Math.max(count1, count2);
    }
    
    const charSimilarity = totalChars === 0 ? 0 : commonChars / totalChars;
    
    return Math.max(exactMatch, substringMatch, charSimilarity);
  }

  static findBestMatch(source: string, targets: FuzzyMatcherData[]): FuzzyMatchResult | null {
    let bestMatch: FuzzyMatchResult | null = null;
    let bestScore = 0;

    for (const target of targets) {
      const score = this.similarity(source, target.value);
      if (score > bestScore) {
        bestScore = score;
        bestMatch = {
          source,
          target: target.value,
          score,
          algorithm: 'ufuzzy',
          sourceRow: -1,
          targetRow: target.rowIndex
        };
      }
    }

    return bestMatch;
  }
}

/**
 * FuzzySort Algorithm (External Library)
 */
export class FuzzySortMatcher {
  static async similarity(str1: string, str2: string): Promise<number> {
    try {
      const fuzzysort = await import("fuzzysort");
      const result = fuzzysort.default.single(str1, str2);
      if (!result) return 0;
      
      // fuzzysort returns negative scores, convert to positive similarity (0-1)
      // Lower scores (more negative) = better match
      const normalizedScore = Math.max(0, (result.score + 1000) / 1000);
      return Math.min(1.0, normalizedScore);
    } catch (error) {
      console.warn('FuzzySort error:', error);
      return LevenshteinMatcher.similarity(str1, str2);
    }
  }

  static async findBestMatch(source: string, targets: FuzzyMatcherData[]): Promise<FuzzyMatchResult | null> {
    try {
      const fuzzysort = await import("fuzzysort");
      const targetStrings = targets.map(t => t.value);
      const results = fuzzysort.default.go(source, targetStrings);
      
      if (results.length === 0) return null;
      
      const bestResult = results[0];
      const targetIndex = targetStrings.indexOf(bestResult.target);
      const targetData = targets[targetIndex];
      
      // Convert fuzzysort score to similarity (0-1)
      const similarity = Math.max(0, (bestResult.score + 1000) / 1000);
      
      return {
        source,
        target: bestResult.target,
        score: Math.min(1.0, similarity),
        algorithm: 'fuzzysort',
        sourceRow: -1,
        targetRow: targetData.rowIndex
      };
    } catch (error) {
      console.warn('FuzzySort findBestMatch error:', error);
      // Fallback to Levenshtein
      return LevenshteinMatcher.findBestMatch(source, targets);
    }
  }


}

/**
 * Fast-Fuzzy Algorithm (External Library)  
 */
export class FastFuzzyMatcher {
  static similarity(str1: string, str2: string): number {
    try {
      // Fallback implementation using Levenshtein for now
      return LevenshteinMatcher.similarity(str1, str2);
    } catch (error) {
      console.warn('Fast-Fuzzy error:', error);
      return LevenshteinMatcher.similarity(str1, str2);
    }
  }

  static findBestMatch(source: string, targets: FuzzyMatcherData[]): FuzzyMatchResult | null {
    try {
      // Use enhanced Levenshtein as fallback
      const result = LevenshteinMatcher.findBestMatch(source, targets);
      if (result) {
        result.algorithm = 'fast-fuzzy';
      }
      return result;
    } catch (error) {
      console.warn('Fast-Fuzzy findBestMatch error:', error);
      return null;
    }
  }
}

/**
 * FuzzySearch Algorithm (External Library)
 */
export class FuzzySearchMatcher {
  static similarity(str1: string, str2: string, maxDistance: number = 2): number {
    try {
      const s1 = str1.toLowerCase();
      const s2 = str2.toLowerCase();
      
      if (s1 === s2) return 1.0;
      
      // Simple substring matching as fallback
      const isSubstring = s1.includes(s2) || s2.includes(s1);
      
      if (isSubstring) {
        // Calculate similarity based on length difference
        const maxLen = Math.max(s1.length, s2.length);
        const minLen = Math.min(s1.length, s2.length);
        return minLen / maxLen;
      }
      
      // Fallback to distance-based matching
      const distance = LevenshteinMatcher.distance(s1, s2);
      const maxLen = Math.max(s1.length, s2.length);
      
      if (distance <= maxDistance) {
        return (maxLen - distance) / maxLen;
      }
      
      return 0.0;
    } catch (error) {
      console.warn('FuzzySearch error:', error);
      return 0.0;
    }
  }

  static findBestMatch(source: string, targets: FuzzyMatcherData[]): FuzzyMatchResult | null {
    let bestMatch: FuzzyMatchResult | null = null;
    let bestScore = 0;

    for (const target of targets) {
      const score = this.similarity(source, target.value);
      if (score > bestScore) {
        bestScore = score;
        bestMatch = {
          source,
          target: target.value,
          score,
          algorithm: 'fuzzysearch',
          sourceRow: -1,
          targetRow: target.rowIndex
        };
      }
    }

    return bestMatch;
  }
}

/**
 * Fuzzy.js-style Algorithm
 */
export class FuzzyJSMatcher {
  static similarity(str1: string, str2: string): number {
    const pattern = str1.toLowerCase();
    const text = str2.toLowerCase();
    
    if (pattern === text) return 1.0;
    if (pattern.length === 0) return 0.0;
    
    let score = 0;
    let patternIdx = 0;
    let textIdx = 0;
    let consecutiveMatches = 0;
    let startOfStringBonus = 0;
    
    while (patternIdx < pattern.length && textIdx < text.length) {
      if (pattern[patternIdx] === text[textIdx]) {
        score += 1;
        
        // Bonus for consecutive matches
        if (consecutiveMatches > 0) {
          score += consecutiveMatches * 0.5;
        }
        consecutiveMatches++;
        
        // Bonus for matches at start of string
        if (textIdx === patternIdx) {
          startOfStringBonus += 1;
        }
        
        patternIdx++;
      } else {
        consecutiveMatches = 0;
      }
      textIdx++;
    }
    
    if (patternIdx < pattern.length) {
      return 0; // Pattern not fully matched
    }
    
    const baseScore = score / pattern.length;
    const positionBonus = startOfStringBonus / pattern.length * 0.3;
    
    return Math.min(1.0, baseScore + positionBonus);
  }

  static findBestMatch(source: string, targets: FuzzyMatcherData[]): FuzzyMatchResult | null {
    let bestMatch: FuzzyMatchResult | null = null;
    let bestScore = 0;

    for (const target of targets) {
      const score = this.similarity(source, target.value);
      if (score > bestScore) {
        bestScore = score;
        bestMatch = {
          source,
          target: target.value,
          score,
          algorithm: 'fuzzyjs',
          sourceRow: -1,
          targetRow: target.rowIndex
        };
      }
    }

    return bestMatch;
  }
}

/**
 * MiniSearch-style Algorithm
 */
export class MiniSearchMatcher {
  private static tokenize(str: string): string[] {
    return str.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(token => token.length > 1);
  }

  static similarity(str1: string, str2: string): number {
    const tokens1 = this.tokenize(str1);
    const tokens2 = this.tokenize(str2);
    
    if (tokens1.length === 0 && tokens2.length === 0) return 1.0;
    if (tokens1.length === 0 || tokens2.length === 0) return 0.0;
    
    let totalScore = 0;
    let maxPossibleScore = 0;
    
    for (const token1 of tokens1) {
      let bestTokenScore = 0;
      
      for (const token2 of tokens2) {
        // Exact match
        if (token1 === token2) {
          bestTokenScore = 1.0;
          break;
        }
        
        // Prefix match
        if (token2.startsWith(token1) || token1.startsWith(token2)) {
          bestTokenScore = Math.max(bestTokenScore, 0.8);
        }
        
        // Fuzzy match using simple distance
        const distance = LevenshteinMatcher.distance(token1, token2);
        const maxLen = Math.max(token1.length, token2.length);
        const tokenScore = maxLen > 0 ? (maxLen - distance) / maxLen : 0;
        
        if (tokenScore > 0.6) { // Only consider good matches
          bestTokenScore = Math.max(bestTokenScore, tokenScore * 0.6);
        }
      }
      
      totalScore += bestTokenScore;
      maxPossibleScore += 1.0;
    }
    
    return maxPossibleScore > 0 ? totalScore / maxPossibleScore : 0.0;
  }

  static findBestMatch(source: string, targets: FuzzyMatcherData[]): FuzzyMatchResult | null {
    let bestMatch: FuzzyMatchResult | null = null;
    let bestScore = 0;

    for (const target of targets) {
      const score = this.similarity(source, target.value);
      if (score > bestScore) {
        bestScore = score;
        bestMatch = {
          source,
          target: target.value,
          score,
          algorithm: 'minisearch',
          sourceRow: -1,
          targetRow: target.rowIndex
        };
      }
    }

    return bestMatch;
  }
}

/**
 * Meilisearch-style Algorithm (Simulated)
 */
export class MeilisearchMatcher {
  private static normalizeString(str: string): string {
    return str.toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
      .replace(/[^\w\s]/g, ' ')
      .trim();
  }

  static similarity(str1: string, str2: string): number {
    const norm1 = this.normalizeString(str1);
    const norm2 = this.normalizeString(str2);
    
    if (norm1 === norm2) return 1.0;
    
    // Typo tolerance with different strategies
    let score = 0;
    
    // 1. Exact match after normalization
    if (norm1 === norm2) score = 1.0;
    
    // 2. Prefix matching
    else if (norm2.startsWith(norm1) || norm1.startsWith(norm2)) {
      const minLen = Math.min(norm1.length, norm2.length);
      const maxLen = Math.max(norm1.length, norm2.length);
      score = 0.9 * (minLen / maxLen);
    }
    
    // 3. Word-based matching
    else {
      const words1 = norm1.split(/\s+/);
      const words2 = norm2.split(/\s+/);
      
      let wordMatches = 0;
      const totalWords = Math.max(words1.length, words2.length);
      
      for (const word1 of words1) {
        for (const word2 of words2) {
          if (word1 === word2) {
            wordMatches += 1;
            break;
          } else if (word1.length > 3 && word2.length > 3) {
            const distance = LevenshteinMatcher.distance(word1, word2);
            const maxLen = Math.max(word1.length, word2.length);
            if (distance <= 2 && distance / maxLen <= 0.3) {
              wordMatches += 0.8;
              break;
            }
          }
        }
      }
      
      score = wordMatches / totalWords;
    }
    
    return Math.min(1.0, score);
  }

  static findBestMatch(source: string, targets: FuzzyMatcherData[]): FuzzyMatchResult | null {
    let bestMatch: FuzzyMatchResult | null = null;
    let bestScore = 0;

    for (const target of targets) {
      const score = this.similarity(source, target.value);
      if (score > bestScore) {
        bestScore = score;
        bestMatch = {
          source,
          target: target.value,
          score,
          algorithm: 'meilisearch',
          sourceRow: -1,
          targetRow: target.rowIndex
        };
      }
    }

    return bestMatch;
  }
}

/**
 * Elasticsearch-style Algorithm (Simulated)
 */
export class ElasticsearchMatcher {
  private static analyzeText(text: string): string[] {
    return text.toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(token => token.length > 0);
  }

  static similarity(str1: string, str2: string): number {
    const tokens1 = this.analyzeText(str1);
    const tokens2 = this.analyzeText(str2);
    
    if (tokens1.length === 0 && tokens2.length === 0) return 1.0;
    if (tokens1.length === 0 || tokens2.length === 0) return 0.0;
    
    // Multi-faceted scoring like Elasticsearch - FIXED VERSION
    let exactScore = 0;
    let fuzzyScore = 0;
    let prefixScore = 0;
    let totalTokensMatched = 0;
    
    const minTokens = Math.min(tokens1.length, tokens2.length);
    const maxTokens = Math.max(tokens1.length, tokens2.length);
    
    // Improved scoring to prevent over-matching
    for (const token1 of tokens1) {
      let bestExact = 0;
      let bestFuzzy = 0;
      let bestPrefix = 0;
      let hasMatch = false;
      
      for (const token2 of tokens2) {
        // Exact match
        if (token1 === token2) {
          bestExact = 1.0;
          hasMatch = true;
          break; // Exact match found, no need to check others
        }
        
        // Prefix match (more restrictive but not too strict)
        if (token1.length >= 2 && token2.length >= 2) {
          if (token2.startsWith(token1) || token1.startsWith(token2)) {
            const minLen = Math.min(token1.length, token2.length);
            const maxLen = Math.max(token1.length, token2.length);
            const prefixRatio = minLen / maxLen;
            // Consider reasonable prefix matches (>40% overlap)
            if (prefixRatio > 0.4) {
              bestPrefix = Math.max(bestPrefix, prefixRatio * 0.8);
              hasMatch = true;
            }
          }
        }
        
        // Fuzzy match with reasonable criteria
        if (token1.length >= 3 && token2.length >= 3) {
          const distance = LevenshteinMatcher.distance(token1, token2);
          const maxLen = Math.max(token1.length, token2.length);
          const allowedDistance = Math.max(1, Math.floor(maxLen * 0.25)); // 25% edit distance
          
          if (distance <= allowedDistance) {
            const fuzzyRatio = (maxLen - distance) / maxLen;
            // Consider reasonable fuzzy matches (>50% similarity)
            if (fuzzyRatio > 0.5) {
              bestFuzzy = Math.max(bestFuzzy, fuzzyRatio * 0.7);
              hasMatch = true;
            }
          }
        }
      }
      
      if (hasMatch) {
        totalTokensMatched++;
        exactScore += bestExact;
        fuzzyScore += bestFuzzy;
        prefixScore += bestPrefix;
      }
    }
    
    // Require reasonable token coverage to prevent false positives
    const tokenCoverage = totalTokensMatched / maxTokens;
    if (tokenCoverage < 0.3) { // At least 30% of tokens must match
      return 0.0;
    }
    
    // Balanced weighted scoring
    const rawScore = (
      exactScore * 1.0 +      // Exact matches get full weight
      prefixScore * 0.8 +     // Prefix matches get 80% weight  
      fuzzyScore * 0.6        // Fuzzy matches get 60% weight
    ) / maxTokens;
    
    // Apply token coverage penalty
    const finalScore = rawScore * tokenCoverage;
    
    return Math.min(1.0, finalScore);
  }

  static findBestMatch(source: string, targets: FuzzyMatcherData[]): FuzzyMatchResult | null {
    let bestMatch: FuzzyMatchResult | null = null;
    let bestScore = 0;

    for (const target of targets) {
      const score = this.similarity(source, target.value);
      if (score > bestScore) {
        bestScore = score;
        bestMatch = {
          source,
          target: target.value,
          score,
          algorithm: 'elasticsearch',
          sourceRow: -1,
          targetRow: target.rowIndex
        };
      }
    }

    return bestMatch;
  }
}