var PATREE = PATREE || {};
var $P = PATREE;
 
$P.classes = {};

/**
 * Get a json file.
 */
$P.getJSON = function(url, callback, params) {
    var call, config, count = 0;
    config = {
        dataType: 'json',
        url: url,
        async: false,
        error: function(jqXHR, textStatus, errorThrown) {
            if ('timeout' === textStatus) {
                call();}
            else {
                console.error(errorThrown);
                console.error(textStatus);}},
        timeout: 120000,
        success: callback};
    if (params) {config = $.extend(config, params);}
    call = function call() {
        ++count;
        if (count < 5) {
            $.ajax(config);}};
    call();};


/**
 * Simple class inheritance.
 * Does not handle calling the superclass constructor.
 * Defines superclass on the prototype.
 * Stores in $P.classes[name of init function].
 * @param {?Function} superclass - the parent class
 * @param {!Function} init - the initialization function
 * @param {Object} prototype - the prototype methods
 */
$P.defineClass = function(superclass, init, prototype) {
    init.prototype = Object.create(superclass && superclass.prototype);
    Object.getOwnPropertyNames(prototype).forEach(function(name) {
        Object.defineProperty(init.prototype, name, Object.getOwnPropertyDescriptor(prototype, name));});
    init.prototype.constructor = init;
    init.prototype.superclass = superclass;
    init.prototype.classname = init.name;
    $P.classes[init.name] = init;
    return init;};

/**
 * Create a function that retrieves a specific key from an object.
 * @param {string} key - the key to return
 * @returns {getter}
 */
$P.getter = function (key) {return function(object) {return object[key];};};
