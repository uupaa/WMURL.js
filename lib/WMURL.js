/*
var urlObject = WMURL.parse("http://user:pass@example.com:8080/dir1/dir2/file.ext?a=b;c=d#hash");

urlObject = {
    href:       "http://user:pass@example.com:8080/dir1/dir2/file.ext?a=b;c=d#hash",
    protocol:   "http:",
    origin:     "http://example.com:8080",
    host:       "example.com:8080",
    hostname:   "example.com",
    port:       "8080",
    username:   "user",
    password:   "pass",
    pathname:   "/dir1/dir2/file.ext",
    search:     "?a=b;c=d",
    hash:       "#hash",
    // --- extras properties ---
    scheme:     "http:",
    path:       "/dir1/dir2/file.ext?a=b;c=d#hash",
    dir:        "/dir1/dir2/",                // [!] has last slash
    file:       "file.ext",
    fragment:   "#fragment"
};

var urlObject = new window.URL("http://user:pass@example.com:8080/dir1/dir2/file.ext?a=b;c=d#hash");

urlObject = {
    href:       "http://user:pass@example.com:8080/dir1/dir2/file.ext?a=b;c=d#hash",
    protocol:   "http:",
    origin:     "http://example.com:8080",
    host:       "example.com:8080",
    hostname:   "example.com",
    port:       "8080",
    username:   "user"
    password:   "pass",
    pathname:   "/dir1/dir2/file.ext",
    search:     "?a=b;c=d",
    hash:       "#hash"
};
 */
(function(global) {

// --- dependency modules ----------------------------------
// --- define / local variables ----------------------------
//var _runOnNode = "process" in global;
//var _runOnWorker = "WorkerLocation" in global;
var _runOnBrowser = "document" in global;

var PORT_NUMBER = { "http:": "80", "https:": "443", "ws:": "81", "wss:": "816" };
var REGEXP_URL  = /^(\w+:)\/\/(?:(?:([\w:]+)@)?([^\/:]+)(?::(\d*))?)([^ :?#]*)(?:(\?[^#]*))?(?:(#.*))?$/;
                //  ~~~~~~~~~       ~~~~~~~~~~ ~~~~~~~~~   ~~~~~~~  ~~~~~~~~~~   ~~~~~~~~~     ~~~~~
                //  https://        user:pass@ server      :port    /dir/f.ext   ?key=value    #hash
                //  [1]             [2]        [3]          [4]     [5]          [6]           [7]

var REGEXP_FILE = /^(file:)\/\/(?:localhost)?([^ ?#]*)(?:(\?[^#]*))?(?:(#.*))?$/i;
                //  ~~~~~~~~~~~   ~~~~~~~~~  ~~~~~~~~~   ~~~~~~~~~     ~~~~~
                //                localhost  /dir/f.ext  ?key=value    #hash
                //  [1]                      [2]         [3]           [4]

var REGEXP_PATH = /^([^ ?#]*)(?:(\?[^#]*))?(?:(#.*))?$/;
                //  ~~~~~~~~~   ~~~~~~~~~     ~~~~~
                //  /dir/f.ext  key=value     hash
                //  [1]         [2]           [3]


// --- class / interfaces ----------------------------------
function WMURL(url) { // @ret URLString
                      // @ret URLObject - WMURL.parse(urlString) result
    return WMURL.parse(url);
}

//{@dev
WMURL["repository"] = "https://github.com/uupaa/WMURL.js";
//}@dev

WMURL["valid"]      = WMURL_valid;        // WMURL.valid(url:URLString):Boolean
WMURL["parse"]      = WMURL_parse;        // WMURL.parse(url:URLString):URLObject
WMURL["build"]      = WMURL_build;        // WMURL.build(obj:URLObject):URLString
WMURL["resolve"]    = WMURL_resolve;      // WMURL.resolve(url:URLString, basePath:URLString = ""):URLString
WMURL["normalize"]  = WMURL_normalize;    // WMURL.normalize(url:URLString):URLString
WMURL["isAbsolute"] = WMURL_isAbsolute;   // WMURL.isAbsolute(url:URLString):Boolean
WMURL["isRelative"] = WMURL_isRelative;   // WMURL.isRelative(url:URLString):Boolean
WMURL["buildQuery"] = WMURL_buildQuery;   // WMURL.buildQuery(url:URLQueryObject, joint:String = "&"):URLQueryString
WMURL["parseQuery"] = WMURL_parseQuery;   // WMURL.parseQuery(queryString:URLString/URLQueryString):URLQueryObject

// --- implements ------------------------------------------
function WMURL_valid(url) { // @arg URLString - absolute url or relative url
                            // @ret Boolean
                            // @desc validate URL
//{@dev
    $valid($type(url, "String"), WMURL_valid, "url");
//}@dev

    return !!_parse(url);
}

function WMURL_parse(url) { // @arg URLString - absolute url or relative url
                            // @ret URLObject - { href, ... hash }
                            // @desc parse URL
//{@dev
    $valid($type(url, "String"), WMURL_parse, "url");
//}@dev

    return _parse(url) || { "href": url };
}

function _parse(url) { // @arg URLString
                       // @ret URLObject|null - null is error
    var m = REGEXP_FILE.exec(url);

    if (m) {
        return _createURLObject({
            "href":     url,
            "protocol": m[1] || "",
            "hostname": "",
            "port":     "",
            "pathname": m[2] || "",
            "search":   m[3] || "",
            "hash":     m[4] || ""
        }, ["", ""]);
    }
    m = REGEXP_URL.exec(url);
    if (m) {
        return _createURLObject({
            "href":     url,
            "protocol": m[1],
            "hostname": m[3],
            "port":     m[4] ? m[4] : (PORT_NUMBER[m[1]] || ""),
            "pathname": m[5] || "",
            "search":   m[6] || "",
            "hash":     m[7] || ""
        }, (m[2] || ":").split(":")); // [username, password]
    }
    m = REGEXP_PATH.exec(url);
    if (m) {
        return _createURLObject({
            "href":     url,
            "protocol": "",
            "hostname": "",
            "port":     "",
            "pathname": m[1] || "",
            "search":   m[2] || "",
            "hash":     m[3] || ""
        }, ["", ""]);
    }
    return null;
}

function _createURLObject(obj,    // @arg URLObject - { href, protocol, hostname, port, pathname, search, hash }
                          auth) { // @arg StringArray - [username, password]
                                  // @ret URLObject
    var host = obj["port"] ? (obj["hostname"] + ":" + obj["port"]) : obj["hostname"];

    obj["origin"]   = obj["protocol"] ? (obj["protocol"] + "//" + host) : host;
    obj["host"]     = host;
    obj["username"] = auth[0];
    obj["password"] = auth[1];

    // --- extras properties ---
    var path = obj["pathname"].split("/"); // "/dir1/dir2/file.ext" -> ["", "dir1", "dir2", "file.ext"]
    var file = path.pop();
    var dir  = path.join("/");

    obj["scheme"]   = obj["protocol"];
    obj["path"]     = obj["pathname"] + obj["search"] + obj["hash"];
    obj["dir"]      = dir;
    obj["file"]     = file;
    obj["fragment"] = obj["hash"];

    return obj;
}

function WMURL_build(obj) { // @arg URLObject - { protocol, username, password, hostname, port, pathname, search, hash }
                            // @ret URLString - "http://..."
                            // @desc build URL
//{@dev
    $valid($type(obj, "Object"), WMURL_build, "obj");
//}@dev

    var protocol = obj["protocol"] || obj["sceheme"] || "";
    var username = obj["username"] || "";
    var password = obj["password"] || "";
    var hostname = obj["hostname"] || "";
    var pathname = obj["pathname"] || "/";
    var port     = obj["port"]     || "";
    var search   = obj["search"]   || "";
    var hash     = obj["hash"]     || obj["fragment"] || "";
    var slash    = "";
    var auth     = "";

    // --- normalize ---
    if (protocol) {
        slash = "//";
        if (!hostname) {
            slash += "/"; // "file://localhost/file" <-> "file:///file"
        }
    }
    if (username && password) {
        auth = username + ":" + password + "@";
    }
    // port number normalize. "http://example.com:80" -> "http://example.com"
    if (!protocol || PORT_NUMBER[protocol] === port) {
        port = "";
    }

    return [
        protocol, slash,                            // "http://"
        auth, hostname, port ? (":" + port) : port, // "user:pass@domain.com:port"
        pathname, search, hash                      // "/dir/file.ext?search#hash"
    ].join("");
}

function WMURL_resolve(url,        // @arg URLString - relative URL or absolute URL
                       basePath) { // @arg URLString = "" - base path.
                                   // @ret URLString - absolute URL
                                   // @desc Convert relative URL to absolute URL.
//{@dev
    $valid($type(url,      "String"),         WMURL_resolve, "url");
    $valid($type(basePath, "URLString|omit"), WMURL_resolve, "basePath");
//}@dev

    if (WMURL_isAbsolute(url)) {
        return url;
    }
    if (basePath) {
        return WMURL_normalize(basePath + "/" + url);
    }
    if (_runOnBrowser) {
        var a = global["document"]["createElement"]("a");

        a["setAttribute"]("href", url);       // <a href="hoge.htm">
        return a["cloneNode"](false)["href"]; // -> "http://example.com/hoge.htm"
    }
    return url;
}

function WMURL_normalize(url) { // @arg URLString
                                // @ret URLString
                                // @desc Path normalize.
//{@dev
    $valid($type(url, "String"), WMURL_normalize, "url");
//}@dev

    var obj = WMURL_parse(url);
    var normalizedPath = obj["dir"].split("/").reduce(function(result, path) {
            if (path === "..") {
                result.pop();
                if (!result.length) {
                    result.unshift("/"); // root dir
                }
            } else if ( !/^\.+$/.test(path) ) {
                result.push(path);
            }
            return result;
        }, []).join("/");

    // tidy slash "///" -> "/"
    obj["pathname"] = (normalizedPath + "/").replace(/\/+/g, "/") + obj["file"];

    return WMURL_build(obj);
}

function WMURL_isAbsolute(url) { // @arg URLString
                                 // @ret Boolean - true is absolute url
                                 // @desc URL is absolute.
//{@dev
    $valid($type(url, "String"), WMURL_isAbsolute, "url");
//}@dev

    var hasProtocol = /^(https?|wss?):/;

    return hasProtocol.test(url) ? REGEXP_URL.test(url)
                                 : REGEXP_FILE.test(url);
}

function WMURL_isRelative(url) { // @arg URLString
                                 // @ret Boolean - true is relative url
                                 // @desc URL is relative.
//{@dev
    $valid($type(url, "String"), WMURL_isRelative, "url");
//}@dev

    return REGEXP_URL.test("http://example.com/" + url.replace(/^\/+/, ""));
}

function WMURL_buildQuery(queryObject, // @arg URLQueryObject - { key1: "a", key2: "b", key3: [0, 1] }
                          joint) {     // @arg String = "&"   - joint string "&" or "&amp;" or ";"
                                       // @ret URLQueryString - "key1=a&key2=b&key3=0&key3=1"
                                       // @desc build query string
//{@dev
    $valid($type(queryObject, "URLQueryObject"), WMURL_buildQuery, "queryObject");
    $valid($type(joint, "String|omit"),          WMURL_buildQuery, "joint");
//}@dev

    joint = joint || "&";

    var rv = [];

    for (var key in queryObject) {
        var encodedKey = global["encodeURIComponent"](key);
        var value = queryObject[key];

        if (!Array.isArray(value)) {
            value = [value]; // to Array
        }
        // "key3=0&key3=1"
        for (var token = [], i = 0, iz = value.length; i < iz; ++i) {
            token.push( encodedKey + "=" + global["encodeURIComponent"](value[i]) );
        }
        rv.push( token.join(joint) );
    }
    return rv.join(joint); // "key1=a&key2=b&key3=0&key3=1"
}

function WMURL_parseQuery(queryString) { // @arg URLString|URLQueryString - "key1=a;key2=b;key3=0;key3=1"
                                         // @ret URLQueryObject           - { key1: "a", key2: "b", key3: ["0", "1"] }
                                         // @desc parse query string
//{@dev
    $valid($type(queryString, "URLString|URLQueryString"), WMURL_parseQuery, "queryString");
//}@dev

    function _parseQuery(_, key, value) {
        var encodedKey   = global["encodeURIComponent"](key),
            encodedValue = global["encodeURIComponent"](value);

        if ( rv[encodedKey] ) {
            if ( Array.isArray(rv[encodedKey]) ) {
                rv[encodedKey].push(encodedValue);
            } else {
                rv[encodedKey] = [ rv[encodedKey], encodedValue ];
            }
        } else {
            rv[encodedKey] = encodedValue;
        }
        return "";
    }

    var rv = {};

    if (queryString.indexOf("?") >= 0) {
        // pickup "http://example.com/dir/file.exe?key=value#hash"
        //                                         ~~~~~~~~~
        queryString = queryString.split("?")[1].split("#")[0];
    }
    queryString.replace(/&amp;|&|;/g, ";"). // &amp; or & or ; -> ;
                replace(/(?:([^\=]+)\=([^\;]+);?)/g, _parseQuery);
    return rv;
}

// --- validate / assertions -------------------------------
//{@dev
function $valid(val, fn, hint) { if (global["Valid"]) { global["Valid"](val, fn, hint); } }
function $type(obj, type) { return global["Valid"] ? global["Valid"].type(obj, type) : true; }
//function $keys(obj, str) { return global["Valid"] ? global["Valid"].keys(obj, str) : true; }
//function $some(val, str, ignore) { return global["Valid"] ? global["Valid"].some(val, str, ignore) : true; }
//function $args(fn, args) { if (global["Valid"]) { global["Valid"].args(fn, args); } }
//}@dev

// --- exports ---------------------------------------------
if ("process" in global) {
    module["exports"] = WMURL;
}
global["WMURL" in global ? "WMURL_" : "WMURL"] = WMURL; // switch module. http://git.io/Minify

})((this || 0).self || global); // WebModule idiom. http://git.io/WebModule

