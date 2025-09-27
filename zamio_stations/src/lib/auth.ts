const safeRead = (reader: () => string | null): string => {
  try {
    return reader() || '';
  } catch {
    return '';
  }
};

const safeWrite = (writer: () => void) => {
  try {
    writer();
  } catch {
    /* ignore storage write failures */
  }
};

export const getStationId = (): string => {
  const fromLocal = safeRead(() => localStorage.getItem('station_id'));
  if (fromLocal) {
    return fromLocal;
  }
  return safeRead(() => sessionStorage.getItem('station_id'));
};

export const persistStationId = (stationId: string): void => {
  const trimmed = typeof stationId === 'string' ? stationId.trim() : '';
  if (!trimmed) {
    return;
  }

  safeWrite(() => localStorage.setItem('station_id', trimmed));
  safeWrite(() => sessionStorage.setItem('station_id', trimmed));
};

export const clearStationId = (): void => {
  safeWrite(() => localStorage.removeItem('station_id'));
  safeWrite(() => sessionStorage.removeItem('station_id'));
};

export const getToken = (): string => {
  try {
    return localStorage.getItem('token') || sessionStorage.getItem('token') || '';
  } catch {
    return '';
  }
};

