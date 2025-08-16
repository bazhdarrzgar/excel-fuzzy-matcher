/**
 * Enhanced Fuzzy Matcher with Extended Algorithm Support
 */

import { 
  FuzzyAlgorithmType, 
  FuzzyMatchResult, 
  FuzzyMatcherData,
  LevenshteinMatcher,
  JaroWinklerMatcher,
  SoundexMatcher,
  CosineSimilarityMatcher,
  JaccardSimilarityMatcher,
  FlexSearchMatcher,
  MicroFuzzMatcher,
  UFuzzyMatcher,
  FuzzySearchMatcher,
  FuzzySortMatcher,
  FastFuzzyMatcher,
  FuzzyJSMatcher,
  MiniSearchMatcher,
  MeilisearchMatcher,
  ElasticsearchMatcher
} from "./fuzzyAlgorithms.ts";

export interface FuzzyMatchOptions {
  threshold?: number;
  includeScore?: boolean;
  keys?: string[];
  simpleMode?: boolean;
  algorithm?: FuzzyAlgorithmType;
  maxResults?: number;
}

export interface MatchingStats {
  totalMatches: number;
  matchPercentage: number;
  averageScore: number;
  scoreDistribution: {
    excellent: number; // 90-100%
    good: number;      // 70-89%
    fair: number;      // 50-69%
    poor: number;      // <50%
  };
}

export class FuzzyMatcher {
  /**
   * Process bulk fuzzy matching with selected algorithm
   */
  static processBulkMatching(
    sourceData: string[],
    targetData: string[],
    options: FuzzyMatchOptions = {}
  ): {
    matches: FuzzyMatchResult[];
    unmatchedSources: Array<{value: string; rowIndex: number}>;
    unmatchedTargets: Array<{value: string; rowIndex: number}>;
  } {
    const {
      threshold = 0.6,
      algorithm = 'fuse',
      maxResults = 1000,
      simpleMode = false
    } = options;

    console.log(`🔍 Using ${algorithm} algorithm for fuzzy matching`);

    // Prepare target data with indices
    const targetMatcherData: FuzzyMatcherData[] = targetData.map((value, index) => ({
      value,
      rowIndex: index
    }));

    const results: FuzzyMatchResult[] = [];
    const usedTargetIndices = new Set<number>(); // Prevent duplicate target matches
    const matchedSourceIndices = new Set<number>(); // Track matched sources

    // Process each source item
    for (let i = 0; i < sourceData.length && results.length < maxResults; i++) {
      const sourceItem = sourceData[i];
      if (!sourceItem || sourceItem.trim() === '') continue;

      let bestMatch: FuzzyMatchResult | null = null;

      try {
        // Create a filtered target list excluding already used targets
        const availableTargets = targetMatcherData.filter(target => 
          !usedTargetIndices.has(target.rowIndex)
        );
        
        if (availableTargets.length === 0) {
          console.log(`⚠️ No more available targets for matching`);
          break; // No more targets available
        }

        // Route to appropriate algorithm
        switch (algorithm) {
          case 'fuse':
            // Use Fuse.js (existing implementation)
            bestMatch = this.fuseMatching(sourceItem, availableTargets, threshold);
            break;
            
          case 'levenshtein':
            bestMatch = LevenshteinMatcher.findBestMatch(sourceItem, availableTargets);
            break;
            
          case 'jaro-winkler':
            bestMatch = JaroWinklerMatcher.findBestMatch(sourceItem, availableTargets);
            break;
            
          case 'soundex':
            bestMatch = SoundexMatcher.findBestMatch(sourceItem, availableTargets);
            break;
            
          case 'cosine':
            bestMatch = CosineSimilarityMatcher.findBestMatch(sourceItem, availableTargets);
            break;
            
          case 'jaccard':
            bestMatch = JaccardSimilarityMatcher.findBestMatch(sourceItem, availableTargets);
            break;
            
          case 'flexsearch':
            bestMatch = FlexSearchMatcher.findBestMatch(sourceItem, availableTargets);
            break;
            
          case 'microfuzz':
            bestMatch = MicroFuzzMatcher.findBestMatch(sourceItem, availableTargets);
            break;
            
          case 'ufuzzy':
            bestMatch = UFuzzyMatcher.findBestMatch(sourceItem, availableTargets);
            break;
            
          case 'fuzzysearch':
            bestMatch = FuzzySearchMatcher.findBestMatch(sourceItem, availableTargets);
            break;
            
          case 'fuzzysort':
            bestMatch = FuzzySortMatcher.findBestMatch(sourceItem, availableTargets);
            break;
            
          case 'fast-fuzzy':
            bestMatch = FastFuzzyMatcher.findBestMatch(sourceItem, availableTargets);
            break;
            
          case 'fuzzyjs':
            bestMatch = FuzzyJSMatcher.findBestMatch(sourceItem, availableTargets);
            break;
            
          case 'minisearch':
            bestMatch = MiniSearchMatcher.findBestMatch(sourceItem, availableTargets);
            break;
            
          case 'meilisearch':
            bestMatch = MeilisearchMatcher.findBestMatch(sourceItem, availableTargets);
            break;
            
          case 'elasticsearch':
            bestMatch = ElasticsearchMatcher.findBestMatch(sourceItem, availableTargets);
            break;
            
          default:
            console.warn(`Unknown algorithm: ${algorithm}, falling back to Fuse.js`);
            bestMatch = this.fuseMatching(sourceItem, availableTargets, threshold);
        }

        // Apply threshold filter and add to results
        if (bestMatch && bestMatch.score >= threshold) {
          bestMatch.sourceRow = i;
          results.push(bestMatch);
          
          // Mark this target and source as used
          usedTargetIndices.add(bestMatch.targetRow);
          matchedSourceIndices.add(i);
          
          console.log(`✅ Match ${results.length}: "${sourceItem}" → "${bestMatch.target}" (${Math.round(bestMatch.score * 100)}%)`);
        } else {
          console.log(`❌ No match for "${sourceItem}" (threshold: ${Math.round(threshold * 100)}%)`);
        }

      } catch (error) {
        console.error(`Error processing item "${sourceItem}" with ${algorithm}:`, error);
        continue;
      }
    }

    // Collect unmatched items
    const unmatchedSources = sourceData
      .map((value, index) => ({ value, rowIndex: index }))
      .filter((item, index) => !matchedSourceIndices.has(index) && item.value.trim() !== '');

    const unmatchedTargets = targetData
      .map((value, index) => ({ value, rowIndex: index }))
      .filter((item, index) => !usedTargetIndices.has(index) && item.value.trim() !== '');

    console.log(`✅ ${algorithm} matching completed: ${results.length} matches found (${usedTargetIndices.size} unique targets)`);
    console.log(`📊 Unmatched items - Source: ${unmatchedSources.length}, Target: ${unmatchedTargets.length}`);
    
    return {
      matches: results,
      unmatchedSources,
      unmatchedTargets
    };
  }

  /**
   * Fuse.js matching implementation (fallback)
   */
  private static fuseMatching(
    source: string,
    targets: FuzzyMatcherData[],
    threshold: number
  ): FuzzyMatchResult | null {
    // Simple fallback implementation when Fuse.js is not available
    // This uses Levenshtein as a fallback
    return LevenshteinMatcher.findBestMatch(source, targets);
  }

  /**
   * Calculate comprehensive matching statistics
   */
  static getMatchingStats(matches: FuzzyMatchResult[], totalSources: number): MatchingStats {
    if (matches.length === 0) {
      return {
        totalMatches: 0,
        matchPercentage: 0,
        averageScore: 0,
        scoreDistribution: {
          excellent: 0,
          good: 0,
          fair: 0,
          poor: 0
        }
      };
    }

    const totalScore = matches.reduce((sum, match) => sum + match.score, 0);
    const averageScore = totalScore / matches.length;
    const matchPercentage = (matches.length / totalSources) * 100;

    // Score distribution analysis
    const distribution = {
      excellent: 0, // 90-100%
      good: 0,      // 70-89%
      fair: 0,      // 50-69%
      poor: 0       // <50%
    };

    matches.forEach(match => {
      const scorePercent = match.score * 100;
      if (scorePercent >= 90) distribution.excellent++;
      else if (scorePercent >= 70) distribution.good++;
      else if (scorePercent >= 50) distribution.fair++;
      else distribution.poor++;
    });

    return {
      totalMatches: matches.length,
      matchPercentage: Math.round(matchPercentage * 100) / 100,
      averageScore: Math.round(averageScore * 10000) / 100, // Convert to percentage with 2 decimals
      scoreDistribution: distribution
    };
  }

  /**
   * Simple fuzzy search for real-time applications
   */
  static simpleSearch(
    query: string,
    data: string[],
    algorithm: FuzzyAlgorithmType = 'fuse',
    limit: number = 10
  ): Array<{ value: string; score: number; index: number }> {
    if (!query || query.trim() === '') return [];

    const targetData: FuzzyMatcherData[] = data.map((value, index) => ({
      value,
      rowIndex: index
    }));

    const results: Array<{ value: string; score: number; index: number }> = [];

    // Get matcher based on algorithm
    let matcher: any;
    switch (algorithm) {
      case 'levenshtein': matcher = LevenshteinMatcher; break;
      case 'jaro-winkler': matcher = JaroWinklerMatcher; break;
      case 'soundex': matcher = SoundexMatcher; break;
      case 'cosine': matcher = CosineSimilarityMatcher; break;
      case 'jaccard': matcher = JaccardSimilarityMatcher; break;
      case 'flexsearch': matcher = FlexSearchMatcher; break;
      case 'microfuzz': matcher = MicroFuzzMatcher; break;
      case 'ufuzzy': matcher = UFuzzyMatcher; break;
      case 'fuzzysearch': matcher = FuzzySearchMatcher; break;
      case 'fuzzysort': matcher = FuzzySortMatcher; break;
      case 'fast-fuzzy': matcher = FastFuzzyMatcher; break;
      case 'fuzzyjs': matcher = FuzzyJSMatcher; break;
      case 'minisearch': matcher = MiniSearchMatcher; break;
      case 'meilisearch': matcher = MeilisearchMatcher; break;
      case 'elasticsearch': matcher = ElasticsearchMatcher; break;
      default: matcher = LevenshteinMatcher;
    }

    // Score all items
    for (const target of targetData) {
      const score = matcher.similarity(query, target.value);
      if (score > 0.1) { // Minimum threshold for inclusion
        results.push({
          value: target.value,
          score,
          index: target.rowIndex
        });
      }
    }

    // Sort by score and return top results
    return results
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  /**
   * Get algorithm performance characteristics
   */
  static getAlgorithmInfo(algorithm: FuzzyAlgorithmType): {
    name: string;
    description: string;
    performance: string;
    bestFor: string;
  } {
    const algorithmMap: Record<FuzzyAlgorithmType, any> = {
      'fuse': {
        name: 'Fuse.js',
        description: 'Comprehensive fuzzy search library',
        performance: 'medium',
        bestFor: 'General purpose fuzzy searching'
      },
      'levenshtein': {
        name: 'Levenshtein Distance',
        description: 'Edit distance-based matching',
        performance: 'fast',
        bestFor: 'Character-level differences and typos'
      },
      'jaro-winkler': {
        name: 'Jaro-Winkler',
        description: 'String similarity with prefix bias',
        performance: 'fast',
        bestFor: 'Names and short strings'
      },
      'soundex': {
        name: 'Soundex',
        description: 'Phonetic matching algorithm',
        performance: 'fast',
        bestFor: 'Names that sound similar'
      },
      'cosine': {
        name: 'Cosine Similarity',
        description: 'Vector-based text similarity',
        performance: 'medium',
        bestFor: 'Document and text content matching'
      },
      'jaccard': {
        name: 'Jaccard Similarity',
        description: 'Set intersection-based matching',
        performance: 'fast',
        bestFor: 'Tag and category matching'
      },
      'flexsearch': {
        name: 'FlexSearch',
        description: 'High-performance full-text search',
        performance: 'fast',
        bestFor: 'Large datasets and real-time search'
      },
      'microfuzz': {
        name: 'MicroFuzz',
        description: 'Lightweight fuzzy matching',
        performance: 'fast',
        bestFor: 'Simple, lightweight applications'
      },
      'ufuzzy': {
        name: 'μFuzzy',
        description: 'Unicode-aware fuzzy matching',
        performance: 'fast',
        bestFor: 'International and multilingual text'
      },
      'fuzzysearch': {
        name: 'FuzzySearch',
        description: 'Simple approximate string matching',
        performance: 'fast',
        bestFor: 'Basic fuzzy search needs'
      },
      'fuzzysort': {
        name: 'FuzzySort',
        description: 'Fast SublimeText-like fuzzy search with highlighting',
        performance: 'fast',
        bestFor: 'Real-time search and autocomplete'
      },
      'fast-fuzzy': {
        name: 'Fast-Fuzzy',
        description: 'Performance-optimized fuzzy string matching',
        performance: 'fast',
        bestFor: 'Performance-critical applications'
      },
      'fuzzyjs': {
        name: 'Fuzzy.js',
        description: 'JavaScript fuzzy matching with highlighting',
        performance: 'medium',
        bestFor: 'UI search with result highlighting'
      },
      'minisearch': {
        name: 'MiniSearch',
        description: 'Compact full-text search engine',
        performance: 'medium',
        bestFor: 'Client-side search applications'
      },
      'meilisearch': {
        name: 'Meilisearch',
        description: 'Search engine with typo tolerance',
        performance: 'medium',
        bestFor: 'E-commerce and content search'
      },
      'elasticsearch': {
        name: 'Elasticsearch',
        description: 'Enterprise search with advanced features',
        performance: 'slow',
        bestFor: 'Enterprise and analytics applications'
      }
    };

    return algorithmMap[algorithm] || algorithmMap['fuse'];
  }
}