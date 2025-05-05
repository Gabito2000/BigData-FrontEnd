import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getFileDownloadUrl } from "@/lib/api";

type FileViewerProps = {
  filePath?: string; // Now optional, can be set via URL or input
};

function getFileExtension(filePath: string) {
  return filePath.split(".").pop()?.toLowerCase() || "";
}

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export const FileViewer: React.FC<FileViewerProps> = ({ filePath: propFilePath }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const query = useQuery();

  // Get file path from URL query (?file=...)
  const urlFilePath = query.get("file") || "";
  const [inputPath, setInputPath] = useState(propFilePath || urlFilePath);

  // Add state for CSV data, loading, and errors
  const [csvData, setCsvData] = useState<string[][] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync inputPath with prop or URL changes
  useEffect(() => {
    const newPath = propFilePath || urlFilePath;
    // Only update if the source (prop/URL) has changed and differs from current input
    if (newPath !== inputPath) {
        setInputPath(newPath);
        // Reset CSV data when path changes
        setCsvData(null);
        setError(null);
    }
    // We intentionally don't include inputPath here, as we only want to react
    // to external changes from props or URL, not user typing.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [propFilePath, urlFilePath]); // REMOVED inputPath dependency

  const ext = getFileExtension(inputPath);

  // Effect to fetch and parse CSV data
  useEffect(() => {
    if (inputPath && ext === "csv") {
      setIsLoading(true);
      setCsvData(null); // Clear previous data
      setError(null); // Clear previous error
      fetch(getFileDownloadUrl(inputPath))
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.text();
        })
        .then(text => {
          // Basic CSV parsing (split by newline, then by comma)
          // WARNING: This simple parsing might fail for complex CSVs (e.g., commas in quotes)
          const rows = text.split('\n').map(row => row.split(','));
          setCsvData(rows);
          setError(null);
        })
        .catch(e => {
          console.error("Error fetching or parsing CSV:", e);
          setError(`Failed to load CSV: ${e.message}`);
          setCsvData(null);
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
        // Clear CSV data if file is not CSV or path is empty
        setCsvData(null);
        setError(null);
        setIsLoading(false);
    }
  }, [inputPath, ext]); // Re-run when inputPath or ext changes

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputPath(e.target.value);
  };

  const handleSetPath = () => {
    // Update the URL with the new file path
    // This will trigger the useEffect hooks due to location change
    navigate(`?file=${encodeURIComponent(inputPath)}`);
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = getFileDownloadUrl(inputPath);
    link.download = inputPath.split('/').pop() || 'download';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <div>
          <strong>File path:</strong> {inputPath || <em>No file selected</em>}
        </div>
        <div style={{ marginTop: 8 }}>
          <input
            type="text"
            value={inputPath}
            onChange={handleInputChange}
            placeholder="Enter file path..."
            style={{ width: "60%" }}
          />
          <button onClick={handleSetPath} style={{ marginLeft: 8 }}>
            Set Path
          </button>
          {inputPath && (
            <button onClick={handleDownload} style={{ marginLeft: 8 }}>
              Download File
            </button>
          )}
        </div>
      </div>
      {!inputPath && <div>No file selected.</div>}
      {inputPath && (
        <>
          {/* Updated CSV Rendering */}
          {ext === "csv" && (
            <div style={{ width: "100%", height: "80vh", border: "1px solid #ccc", overflow: "auto" }}>
              {isLoading && <div>Loading CSV data...</div>}
              {error && <div style={{ color: 'red' }}>Error: {error}</div>}
              {csvData && !isLoading && !error && (
                <table style={{ borderCollapse: 'collapse', width: '100%' }}>
                  <thead>
                    <tr>
                      {csvData[0]?.map((header, index) => (
                        <th key={index} style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left', backgroundColor: '#f2f2f2' }}>
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {csvData.slice(1).map((row, rowIndex) => (
                      // Only render row if it's not empty or just whitespace
                      row.join('').trim() && (
                        <tr key={rowIndex}>
                          {row.map((cell, cellIndex) => (
                            <td key={cellIndex} style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>
                              {cell}
                            </td>
                          ))}
                        </tr>
                      )
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
          {/* Keep other file type handlers */}
          {(ext === "txt" || ext === "json") && (
            <div style={{ width: "100%", height: "80vh", border: "1px solid #ccc", overflow: "auto" }}>
              <object
                data={getFileDownloadUrl(inputPath)}
                type="text/plain"
                style={{ width: "100%", height: "100%" }}
              >
                <embed src={getFileDownloadUrl(inputPath)} type="text/plain" />
              </object>
            </div>
          )}
          {ext === "pdf" && (
            <object
              data={getFileDownloadUrl(inputPath)}
              type="application/pdf"
              style={{ width: "100%", height: "80vh" }}
            >
              <embed src={getFileDownloadUrl(inputPath)} type="application/pdf" />
            </object>
          )}
          {ext === "mp3" && (
            <audio controls style={{ width: "100%" }}>
              <source src={getFileDownloadUrl(inputPath)} type="audio/mpeg" />
              Your browser does not support the audio element.
            </audio>
          )}
          {["png", "jpg", "jpeg", "gif", "bmp", "webp"].includes(ext) && (
            <img
              src={getFileDownloadUrl(inputPath)}
              alt={inputPath}
              style={{ maxWidth: "100%", maxHeight: "80vh" }}
            />
          )}
          {/* Fallback for unsupported types (excluding CSV now handled above) */}
          {!["csv", "txt", "json", "pdf", "mp3", "png", "jpg", "jpeg", "gif", "bmp", "webp"].includes(ext) && (
            <div>
              <p>Preview not available for this file type.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};