/* global window,global */
/* exported log */
(function(global) {
    "use strict";

    function stringify(i) {
        if(i instanceof Error) {
            return i.toString();
        }

        return (typeof i === "object") ? JSON.stringify(i) : i;
    }

    function createLogger(output) {
        function create(method, tag) {
            tag = "[" + tag +"]";
            method = output[method];
            
            return function() {
                method.apply(output, [tag].concat([].slice.call(arguments).map(stringify)));
            }
        }
     
        var obj = {
            debug: create("log", "DEBUG"),
            info: create("log", "INFO"),
            error: create("error", "ERROR"),
            warn: create("warn", "WARN"),
        };
        
        return obj;
    }

    global.log = createLogger(global.console);

}(typeof window !== "undefined" ? window : global));
