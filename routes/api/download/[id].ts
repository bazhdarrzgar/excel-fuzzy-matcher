import { Handlers } from "$fresh/server.ts";
import { connectDB, getMatchResultsCollection } from "../../../utils/mongodb.ts";
import { FileProcessor } from "../../../utils/fileProcessor.ts";

export const handler: Handlers = {
  async GET(_req, ctx) {
    try {
      // Connect to database
      await connectDB();
      const matchResultsCollection = getMatchResultsCollection();

      // Get match ID from URL params
      const matchId = ctx.params.id;

      if (!matchId) {
        return new Response("Match ID is required", { status: 400 });
      }

      // Find the match result
      const matchResult = await matchResultsCollection.findOne({ _id: matchId });

      if (!matchResult) {
        return new Response("Match result not found", { status: 404 });
      }

      // Note: In a production app, you would store the original file data
      // For this example, we'll generate a simplified Excel file with just the matches
      const matches = matchResult.matches;
      const resultsData = matches.map((match: any, index: number) => ({
        "Match #": index + 1,
        [`${matchResult.fileName1} - ${matchResult.column1}`]: match.source,
        [`${matchResult.fileName2} - ${matchResult.column2}`]: match.target,
        "Match Score": `${(match.score * 100).toFixed(2)}%`,
        "Source Row": match.sourceRow + 1,
        "Target Row": match.targetRow + 1,
      }));

      // Generate Excel buffer (simplified version)
      const workbook = {
        SheetNames: ["Fuzzy Match Results", "Statistics"],
        Sheets: {
          "Fuzzy Match Results": XLSX.utils.json_to_sheet(resultsData),
          "Statistics": XLSX.utils.json_to_sheet([{
            "Total Matches": matchResult.totalMatches,
            "File 1": matchResult.fileName1,
            "File 2": matchResult.fileName2,
            "Column 1": matchResult.column1,
            "Column 2": matchResult.column2,
            "Processed At": matchResult.timestamp,
          }])
        }
      };

      // For this example, we'll return a JSON response instead of actual Excel
      // In production, you would use XLSX.write() to generate the actual file
      const response = {
        success: true,
        filename: `fuzzy_match_results_${matchId}.xlsx`,
        totalMatches: matchResult.totalMatches,
        data: resultsData,
        statistics: matchResult.statistics,
      };

      return new Response(JSON.stringify(response), {
        headers: { 
          "Content-Type": "application/json",
          "Content-Disposition": `attachment; filename="fuzzy_match_results_${matchId}.json"`
        },
      });

    } catch (error) {
      console.error("Download error:", error);
      
      return new Response(JSON.stringify({
        success: false,
        error: error.message || "Failed to generate download"
      }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  },
};