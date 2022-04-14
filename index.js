const dbPath = "./db/chinook.db";

//? Sqlite Database
const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        return console.log(err.message);
    }
    console.log("Connected to chinook database.");
});

//? Redis Database
const redis = require("redis");

const client = redis.createClient(); //* Connect to localhost:6379 automaticly

// client.on("error", (err) => console.log(err)); //* Handle Error

//* Query
const query = "SELECT TrackId as track from playlist_track";

//? Creating Timer
console.time("Query_Time");

//? Check to see if query result is in cache
client.get(query, (err, value) => {
    if (err) {
        return console.log(err);
    }

    if (value) {
        client.DEL(query);
        console.log(`Redis Cache : Number of records -> ${value}`);
        return console.timeEnd("Query_Time");
    } else {
        db.serialize(() => {
            db.all(query, (err, value) => {
                if (err) {
                    return console.log(err);
                }

                if (value) {
                    console.timeEnd("Query_Time");
                    console.log(
                        `Sqlite Query : Number of records -> ${value.length}`
                    );
                }

                //? How to set redis key, value
                client.set(query, value.length, (err) => {
                    if (err) {
                        return console.log(err);
                    }

                    //* Redis can have expiration time.
                    // client.expire(query, 20)
                });
                //? End of redis set
                return db.close();
            });
        });
    }
});
