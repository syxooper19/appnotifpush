const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(':memory:');

module.exports.initDb = () => {
    db.run("CREATE TABLE subscription (id integer primary key autoincrement , endpoint TEXT)");
};

module.exports.saveSubscription = ( body ) => {
    return new Promise((resolve, reject) => {
        db.run("INSERT INTO subscription (endpoint) VALUES (?)", [JSON.stringify(body)], function(err) {
            if (err) {
                reject(err.message);
            }
            // return last insert id
            resolve( this.lastID );
        });
    })
};

module.exports.getAllEndpoints = () => {
    return new Promise( (resolve, reject) => {
        let sql = "SELECT id, endpoint FROM subscription";
        db.all(sql, [], (err, rows) => {
            if (err) {
                reject( err );
            }
            let list = [];
            rows.forEach( (row) => {
                list.push({
                    id: row.id,
                    subscritor: JSON.parse(row.endpoint)
                })
            });
            resolve( list );
        });
    })
};

module.exports.delSubscription = (id) => {
    console.log("delete : "+id)

};