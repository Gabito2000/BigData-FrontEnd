import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getFileDownloadUrl } from "@/lib/api";

type FileViewerProps = {
  filePath?: string;
};

// Comprehensive file type detection
const getFileExtension = (filePath: string): string => {
  return filePath.split(".").pop()?.toLowerCase() || "";
};

const getFileType = (ext: string): string => {
  const typeMap: Record<string, string> = {
    // Text files
    txt: "text",
    json: "text",
    xml: "text",
    md: "text",
    yaml: "text",
    yml: "text",
    // Spreadsheet files
    csv: "csv",
    tsv: "csv",
    // Documents
    pdf: "pdf",
    // Images
    png: "image",
    jpg: "image",
    jpeg: "image",
    gif: "image",
    bmp: "image",
    webp: "image",
    svg: "image",
    // Audio
    mp3: "audio",
    wav: "audio",
    ogg: "audio",
    // Video
    mp4: "video",
    webm: "video",
    ogg: "video",
  };
  return typeMap[ext] || "unsupported";
};

// Improved CSV parsing with proper quote handling
const parseCSV = (text: string): string[][] => {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentCell = "";
  let inQuotes = false;
  let i = 0;

  while (i < text.length) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote
        currentCell += '"';
        i += 2;
        continue;
      } else {
        // Toggle quote state
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      // End of cell
      currentRow.push(currentCell.trim());
      currentCell = "";
    } else if ((char === '\n' || char === '\r') && !inQuotes) {
      // End of row
      currentRow.push(currentCell.trim());
      if (currentRow.some(cell => cell.length > 0)) {
        rows.push(currentRow);
      }
      currentRow = [];
      currentCell = "";
      // Skip \r\n combinations
      if (char === '\r' && nextChar === '\n') {
        i++;
      }
    } else {
      currentCell += char;
    }
    i++;
  }

  // Handle last cell/row
  if (currentCell || currentRow.length > 0) {
    currentRow.push(currentCell.trim());
    if (currentRow.some(cell => cell.length > 0)) {
      rows.push(currentRow);
    }
  }

  return rows;
};

const useQuery = () => {
  return new URLSearchParams(useLocation().search);
};

export const FileViewer: React.FC<FileViewerProps> = ({ filePath: propFilePath }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const query = useQuery();

  const urlFilePath = query.get("file") || "";
  const [inputPath, setInputPath] = useState(propFilePath || urlFilePath);
  const [csvData, setCsvData] = useState<string[][] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [textContent, setTextContent] = useState<string | null>(null);

  // Memoized file info
  const fileInfo = useMemo(() => {
    if (!inputPath) return null;
    const ext = getFileExtension(inputPath);
    const type = getFileType(ext);
    const fileName = inputPath.split('/').pop() || 'unknown';
    return { ext, type, fileName };
  }, [inputPath]);

  // Reset data when path changes
  useEffect(() => {
    const newPath = propFilePath || urlFilePath;
    if (newPath !== inputPath) {
      setInputPath(newPath);
      setCsvData(null);
      setTextContent(null);
      setError(null);
    }
  }, [propFilePath, urlFilePath, inputPath]);

  // Fetch and process file content
  useEffect(() => {
    if (!inputPath || !fileInfo) {
      setCsvData(null);
      setTextContent(null);
      setError(null);
      setIsLoading(false);
      return;
    }

    if (fileInfo.type === "csv" || fileInfo.type === "text") {
      setIsLoading(true);
      setError(null);

      fetch(getFileDownloadUrl(inputPath))
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
          return response.text();
        })
        .then(text => {
          if (fileInfo.type === "csv") {
            try {
              const rows = parseCSV(text);
              setCsvData(rows);
            } catch (parseError) {
              throw new Error(`CSV parsing failed: ${parseError.message}`);
            }
          } else {
            setTextContent(text);
          }
          setError(null);
        })
        .catch(e => {
          console.error("Error fetching or parsing file:", e);
          setError(`Failed to load file: ${e.message}`);
          setCsvData(null);
          setTextContent(null);
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      // Clear data for non-text files
      setCsvData(null);
      setTextContent(null);
      setError(null);
      setIsLoading(false);
    }
  }, [inputPath, fileInfo]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInputPath(e.target.value);
  }, []);

  const handleSetPath = useCallback(() => {
    navigate(`?file=${encodeURIComponent(inputPath)}`);
  }, [inputPath, navigate]);

  const handleDownload = useCallback(() => {
    if (!fileInfo) return;
    
    const link = document.createElement('a');
    link.href = getFileDownloadUrl(inputPath);
    link.download = fileInfo.fileName;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [inputPath, fileInfo]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSetPath();
    }
  }, [handleSetPath]);

  const renderContent = () => {
    if (!inputPath) {
      return (
        <div style={{ 
          padding: '40px', 
          textAlign: 'center', 
          color: '#666',
          backgroundColor: '#f9f9f9',
          borderRadius: '8px'
        }}>
          <p>📁 No file selected</p>
          <p>Enter a file path above to view its contents.</p>
        </div>
      );
    }

    if (!fileInfo) return null;

    const containerStyle = {
      width: "100%",
      height: "80vh",
      border: "1px solid #ddd",
      borderRadius: "8px",
      overflow: "auto",
      backgroundColor: "#fff"
    };

    if (isLoading) {
      return (
        <div style={{ 
          ...containerStyle, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          flexDirection: 'column'
        }}>
          <div>⏳ Loading {fileInfo.fileName}...</div>
          <div style={{ marginTop: '8px', fontSize: '14px', color: '#666' }}>
            File type: {fileInfo.type.toUpperCase()}
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div style={{ 
          ...containerStyle, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          flexDirection: 'column',
          color: '#d32f2f'
        }}>
          <div>❌ {error}</div>
          <button 
            onClick={() => window.location.reload()} 
            style={{ 
              marginTop: '16px',
              padding: '8px 16px',
              backgroundColor: '#1976d2',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Retry
          </button>
        </div>
      );
    }

    switch (fileInfo.type) {
      case "csv":
        if (!csvData) return null;
        return (
          <div style={containerStyle}>
            <div style={{ padding: '8px', backgroundColor: '#f5f5f5', borderBottom: '1px solid #ddd' }}>
              📊 CSV Data ({csvData.length} rows, {csvData[0]?.length || 0} columns)
            </div>
            <table style={{ borderCollapse: 'collapse', width: '100%' }}>
              <thead>
                <tr>
                  {csvData[0]?.map((header, index) => (
                    <th key={index} style={{ 
                      border: '1px solid #ddd', 
                      padding: '12px 8px', 
                      textAlign: 'left', 
                      backgroundColor: '#f8f9fa',
                      fontWeight: 'bold',
                      position: 'sticky',
                      top: 0,
                      zIndex: 1
                    }}>
                      {header || `Column ${index + 1}`}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {csvData.slice(1).map((row, rowIndex) => (
                  <tr key={rowIndex} style={{ 
                    backgroundColor: rowIndex % 2 === 0 ? '#fff' : '#f9f9f9' 
                  }}>
                    {row.map((cell, cellIndex) => (
                      <td key={cellIndex} style={{ 
                        border: '1px solid #ddd', 
                        padding: '8px', 
                        textAlign: 'left',
                        maxWidth: '200px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      case "text":
        return (
          <div style={containerStyle}>
            <div style={{ padding: '8px', backgroundColor: '#f5f5f5', borderBottom: '1px solid #ddd' }}>
              📄 Text File ({textContent?.split('\n').length || 0} lines)
            </div>
            <pre style={{ 
              margin: 0, 
              padding: '16px', 
              fontFamily: 'Monaco, Consolas, "Courier New", monospace',
              fontSize: '14px',
              lineHeight: '1.5',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word'
            }}>
              {textContent}
            </pre>
          </div>
        );

      case "pdf":
        return (
          <div style={containerStyle}>
            <object
              data={getFileDownloadUrl(inputPath)}
              type="application/pdf"
              style={{ width: "100%", height: "100%" }}
            >
              <div style={{ padding: '40px', textAlign: 'center' }}>
                <p>📄 PDF preview not available in this browser.</p>
                <button onClick={handleDownload} style={{
                  padding: '8px 16px',
                  backgroundColor: '#1976d2',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}>
                  Download PDF
                </button>
              </div>
            </object>
          </div>
        );

      case "image":
        return (
          <div style={{ ...containerStyle, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img
              src={getFileDownloadUrl(inputPath)}
              alt={fileInfo.fileName}
              style={{ 
                maxWidth: "100%", 
                maxHeight: "100%",
                objectFit: 'contain'
              }}
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling!.style.display = 'block';
              }}
            />
            <div style={{ display: 'none', textAlign: 'center' }}>
              <p>🖼️ Image could not be loaded</p>
              <button onClick={handleDownload} style={{
                padding: '8px 16px',
                backgroundColor: '#1976d2',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}>
                Download Image
              </button>
            </div>
          </div>
        );

      case "audio":
        return (
          <div style={{ ...containerStyle, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ marginBottom: '16px' }}>🎵 {fileInfo.fileName}</div>
              <audio controls style={{ width: "100%", maxWidth: "400px" }}>
                <source src={getFileDownloadUrl(inputPath)} type={`audio/${fileInfo.ext}`} />
                Your browser does not support the audio element.
              </audio>
            </div>
          </div>
        );

      case "video":
        return (
          <div style={{ ...containerStyle, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <video controls style={{ maxWidth: "100%", maxHeight: "100%" }}>
              <source src={getFileDownloadUrl(inputPath)} type={`video/${fileInfo.ext}`} />
              Your browser does not support the video element.
            </video>
          </div>
        );

      default:
        return (
          <div style={{ 
            ...containerStyle, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            flexDirection: 'column'
          }}>
            <div style={{ textAlign: 'center' }}>
              <p>📎 Preview not available for .{fileInfo.ext} files</p>
              <p style={{ color: '#666', fontSize: '14px' }}>
                File type: {fileInfo.type} | Size: {fileInfo.fileName}
              </p>
              <button onClick={handleDownload} style={{
                padding: '12px 24px',
                backgroundColor: '#1976d2',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '16px'
              }}>
                📥 Download File
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Header */}
      <div style={{ 
        marginBottom: '16px', 
        padding: '16px',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        border: '1px solid #e9ecef'
      }}>
        <div style={{ marginBottom: '8px' }}>
          <strong>📁 File Path:</strong> {inputPath || <em style={{ color: '#666' }}>No file selected</em>}
          {fileInfo && (
            <span style={{ marginLeft: '16px', color: '#666', fontSize: '14px' }}>
              Type: {fileInfo.type.toUpperCase()} | Extension: .{fileInfo.ext}
            </span>
          )}
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <input
            type="text"
            value={inputPath}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder="Enter file path... (press Enter to load)"
            style={{ 
              flex: 1,
              padding: '8px 12px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '14px'
            }}
          />
          <button 
            onClick={handleSetPath} 
            style={{
              padding: '8px 16px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            📂 Load File
          </button>
          {inputPath && (
            <button 
              onClick={handleDownload} 
              style={{
                padding: '8px 16px',
                backgroundColor: '#1976d2',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              📥 Download
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      {renderContent()}
    </div>
  );
};