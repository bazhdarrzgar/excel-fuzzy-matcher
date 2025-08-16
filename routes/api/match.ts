import { Handlers } from "$fresh/server.ts";
import { connectDB, getMatchResultsCollection } from "../../utils/mongodb.ts";
import { FuzzyMatcher } from "../../utils/fuzzyMatcher.ts";
import { FileProcessor } from "../../utils/fileProcessor.ts";
import { FuzzyAlgorithmType } from "../../utils/fuzzyAlgorithms.ts";

interface MatchRequest {
  file1Data: any[];
  file2Data: any[];
  file1Name: string;
  file2Name: string;
  column1: string;
  column2: string;
  additionalColumns1?: string[];
  additionalColumns2?: string[];
  threshold?: number;
  simpleMode?: boolean;
  algorithm?: FuzzyAlgorithmType;
}

export const handler: Handlers = {
  async POST(req) {
    try {
      // Connect to database
      await connectDB();
      const matchResultsCollection = getMatchResultsCollection();

      // Parse request body
      const requestData: MatchRequest = await req.json();
      
      const {
        file1Data,
        file2Data,
        file1Name,
        file2Name,
        column1,
        column2,
        additionalColumns1 = [],
        additionalColumns2 = [],
        threshold = 0.6,
        simpleMode = false,
        algorithm = 'fuse'
      } = requestData;

      // Validate required fields
      if (!file1Data || !file2Data || !column1 || !column2) {
        return new Response(JSON.stringify({
          success: false,
          error: "Missing required data: file1Data, file2Data, column1, column2"
        }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      // Extract column data
      const sourceData = file1Data.map(row => String(row[column1] || "").trim())
        .filter(value => value !== "");
      
      const targetData = file2Data.map(row => String(row[column2] || "").trim())
        .filter(value => value !== "");

      if (sourceData.length === 0 || targetData.length === 0) {
        return new Response(JSON.stringify({
          success: false,
          error: `No data found in specified columns. Source: ${sourceData.length} items, Target: ${targetData.length} items`
        }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      // Perform fuzzy matching with selected algorithm
      console.log(`🔍 Starting ${algorithm} fuzzy matching: ${sourceData.length} source items vs ${targetData.length} target items`);
      
      const matchingResult = FuzzyMatcher.processBulkMatching(sourceData, targetData, {
        threshold: algorithm === 'fuse' ? (1 - threshold) : threshold, // Fuse.js uses distance, others use similarity
        includeScore: true,
        simpleMode: simpleMode,
        algorithm: algorithm
      });

      const { matches, unmatchedSources, unmatchedTargets } = matchingResult;

      // Generate statistics (simplified for simple mode)
      const stats = simpleMode ? 
        { matchPercentage: 0, averageScore: 0 } :
        FuzzyMatcher.getMatchingStats(matches, sourceData.length);

      // Save results to database
      const matchResult = {
        fileName1: file1Name,
        fileName2: file2Name,
        column1,
        column2,
        algorithm: algorithm,
        threshold: threshold,
        matches: matches.map(match => ({
          source: match.source,
          target: match.target,
          score: Math.round(match.score * 100) / 100, // Round to 2 decimal places
          sourceRow: match.sourceRow,
          targetRow: match.targetRow,
          algorithm: match.algorithm || algorithm
        })),
        timestamp: new Date(),
        totalMatches: matches.length,
        simpleMode,
      };

      const result = await matchResultsCollection.insertOne(matchResult);

      // Generate Excel file with results (simple format if simpleMode)
      const excelBuffer = simpleMode ? 
        FileProcessor.generateSimpleResultsExcel(
          column1,
          column2,
          matches,
          file1Data,
          file2Data,
          additionalColumns1,
          additionalColumns2
        ) :
        FileProcessor.generateResultsExcel(
          file1Name,
          file2Name,
          column1,
          column2,
          matches,
          file1Data,
          file2Data,
          additionalColumns1,
          additionalColumns2
        );

      // Generate unmatched files
      let unmatchedFile1Buffer: Uint8Array | null = null;
      let unmatchedFile2Buffer: Uint8Array | null = null;

      if (unmatchedSources.length > 0) {
        unmatchedFile1Buffer = FileProcessor.generateUnmatchedFile1Excel(
          file1Name,
          column1,
          unmatchedSources,
          file1Data,
          additionalColumns1
        );
      }

      if (unmatchedTargets.length > 0) {
        unmatchedFile2Buffer = FileProcessor.generateUnmatchedFile2Excel(
          file2Name,
          column2,
          unmatchedTargets,
          file2Data,
          additionalColumns2
        );
      }

      // Convert excel buffers to base64 safely (avoid stack overflow)
      const base64Excel = btoa(Array.from(excelBuffer, byte => String.fromCharCode(byte)).join(''));

      let base64UnmatchedFile1: string | null = null;
      let base64UnmatchedFile2: string | null = null;

      if (unmatchedFile1Buffer) {
        base64UnmatchedFile1 = btoa(Array.from(unmatchedFile1Buffer, byte => String.fromCharCode(byte)).join(''));
      }

      if (unmatchedFile2Buffer) {
        base64UnmatchedFile2 = btoa(Array.from(unmatchedFile2Buffer, byte => String.fromCharCode(byte)).join(''));
      }

      // Prepare response
      const response = simpleMode ? {
        success: true,
        matchId: result.toString(),
        totalMatches: matches.length,
        totalProcessed: sourceData.length,
        algorithm: algorithm,
        matches: matches.slice(0, 20), // Show more matches for simple mode
        excelData: base64Excel,
        // Unmatched data info
        unmatchedCount: {
          file1: unmatchedSources.length,
          file2: unmatchedTargets.length
        },
        unmatchedFile1Data: base64UnmatchedFile1,
        unmatchedFile2Data: base64UnmatchedFile2,
      } : {
        success: true,
        matchId: result.toString(),
        totalMatches: matches.length,
        matchPercentage: Math.round(stats.matchPercentage * 100) / 100,
        averageScore: Math.round(stats.averageScore * 100),
        algorithm: algorithm,
        statistics: stats,
        matches: matches.slice(0, 100), // Return first 100 matches for preview
        downloadAvailable: true,
        excelData: base64Excel,
        // Unmatched data info
        unmatchedCount: {
          file1: unmatchedSources.length,
          file2: unmatchedTargets.length
        },
        unmatchedFile1Data: base64UnmatchedFile1,
        unmatchedFile2Data: base64UnmatchedFile2,
        fileNames: {
          file1: file1Name,
          file2: file2Name
        }
      };

      console.log(`✅ Matching completed: ${matches.length} matches found`);

      return new Response(JSON.stringify(response), {
        headers: { "Content-Type": "application/json" },
      });

    } catch (error) {
      console.error("Matching error:", error);
      
      return new Response(JSON.stringify({
        success: false,
        error: error.message || "Failed to perform fuzzy matching"
      }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  },
};