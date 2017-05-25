// Run a node.js web server for local development of a static web site.
// Start with "node server.js" and put pages in a "public" sub-folder.
// Visit the site at the address printed on the console.

// The server is configured to be platform independent.  URLs are made lower
// case, so the server is case insensitive even on Linux, and paths containing
// upper case letters are banned so that the file system is treated as case
// sensitive even on Windows.

// Load the library modules, and define the global constants.
// See http://en.wikipedia.org/wiki/List_of_HTTP_status_codes.
// Start the server: change the port to the default 80, if there are no
// privilege issues and port number 80 isn't already in use.

// TO DO:
    // Check if person's email exists
    // Is the Virtual Table updated??
    // Sort by relevance optimized

"use strict";

var http = require("http");
var fs = require("fs-extra");
var formidable = require('formidable');
var util = require('util');
var sql = require("sqlite3");
var db = new sql.Database("data.db");
db.loadExtension("./okapi_bm25.sqlext");
var OK = 200, NotFound = 404, BadType = 415, Error = 500;
var types, banned;
start(8080);

// Start the http service.  Accept only requests from localhost, for security.
function start(port) {
    types = defineTypes();
    banned = [];
    banUpperCase("./public/", "");
    var service = http.createServer(handle);
    service.listen(port, "localhost");
    var address = "http://localhost";
    if (port != 80) address = address + ":" + port;
    console.log("Server running at", address);
}

// Serve a request by delivering a file.
function handle(request, response) {
    var url = request.url.toLowerCase();
    if (url.startsWith("/item")) handleItem(response, url);
    if (url.startsWith("/create-person")) handleCreatePerson(response, url);
    if (url.startsWith("/success-person")) handleSuccessPerson(request, response, url);
    if (url.startsWith("/add-item")) handleAddItem(response, url);
    if (url.startsWith("/success-item")) handleSuccessItem(request, response, url);
    if (url.startsWith("/detailed-item")) detailedItem(request, response, url);
    if (url.endsWith("/")) handleIndex(response, url);
    if (url.startsWith("/css") || url.startsWith("/img") || url.startsWith("/js") || url.startsWith("/uploads")) handleResources(response, url);
}

function detailedItem(request, response, url) {
  var file = "./public" + url;
  var pieces = "";
  pieces = file.split("?id=");
  var detailedItemId = pieces[1];
  file = pieces[0];
  var type = validate(file, response);
  return specialDetailedItem(response, file, detailedItemId, type);
}

function handleResources(response, url) {
    var type = validate(url, response);
    var file = "./public" + url;
    fs.readFile(file, ready);
    function ready(err, content) { deliver(response, type, err, content); }
}

// Handles the index page.
function handleIndex(response, url) {
    url = url + "index.html";
    var type = validate(url, response);
    var file = "./public" + url;
    fs.readFile(file, ready);
    function ready(err, content) { deliver(response, type, err, content); }
}

// Handles the Item page - on Item ID search.
function handleItem(response, url) {
    var file = "./public" + url;
    var pieces = "";
    pieces = file.split("?title=");
    var searchId = pieces[1];
    file = pieces[0];
    var type = validate(file, response);
    return specialItemSearch(response, file, searchId, type);
}

// Handles the create Person page.
function handleCreatePerson(response, url) {
    var type = validate(url, response);
    var file = "./public" + url;
    fs.readFile(file, ready);
    function ready(err, content) { deliver(response, type, err, content); }
}

// Handles parsing form data using POST method for creating a new person.
function handleSuccessPerson(request, response, url) {
    var file = "./public" + url;
    request.on('data', add);
    request.on('end', end);
    var body = "";
    function add(chunk) {
        body = body + chunk.toString();
    }
    function end() {
        body = decodeURIComponent(body);
        body = body.slice(5);
        var personData = body.split("&name=");
        var type = validate(file, response);
        return specialSuccessPerson(response, file, personData, type);
    }
}

// Handles request for Item page.
function handleAddItem(response, url) {
    var type = validate(url, response);
    var file = "./public" + url;
    fs.readFile(file, ready);
    function ready(err, content) { deliver(response, type, err, content); }
}

// Handles parsing form data using POST method for creating a new item.
// If there's too much data, kill the connection
function handleSuccessItem(request, response, url) {
    var file = "./public" + url;
    var type = validate(file, response);
    var form = new formidable.IncomingForm();
    var picId = "";
    var temp_path;
    var new_location = './public/uploads/';
    var itemData;

    form.parse(request, function(err, fields, files) {
        console.log(util.inspect({fields: fields, files: files}));
        temp_path = files.upload.path;
        var p = temp_path.toString();
        var p2 = p.split("upload_");
        picId = p2[1];
        itemData = fields;
        var imgType = validate(files.upload.name);
        if (imgType.includes("image")) {
            var slash = imgType.lastIndexOf("/");
            var extension = ("."+imgType.substring(slash+1));
            picId += extension;
            console.log(picId);
        }
        else {
            console.log("Picture must be png, gif, jpeg, jpg, svg");
        }
    });

    form.on('progress', function(bytesReceived, bytesExpected) {
        var percent_complete = (bytesReceived / bytesExpected) * 100;
        console.log(percent_complete.toFixed(2));
    });

    form.on('error', function(err) {
        console.error(err);
    });

    form.on('end', function(files) {
        fs.copy(temp_path, new_location + picId, function(err) {
            if (err) {
                console.error(err);
            } else {
                console.log("success!")
            }
        });
        return specialSuccessItem(response, file, itemData, type, picId);
    });
}

// Validates the url.
function validate(url, response) {
    if (isBanned(url)) return fail(response, NotFound, "URL has been banned");
    var type = findType(url);
    console.log(type);
    if (type === null) return fail(response, BadType, "File type unsupported");
    return type;
}

// readFile and runs getData to return page with queried data.
function specialItemSearch(response, file, searchTitle, type) {
    fs.readFile(file, "utf8", ready);
    function ready(fileErr, content) { getDataItem(content, response, searchTitle, type, fileErr); }
}

// need to add validating methods for person input.
function specialSuccessPerson(response, file, personData, type) {
    fs.readFile(file, ready);
    function ready(fileErr, content) { setDataPerson(content, response, personData, type, fileErr); }
}

function specialSuccessItem(response, file, itemData, type, picId) {
    fs.readFile(file, ready);
    function ready(fileErr, content) { checkEmailExists(content, response, itemData, type, fileErr, picId); }
}

function specialDetailedItem(response, file, detailedItemId, type) {
  fs.readFile(file, "utf8", ready);
  function ready(fileErr, content) { getDetailedDataItem(content, response, detailedItemId, type, fileErr); }
}

// Prepares statement, runs query.
// Need to catch edge cases and errors.
// Very simple search on title has to match part of title.l
// Looking into using FTS4 (full text search) a full text search extension for sqlite3.
function getDataItem(content, response, searchTitle, type, fileErr) {
    //split up if multiple words with SQL OR
    searchTitle = searchTitle.replace(/\+/g, " OR ");
    var STMT = db.prepare("SELECT * FROM ItemSearch WHERE ItemSearch MATCH ? ORDER BY okapi_bm25(matchinfo(ItemSearch, 'pcxnal'), 2) DESC");
    STMT.all(searchTitle, ready);
    function ready(err, object) {
        finishItem(content, object, response, type, fileErr); }
    STMT.finalize();
  }

// Shouldnt be joining on email because we dont know if they changed their email
function getDetailedDataItem(content, response, detailedItemId, type, fileErr) {
    var STMT = db.prepare("SELECT Item.title, Item.location, Item.description, Item.postedDate, Item.pictureId, Person.phone FROM Item Join Person ON Item.personEmail = Person.email WHERE Item.id = ?");
    STMT.get(detailedItemId, ready);
    function ready(err, object) {
        finishDetailedItem(content, object, response, type, fileErr); }
    STMT.finalize();
}

// Needs to check if this person's email exists
function setDataPerson(content, response, personData, type, fileErr) {
    var STMT = db.prepare("INSERT INTO Person (name, email, phone) VALUES (?, ?, ?)");
    STMT.run(personData[0], personData[1], personData[2], ready);
    function ready(err, object) { finishPerson(content, object, response, type, fileErr); }
    STMT.finalize();
}

// Checks that the user has entered a validate email address, then alls the set data.
function checkEmailExists(content, response, itemData, type, fileErr, picId) {
    var STMT = db.prepare("SELECT COUNT(id) AS exist FROM Person WHERE Person.email = ?");
    STMT.get(itemData.email, ready);
    // Need to handle the fail where email does not exist in a dynamic way on page, currently crashes server.
    function ready(err, object) {
        if (object.exist == 1) {
            setDataItem(content, response, itemData, type, fileErr, picId);
        } else return fail(response, NotFound, "Email not found");
    }
    STMT.finalize();
}

// Prepares insert statement for new item.
function setDataItem(content, response, itemData, type, fileErr, picId) {
    var STMT = db.prepare("INSERT INTO Item (personEmail, title, description, location, postedDate, pictureId) VALUES (?, ?, ?, ?, datetime('now'), ?)");
    STMT.run(itemData.email, itemData.title, itemData.description, itemData.location, picId, ready);
    function ready(err, object) { finishSetItem(content, object, response, type, fileErr); }
    STMT.finalize();
    // Updates the virtual table with new entry - for search.
    var UPDATE = db.prepare("INSERT INTO ItemSearch SELECT id, title, description, postedDate, location, pictureId FROM Item WHERE Item.pictureId = ?");
    UPDATE.run(picId);
    UPDATE.finalize();
}

// Delivers Item page by splitting content and adding object data.
// If img is deleted from file there needs to be a check to replace with no image found.
function finishItem(content, object, response, type, fileErr) {
    var header = content.split("<!-- {list} -->");
    var s = "";
    var imgURL = "/uploads/";
    for (var i = 0; i < object.length; i++) {
        var img = imgURL + object[i].pictureId;
        console.log(img);
        var pieces = header[1].split("$");
        s += pieces[0]+object[i].id+pieces[1]+img+pieces[2]+object[i].title+pieces[3]+object[i].location+pieces[4]+object[i].description+pieces[5]+object[i].postedDate+pieces[6];
    }
    s = header[0]+s+header[2];
    deliver(response, type, fileErr, s);
}

function finishDetailedItem(content, object, response, type, fileErr) {
    var pieces = content.split("$");
    var imgURL = "/uploads/";
    var img = imgURL + object.pictureId;
    console.log(object.pictureId);
    var s = pieces[0]+img+pieces[1]+object.title+pieces[2]+object.location+pieces[3]+object.description+pieces[4]+object.postedDate+pieces[5]+object.phone+pieces[6];
    deliver(response, type, fileErr, s);
}

function finishPerson(content, object, response, type, fileErr) {
    deliver(response, type, fileErr, content);
}

function finishSetItem(content, object, response, type, fileErr) {
    deliver(response, type, fileErr, content);
}

// Forbid any resources which shouldn't be delivered to the browser.
function isBanned(url) {
    for (var i=0; i<banned.length; i++) {
        var b = banned[i];
        if (url.startsWith(b)) return true;
    }
    return false;
}

// Find the content type to respond with, or undefined.
function findType(url) {
    var dot = url.lastIndexOf(".");
    var extension = url.substring(dot + 1);
    return types[extension];
}

// Deliver the file that has been read in to the browser.
function deliver(response, type, err, content) {
    if (err) return fail(response, NotFound, "File not found");
    var typeHeader = { "Content-Type": type };
    response.writeHead(OK, typeHeader);
    response.write(content);
    response.end();
}

// Give a minimal failure response to the browser
function fail(response, code, text) {
    var textTypeHeader = { "Content-Type": "text/plain" };
    response.writeHead(code, textTypeHeader);
    response.write(text, "utf8");
    response.end();
}

// Check a folder for files/subfolders with non-lowercase names.  Add them to
// the banned list so they don't get delivered, making the site case sensitive,
// so that it can be moved from Windows to Linux, for example. Synchronous I/O
// is used because this function is only called during startup.  This avoids
// expensive file system operations during normal execution.  A file with a
// non-lowercase name added while the server is running will get delivered, but
// it will be detected and banned when the server is next restarted.
function banUpperCase(root, folder) {
    var folderBit = 1 << 14;
    var names = fs.readdirSync(root + folder);
    for (var i=0; i<names.length; i++) {
        var name = names[i];
        var file = folder + "/" + name;
        if (name != name.toLowerCase()) banned.push(file.toLowerCase());
        var mode = fs.statSync(root + file).mode;
        if ((mode & folderBit) == 0) continue;
        banUpperCase(root, file);
    }
}

// The most common standard file extensions are supported, and html is
// delivered as xhtml ("application/xhtml+xml").  Some common non-standard file
// extensions are explicitly excluded.  This table is defined using a function
// rather than just a global variable, because otherwise the table would have
// to appear before calling start().  NOTE: for a more complete list, install
// the mime module and adapt the list it provides.
function defineTypes() {
    var types = {
        html : "application/xhtml+xml",
        css  : "text/css",
        js   : "application/javascript",
        png  : "image/png",
        gif  : "image/gif",    // for images copied unchanged
        jpeg : "image/jpeg",   // for images copied unchanged
        jpg  : "image/jpeg",   // for images copied unchanged
        svg  : "image/svg+xml",
        json : "application/json",
        pdf  : "application/pdf",
        txt  : "text/plain",
        ttf  : "application/x-font-ttf",
        woff : "application/font-woff",
        aac  : "audio/aac",
        mp3  : "audio/mpeg",
        mp4  : "video/mp4",
        webm : "video/webm",
        ico  : "image/x-icon", // just for favicon.ico
        xhtml: undefined,      // non-standard, use .html
        htm  : undefined,      // non-standard, use .html
        rar  : undefined,      // non-standard, platform dependent, use .zip
        doc  : undefined,      // non-standard, platform dependent, use .pdf
        docx : undefined,      // non-standard, platform dependent, use .pdf
    }
    return types;
}
