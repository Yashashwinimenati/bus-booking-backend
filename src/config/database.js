const sqlite3 = require('sqlite3').verbose();
const path = require('path');

class Database {
    constructor() {
        this.dbPath = path.join(__dirname, '../../database/bus_booking.db');
        this.db = null;
    }

    connect() {
        return new Promise((resolve, reject) => {
            this.db = new sqlite3.Database(this.dbPath, (err) => {
                if (err) {
                    console.error('Error connecting to database:', err.message);
                    reject(err);
                    return;
                }
                console.log('Connected to SQLite database.');
                resolve();
            });
        });
    }

    disconnect() {
        return new Promise((resolve, reject) => {
            if (this.db) {
                this.db.close((err) => {
                    if (err) {
                        console.error('Error closing database:', err.message);
                        reject(err);
                        return;
                    }
                    console.log('Database connection closed.');
                    resolve();
                });
            } else {
                resolve();
            }
        });
    }

    run(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.run(sql, params, function(err) {
                if (err) {
                    console.error('Error running query:', err.message);
                    reject(err);
                    return;
                }
                resolve({ id: this.lastID, changes: this.changes });
            });
        });
    }

    get(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.get(sql, params, (err, row) => {
                if (err) {
                    console.error('Error getting row:', err.message);
                    reject(err);
                    return;
                }
                resolve(row);
            });
        });
    }

    all(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.all(sql, params, (err, rows) => {
                if (err) {
                    console.error('Error getting rows:', err.message);
                    reject(err);
                    return;
                }
                resolve(rows);
            });
        });
    }

    transaction(callback) {
        return new Promise((resolve, reject) => {
            this.db.serialize(() => {
                this.db.run('BEGIN TRANSACTION');
                
                callback(this)
                    .then(() => {
                        this.db.run('COMMIT', (err) => {
                            if (err) {
                                this.db.run('ROLLBACK');
                                reject(err);
                            } else {
                                resolve();
                            }
                        });
                    })
                    .catch((err) => {
                        this.db.run('ROLLBACK');
                        reject(err);
                    });
            });
        });
    }
}

// Create singleton instance
const database = new Database();

module.exports = database; 