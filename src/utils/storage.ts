export function saveHistory(userSaid: string, serenioSaid: string) {
  const entry = {
    time: new Date().toLocaleString(),
    userSaid,
    serenioSaid,
    mood: null
  };
  const existing = JSON.parse(localStorage.getItem('serenio-history') || '[]');
  existing.unshift(entry);
  localStorage.setItem('serenio-history', JSON.stringify(existing));
}

export function getHistory() {
  return JSON.parse(localStorage.getItem('serenio-history') || '[]');
}

export function saveMood(mood: string) {
  const today = new Date().toLocaleDateString();
  const moods = JSON.parse(localStorage.getItem('serenio-moods') || '{}');
  moods[today] = mood;
  localStorage.setItem('serenio-moods', JSON.stringify(moods));
}

export function getMoods() {
  return JSON.parse(localStorage.getItem('serenio-moods') || '{}');
}

export function clearHistory() {
  localStorage.removeItem('serenio-history');
}


