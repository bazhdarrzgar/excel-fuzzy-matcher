import { Handlers } from "$fresh/server.ts";
import { connectDB, getUploadedFilesCollection } from "../../utils/mongodb.ts";
import { FileProcessor } from "../../utils/fileProcessor.ts";

export const handler: Handlers = {
  async POST(req) {
    try {
      // Connect to database
      await connectDB();
      const filesCollection = getUploadedFilesCollection();

      // Parse multipart form data
      const formData = await req.formData();
      const file = formData.get("file") as File;

      if (!file) {
        return new Response(JSON.stringify({ 
          success: false, 
          error: "No file provided" 
        }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      // Validate file type
      if (!FileProcessor.isValidFileType(file.name)) {
        return new Response(JSON.stringify({
          success: false,
          error: "Invalid file type. Please upload Excel (.xlsx, .xls) or CSV (.csv) files only."
        }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      // Process the file
      const processedData = await FileProcessor.processFile(file);

      // Save file metadata to database
      const fileDoc = {
        filename: crypto.randomUUID(),
        originalName: file.name,
        size: file.size,
        columns: processedData.columns,
        rowCount: processedData.rowCount,
        uploadedAt: new Date(),
      };

      const result = await filesCollection.insertOne(fileDoc);

      // Store processed data temporarily (in production, consider using Redis or file storage)
      // For now, we'll store it in memory or return it directly
      const response = {
        success: true,
        fileId: result.toString(),
        filename: fileDoc.originalName,
        columns: processedData.columns,
        rowCount: processedData.rowCount,
        size: FileProcessor.formatFileSize(file.size),
        // Include processed data for immediate use
        data: processedData.data,
      };

      return new Response(JSON.stringify(response), {
        headers: { "Content-Type": "application/json" },
      });

    } catch (error) {
      console.error("Upload error:", error);
      
      return new Response(JSON.stringify({
        success: false,
        error: error.message || "Failed to process file"
      }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  },
};