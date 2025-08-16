import { signal } from "@preact/signals";
import { useEffect } from "preact/hooks";
import FileUploadZone from "./FileUploadZone.tsx";
import LoadingSpinner from "./LoadingSpinner.tsx";
import ProgressBar from "./ProgressBar.tsx";
import AlgorithmSelector from "./AlgorithmSelector.tsx";
import { showToast } from "./Toast.tsx";
import { FuzzyAlgorithmType } from "../utils/fuzzyAlgorithms.ts";

// Simple state management
const file1 = signal<File | null>(null);
const file2 = signal<File | null>(null);
const file1Data = signal<any>(null);
const file2Data = signal<any>(null);
const selectedColumn1 = signal<string>("");
const selectedColumn2 = signal<string>("");
const additionalColumns1 = signal<string[]>([]);
const additionalColumns2 = signal<string[]>([]);
const selectedAlgorithm = signal<FuzzyAlgorithmType>('fuse');
const isUploading = signal<boolean>(false);
const isMatching = signal<boolean>(false);
const uploadProgress = signal<number>(0);
const matchProgress = signal<number>(0);
const uploadError = signal<string>("");
const matchResults = signal<any>(null);

export default function UploadForm() {
  const handleFile1Change = (file: File) => {
    file1.value = file;
    file1Data.value = null;
    selectedColumn1.value = "";
    additionalColumns1.value = [];
    matchResults.value = null;
    uploadError.value = "";
  };

  const handleFile2Change = (file: File) => {
    file2.value = file;
    file2Data.value = null;
    selectedColumn2.value = "";
    additionalColumns2.value = [];
    matchResults.value = null;
    uploadError.value = "";
  };

  const uploadFile = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Upload failed");
    }

    return await response.json();
  };

  const handleUpload = async () => {
    if (!file1.value || !file2.value) {
      showToast({
        type: 'error',
        title: 'Missing Files',
        message: 'Please select both Excel files to continue'
      });
      return;
    }

    isUploading.value = true;
    uploadError.value = "";
    uploadProgress.value = 0;

    try {
      showToast({
        type: 'info',
        title: 'Processing Files',
        message: 'Reading Excel files and extracting columns...'
      });

      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        if (uploadProgress.value < 90) {
          uploadProgress.value += 10;
        }
      }, 200);

      // Upload both files
      const [result1, result2] = await Promise.all([
        uploadFile(file1.value),
        uploadFile(file2.value),
      ]);

      clearInterval(progressInterval);
      uploadProgress.value = 100;

      if (result1.success && result2.success) {
        file1Data.value = result1;
        file2Data.value = result2;
        
        showToast({
          type: 'success',
          title: 'Files Processed!',
          message: `Excel 1: ${result1.rowCount} rows, Excel 2: ${result2.rowCount} rows`
        });

        // Auto-suggest columns if common names found
        autoSuggestColumns(result1.columns, result2.columns);
      } else {
        throw new Error("One or both file uploads failed");
      }
    } catch (error) {
      console.error("Upload error:", error);
      uploadError.value = error.message;
      showToast({
        type: 'error',
        title: 'Upload Failed',
        message: error.message
      });
    } finally {
      isUploading.value = false;
      uploadProgress.value = 0;
    }
  };

  const autoSuggestColumns = (columns1: string[], columns2: string[]) => {
    // Auto-suggest common column patterns
    const commonPatterns = [
      { patterns: ['name', 'myname', 'full_name', 'fullname', 'customer_name'], priority: 1 },
      { patterns: ['id', 'user_id', 'customer_id'], priority: 2 },
      { patterns: ['email', 'email_address'], priority: 3 }
    ];

    for (const { patterns } of commonPatterns) {
      const col1 = columns1.find(col => 
        patterns.some(pattern => col.toLowerCase().includes(pattern.toLowerCase()))
      );
      const col2 = columns2.find(col => 
        patterns.some(pattern => col.toLowerCase().includes(pattern.toLowerCase()))
      );

      if (col1 && col2 && !selectedColumn1.value && !selectedColumn2.value) {
        selectedColumn1.value = col1;
        selectedColumn2.value = col2;
        showToast({
          type: 'info',
          title: 'Columns Auto-Selected',
          message: `Found matching columns: "${col1}" ↔ "${col2}"`
        });
        break;
      }
    }
  };

  const handleMatch = async () => {
    if (!file1Data.value || !file2Data.value || !selectedColumn1.value || !selectedColumn2.value) {
      showToast({
        type: 'error',
        title: 'Incomplete Selection',
        message: 'Please upload files and select columns for both files'
      });
      return;
    }

    isMatching.value = true;
    uploadError.value = "";
    matchProgress.value = 0;

    try {
      showToast({
        type: 'info',
        title: 'Starting Fuzzy Search',
        message: `Using ${selectedAlgorithm.value} algorithm to match "${selectedColumn1.value}" with "${selectedColumn2.value}"`
      });

      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        if (matchProgress.value < 90) {
          matchProgress.value += Math.random() * 15;
        }
      }, 300);

      const response = await fetch("/api/match", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          file1Data: file1Data.value.data,
          file2Data: file2Data.value.data,
          file1Name: file1Data.value.filename,
          file2Name: file2Data.value.filename,
          column1: selectedColumn1.value,
          column2: selectedColumn2.value,
          additionalColumns1: additionalColumns1.value,
          additionalColumns2: additionalColumns2.value,
          threshold: 0.7, // Fixed threshold for simplicity
          simpleMode: true, // New flag for simple matching
          algorithm: selectedAlgorithm.value
        }),
      });

      clearInterval(progressInterval);
      matchProgress.value = 100;

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Matching failed");
      }

      const result = await response.json();
      
      if (result.success) {
        matchResults.value = result;
        showToast({
          type: 'success',
          title: `${selectedAlgorithm.value.toUpperCase()} Matching Complete! 🎉`,
          message: `Processed ${result.totalProcessed} rows with ${result.totalMatches} matches found using ${result.algorithm} algorithm`
        });
      } else {
        throw new Error("Matching failed");
      }
    } catch (error) {
      console.error("Matching error:", error);
      uploadError.value = error.message;
      showToast({
        type: 'error',
        title: 'Matching Failed',
        message: error.message
      });
    } finally {
      isMatching.value = false;
      matchProgress.value = 0;
    }
  };

  const downloadResults = () => {
    if (!matchResults.value || !matchResults.value.excelData) {
      showToast({
        type: 'error',
        title: 'Download Error',
        message: 'No results available for download'
      });
      return;
    }

    try {
      // Convert base64 to blob and download
      const binaryString = atob(matchResults.value.excelData);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      const blob = new Blob([bytes], { 
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" 
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `fuzzy_match_results_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      showToast({
        type: 'success',
        title: 'Download Started',
        message: 'Your Excel file is being downloaded'
      });
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Download Failed',
        message: 'Failed to generate download file'
      });
    }
  };

  const downloadUnmatchedFile1 = () => {
    if (!matchResults.value || !matchResults.value.unmatchedFile1Data) {
      showToast({
        type: 'error',
        title: 'Download Error',
        message: 'No unmatched data available for File 1'
      });
      return;
    }

    try {
      const binaryString = atob(matchResults.value.unmatchedFile1Data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      const blob = new Blob([bytes], { 
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" 
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const fileName = matchResults.value.fileNames?.file1 || 'File1';
      a.download = `unmatched_${fileName}_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      showToast({
        type: 'success',
        title: 'Download Started',
        message: `Unmatched data from ${fileName} is being downloaded`
      });
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Download Failed',
        message: 'Failed to download unmatched File 1 data'
      });
    }
  };

  const downloadUnmatchedFile2 = () => {
    if (!matchResults.value || !matchResults.value.unmatchedFile2Data) {
      showToast({
        type: 'error',
        title: 'Download Error',
        message: 'No unmatched data available for File 2'
      });
      return;
    }

    try {
      const binaryString = atob(matchResults.value.unmatchedFile2Data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      const blob = new Blob([bytes], { 
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" 
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const fileName = matchResults.value.fileNames?.file2 || 'File2';
      a.download = `unmatched_${fileName}_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      showToast({
        type: 'success',
        title: 'Download Started',
        message: `Unmatched data from ${fileName} is being downloaded`
      });
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Download Failed',
        message: 'Failed to download unmatched File 2 data'
      });
    }
  };

  const resetForm = () => {
    file1.value = null;
    file2.value = null;
    file1Data.value = null;
    file2Data.value = null;
    selectedColumn1.value = "";
    selectedColumn2.value = "";
    additionalColumns1.value = [];
    additionalColumns2.value = [];
    selectedAlgorithm.value = 'fuse';
    matchResults.value = null;
    uploadError.value = "";
    
    // Reset file inputs
    const fileInputs = document.querySelectorAll('input[type="file"]');
    fileInputs.forEach(input => (input as HTMLInputElement).value = "");

    showToast({
      type: 'info',
      title: 'Form Reset',
      message: 'Ready for new files'
    });
  };

  return (
    <div className="space-y-8">
      {/* Simple Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
          Choose Your Excel Files
        </h2>
        <p className="text-gray-600 dark:text-gray-300 max-w-xl mx-auto">
          Upload two Excel files and select one column from each to find fuzzy matches.
        </p>
      </div>

      {/* Progress Indicators */}
      {(isUploading.value || isMatching.value) && (
        <div className="bg-blue-50 dark:bg-gray-800/80 rounded-xl p-6 border border-blue-200 dark:border-gray-600">
          {isUploading.value && (
            <ProgressBar 
              progress={uploadProgress.value} 
              color="blue" 
              animated={true}
            />
          )}
          {isMatching.value && (
            <ProgressBar 
              progress={matchProgress.value} 
              color="green" 
              animated={true}
            />
          )}
        </div>
      )}

      {/* File Upload Section */}
      <div className="grid md:grid-cols-2 gap-6">
        <FileUploadZone
          label="📊 Excel File 1"
          onFileSelect={handleFile1Change}
          isUploading={isUploading.value}
          uploadProgress={uploadProgress.value}
          fileData={file1Data.value}
          selectedFile={file1.value}
          disabled={isUploading.value || isMatching.value}
        />
        
        <FileUploadZone
          label="📋 Excel File 2"
          onFileSelect={handleFile2Change}
          isUploading={isUploading.value}
          uploadProgress={uploadProgress.value}
          fileData={file2Data.value}
          selectedFile={file2.value}
          disabled={isUploading.value || isMatching.value}
        />
      </div>

      {/* Algorithm Selection - Only show after files are uploaded */}
      {file1Data.value && file2Data.value && (
        <AlgorithmSelector 
          selectedAlgorithm={selectedAlgorithm.value}
          onAlgorithmChange={(algorithm) => selectedAlgorithm.value = algorithm}
          disabled={isMatching.value}
        />
      )}

      {/* Column Selection - Enhanced Design */}
      {file1Data.value && file2Data.value && (
        <div className="bg-gradient-to-br from-slate-50/80 to-gray-50/80 dark:from-gray-800/70 dark:to-gray-700/80 backdrop-blur-sm rounded-xl p-8 border border-gray-200/70 dark:border-gray-600/50 shadow-xl dark:shadow-2xl dark:shadow-black/30">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 flex items-center space-x-2">
                <span>🎯</span>
                <span>Select Columns to Match</span>
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Choose one column from each file to find similar data
              </p>
            </div>
            <div className="px-4 py-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-700/50">
              <span className="text-xs font-medium text-blue-700 dark:text-blue-300">
                Ready for matching
              </span>
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200">
                  Column from File 1: <span className="text-blue-600 dark:text-blue-400 font-bold">{file1Data.value.filename}</span>
                </label>
              </div>
              <select
                value={selectedColumn1.value}
                onChange={(e) => selectedColumn1.value = (e.target as HTMLSelectElement).value}
                className="w-full px-4 py-3.5 bg-white/90 dark:bg-gray-700/90 border border-gray-300/70 dark:border-gray-500/50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white shadow-sm dark:shadow-lg backdrop-blur-sm font-medium transition-all duration-200 hover:shadow-md"
                disabled={isMatching.value}
              >
                <option value="" className="text-gray-500">Choose a column...</option>
                {file1Data.value.columns.map((column: string) => (
                  <option key={column} value={column} className="py-2">
                    {column} ({file1Data.value.data.filter((row: any) => row[column] && String(row[column]).trim() !== '').length} values)
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-3">
                          <div className="flex items-center space-x-2">
              <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200">
                Column from File 2: <span className="text-emerald-600 dark:text-emerald-400 font-bold">{file2Data.value.filename}</span>
              </label>
            </div>
              <select
                value={selectedColumn2.value}
                onChange={(e) => selectedColumn2.value = (e.target as HTMLSelectElement).value}
                className="w-full px-4 py-3.5 bg-white/90 dark:bg-gray-700/90 border border-gray-300/70 dark:border-gray-500/50 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-900 dark:text-white shadow-sm dark:shadow-lg backdrop-blur-sm font-medium transition-all duration-200 hover:shadow-md"
                disabled={isMatching.value}
              >
                <option value="" className="text-gray-500">Choose a column...</option>
                {file2Data.value.columns.map((column: string) => (
                  <option key={column} value={column} className="py-2">
                    {column} ({file2Data.value.data.filter((row: any) => row[column] && String(row[column]).trim() !== '').length} values)
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Additional Columns Selection - NEW FEATURE */}
      {selectedColumn1.value && selectedColumn2.value && (
        <div className="bg-gradient-to-br from-blue-50/80 to-indigo-50/80 dark:from-blue-900/20 dark:to-indigo-900/20 backdrop-blur-sm rounded-xl p-8 border border-blue-200/70 dark:border-blue-600/50 shadow-xl dark:shadow-2xl dark:shadow-black/30">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 flex items-center space-x-2">
                <span>➕</span>
                <span>Select Additional Columns for Excel Output (Optional)</span>
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                <span className="font-semibold text-amber-600 dark:text-amber-400">📝 Note:</span> These columns will <strong>NOT</strong> be used for fuzzy matching. 
                They will only be included in your Excel report in the correct rows alongside the matched data.
              </p>
            </div>
            <div className="px-4 py-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-700/50">
              <span className="text-xs font-medium text-blue-700 dark:text-blue-300">
                Optional Enhancement
              </span>
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* Additional Columns from File 1 */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200">
                  Extra Data from File 1: <span className="text-blue-600 dark:text-blue-400 font-bold">{file1Data.value.filename}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">(for Excel output only)</span>
                </label>
              </div>
              <div className="bg-white/90 dark:bg-gray-700/90 border border-gray-300/70 dark:border-gray-500/50 rounded-xl p-4 shadow-sm dark:shadow-lg backdrop-blur-sm">
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {file1Data.value.columns
                    .filter(col => col !== selectedColumn1.value)
                    .map((column: string) => (
                      <label key={column} className="flex items-center space-x-3 p-2 hover:bg-gray-50/80 dark:hover:bg-gray-600/50 rounded-lg cursor-pointer transition-colors">
                        <input
                          type="checkbox"
                          checked={additionalColumns1.value.includes(column)}
                          onChange={(e) => {
                            const isChecked = (e.target as HTMLInputElement).checked;
                            if (isChecked) {
                              additionalColumns1.value = [...additionalColumns1.value, column];
                            } else {
                              additionalColumns1.value = additionalColumns1.value.filter(col => col !== column);
                            }
                          }}
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                          disabled={isMatching.value}
                        />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-200 flex-1">
                          {column}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          ({file1Data.value.data.filter((row: any) => row[column] && String(row[column]).trim() !== '').length} values)
                        </span>
                      </label>
                    ))}
                </div>
                {additionalColumns1.value.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-200/50 dark:border-gray-600/50">
                    <div className="flex flex-wrap gap-2">
                      <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Selected:</span>
                      {additionalColumns1.value.map(col => (
                        <span key={col} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-700/50">
                          {col}
                          <button
                            onClick={() => {
                              additionalColumns1.value = additionalColumns1.value.filter(c => c !== col);
                            }}
                            className="ml-1.5 inline-flex items-center justify-center w-3 h-3 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 transition-colors"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Additional Columns from File 2 */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200">
                  Extra Data from File 2: <span className="text-emerald-600 dark:text-emerald-400 font-bold">{file2Data.value.filename}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">(for Excel output only)</span>
                </label>
              </div>
              <div className="bg-white/90 dark:bg-gray-700/90 border border-gray-300/70 dark:border-gray-500/50 rounded-xl p-4 shadow-sm dark:shadow-lg backdrop-blur-sm">
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {file2Data.value.columns
                    .filter(col => col !== selectedColumn2.value)
                    .map((column: string) => (
                      <label key={column} className="flex items-center space-x-3 p-2 hover:bg-gray-50/80 dark:hover:bg-gray-600/50 rounded-lg cursor-pointer transition-colors">
                        <input
                          type="checkbox"
                          checked={additionalColumns2.value.includes(column)}
                          onChange={(e) => {
                            const isChecked = (e.target as HTMLInputElement).checked;
                            if (isChecked) {
                              additionalColumns2.value = [...additionalColumns2.value, column];
                            } else {
                              additionalColumns2.value = additionalColumns2.value.filter(col => col !== column);
                            }
                          }}
                          className="w-4 h-4 text-emerald-600 bg-gray-100 border-gray-300 rounded focus:ring-emerald-500 focus:ring-2"
                          disabled={isMatching.value}
                        />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-200 flex-1">
                          {column}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          ({file2Data.value.data.filter((row: any) => row[column] && String(row[column]).trim() !== '').length} values)
                        </span>
                      </label>
                    ))}
                </div>
                {additionalColumns2.value.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-200/50 dark:border-gray-600/50">
                    <div className="flex flex-wrap gap-2">
                      <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Selected:</span>
                      {additionalColumns2.value.map(col => (
                        <span key={col} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700/50">
                          {col}
                          <button
                            onClick={() => {
                              additionalColumns2.value = additionalColumns2.value.filter(c => c !== col);
                            }}
                            className="ml-1.5 inline-flex items-center justify-center w-3 h-3 text-emerald-600 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-200 transition-colors"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Summary of Selected Additional Columns */}
          {(additionalColumns1.value.length > 0 || additionalColumns2.value.length > 0) && (
            <div className="mt-6 p-4 bg-gradient-to-r from-blue-50/80 to-emerald-50/80 dark:from-blue-900/20 dark:to-emerald-900/20 border border-blue-200/60 dark:border-blue-600/40 rounded-xl">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-sm font-bold">✓</span>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
                    📊 Additional Data for Excel Output
                  </h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                    These columns will be included in your Excel report alongside the fuzzy match results.
                    <strong> Fuzzy matching will only use the two main columns selected above.</strong>
                    The additional data will appear in the corresponding rows of the matched entries.
                  </p>
                  <div className="mt-2 text-xs text-gray-700 dark:text-gray-300">
                    <span className="font-medium">File 1:</span> {additionalColumns1.value.length} columns • 
                    <span className="font-medium ml-2">File 2:</span> {additionalColumns2.value.length} columns
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Action Buttons - Enhanced Design */}
      <div className="flex justify-center space-x-6">
        {!file1Data.value || !file2Data.value ? (
          <button
            onClick={handleUpload}
            disabled={!file1.value || !file2.value || isUploading.value}
            className="group relative bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 text-white px-10 py-4 rounded-xl font-bold text-lg disabled:cursor-not-allowed transition-all duration-300 flex items-center space-x-3 shadow-xl dark:shadow-2xl dark:shadow-blue-900/40 hover:shadow-2xl hover:scale-105 disabled:hover:scale-100 border border-blue-500/20 dark:border-blue-400/30"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            {isUploading.value ? (
              <>
                <LoadingSpinner size="sm" color="white" />
                <span className="relative z-10">Processing Files...</span>
              </>
            ) : (
              <>
                <span className="text-xl relative z-10">📤</span>
                <span className="relative z-10">Upload & Process Files</span>
              </>
            )}
          </button>
        ) : (
          <div className="flex space-x-4">
            <button
              onClick={handleMatch}
              disabled={!selectedColumn1.value || !selectedColumn2.value || isMatching.value}
              className="group relative bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 disabled:from-gray-400 disabled:to-gray-500 text-white px-10 py-4 rounded-xl font-bold text-lg disabled:cursor-not-allowed transition-all duration-300 flex items-center space-x-3 shadow-xl dark:shadow-2xl dark:shadow-emerald-900/40 hover:shadow-2xl hover:scale-105 disabled:hover:scale-100 border border-emerald-500/20 dark:border-emerald-400/30"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              {isMatching.value ? (
                <>
                  <LoadingSpinner size="sm" color="white" />
                  <span className="relative z-10">Analyzing Data...</span>
                </>
              ) : (
                <>
                  <span className="text-xl relative z-10 text-button">🔍</span>
                  <span className="relative z-10 text-button">Start Fuzzy Matching</span>
                </>
              )}
            </button>
            
            <button
              onClick={resetForm}
              disabled={isUploading.value || isMatching.value}
              className="group relative bg-gradient-to-r from-slate-500 to-slate-600 hover:from-slate-600 hover:to-slate-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-8 py-4 rounded-xl font-semibold disabled:cursor-not-allowed transition-all duration-300 flex items-center space-x-3 shadow-lg dark:shadow-xl dark:shadow-slate-900/40 hover:shadow-xl hover:scale-105 disabled:hover:scale-100 border border-slate-400/20 dark:border-slate-300/20"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <span className="text-lg relative z-10 text-button">🔄</span>
              <span className="relative z-10 text-button">Reset Form</span>
            </button>
          </div>
        )}
      </div>

      {/* Enhanced Results Display */}
      {matchResults.value && (
        <div className="bg-gradient-to-br from-emerald-50/90 to-green-50/90 dark:from-gray-800/90 dark:to-gray-700/90 backdrop-blur-sm border border-emerald-200/70 dark:border-gray-600/50 rounded-2xl p-8 shadow-2xl dark:shadow-3xl dark:shadow-black/40">
          <div className="flex justify-between items-start mb-8">
            <div className="space-y-3">
              <h3 className="text-2xl font-bold text-emerald-800 dark:text-emerald-200 flex items-center space-x-3">
                <span className="w-10 h-10 bg-gradient-to-br from-emerald-100 to-emerald-200 dark:from-emerald-900/50 dark:to-emerald-800/50 rounded-full flex items-center justify-center">
                  ✅
                </span>
                <span>{matchResults.value.algorithm?.toUpperCase()} Matching Complete!</span>
              </h3>
              <div className="flex items-center space-x-6 text-sm">
                <div className="flex items-center space-x-2">
                  <span className="w-3 h-3 bg-emerald-500 rounded-full"></span>
                  <span className="text-emerald-700 dark:text-emerald-300 font-medium">
                    {matchResults.value.totalMatches} matches found
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                  <span className="text-blue-700 dark:text-blue-300 font-medium">
                    {matchResults.value.totalProcessed} rows processed
                  </span>
                </div>
                {matchResults.value.unmatchedCount && (
                  <div className="flex items-center space-x-2">
                    <span className="w-3 h-3 bg-amber-500 rounded-full"></span>
                    <span className="text-amber-700 dark:text-amber-300 font-medium">
                      {(matchResults.value.unmatchedCount.file1 || 0) + (matchResults.value.unmatchedCount.file2 || 0)} unmatched items
                    </span>
                  </div>
                )}
                <div className="px-3 py-1.5 bg-gradient-to-r from-purple-100 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-900/30 rounded-full border border-purple-200 dark:border-purple-700/50">
                  <span className="text-xs font-semibold text-purple-700 dark:text-purple-300 uppercase tracking-wide">
                    {matchResults.value.algorithm} Algorithm
                  </span>
                </div>
              </div>
            </div>
            
            {/* Download Section with Main Results Button */}
            <div className="flex flex-col space-y-3">
              <button
                onClick={downloadResults}
                className="group relative bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white px-8 py-4 rounded-xl font-bold transition-all duration-300 flex items-center space-x-3 shadow-xl dark:shadow-2xl dark:shadow-emerald-900/40 hover:shadow-2xl hover:scale-105 border border-emerald-500/30"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <span className="text-lg relative z-10">💾</span>
                <span className="relative z-10">Download Excel Report</span>
              </button>
            </div>
          </div>

          {/* Unmatched Data Summary */}
          {matchResults.value.unmatchedCount && ((matchResults.value.unmatchedCount.file1 > 0) || (matchResults.value.unmatchedCount.file2 > 0)) && (
            <div className="mb-8 bg-gradient-to-br from-amber-50/80 to-orange-50/80 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200/60 dark:border-amber-600/40 rounded-xl p-6">
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-gradient-to-br from-amber-100 to-amber-200 dark:from-amber-900/50 dark:to-amber-800/50 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-amber-700 dark:text-amber-300 font-bold">📊</span>
                </div>
                <div className="flex-1">
                  <h4 className="text-lg font-bold text-amber-800 dark:text-amber-200 mb-2">
                    Unmatched Data Available
                  </h4>
                  <p className="text-amber-700 dark:text-amber-300 text-sm mb-4 leading-relaxed">
                    Some items from your files didn't have matches. Download the unmatched data separately to review items that need manual processing.
                  </p>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    {/* Unmatched File 1 */}
                    {matchResults.value.unmatchedCount.file1 > 0 && matchResults.value.unmatchedFile1Data && (
                      <div className="bg-white/80 dark:bg-gray-800/60 rounded-lg p-4 border border-amber-200/50 dark:border-amber-600/30">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h5 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                              📄 {matchResults.value.fileNames?.file1 || 'File 1'}
                            </h5>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              {matchResults.value.unmatchedCount.file1} unmatched items
                            </p>
                          </div>
                          <button
                            onClick={downloadUnmatchedFile1}
                            className="group relative bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-all duration-300 flex items-center space-x-2 shadow-lg hover:shadow-xl hover:scale-105"
                          >
                            <span className="text-sm">📥</span>
                            <span>Download</span>
                          </button>
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          Items from <strong>{selectedColumn1.value}</strong> column that had no matches
                        </div>
                      </div>
                    )}

                    {/* Unmatched File 2 */}
                    {matchResults.value.unmatchedCount.file2 > 0 && matchResults.value.unmatchedFile2Data && (
                      <div className="bg-white/80 dark:bg-gray-800/60 rounded-lg p-4 border border-amber-200/50 dark:border-amber-600/30">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h5 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                              📄 {matchResults.value.fileNames?.file2 || 'File 2'}
                            </h5>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              {matchResults.value.unmatchedCount.file2} unmatched items
                            </p>
                          </div>
                          <button
                            onClick={downloadUnmatchedFile2}
                            className="group relative bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-all duration-300 flex items-center space-x-2 shadow-lg hover:shadow-xl hover:scale-105"
                          >
                            <span className="text-sm">📥</span>
                            <span>Download</span>
                          </button>
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          Items from <strong>{selectedColumn2.value}</strong> column that had no matches
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Enhanced Preview Table */}
          {matchResults.value.matches && matchResults.value.matches.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-lg text-gray-900 dark:text-gray-100">
                  📊 Match Preview (Top 5 Results)
                </h4>
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                  <span>Sorted by match score</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                  </svg>
                </div>
              </div>
              
              <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl border border-gray-200/70 dark:border-gray-600/50 overflow-hidden shadow-xl dark:shadow-2xl">
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-gradient-to-r from-gray-50/90 to-slate-50/90 dark:from-gray-700/90 dark:to-gray-600/90 backdrop-blur-sm">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 dark:text-gray-100 tracking-wide">
                          <div className="flex items-center space-x-2">
                            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                            <span>{selectedColumn1.value}</span>
                          </div>
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 dark:text-gray-100 tracking-wide">
                          <div className="flex items-center space-x-2">
                            <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                            <span>{selectedColumn2.value}</span>
                          </div>
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 dark:text-gray-100 tracking-wide">
                          Algorithm Used
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 dark:text-gray-100 tracking-wide">
                          Match Confidence
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200/70 dark:divide-gray-600/50">
                      {matchResults.value.matches.slice(0, 5).map((match: any, index: number) => {
                        const score = Math.round(match.score * 100);
                        const isHighScore = score >= 90;
                        const isMediumScore = score >= 70 && score < 90;
                        const isLowScore = score < 70;
                        
                        return (
                          <tr key={index} className={`
                            hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-all duration-200
                            ${index % 2 === 0 ? 'bg-white/50 dark:bg-gray-800/40' : 'bg-gray-50/30 dark:bg-gray-700/20'}
                          `}>
                            <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-gray-100">
                              <div className="flex items-center space-x-2">
                                <span className="w-1.5 h-1.5 bg-blue-400 rounded-full"></span>
                                <span>{match.source}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-gray-100">
                              <div className="flex items-center space-x-2">
                                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></span>
                                <span>{match.target}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm">
                              <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-purple-100 to-indigo-100 dark:from-purple-900/40 dark:to-indigo-900/40 text-purple-800 dark:text-purple-200 border border-purple-200/50 dark:border-purple-700/30">
                                {match.algorithm || selectedAlgorithm.value}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm">
                              <div className="flex items-center space-x-3">
                                <div className={`
                                  inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-bold
                                  ${isHighScore 
                                    ? 'bg-emerald-100/80 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-700/30' 
                                    : isMediumScore
                                    ? 'bg-amber-100/80 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 border border-amber-200/50 dark:border-amber-700/30'
                                    : 'bg-gray-100/80 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 border border-gray-200/50 dark:border-gray-600/30'
                                  }
                                `}>
                                  {score}%
                                </div>
                                <div className="flex-1 bg-gray-200/60 dark:bg-gray-600/40 rounded-full h-2">
                                  <div 
                                    className={`
                                      h-2 rounded-full transition-all duration-500
                                      ${isHighScore 
                                        ? 'bg-gradient-to-r from-emerald-400 to-emerald-500' 
                                        : isMediumScore
                                        ? 'bg-gradient-to-r from-amber-400 to-amber-500'
                                        : 'bg-gradient-to-r from-gray-400 to-gray-500'
                                      }
                                    `}
                                    style={{ width: `${score}%` }}
                                  />
                                </div>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}