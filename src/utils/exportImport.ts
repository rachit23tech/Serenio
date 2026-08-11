export interface BackupData {
  version: string;
  timestamp: string;
  data: Record<string, any>;
}

const STORAGE_KEYS = [
  'serenio-sessions',
  'serenio-moodlog',
  'serenio-habits',
  'serenio-medications',
  'serenio-appointments',
  'serenio-moods',
  'serenio-theme',
  'serenio-helpline-region',
];

/**
 * Exports all Serenio localStorage items into a JSON backup file download
 */
export function exportData(): void {
  const exportPayload: Record<string, any> = {};

  for (const key of STORAGE_KEYS) {
    const raw = localStorage.getItem(key);
    if (raw !== null) {
      try {
        exportPayload[key] = JSON.parse(raw);
      } catch {
        exportPayload[key] = raw;
      }
    }
  }

  const backup: BackupData = {
    version: '1.0',
    timestamp: new Date().toISOString(),
    data: exportPayload,
  };

  const jsonStr = JSON.stringify(backup, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const dateStr = new Date().toISOString().split('T')[0];
  const a = document.createElement('a');
  a.href = url;
  a.download = `serenio-backup-${dateStr}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Imports a JSON backup file and updates localStorage
 */
export function importData(jsonContent: string): { success: boolean; count: number; error?: string } {
  try {
    const parsed: BackupData = JSON.parse(jsonContent);
    if (!parsed || typeof parsed !== 'object' || !parsed.data) {
      return { success: false, count: 0, error: 'Invalid backup file format.' };
    }

    let restoredCount = 0;
    for (const [key, value] of Object.entries(parsed.data)) {
      if (STORAGE_KEYS.includes(key)) {
        const valStr = typeof value === 'string' ? value : JSON.stringify(value);
        localStorage.setItem(key, valStr);
        restoredCount++;
      }
    }

    return { success: true, count: restoredCount };
  } catch (err) {
    return {
      success: false,
      count: 0,
      error: err instanceof Error ? err.message : 'Failed to parse JSON file.',
    };
  }
}

/**
 * Estimates storage usage in bytes and percentage (if supported by browser)
 */
export async function getStorageEstimate(): Promise<{ usedBytes: number; quotaBytes: number; formattedUsed: string }> {
  if (navigator.storage && navigator.storage.estimate) {
    try {
      const { usage = 0, quota = 0 } = await navigator.storage.estimate();
      const usedMB = (usage / (1024 * 1024)).toFixed(2);
      return {
        usedBytes: usage,
        quotaBytes: quota,
        formattedUsed: `${usedMB} MB`,
      };
    } catch {
      // Fallback
    }
  }

  // Fallback to local storage length calculation
  let totalChars = 0;
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k) {
      totalChars += (k.length + (localStorage.getItem(k)?.length || 0));
    }
  }
  const approxKB = (totalChars / 1024).toFixed(1);
  return {
    usedBytes: totalChars,
    quotaBytes: 5 * 1024 * 1024,
    formattedUsed: `${approxKB} KB`,
  };
}
