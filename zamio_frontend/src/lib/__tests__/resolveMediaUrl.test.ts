import { beforeAll, describe, expect, it, vi } from 'vitest';

vi.mock('@zamio/ui', async () => {
  const actual = await vi.importActual<typeof import('@zamio/ui')>('@zamio/ui');
  return {
    ...actual,
    resolveApiBaseUrl: () => 'http://localhost:8000/api',
  };
});

let resolveMediaUrl: (input?: string | null) => string | null;

beforeAll(async () => {
  ({ resolveMediaUrl } = await import('../api'));
});

describe('resolveMediaUrl', () => {
  it('returns null for empty values', () => {
    expect(resolveMediaUrl(null)).toBeNull();
    expect(resolveMediaUrl('')).toBeNull();
  });

  it('keeps absolute URLs unchanged', () => {
    const absolute = 'https://cdn.example.com/assets/cover.png';
    expect(resolveMediaUrl(absolute)).toBe(absolute);
  });

  it('resolves relative media paths against the API origin', () => {
    expect(resolveMediaUrl('/media/albums/cover.png')).toBe(
      'http://localhost:8000/media/albums/cover.png',
    );
    expect(resolveMediaUrl('media/albums/cover.png')).toBe(
      'http://localhost:8000/media/albums/cover.png',
    );
  });
});
