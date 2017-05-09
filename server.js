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

"use strict";

var http = require("http");
var fs = require("fs");
var sql = require("sqlite3");
var db = new sql.Database("data.db");
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
    if (url.endsWith("/")) handleIndex(response, url);
    if (url.startsWith("/item")) handleItem(response, url);
    if (url.startsWith("/create-person")) handleCreatePerson(response, url);
    if (url.startsWith("/success-person")) handleSuccessPerson(response, url);
    if (url.startsWith("/add-item")) handleAddItem(response, url);
    if (url.startsWith("/success-item")) handleSuccessItem(response, url);

    // validate(url, response);
}

// Handles the index page.
function handleIndex(response, url) {
    url = url + "index.html";
    var type = validate(url, response);
    var file = "./public" + url;
    fs.readFile(file, ready);
    function ready(err, content) { deliver(response, type, err, content); }
}

// Handles the Item page.
function handleItem(response, url) {
    var file = "./public" + url;
    var pieces = file.split("?id=");
    var searchId = pieces[1];
    file = pieces[0];
    var type = validate(file, response);
    return specialItemSearch(response, file, searchId, type);
}

// Handles the create Person page.
function handleCreatePerson(response, url) {
    console.log("url in: "+url);
    var type = validate(url, response);
    var file = "./public" + url;
    console.log("file: "+file);
    fs.readFile(file, ready);
    function ready(err, content) { deliver(response, type, err, content); }
}

function handleSuccessPerson(response, url) {
    console.log(url);
    var file = "./public" + url;
    var pieces = file.split("?name=");
    var information = pieces[1];
    file = pieces[0];
    var information2 = information.split("&name=");
    console.log(information2);
    information2[1] = information2[1].replace("%40", "@");
    var type = validate(file, response);
    return specialSuccessPerson(response, file, information2, type);
}

function handleAddItem(response, url) {
    console.log("url in: "+url);
    var type = validate(url, response);
    var file = "./public" + url;
    console.log("file: "+file);
    fs.readFile(file, ready);
    function ready(err, content) { deliver(response, type, err, content); }
}

function handleSuccessItem(response, url) {
    console.log(url);
    var file = "./public" + url;
    var pieces = file.split("?name=");
    var information = pieces[1];
    file = pieces[0];
    var information2 = information.split("&name=");
    // console.log(information2);
    information2[0] = information2[0].replace("%40", "@");
    var type = validate(file, response);
    return specialSuccessItem(response, file, information2, type);
}

// Validates the url.
function validate(url, response) {
    if (isBanned(url)) return fail(response, NotFound, "URL has been banned");
    var type = findType(url);
    if (type === null) return fail(response, BadType, "File type unsupported");
    return type;
}

// readFile and runs getData to return page with queried data.
function specialItemSearch(response, file, searchId, type) {
    fs.readFile(file, ready);
    function ready(fileErr, content) { getDataItem(content, response, searchId, type, fileErr); }
}

function specialSuccessPerson(response, file, information2, type) {
    fs.readFile(file, ready);
    function ready(fileErr, content) { setDataPerson(content, response, information2, type, fileErr); }
}

function specialSuccessItem(response, file, information2, type) {
    fs.readFile(file, ready);
    function ready(fileErr, content) { setDataItem(content, response, information2, type, fileErr); }
}

// Prepares statement, runs query.
// Need to catch edge cases and errors.
function getDataItem(content, response, searchId, type, fileErr) {
    var STMT = db.prepare("select * from Item where Item.id = ? ");
    STMT.get(searchId, ready);
    function ready(err, object) { finishItem(content, object, response, type, fileErr); }
    STMT.finalize();
  }

function setDataPerson(content, response, information2, type, fileErr) {
    var STMT = db.prepare("insert into Person (name, email, phone) values (?, ?, ?)");
    STMT.run(information2[0], information2[1], information2[2], ready);
    function ready(err, object) { finishPerson(content, object, response, type, fileErr); }
    STMT.finalize();
}

function setDataItem(content, response, information2, type, fileErr) {
    console.log(information2);
    checkEmailExists(information2[0], response);
    var STMT = db.prepare("insert into Item (personEmail, title, description) values (?, ?, ?)");
    STMT.run(information2[0], information2[1], information2[2], ready);
    function ready(err, object) { finishSetItem(content, object, response, type, fileErr); }
    STMT.finalize();
}

function checkEmailExists(email, response) {
    var STMT = db.prepare("SELECT COUNT(id) AS exist FROM Person WHERE Person.email = ?");
    STMT.get(email, ready);
    // Need to handle the fail where email does not exist in a dynamic way on page, currently crashes server.
    function ready(err, object) { if (object.exist != 1) return fail(response, NotFound, "Email not found"); }
    STMT.finalize();
}

// Delivers Item page by splitting content and adding object data.
function finishItem(content, object, response, type, fileErr) {
    var c = content+"";
    var pieces = c.split("$");
    var s = pieces[0]+object.id+pieces[1]+object.title+pieces[2]+object.description+pieces[3];
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


/*--------------------------------Form Handling-------------------------------*/
