var sql = require("sqlite3");
var db = new sql.Database("data.db");


function valForm (form) {
  var item;
  item = form.first.value;

  // checks

  var STMT = db.prepare("select * from Item where Item.id = ? ");
  STMT.run(item, show);
  STMT.finalize();

  function show(err, rows) {
      if (err) throw err;
      console.log(rows);
  }

}
