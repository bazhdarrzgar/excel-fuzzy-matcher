import { signal } from "@preact/signals";
import { FuzzyAlgorithmType, FUZZY_ALGORITHMS } from "../utils/fuzzyAlgorithms.ts";

interface AlgorithmSelectorProps {
  selectedAlgorithm: FuzzyAlgorithmType;
  onAlgorithmChange: (algorithm: FuzzyAlgorithmType) => void;
  disabled?: boolean;
}

const showAdvanced = signal<boolean>(false);
const selectedCategory = signal<string>('all');

export default function AlgorithmSelector({ selectedAlgorithm, onAlgorithmChange, disabled = false }: AlgorithmSelectorProps) {
  // Filter algorithms by category
  const filteredAlgorithms = selectedCategory.value === 'all' 
    ? FUZZY_ALGORITHMS
    : FUZZY_ALGORITHMS.filter(alg => alg.category === selectedCategory.value);

  // Group algorithms by category for better organization
  const categories = [
    { id: 'all', name: 'All Algorithms', icon: '🌟' },
    { id: 'basic', name: 'Basic Algorithms', icon: '🔧' },
    { id: 'advanced', name: 'Advanced Libraries', icon: '🚀' },
    { id: 'search-engine', name: 'Search Engines', icon: '🔍' }
  ];

  return (
    <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 rounded-2xl p-8 border border-slate-200/60 dark:border-gray-700/60 shadow-2xl dark:shadow-black/40 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-purple-800 to-indigo-900 dark:from-white dark:via-purple-200 dark:to-cyan-200 bg-clip-text text-transparent flex items-center space-x-3">
            <span className="text-3xl">🧠</span>
            <span>Choose Fuzzy Matching Algorithm</span>
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 font-medium">
            {FUZZY_ALGORITHMS.length} powerful algorithms available • Select the best one for your data
          </p>
        </div>
        <button
          onClick={() => showAdvanced.value = !showAdvanced.value}
          className="text-sm text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-cyan-300 font-semibold px-4 py-2.5 rounded-xl hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-all duration-300 border border-purple-200 dark:border-purple-800/50 hover:border-purple-300 dark:hover:border-cyan-500/50 hover:shadow-lg dark:hover:shadow-cyan-900/20"
          disabled={disabled}
        >
          {showAdvanced.value ? '🔽 Hide Details' : '🔍 Show Details'}
        </button>
      </div>

      {/* ENHANCED DROPDOWN - Algorithm Selection */}
      <div className="mb-10">
        <label className="block text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center space-x-3">
          <span className="text-2xl">🔍</span>
          <span>Select Algorithm</span>
        </label>
        <div className="relative">
          <select
            value={selectedAlgorithm}
            onChange={(e) => onAlgorithmChange((e.target as HTMLSelectElement).value as FuzzyAlgorithmType)}
            disabled={disabled}
            className="w-full px-6 py-4 text-lg font-semibold bg-white/90 dark:bg-gray-800/90 border-2 border-gray-300/70 dark:border-purple-500/50 rounded-xl focus:ring-2 focus:ring-purple-500 dark:focus:ring-cyan-500 focus:border-purple-500 dark:focus:border-cyan-500 text-gray-900 dark:text-white shadow-lg dark:shadow-2xl backdrop-blur-sm transition-all duration-300 hover:shadow-xl dark:hover:shadow-cyan-900/30 dark:hover:border-cyan-400/70 appearance-none cursor-pointer"
          >
            {FUZZY_ALGORITHMS.map((algorithm) => (
              <option key={algorithm.id} value={algorithm.id} className="py-3 text-base font-medium bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                {algorithm.name} - {algorithm.description}
              </option>
            ))}
          </select>
          {/* Custom dropdown arrow */}
          <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
            <svg className="w-6 h-6 text-purple-500 dark:text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="mb-8">
        <div className="flex flex-wrap gap-3">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => selectedCategory.value = category.id}
              className={`
                px-5 py-3 rounded-xl text-sm font-semibold transition-all duration-300 border-2
                ${selectedCategory.value === category.id
                  ? 'bg-gradient-to-r from-purple-600 to-cyan-600 dark:from-purple-500 dark:to-cyan-400 text-white shadow-xl dark:shadow-cyan-900/30 border-purple-500 dark:border-cyan-400 transform scale-105'
                  : 'bg-white/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-gray-700/90 border-gray-200 dark:border-gray-600 hover:border-purple-300 dark:hover:border-cyan-500 hover:shadow-lg dark:hover:shadow-gray-900/50 backdrop-blur-sm'
                }
              `}
              disabled={disabled}
            >
              <span className="mr-2 text-lg">{category.icon}</span>
              {category.name}
            </button>
          ))}
        </div>
      </div>
      
      <p className="text-gray-600 dark:text-gray-300 mb-8 text-sm font-medium">
        Currently showing: <strong className="text-purple-600 dark:text-cyan-400">{filteredAlgorithms.length}</strong> algorithms • 
        Different algorithms excel at different types of matching
      </p>

      {/* Algorithm Cards - Simplified for better UX */}
      {showAdvanced.value && (
        <div className="grid gap-6 mb-10">
          {filteredAlgorithms.map((algorithm) => (
            <div key={algorithm.id} className={`
              relative group p-6 rounded-2xl border-2 transition-all duration-500 backdrop-blur-sm
              ${selectedAlgorithm === algorithm.id 
                ? 'border-purple-500 dark:border-cyan-400 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/30 dark:to-cyan-900/20 shadow-2xl dark:shadow-cyan-900/20 transform scale-[1.02]' 
                : 'border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-cyan-500 bg-white/90 dark:bg-gray-800/90 hover:shadow-xl dark:hover:shadow-gray-900/50 hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50 dark:hover:from-gray-700/95 dark:hover:to-gray-600/95'
              }
            `}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <h4 className={`font-bold text-xl ${
                    selectedAlgorithm === algorithm.id 
                      ? 'text-purple-700 dark:text-cyan-300' 
                      : 'text-gray-900 dark:text-white'
                  }`}>
                    {algorithm.name}
                  </h4>
                  
                  {/* Performance Badge */}
                  <span className={`
                    inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold border-2
                    ${algorithm.performance === 'fast' ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300 border-green-200 dark:border-green-700/50' :
                      algorithm.performance === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300 border-yellow-200 dark:border-yellow-700/50' :
                      'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300 border-red-200 dark:border-red-700/50'}
                  `}>
                    {algorithm.performance === 'fast' ? '⚡' : algorithm.performance === 'medium' ? '⏱️' : '🐌'} {algorithm.performance}
                  </span>
                  
                  {/* Category Badge */}
                  <span className={`
                    inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold border-2
                    ${algorithm.category === 'basic' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 border-blue-200 dark:border-blue-700/50' :
                      algorithm.category === 'advanced' ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300 border-indigo-200 dark:border-indigo-700/50' :
                      'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300 border-orange-200 dark:border-orange-700/50'}
                  `}>
                    {algorithm.category === 'basic' ? '🔧' : algorithm.category === 'advanced' ? '🚀' : '🔍'} {algorithm.category}
                  </span>
                </div>
                
                {selectedAlgorithm === algorithm.id && (
                  <span className="inline-flex items-center px-4 py-2 rounded-full text-xs font-bold bg-gradient-to-r from-purple-100 to-cyan-100 text-purple-800 dark:from-purple-900/50 dark:to-cyan-900/50 dark:text-cyan-300 border-2 border-purple-200 dark:border-cyan-700/50 animate-pulse shadow-lg">
                    ✅ SELECTED
                  </span>
                )}
              </div>
              
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 leading-relaxed font-medium">
                {algorithm.description}
              </p>
              
              <div className="flex flex-wrap gap-3 mb-4">
                <span className="inline-flex items-center px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 dark:from-blue-900/30 dark:to-indigo-900/20 dark:text-blue-300 border-2 border-blue-200 dark:border-blue-700/50 shadow-sm">
                  🎯 Best for: {algorithm.bestFor}
                </span>
                <span className="inline-flex items-center px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 dark:from-green-900/30 dark:to-emerald-900/20 dark:text-green-300 border-2 border-green-200 dark:border-green-700/50 shadow-sm">
                  💪 {algorithm.strength}
                </span>
              </div>
              
              <div className="mt-5 p-4 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-700/50 dark:to-gray-600/30 rounded-xl border-2 border-gray-200 dark:border-gray-600/50 shadow-inner">
                <div className="text-xs text-gray-600 dark:text-gray-400 space-y-2 font-medium">
                  {algorithm.id === 'fuse' && (
                    <div>
                      <strong className="text-purple-600 dark:text-purple-400">🌟 Most Popular:</strong> Comprehensive fuzzy search with advanced configuration options. 
                      Great starting point for most use cases.
                    </div>
                  )}
                  
                  {algorithm.id === 'flexsearch' && (
                    <div>
                      <strong className="text-green-600 dark:text-green-400">🚀 Performance King:</strong> Ultra-fast indexing and searching. Perfect for large datasets 
                      and real-time applications.
                    </div>
                  )}
                  
                  {algorithm.id === 'jaro-winkler' && (
                    <div>
                      <strong className="text-blue-600 dark:text-blue-400">👤 Name Expert:</strong> "John Smith" ↔ "J. Smith", "Microsoft Corp" ↔ "Microsoft Corporation"
                    </div>
                  )}
                  
                  {algorithm.id === 'levenshtein' && (
                    <div>
                      <strong className="text-orange-600 dark:text-orange-400">✏️ Typo Master:</strong> Perfect for spelling corrections and character-level differences
                    </div>
                  )}
                  
                  {algorithm.id === 'soundex' && (
                    <div>
                      <strong className="text-pink-600 dark:text-pink-400">🔊 Sound Alike:</strong> "Smith" ↔ "Smyth", "Johnson" ↔ "Johnsen" - phonetic matching
                    </div>
                  )}
                  
                  {algorithm.id === 'cosine' && (
                    <div>
                      <strong className="text-indigo-600 dark:text-indigo-400">📄 Text Pro:</strong> Ideal for descriptions, long text, and document similarity analysis
                    </div>
                  )}
                  
                  {algorithm.id === 'jaccard' && (
                    <div>
                      <strong className="text-teal-600 dark:text-teal-400">🏷️ Tag Expert:</strong> Great for tags, categories, and keyword-based data matching
                    </div>
                  )}
                  
                  {algorithm.id === 'microfuzz' && (
                    <div>
                      <strong className="text-cyan-600 dark:text-cyan-400">⚡ Lightweight:</strong> Minimal overhead for simple fuzzy matching needs
                    </div>
                  )}
                  
                  {algorithm.id === 'ufuzzy' && (
                    <div>
                      <strong className="text-emerald-600 dark:text-emerald-400">🌍 Unicode Ready:</strong> Excellent for international text and multilingual data
                    </div>
                  )}
                  
                  {algorithm.id === 'fuzzysearch' && (
                    <div>
                      <strong className="text-amber-600 dark:text-amber-400">🎯 Simple & Fast:</strong> Straightforward approximate string matching with external library
                    </div>
                  )}
                  
                  {algorithm.id === 'fuzzysort' && (
                    <div>
                      <strong className="text-lime-600 dark:text-lime-400">⚡ SublimeText-like:</strong> Lightning-fast fuzzy search with built-in highlighting, perfect for autocomplete
                    </div>
                  )}
                  
                  {algorithm.id === 'fast-fuzzy' && (
                    <div>
                      <strong className="text-emerald-600 dark:text-emerald-400">🚀 Performance Beast:</strong> Extremely fast fuzzy matching optimized for large datasets
                    </div>
                  )}
                  
                  {algorithm.id === 'fuzzyjs' && (
                    <div>
                      <strong className="text-violet-600 dark:text-violet-400">🎨 UI Friendly:</strong> Built-in highlighting and detailed scoring for interfaces
                    </div>
                  )}
                  
                  {algorithm.id === 'minisearch' && (
                    <div>
                      <strong className="text-rose-600 dark:text-rose-400">📦 Full Featured:</strong> Complete search engine features in a compact package
                    </div>
                  )}
                  
                  {algorithm.id === 'meilisearch' && (
                    <div>
                      <strong className="text-lime-600 dark:text-lime-400">🛒 E-commerce Ready:</strong> Advanced typo tolerance and instant search experience
                    </div>
                  )}
                  
                  {algorithm.id === 'elasticsearch' && (
                    <div>
                      <strong className="text-sky-600 dark:text-sky-400">🏢 Enterprise Grade:</strong> Advanced query capabilities and analytics features
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quick Selection Buttons */}
      <div className="mt-10 border-t-2 border-gray-200 dark:border-gray-700 pt-8">
        <p className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-6">🚀 Quick Selection by Use Case:</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={() => onAlgorithmChange('fuse')}
            disabled={disabled}
            className="px-5 py-4 text-xs font-bold rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-700 hover:from-blue-200 hover:to-indigo-200 dark:from-blue-900/60 dark:to-indigo-900/50 dark:text-blue-200 dark:hover:from-blue-800/70 dark:hover:to-indigo-800/60 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105 border-2 border-blue-200 dark:border-blue-600/70 hover:border-blue-300 dark:hover:border-cyan-500/80 shadow-lg hover:shadow-xl dark:hover:shadow-cyan-900/30"
          >
            🎯 General<br/>Purpose
          </button>
          <button
            onClick={() => onAlgorithmChange('fuzzysort')}
            disabled={disabled}
            className="px-5 py-4 text-xs font-bold rounded-xl bg-gradient-to-br from-lime-100 to-green-100 text-lime-700 hover:from-lime-200 hover:to-green-200 dark:from-lime-900/60 dark:to-green-900/50 dark:text-lime-200 dark:hover:from-lime-800/70 dark:hover:to-green-800/60 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105 border-2 border-lime-200 dark:border-lime-600/70 hover:border-lime-300 dark:hover:border-cyan-500/80 shadow-lg hover:shadow-xl dark:hover:shadow-cyan-900/30"
          >
            ⚡ FuzzySort<br/>Lightning Fast
          </button>
          <button
            onClick={() => onAlgorithmChange('fast-fuzzy')}
            disabled={disabled}
            className="px-5 py-4 text-xs font-bold rounded-xl bg-gradient-to-br from-emerald-100 to-teal-100 text-emerald-700 hover:from-emerald-200 hover:to-teal-200 dark:from-emerald-900/60 dark:to-teal-900/50 dark:text-emerald-200 dark:hover:from-emerald-800/70 dark:hover:to-teal-800/60 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105 border-2 border-emerald-200 dark:border-emerald-600/70 hover:border-emerald-300 dark:hover:border-cyan-500/80 shadow-lg hover:shadow-xl dark:hover:shadow-cyan-900/30"
          >
            🚀 Fast-Fuzzy<br/>Performance
          </button>
          <button
            onClick={() => onAlgorithmChange('fuzzysearch')}
            disabled={disabled}
            className="px-5 py-4 text-xs font-bold rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 text-amber-700 hover:from-amber-200 hover:to-orange-200 dark:from-amber-900/60 dark:to-orange-900/50 dark:text-amber-200 dark:hover:from-amber-800/70 dark:hover:to-orange-800/60 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105 border-2 border-amber-200 dark:border-amber-600/70 hover:border-amber-300 dark:hover:border-cyan-500/80 shadow-lg hover:shadow-xl dark:hover:shadow-cyan-900/30"
          >
            🎯 FuzzySearch<br/>Simple & Fast
          </button>
          <button
            onClick={() => onAlgorithmChange('flexsearch')}
            disabled={disabled}
            className="px-5 py-4 text-xs font-bold rounded-xl bg-gradient-to-br from-green-100 to-emerald-100 text-green-700 hover:from-green-200 hover:to-emerald-200 dark:from-green-900/60 dark:to-emerald-900/50 dark:text-green-200 dark:hover:from-green-800/70 dark:hover:to-emerald-800/60 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105 border-2 border-green-200 dark:border-green-600/70 hover:border-green-300 dark:hover:border-cyan-500/80 shadow-lg hover:shadow-xl dark:hover:shadow-cyan-900/30"
          >
            ⚡ FlexSearch<br/>High Performance
          </button>
          <button
            onClick={() => onAlgorithmChange('jaro-winkler')}
            disabled={disabled}
            className="px-5 py-4 text-xs font-bold rounded-xl bg-gradient-to-br from-orange-100 to-amber-100 text-orange-700 hover:from-orange-200 hover:to-amber-200 dark:from-orange-900/60 dark:to-amber-900/50 dark:text-orange-200 dark:hover:from-orange-800/70 dark:hover:to-amber-800/60 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105 border-2 border-orange-200 dark:border-orange-600/70 hover:border-orange-300 dark:hover:border-cyan-500/80 shadow-lg hover:shadow-xl dark:hover:shadow-cyan-900/30"
          >
            👤 Names &<br/>IDs
          </button>
          <button
            onClick={() => onAlgorithmChange('levenshtein')}
            disabled={disabled}
            className="px-5 py-4 text-xs font-bold rounded-xl bg-gradient-to-br from-purple-100 to-violet-100 text-purple-700 hover:from-purple-200 hover:to-violet-200 dark:from-purple-900/60 dark:to-violet-900/50 dark:text-purple-200 dark:hover:from-purple-800/70 dark:hover:to-violet-800/60 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105 border-2 border-purple-200 dark:border-purple-600/70 hover:border-purple-300 dark:hover:border-cyan-500/80 shadow-lg hover:shadow-xl dark:hover:shadow-cyan-900/30"
          >
            ✏️ Typos &<br/>Spelling
          </button>
          <button
            onClick={() => onAlgorithmChange('soundex')}
            disabled={disabled}
            className="px-5 py-4 text-xs font-bold rounded-xl bg-gradient-to-br from-pink-100 to-rose-100 text-pink-700 hover:from-pink-200 hover:to-rose-200 dark:from-pink-900/60 dark:to-rose-900/50 dark:text-pink-200 dark:hover:from-pink-800/70 dark:hover:to-rose-800/60 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105 border-2 border-pink-200 dark:border-pink-600/70 hover:border-pink-300 dark:hover:border-cyan-500/80 shadow-lg hover:shadow-xl dark:hover:shadow-cyan-900/30"
          >
            🔊 Sounds<br/>Like
          </button>
          <button
            onClick={() => onAlgorithmChange('cosine')}
            disabled={disabled}
            className="px-5 py-4 text-xs font-bold rounded-xl bg-gradient-to-br from-indigo-100 to-blue-100 text-indigo-700 hover:from-indigo-200 hover:to-blue-200 dark:from-indigo-900/60 dark:to-blue-900/50 dark:text-indigo-200 dark:hover:from-indigo-800/70 dark:hover:to-blue-800/60 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105 border-2 border-indigo-200 dark:border-indigo-600/70 hover:border-indigo-300 dark:hover:border-cyan-500/80 shadow-lg hover:shadow-xl dark:hover:shadow-cyan-900/30"
          >
            📄 Text<br/>Content
          </button>
          <button
            onClick={() => onAlgorithmChange('meilisearch')}
            disabled={disabled}
            className="px-5 py-4 text-xs font-bold rounded-xl bg-gradient-to-br from-yellow-100 to-amber-100 text-yellow-700 hover:from-yellow-200 hover:to-amber-200 dark:from-yellow-900/60 dark:to-amber-900/50 dark:text-yellow-200 dark:hover:from-yellow-800/70 dark:hover:to-amber-800/60 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105 border-2 border-yellow-200 dark:border-yellow-600/70 hover:border-yellow-300 dark:hover:border-cyan-500/80 shadow-lg hover:shadow-xl dark:hover:shadow-cyan-900/30"
          >
            🛒 E-commerce<br/>Search
          </button>
          <button
            onClick={() => onAlgorithmChange('ufuzzy')}
            disabled={disabled}
            className="px-5 py-4 text-xs font-bold rounded-xl bg-gradient-to-br from-teal-100 to-cyan-100 text-teal-700 hover:from-teal-200 hover:to-cyan-200 dark:from-teal-900/60 dark:to-cyan-900/50 dark:text-teal-200 dark:hover:from-teal-800/70 dark:hover:to-cyan-800/60 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105 border-2 border-teal-200 dark:border-teal-600/70 hover:border-teal-300 dark:hover:border-cyan-500/80 shadow-lg hover:shadow-xl dark:hover:shadow-cyan-900/30"
          >
            🌍 Multi<br/>lingual
          </button>
        </div>
      </div>

      {/* Current Selection Summary */}
      <div className="mt-8 p-6 bg-gradient-to-r from-white to-blue-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl border-2 border-gray-200 dark:border-gray-600 shadow-xl dark:shadow-black/30 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Current Selection:</span>
              <span className="font-bold text-lg bg-gradient-to-r from-purple-600 to-cyan-600 dark:from-purple-400 dark:to-cyan-400 bg-clip-text text-transparent">
                {FUZZY_ALGORITHMS.find(alg => alg.id === selectedAlgorithm)?.name}
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
              {FUZZY_ALGORITHMS.find(alg => alg.id === selectedAlgorithm)?.strength}
            </p>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">Performance</div>
            <div className={`text-sm font-bold px-3 py-1.5 rounded-full border-2 ${
              FUZZY_ALGORITHMS.find(alg => alg.id === selectedAlgorithm)?.performance === 'fast' ? 'text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900/40 border-green-200 dark:border-green-700/50' :
              FUZZY_ALGORITHMS.find(alg => alg.id === selectedAlgorithm)?.performance === 'medium' ? 'text-yellow-700 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/40 border-yellow-200 dark:border-yellow-700/50' :
              'text-red-700 dark:text-red-400 bg-red-100 dark:bg-red-900/40 border-red-200 dark:border-red-700/50'
            }`}>
              {FUZZY_ALGORITHMS.find(alg => alg.id === selectedAlgorithm)?.performance?.toUpperCase()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}