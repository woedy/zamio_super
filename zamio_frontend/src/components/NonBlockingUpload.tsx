import React, { useState, useCallback } from 'react';
import { Upload, CheckCircle, XCircle, Clock, AlertCircle, Loader2 } from 'lucide-react';
import { baseUrl, userToken } from '../constants';

interface UploadStatus {
  upload_id: string;
  status: 'queued' | 'processing' | 'completed' | 'failed' | 'cancelled';
  progress_percentage: number;
  current_step: string;
  upload_type: string;
  original_filename: string;
  file_size: number;
  error_message?: string;
  created_at: string;
  started_at?: string;
  completed_at?: string;
  entity_details?: {
    id: number;
    title: string;
    processing_status: string;
    can_be_published: boolean;
    contributor_splits_valid: boolean;
    audio_file_url?: string;
    cover_art_url?: string;
  };
  metadata: any;
}

interface NonBlockingUploadProps {
  uploadType: 'track_audio' | 'track_cover' | 'album_cover';
  onUploadComplete?: (result: UploadStatus) => void;
  onUploadError?: (error: string) => void;
  metadata?: {
    title?: string;
    track_id?: number;
    album_id?: number;
    genre_id?: number;
    release_date?: string;
    explicit?: boolean;
    lyrics?: string;
  };
  acceptedFileTypes?: string;
  maxFileSize?: number;
  className?: string;
}

export const NonBlockingUpload: React.FC<NonBlockingUploadProps> = ({
  uploadType,
  onUploadComplete,
  onUploadError,
  metadata = {},
  acceptedFileTypes = uploadType === 'track_audio' ? 'audio/mpeg,audio/wav' : 'image/jpeg,image/png,image/webp',
  maxFileSize = uploadType === 'track_audio' ? 100 * 1024 * 1024 : 10 * 1024 * 1024, // 100MB for audio, 10MB for images
  className = ''
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Poll for upload status
  const pollUploadStatus = useCallback(async (uploadId: string) => {
    try {
      const response = await fetch(`${baseUrl}api/artists/upload-status/${uploadId}/`, {
        headers: {
          'Authorization': `Token ${userToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch upload status');
      }

      const data = await response.json();
      const status: UploadStatus = data.data;
      
      setUploadStatus(status);

      // Continue polling if still processing
      if (status.status === 'queued' || status.status === 'processing') {
        setTimeout(() => pollUploadStatus(uploadId), 2000); // Poll every 2 seconds
      } else if (status.status === 'completed') {
        setIsUploading(false);
        onUploadComplete?.(status);
      } else if (status.status === 'failed') {
        setIsUploading(false);
        const errorMsg = status.error_message || 'Upload failed';
        setError(errorMsg);
        onUploadError?.(errorMsg);
      }
    } catch (err) {
      console.error('Error polling upload status:', err);
      setError('Failed to check upload status');
      setIsUploading(false);
    }
  }, [onUploadComplete, onUploadError]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      setSelectedFile(null);
      return;
    }

    // Validate file size
    if (file.size > maxFileSize) {
      const maxSizeMB = Math.round(maxFileSize / (1024 * 1024));
      setError(`File size exceeds ${maxSizeMB}MB limit`);
      return;
    }

    // Validate file type
    const allowedTypes = acceptedFileTypes.split(',').map(type => type.trim());
    if (!allowedTypes.includes(file.type)) {
      setError(`File type ${file.type} is not allowed`);
      return;
    }

    setSelectedFile(file);
    setError(null);
    setUploadStatus(null);
  };

  const initiateUpload = async () => {
    if (!selectedFile) {
      setError('Please select a file');
      return;
    }

    setIsUploading(true);
    setError(null);
    setUploadStatus(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('upload_type', uploadType);
      
      // Add metadata
      Object.entries(metadata).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, String(value));
        }
      });

      const response = await fetch(`${baseUrl}api/artists/upload/initiate/`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${userToken}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Upload initiation failed');
      }

      const uploadId = data.data.upload_id;
      
      // Start polling for status
      pollUploadStatus(uploadId);

    } catch (err: any) {
      setIsUploading(false);
      const errorMsg = err.message || 'Upload failed';
      setError(errorMsg);
      onUploadError?.(errorMsg);
    }
  };

  const cancelUpload = async () => {
    if (!uploadStatus?.upload_id) return;

    try {
      const response = await fetch(`${baseUrl}api/artists/upload/${uploadStatus.upload_id}/cancel/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Token ${userToken}`,
        },
      });

      if (response.ok) {
        setUploadStatus(prev => prev ? { ...prev, status: 'cancelled' } : null);
        setIsUploading(false);
      }
    } catch (err) {
      console.error('Error cancelling upload:', err);
    }
  };

  const getStatusIcon = () => {
    if (!uploadStatus) return null;

    switch (uploadStatus.status) {
      case 'queued':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'processing':
        return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />;
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'cancelled':
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
      default:
        return null;
    }
  };

  const getStatusText = () => {
    if (!uploadStatus) return '';

    switch (uploadStatus.status) {
      case 'queued':
        return 'Queued for processing...';
      case 'processing':
        return uploadStatus.current_step || 'Processing...';
      case 'completed':
        return 'Upload completed successfully!';
      case 'failed':
        return `Upload failed: ${uploadStatus.error_message}`;
      case 'cancelled':
        return 'Upload cancelled';
      default:
        return '';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* File Selection */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
        <input
          type="file"
          accept={acceptedFileTypes}
          onChange={handleFileSelect}
          className="hidden"
          id={`file-upload-${uploadType}`}
          disabled={isUploading}
        />
        <label
          htmlFor={`file-upload-${uploadType}`}
          className={`cursor-pointer ${isUploading ? 'cursor-not-allowed opacity-50' : ''}`}
        >
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-lg font-medium text-gray-700 mb-2">
            {selectedFile ? selectedFile.name : 'Choose file to upload'}
          </p>
          <p className="text-sm text-gray-500">
            {uploadType === 'track_audio' 
              ? 'MP3 or WAV files up to 100MB' 
              : 'JPEG, PNG, or WebP images up to 10MB'
            }
          </p>
          {selectedFile && (
            <p className="text-sm text-gray-600 mt-2">
              Size: {formatFileSize(selectedFile.size)}
            </p>
          )}
        </label>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <div className="flex items-center">
            <XCircle className="w-5 h-5 mr-2" />
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Upload Status */}
      {uploadStatus && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              {getStatusIcon()}
              <span className="font-medium">{uploadStatus.original_filename}</span>
            </div>
            {uploadStatus.status === 'processing' && (
              <button
                onClick={cancelUpload}
                className="text-sm text-red-600 hover:text-red-800"
              >
                Cancel
              </button>
            )}
          </div>
          
          <p className="text-sm text-gray-600 mb-2">{getStatusText()}</p>
          
          {/* Progress Bar */}
          {(uploadStatus.status === 'processing' || uploadStatus.status === 'queued') && (
            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadStatus.progress_percentage}%` }}
              />
            </div>
          )}
          
          <div className="text-xs text-gray-500">
            <span>Progress: {uploadStatus.progress_percentage}%</span>
            {uploadStatus.started_at && (
              <span className="ml-4">
                Started: {new Date(uploadStatus.started_at).toLocaleTimeString()}
              </span>
            )}
            {uploadStatus.completed_at && (
              <span className="ml-4">
                Completed: {new Date(uploadStatus.completed_at).toLocaleTimeString()}
              </span>
            )}
          </div>

          {/* Entity Details */}
          {uploadStatus.entity_details && (
            <div className="mt-3 p-3 bg-white rounded border">
              <h4 className="font-medium text-sm mb-2">Track Details:</h4>
              <div className="text-xs text-gray-600 space-y-1">
                <p><strong>Title:</strong> {uploadStatus.entity_details.title}</p>
                <p><strong>Status:</strong> {uploadStatus.entity_details.processing_status}</p>
                <p><strong>Can be published:</strong> {uploadStatus.entity_details.can_be_published ? 'Yes' : 'No'}</p>
                <p><strong>Contributor splits valid:</strong> {uploadStatus.entity_details.contributor_splits_valid ? 'Yes' : 'No'}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Upload Button */}
      {selectedFile && !isUploading && !uploadStatus && (
        <button
          onClick={initiateUpload}
          className="w-full bg-emerald-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-colors"
        >
          <Upload className="w-5 h-5 inline mr-2" />
          Start Upload
        </button>
      )}
    </div>
  );
};

export default NonBlockingUpload;