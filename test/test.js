var ModuleTestWMURL = (function(global) {

var _runOnNode = "process" in global;
var _runOnWorker = "WorkerLocation" in global;
var _runOnBrowser = "document" in global;

var test = new Test("WMURL", {
        disable:    false,
        browser:    true,
        worker:     true,
        node:       true,
        button:     true,
        both:       true, // test the primary module and secondary module
    }).add([
        testWMURLParse,
        testWMURLParse2,
        testWMURLParse3,
        testWMURLParse4,
        testWMURLParse5,
        testWMURLParse6,
        testWMURLValid,
        testWMURLParseAndBuild,
        testWMURLIsAbsolute,
        testWMURLIsRelative,
        testWMURLResolveAbsolute,
        testWMURLResolveWithoutBasePath,
        testWMURLResolveWithBasePath,
        testWMURLNormalize,
        testWMURLQueryString,
        testEncodeURIComponent,
        testDecodeURIComponent,
    ]);

/*
if (!_runOnWorker && _runOnBrowser) {
    test.add([
        //testWMURLGetCurrentWMURL,
    ]);
}
 */

test.run().clone();


/*
function testWMURLGetCurrentWMURL(test) {

    var url = WMURL(); // get current WMURL
    var obj = WMURL.parse(url);

    // location.href is "WMURL.js/test/"
    //               or "WMURL.js/test/index.html"

    if (obj.dir.split("/").pop() === "test" && (obj.file === "" ||
                                                obj.file === "index.html")) {
        test && test.pass();
    } else {
        test && test.miss();
    }
}
 */

function testWMURLParse(test, pass, miss) {
    var href = "http://user:pass@example.com:8080/dir1/dir2/file.ext?a=b;c=d#hash";

    var obj = WMURL.parse(href);

    if (obj.href     === href &&
        obj.protocol === "http:" &&
        obj.origin   === "http://example.com:8080" &&
        obj.host     === "example.com:8080" &&
        obj.hostname === "example.com" &&
        obj.port     === "8080" &&
        obj.username === "user" &&
        obj.password === "pass" &&
        obj.pathname === "/dir1/dir2/file.ext" &&
        obj.search   === "?a=b;c=d" &&
        obj.hash     === "#hash") {

        // check extras properties
        if (obj.scheme   === "http:" &&
            obj.path     === "/dir1/dir2/file.ext?a=b;c=d#hash" &&
            obj.dir      === "/dir1/dir2" &&
            obj.file     === "file.ext" &&
            obj.fragment === "#hash") {

            test.done(pass());
            return;
        }
    }
    test.done(miss());
}

function testWMURLParse2(test, pass, miss) {
    var href = "/dir1/dir2/file.ext?a=b;c=d#hash"; // root and absolute

    var obj = WMURL.parse(href);

    if (obj.href     === href &&
        obj.protocol === "" &&
        obj.origin   === "" &&
        obj.host     === "" &&
        obj.hostname === "" &&
        obj.port     === "" &&
        obj.username === "" &&
        obj.password === "" &&
        obj.pathname === "/dir1/dir2/file.ext" &&
        obj.search   === "?a=b;c=d" &&
        obj.hash     === "#hash") {

        // check extras properties
        if (obj.scheme   === "" &&
            obj.path     === "/dir1/dir2/file.ext?a=b;c=d#hash" &&
            obj.dir      === "/dir1/dir2" &&
            obj.file     === "file.ext" &&
            obj.fragment === "#hash") {

            test.done(pass());
            return;
        }
    }
    test.done(miss());
}

function testWMURLParse3(test, pass, miss) {
    var href = "./dir1/dir2/file.ext?a=b;c=d#hash"; // retative

    var obj = WMURL.parse(href);

    if (obj.href     === href &&
        obj.protocol === "" &&
        obj.origin   === "" &&
        obj.host     === "" &&
        obj.hostname === "" &&
        obj.port     === "" &&
        obj.username === "" &&
        obj.password === "" &&
        obj.pathname === "./dir1/dir2/file.ext" &&
        obj.search   === "?a=b;c=d" &&
        obj.hash     === "#hash") {

        // check extras properties
        if (obj.scheme   === "" &&
            obj.path     === "./dir1/dir2/file.ext?a=b;c=d#hash" &&
            obj.dir      === "./dir1/dir2" &&
            obj.file     === "file.ext" &&
            obj.fragment === "#hash") {

            test.done(pass());
            return;
        }
    }
    test.done(miss());
}

function testWMURLParse4(test, pass, miss) {
    var href = "file://localhost/dir1/dir2/file.ext?a=b;c=d#hash"; // file and localhost

    var obj = WMURL.parse(href);

    if (obj.href     === href &&
        obj.protocol === "file:" &&
        obj.origin   === "file://" &&
        obj.host     === "" &&
        obj.hostname === "" &&
        obj.port     === "" &&
        obj.username === "" &&
        obj.password === "" &&
        obj.pathname === "/dir1/dir2/file.ext" &&
        obj.search   === "?a=b;c=d" &&
        obj.hash     === "#hash") {

        // check extras properties
        if (obj.scheme   === "file:" &&
            obj.path     === "/dir1/dir2/file.ext?a=b;c=d#hash" &&
            obj.dir      === "/dir1/dir2" &&
            obj.file     === "file.ext" &&
            obj.fragment === "#hash") {

            test.done(pass());
            return;
        }
    }
    test.done(miss());
}

function testWMURLParse5(test, pass, miss) {
    var href = "file:///dir1/dir2/file.ext?a=b;c=d#hash"; // file without localhost

    var obj = WMURL.parse(href);

    if (obj.href     === href &&
        obj.protocol === "file:" &&
        obj.origin   === "file://" &&
        obj.host     === "" &&
        obj.hostname === "" &&
        obj.port     === "" &&
        obj.username === "" &&
        obj.password === "" &&
        obj.pathname === "/dir1/dir2/file.ext" &&
        obj.search   === "?a=b;c=d" &&
        obj.hash     === "#hash") {

        // check extras properties
        if (obj.scheme   === "file:" &&
            obj.path     === "/dir1/dir2/file.ext?a=b;c=d#hash" &&
            obj.dir      === "/dir1/dir2" &&
            obj.file     === "file.ext" &&
            obj.fragment === "#hash") {

            test.done(pass());
            return;
        }
    }
    test.done(miss());
}

function testWMURLParse6(test, pass, miss) {
    var href = "file:///";

    var obj = WMURL.parse(href);

    if (obj.href     === href &&
        obj.protocol === "file:" &&
        obj.scheme   === "file:" &&
        obj.origin   === "file://" &&
        obj.host     === "" &&
        obj.hostname === "" &&
        obj.port     === "" &&
        obj.username === "" &&
        obj.password === "" &&
        obj.path     === "/" &&
        obj.pathname === "/" &&
        obj.dir      === "" &&
        obj.file     === "" &&
        obj.search   === "" &&
        obj.hash     === "" &&
        obj.fragment === "") {

        test.done(pass());
    } else {
        test.done(miss());
    }
}

function testWMURLValid(test, pass, miss) {

    var invalidURL = "http://example.com:port/dir/file.exe?key=value#hash";

    if ( WMURL.valid(invalidURL) ) {
        test.done(pass());
    } else {
        test.done(miss());
    }
}
function testWMURLParseAndBuild(test, pass, miss) {

    var absurl = "http://example.com/dir/file.exe?key=value#hash";
    var parsed = WMURL.parse(absurl);
    var revert = WMURL.build(parsed);

    var ok = revert === absurl; // WMURL.build

    if (ok) {
        test.done(pass());
    } else {
        test.done(miss());
    }
}

function testWMURLIsAbsolute(test, pass, miss) {
    var url = "http://example.com";

    if ( WMURL.isAbsolute(url) === true) {
        test.done(pass());
    } else {
        test.done(miss());
    }
}

function testWMURLIsRelative(test, pass, miss) {
    var url = "/dir/file.ext";

    if ( WMURL.isRelative(url) === true) {
        test.done(pass());
    } else {
        test.done(miss());
    }
}

function testWMURLResolveAbsolute(test, pass, miss) {
    var src = "http://example.com/dir/file.ext";
    var abs = WMURL.resolve(src);
    var url = WMURL.build(WMURL.parse(abs));

    if (src === url) {
        test.done(pass());
    } else {
        test.done(miss());
    }
}

function testWMURLResolveWithoutBasePath(test, pass, miss) {
    var src = "/dir/file.ext";

    if (_runOnNode || _runOnWorker) {
        var abs = WMURL.resolve(src);

        if (abs === src) {
            test.done(pass());
        } else {
            test.done(miss());
        }
    } else if (_runOnBrowser) {
        var abs = WMURL.resolve(src);
        var obj = WMURL.parse(abs);

        if (/file|http/.test(obj.protocol) &&
            obj.path === "/dir/file.ext") {

            test.done(pass());
        } else {
            test.done(miss());
        }
    } else {
        test.done(miss());
    }
}

function testWMURLResolveWithBasePath(test, pass, miss) {
    var src = "/dir/file.ext";
    var abs = WMURL.resolve(src, "http://localhost:8080/");
    var obj = WMURL.parse(abs);

    if (obj.protocol === "http:" &&
        obj.port     === "8080" &&
        obj.path     === "/dir/file.ext") {

        test.done(pass());
    } else {
        test.done(miss());
    }
}

function testWMURLNormalize(test, pass, miss) {
    var items = {
            // url                      result
            "dir/.../a.file":           "dir/a.file",
            "/dir/.../a.file":          "/dir/a.file",
            "../../../../a.file":       "/a.file",
            "dir/dir2///.//.../a.file": "dir/dir2/a.file",
            "dir/.../a.file":           "dir/a.file",
            "../../../../a.file":       "/a.file",
            "http://example.com/../../../../a.file":        "http://example.com/a.file",
            "http://example.com/././//./.../a.file":        "http://example.com/a.file",
            "http://example.com///..//hoge/....//huga.ext": "http://example.com/hoge/huga.ext"
        };

    var ok = true;

    for (var url in items) {
        var result = items[url];
        if (WMURL.normalize(url) !== result) {
            console.error("url = " + url, "normalize = ", WMURL.normalize(url), "result = ", result);
            ok = false;
            break;
        }
    }

    if (ok) {
        test.done(pass());
    } else {
        test.done(miss());
    }
}

function testWMURLQueryString(test, pass, miss) {
    var url = "http://example.com?key1=a;key2=b;key3=0;key3=1";

    var urlQueryObject = WMURL.parseQuery(url);

    var result = JSON.stringify( urlQueryObject );

    if (result === '{"key1":"a","key2":"b","key3":["0","1"]}') {
        test.done(pass());
    } else {
        test.done(miss());
    }
}

function testEncodeURIComponent(test, pass, miss) {

    var source = "123ABCあいう!%#";
    var code   = encodeURIComponent(source);
    var revert = decodeURIComponent(code);

    if (source === revert) {
        test.done(pass());
    } else {
        test.done(miss());
    }
}

function testDecodeURIComponent(test, pass, miss) {

    var source = "123ABCあいう!%#";
    var code   = encodeURIComponent(source);
    var revert = decodeURIComponent(code);

    if (source === revert) {
        test.done(pass());
    } else {
        test.done(miss());
    }
}

})((this || 0).self || global);


