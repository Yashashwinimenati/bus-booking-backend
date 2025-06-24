const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

// Create database directory if it doesn't exist
const dbDir = path.join(__dirname);
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

// Database file path
const dbPath = path.join(dbDir, 'bus_booking.db');

// Initialize database
function initDatabase() {
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database(dbPath, (err) => {
            if (err) {
                console.error('Error opening database:', err.message);
                reject(err);
                return;
            }
            console.log('Connected to SQLite database.');
        });

        // Read schema file
        const schemaPath = path.join(__dirname, 'schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');

        // Read seeds file
        const seedsPath = path.join(__dirname, 'seeds.sql');
        const seeds = fs.readFileSync(seedsPath, 'utf8');

        // Execute schema
        db.exec(schema, (err) => {
            if (err) {
                console.error('Error creating schema:', err.message);
                reject(err);
                return;
            }
            console.log('Database schema created successfully.');

            // Execute seeds
            db.exec(seeds, (err) => {
                if (err) {
                    console.error('Error inserting seed data:', err.message);
                    reject(err);
                    return;
                }
                console.log('Seed data inserted successfully.');
                
                db.close((err) => {
                    if (err) {
                        console.error('Error closing database:', err.message);
                        reject(err);
                        return;
                    }
                    console.log('Database initialization completed successfully!');
                    resolve();
                });
            });
        });
    });
}

// Run initialization
if (require.main === module) {
    initDatabase()
        .then(() => {
            console.log('Database setup completed!');
            process.exit(0);
        })
        .catch((err) => {
            console.error('Database setup failed:', err);
            process.exit(1);
        });
}

module.exports = { initDatabase }; 