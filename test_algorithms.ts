/**
 * Simple test script to verify all algorithms are working
 */

// Import the fuzzy matcher and algorithms
import { FuzzyMatcher } from "./utils/fuzzyMatcher.ts";
import { FUZZY_ALGORITHMS } from "./utils/fuzzyAlgorithms.ts";

// Test data
const sourceData = ["John Smith", "Microsoft Corp", "Apple Inc", "Sarah Johnson"];
const targetData = ["J. Smith", "Microsoft Corporation", "Apple Computer", "Sarah J"];

console.log("🧪 Testing Fuzzy Matching Algorithms");
console.log("=====================================");

console.log("\n📊 Available Algorithms:");
FUZZY_ALGORITHMS.forEach((alg, index) => {
  console.log(`${index + 1}. ${alg.name} (${alg.id}) - ${alg.performance} performance`);
});

// Test each algorithm
const algorithmsToTest = ['fuzzysearch', 'fuzzysort', 'fast-fuzzy', 'levenshtein', 'jaro-winkler'];

for (const algorithm of algorithmsToTest) {
  try {
    console.log(`\n🔍 Testing ${algorithm.toUpperCase()} algorithm:`);
    console.log("─".repeat(40));
    
    const results = FuzzyMatcher.processBulkMatching(sourceData, targetData, {
      algorithm: algorithm as any,
      threshold: 0.3,
      maxResults: 10
    });
    
    if (results.length > 0) {
      console.log(`✅ Success! Found ${results.length} matches:`);
      results.forEach((match, i) => {
        const score = Math.round(match.score * 100);
        console.log(`   ${i + 1}. "${match.source}" ↔ "${match.target}" (${score}%)`);
      });
    } else {
      console.log("❌ No matches found");
    }
    
  } catch (error) {
    console.log(`❌ Error testing ${algorithm}:`, error.message);
  }
}

console.log("\n🎉 Algorithm testing complete!");
console.log("=====================================");

// Get statistics about available algorithms
const stats = FuzzyMatcher.getMatchingStats([], 100);
console.log("\n📈 Available Algorithm Categories:");
const categories = ['basic', 'advanced', 'search-engine'];
categories.forEach(category => {
  const count = FUZZY_ALGORITHMS.filter(alg => alg.category === category).length;
  console.log(`   ${category.toUpperCase()}: ${count} algorithms`);
});

console.log(`\n🔥 Total algorithms available: ${FUZZY_ALGORITHMS.length}`);
console.log("Including the newly added: fuzzysearch, fuzzysort, fast-fuzzy");