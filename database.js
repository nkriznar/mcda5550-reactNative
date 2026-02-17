import * as SQLite from 'expo-sqlite';

// Open the database
const db = SQLite.openDatabaseSync('weather.db');

// 1. Initialize the table
export const initDB = () => {
    db.execSync(`
    CREATE TABLE IF NOT EXISTS locations (
      id INTEGER PRIMARY KEY NOT NULL,
      cityName TEXT NOT NULL,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL
    );
  `);
};

// 2. Get all saved locations
export const getSavedLocations = () => {
    return db.getAllSync('SELECT * FROM locations');
};

// 3. Add a location (With the < 5 limit check) [cite: 526, 561]
export const saveLocation = (cityName, lat, lon) => {
    const existing = db.getAllSync('SELECT * FROM locations');

    if (existing.length >= 5) {
        throw new Error("You can only save up to 5 locations."); // Handle this in UI
    }

    // Check if already exists to avoid duplicates (optional but good UX)
    const isDuplicate = existing.some(l => l.cityName === cityName);
    if (isDuplicate) return;

    db.runSync('INSERT INTO locations (cityName, latitude, longitude) VALUES (?, ?, ?)', [cityName, lat, lon]);
};

// 4. Remove a location 
export const removeLocation = (id) => {
    db.runSync('DELETE FROM locations WHERE id = ?', [id]);
};