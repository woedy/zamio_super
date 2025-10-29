import { render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import UploadManagement from '../UploadManagement';
import {
  fetchUploadManagement,
  fetchUploadStatusById,
} from '../../lib/api';

vi.mock('../../lib/api', () => ({
  fetchUploadManagement: vi.fn(),
  initiateUpload: vi.fn(),
  fetchUploadStatusById: vi.fn(),
  cancelUploadRequest: vi.fn(),
  deleteUploadRequest: vi.fn(),
  createAlbumForUploads: vi.fn(),
}));

const mockedFetchUploadManagement = vi.mocked(fetchUploadManagement);
const mockedFetchUploadStatusById = vi.mocked(fetchUploadStatusById);

describe('UploadManagement', () => {
  beforeEach(() => {
    mockedFetchUploadManagement.mockResolvedValue({
      data: {
        uploads: [
          {
            id: 'upload_1',
            upload_id: 'upload_1',
            status: 'completed',
            raw_status: 'completed',
            progress: 100,
            upload_type: 'track_audio',
            filename: 'song_one.mp3',
            file_size: 1048576,
            file_type: 'audio/mpeg',
            upload_date: '2024-01-01T00:00:00Z',
            error: null,
            retry_count: 0,
            duration: '3:30',
            artist: 'Artist One',
            album: 'Album Alpha',
            title: 'Song One',
            station: 'Station A',
            entity_id: 42,
            metadata: {},
          },
        ],
        pagination: {
          page: 1,
          page_size: 5,
          total_count: 1,
          total_pages: 1,
          has_next: false,
          has_previous: false,
        },
        stats: {
          total: 1,
          uploading: 0,
          processing: 0,
          completed: 1,
          failed: 0,
        },
        filters: {
          albums: ['Album Alpha'],
        },
      },
    });

    mockedFetchUploadStatusById.mockResolvedValue({
      data: {
        upload_id: 'upload_1',
        status: 'completed',
        progress_percentage: 100,
      },
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders data from the upload management API', async () => {
    render(
      <MemoryRouter>
        <UploadManagement />
      </MemoryRouter>,
    );

    expect(screen.getByText(/Loading uploads/i)).toBeInTheDocument();

    const filenameCell = await screen.findByText('song_one.mp3');
    expect(filenameCell).toBeInTheDocument();
    expect(screen.getByText('Artist One - Album Alpha - Song One')).toBeInTheDocument();
    expect(screen.getByText('Station: Station A')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.queryByText(/Loading uploads/i)).not.toBeInTheDocument();
    });

    const totalFilesCard = screen.getByText('Total Files').closest('div');
    expect(totalFilesCard).not.toBeNull();
    expect(within(totalFilesCard as HTMLElement).getByText('1')).toBeInTheDocument();

    expect(mockedFetchUploadManagement).toHaveBeenCalled();
    const firstCall = mockedFetchUploadManagement.mock.calls[0][0];
    expect(firstCall).toMatchObject({
      page: 1,
      page_size: 5,
      sort_by: 'uploadDate',
      sort_order: 'desc',
    });
  });

  it('refreshes an upload when the refresh action is clicked', async () => {
    render(
      <MemoryRouter>
        <UploadManagement />
      </MemoryRouter>,
    );

    await screen.findByText('song_one.mp3');

    const refreshButton = screen.getByRole('button', { name: 'Refresh status' });
    refreshButton.click();

    await waitFor(() => {
      expect(mockedFetchUploadStatusById).toHaveBeenCalledWith('upload_1');
    });
  });
});
