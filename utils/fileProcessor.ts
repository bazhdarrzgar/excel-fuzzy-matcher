import * as XLSX from "xlsx";

export interface ProcessedFileData {
  filename: string;
  columns: string[];
  data: Record<string, any>[];
  rowCount: number;
}

export interface ColumnData {
  columnName: string;
  values: string[];
}

export class FileProcessor {
  /**
   * Process Excel or CSV file and extract data
   */
  static async processFile(file: File): Promise<ProcessedFileData> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: "array" });
      
      // Get the first worksheet
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      
      // Convert to JSON
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
        header: 1,
        defval: "",
        raw: false
      }) as any[][];
      
      if (jsonData.length === 0) {
        throw new Error("File appears to be empty");
      }

      // Extract headers (first row)
      const headers = jsonData[0] as string[];
      const dataRows = jsonData.slice(1);
      
      // Convert to array of objects
      const data = dataRows.map(row => {
        const rowObj: Record<string, any> = {};
        headers.forEach((header, index) => {
          rowObj[header] = row[index] || "";
        });
        return rowObj;
      });

      return {
        filename: file.name,
        columns: headers.filter(h => h && h.trim() !== ""),
        data,
        rowCount: data.length,
      };
    } catch (error) {
      console.error("Error processing file:", error);
      throw new Error(`Failed to process file: ${error.message}`);
    }
  }

  /**
   * Extract column data from processed file
   */
  static extractColumnData(
    fileData: ProcessedFileData, 
    columnName: string
  ): ColumnData {
    if (!fileData.columns.includes(columnName)) {
      throw new Error(`Column "${columnName}" not found in file. Available columns: ${fileData.columns.join(", ")}`);
    }

    const values = fileData.data.map(row => 
      String(row[columnName] || "").trim()
    ).filter(value => value !== "");

    return {
      columnName,
      values,
    };
  }

  /**
   * Generate SIMPLE Excel file with matching results (column1, column2, new_column format)
   */
  static generateSimpleResultsExcel(
    column1Name: string,
    column2Name: string,
    matches: Array<{
      source: string;
      target: string;
      score: number;
      sourceRow: number;
      targetRow: number;
    }>,
    originalData1: any[],
    originalData2: any[],
    additionalColumns1: string[] = [],
    additionalColumns2: string[] = []
  ): Uint8Array {
    // Simple format: column1, column2, new_column (matched result) + additional columns
    const resultsData = matches.map(match => {
      const baseData = {
        [column1Name]: match.source,
        [column2Name]: match.target,
        "match_score": (match.score * 100).toFixed(0) + "%",
      };

      // Add additional columns from file 1
      additionalColumns1.forEach(colName => {
        if (originalData1[match.sourceRow] && originalData1[match.sourceRow][colName] !== undefined) {
          baseData[`${colName} (File1)`] = originalData1[match.sourceRow][colName];
        }
      });

      // Add additional columns from file 2
      additionalColumns2.forEach(colName => {
        if (originalData2[match.targetRow] && originalData2[match.targetRow][colName] !== undefined) {
          baseData[`${colName} (File2)`] = originalData2[match.targetRow][colName];
        }
      });

      return baseData;
    });

    // Create a new workbook
    const workbook = XLSX.utils.book_new();
    
    // Add results sheet (simple format)
    const resultsSheet = XLSX.utils.json_to_sheet(resultsData);
    XLSX.utils.book_append_sheet(workbook, resultsSheet, "Matches");

    // Generate Excel buffer
    const excelBuffer = XLSX.write(workbook, { 
      type: "array", 
      bookType: "xlsx" 
    });

    return new Uint8Array(excelBuffer);
  }

  /**
   * Generate Excel file with matching results (original complex format)
   */
  static generateResultsExcel(
    file1Name: string,
    file2Name: string,
    column1Name: string,
    column2Name: string,
    matches: Array<{
      source: string;
      target: string;
      score: number;
      sourceRow: number;
      targetRow: number;
    }>,
    originalData1: any[],
    originalData2: any[],
    additionalColumns1: string[] = [],
    additionalColumns2: string[] = []
  ): Uint8Array {
    const resultsData = matches.map(match => {
      const baseData = {
        [`${file1Name} - ${column1Name}`]: match.source,
        [`${file2Name} - ${column2Name}`]: match.target,
        "Match Score": (match.score * 100).toFixed(2) + "%",
        "Source Row": match.sourceRow + 1,
        "Target Row": match.targetRow + 1,
      };

      // Add additional columns from file 1
      additionalColumns1.forEach(colName => {
        if (originalData1[match.sourceRow] && originalData1[match.sourceRow][colName] !== undefined) {
          baseData[`${file1Name} - ${colName}`] = originalData1[match.sourceRow][colName];
        }
      });

      // Add additional columns from file 2
      additionalColumns2.forEach(colName => {
        if (originalData2[match.targetRow] && originalData2[match.targetRow][colName] !== undefined) {
          baseData[`${file2Name} - ${colName}`] = originalData2[match.targetRow][colName];
        }
      });

      return baseData;
    });

    // Create a new workbook
    const workbook = XLSX.utils.book_new();
    
    // Add results sheet
    const resultsSheet = XLSX.utils.json_to_sheet(resultsData);
    XLSX.utils.book_append_sheet(workbook, resultsSheet, "Fuzzy Match Results");

    // Add statistics sheet
    const stats = this.generateStatistics(matches, originalData1.length);
    const statsSheet = XLSX.utils.json_to_sheet([stats]);
    XLSX.utils.book_append_sheet(workbook, statsSheet, "Statistics");

    // Generate Excel buffer
    const excelBuffer = XLSX.write(workbook, { 
      type: "array", 
      bookType: "xlsx" 
    });

    return new Uint8Array(excelBuffer);
  }

  /**
   * Generate statistics for the matching results
   */
  private static generateStatistics(matches: any[], totalSourceItems: number) {
    const matchedCount = matches.length;
    const averageScore = matches.length > 0 
      ? matches.reduce((sum: number, match: any) => sum + match.score, 0) / matches.length 
      : 0;
    
    const scoreDistribution = {
      excellent: matches.filter(m => m.score >= 0.9).length,
      good: matches.filter(m => m.score >= 0.7 && m.score < 0.9).length,
      fair: matches.filter(m => m.score >= 0.5 && m.score < 0.7).length,
      poor: matches.filter(m => m.score < 0.5).length,
    };

    return {
      "Total Source Items": totalSourceItems,
      "Total Matches Found": matchedCount,
      "Match Percentage": `${((matchedCount / totalSourceItems) * 100).toFixed(2)}%`,
      "Average Match Score": `${(averageScore * 100).toFixed(2)}%`,
      "Excellent Matches (90%+)": scoreDistribution.excellent,
      "Good Matches (70-89%)": scoreDistribution.good,
      "Fair Matches (50-69%)": scoreDistribution.fair,
      "Poor Matches (<50%)": scoreDistribution.poor,
    };
  }

  /**
   * Validate file type
   */
  static isValidFileType(filename: string): boolean {
    const validExtensions = ['.xlsx', '.xls', '.csv'];
    const extension = filename.toLowerCase().substring(filename.lastIndexOf('.'));
    return validExtensions.includes(extension);
  }

  /**
   * Generate Excel file for unmatched data from File 1
   */
  static generateUnmatchedFile1Excel(
    file1Name: string,
    column1Name: string,
    unmatchedItems: Array<{value: string; rowIndex: number}>,
    originalData: any[],
    additionalColumns: string[] = []
  ): Uint8Array {
    const unmatchedData = unmatchedItems.map(item => {
      const baseData = {
        [`${column1Name} (Unmatched)`]: item.value,
        "Original Row": item.rowIndex + 1,
      };

      // Add additional columns for context
      additionalColumns.forEach(colName => {
        if (originalData[item.rowIndex] && originalData[item.rowIndex][colName] !== undefined) {
          baseData[colName] = originalData[item.rowIndex][colName];
        }
      });

      return baseData;
    });

    // Create workbook
    const workbook = XLSX.utils.book_new();
    
    // Add unmatched data sheet - ensure sheet name doesn't exceed 31 chars
    const unmatchedSheet = XLSX.utils.json_to_sheet(unmatchedData);
    const sheetName1 = this.truncateSheetName(`Unmatched ${file1Name}`);
    XLSX.utils.book_append_sheet(workbook, unmatchedSheet, sheetName1);

    // Add summary sheet
    const summary = [{
      "File": file1Name,
      "Total Unmatched Items": unmatchedItems.length,
      "Column": column1Name,
      "Description": "Items from this file that had no matches in the other file"
    }];
    const summarySheet = XLSX.utils.json_to_sheet(summary);
    XLSX.utils.book_append_sheet(workbook, summarySheet, "Summary");

    // Generate Excel buffer
    const excelBuffer = XLSX.write(workbook, { 
      type: "array", 
      bookType: "xlsx" 
    });

    return new Uint8Array(excelBuffer);
  }

  /**
   * Generate Excel file for unmatched data from File 2
   */
  static generateUnmatchedFile2Excel(
    file2Name: string,
    column2Name: string,
    unmatchedItems: Array<{value: string; rowIndex: number}>,
    originalData: any[],
    additionalColumns: string[] = []
  ): Uint8Array {
    const unmatchedData = unmatchedItems.map(item => {
      const baseData = {
        [`${column2Name} (Unmatched)`]: item.value,
        "Original Row": item.rowIndex + 1,
      };

      // Add additional columns for context
      additionalColumns.forEach(colName => {
        if (originalData[item.rowIndex] && originalData[item.rowIndex][colName] !== undefined) {
          baseData[colName] = originalData[item.rowIndex][colName];
        }
      });

      return baseData;
    });

    // Create workbook
    const workbook = XLSX.utils.book_new();
    
    // Add unmatched data sheet
    const unmatchedSheet = XLSX.utils.json_to_sheet(unmatchedData);
    XLSX.utils.book_append_sheet(workbook, unmatchedSheet, `Unmatched ${file2Name}`);

    // Add summary sheet
    const summary = [{
      "File": file2Name,
      "Total Unmatched Items": unmatchedItems.length,
      "Column": column2Name,
      "Description": "Items from this file that had no matches in the other file"
    }];
    const summarySheet = XLSX.utils.json_to_sheet(summary);
    XLSX.utils.book_append_sheet(workbook, summarySheet, "Summary");

    // Generate Excel buffer
    const excelBuffer = XLSX.write(workbook, { 
      type: "array", 
      bookType: "xlsx" 
    });

    return new Uint8Array(excelBuffer);
  }

  /**
   * Get file size in human readable format
   */
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}