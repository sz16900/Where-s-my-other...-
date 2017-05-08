"use strict";
var sql = require("sqlite3");
var db = new sql.Database("data.db");

db.all("select * from Person", show);

function show(err, rows) {
    if (err) throw err;
    console.log(rows);
}
