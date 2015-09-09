/* Author: Sivamani Varun (varun@semantics3.com)
 * Author: Nagappan Nachiappan (nagappan@semantics3.com)
 * Copyright 2012-2015 Semantics3 Inc., see LICENSE */

"use strict";

var VERSION = '0.01';
var MAX_LIMIT = 10;

var OAuth = require('oauth').OAuth;
var normalizeUrl = require('normalize-url');
var HTTP_VERBS = [ 'GET', 'PUT', 'POST', 'DELETE','UPDATE'];

module.exports = function (api_key,api_secret, options) {

    if(typeof options === 'undefined')
        options = {};

    var base_url = options.base_url || 'https://api.semantics3.com/v1/';
    var userAgent = 'Semantics3 Node.js Lib/' + VERSION;

    var customHeaders = {"Accept" : "*/*", "Connection" : "close", "User-Agent" : userAgent};
    var securer = new OAuth(null, null, api_key, api_secret,'1.0', null,'HMAC-SHA1',32,customHeaders);

    var data_query = {};
    var query_result = {};

    function _request(method, path, data, callback) {
        if(typeof data != 'string')
            data = JSON.stringify(data);

        method = method.toLowerCase();
        if( method === 'get'){
            var request_data = encodeURIComponent(data);
            var url = normalizeUrl(base_url + path + '?q=' + request_data);
            
            securer.get(url, null, null,
                        function(err, data, result) {
                            if(!err) { query_result = JSON.parse(data); }
                            callback(err,data);
                        });
        }
        else if( method == 'delete' ){
            var url = normalizeUrl(base_url + path);
            securer.delete(url, null, null,
                        function(err, data, result) {
                            if(!err) { query_result = JSON.parse(data); }
                            callback(err,data);
                        });
        }
        else{
            var url = normalizeUrl(base_url + path);
            securer[method](url, null, null, data, "application/json",
                        function(err, data, result) {
                            if(!err) { query_result = JSON.parse(data); }
                            callback(err,data);
                        });
        }
    }

    function run_query(endpoint) {
        var queryObj = {};

        if(arguments.length < 2) {
            throw new Error("Insufficient parameters provided");
        }

        var callback,method,data;

        if( typeof arguments[arguments.length-1] != 'function')
            throw new Error("Last parameter must be of type 'function'");
        else
            callback = arguments[arguments.length-1];

        if(arguments.length == 2){
            callback = arguments[1];
        }
        if(arguments.length == 3){
            if(arguments[1] === 'string' && HTTP_VERBS.contains(arguments[1].toUpperCase())){
               method = arguments[1];
            }
            else{
                data = arguments[1];
            }
        }
        else if(arguments.length == 4){
               data = arguments[1];
               method = arguments[2];
        } 

        if(typeof method === 'undefined')
            method = 'GET';
        if(typeof data === 'undefined') {
            _request(method,endpoint,data_query[endpoint],callback);
        }
        else {
            if(typeof data === 'string') {
                _request(method, endpoint,JSON.parse(data),callback);
            }
            else if(typeof data === 'object') {
                _request(method, endpoint,data,callback);
            }
            else {
                callback("Invalid parameters sent");
            }
        }
    }

    return {

        products: {

                //Offers

                offers_field: function () {
                    var args = Array.prototype.slice.call( arguments, 0 );
                    args.unshift('offers');
                    this.add.apply(this,args);
                },

                get_offers: function (callback) {
                    this.run_query('offers',callback);
                },

                //Categories

                categories_field: function () {
                    var args = Array.prototype.slice.call( arguments, 0 );
                    args.unshift('categories');
                    this.add.apply(this,args);
                },

                get_categories: function (callback) {
                    this.run_query('categories',callback);
                },

                // Products

                products_field: function () {
                    var args = Array.prototype.slice.call( arguments, 0 );
                    args.unshift('products');
                    this.add.apply(this,args);
                },

                get_products: function (callback) {
                    this.run_query('products',callback);
                },

                all_products: function() {
                    if(!(query_result['results'])) {
                        throw new Error("Query result is undefined. You need to run a query first. ");
                    }
                    return query_result['results'];
                },

                iterate_products: function(callback) {
                    var limit=MAX_LIMIT;

                    if( (!(query_result['total_results_count'])) || (query_result['offset'] >= query_result['total_results_count'])) {
                        callback("No more iteration");
                    }

                    if(data_query['products']['limit']) {
                        limit = data_query['products']['limit'];
                    }
                    if(!(data_query['products']['offset'])) {
                        data_query['products']['offset'] = 0;
                    }
                    data_query['products']['offset'] = data_query['products']['offset'] + limit;
                    this.get_products(callback);
                },

                // Common

                add: function(endpoint) {
                    var args = Array.prototype.slice.call( arguments, 0 );
                    var fields = args.slice(1);

                    if(!(endpoint && (typeof endpoint === 'string'))) {
                        throw new Error("An endpoint is required");
                    }

                    if(!data_query[endpoint]) {
                        data_query[endpoint] = {};
                    }

                    var prodObj = data_query[endpoint];

                    for( var i=1; i<=(fields.length-1); i++ ) {
                        if( !( prodObj[ fields[i-1] ] ) ) {
                            prodObj[ fields[i-1] ] = {};
                        }
                        if(i != fields.length-1) {
                            prodObj = prodObj[fields[i-1]];
                        }
                        else {
                            prodObj[fields[i-1]] = fields[i];
                        }
                    }
                },

                remove: function(endpoint) {
                    var args = Array.prototype.slice.call( arguments, 0 );
                    var fields = args.slice(1);

                    if(!(endpoint && (typeof endpoint === 'string'))) {
                        throw new Error("An endpoint is required");
                    }

                    var valid = 0;
                    var prodObj;
                    var arrayCt = 0;

                    if( data_query[ endpoint ] ) {
                        prodObj = data_query[ endpoint ];
                        arrayCt = fields.length - 1;
                        valid = 1;

                        for( var i=0; i<=arrayCt-1; i++ ) {
                            if( prodObj[fields[i]] ) {
                                prodObj = prodObj[fields[i]];
                            }
                            else {
                                valid = 0;
                            }
                        }
                    }

                    if( valid ) {
                        delete prodObj[ fields[ arrayCt ] ];
                    }
                    else {
                        throw new Error("Attemped Invalid Deletion");
                    }
                },

                get_query: function(endpoint) {

                    if(!(endpoint && (typeof endpoint === 'string'))) {
                        throw new Error("An endpoint is required");
                    }

                    return data_query[ endpoint ];
                },

                get_query_json: function(endpoint) {
                    if(!(endpoint && (typeof endpoint === 'string'))) {
                        throw new Error("An endpoint is required");
                    }

                    return JSON.stringify(data_query[ endpoint ]);
                },

                get_results: function() {
                    return query_result;
                },

                get_results_json: function()  {
                    return JSON.stringify( query_result );
                },


                clear: function() {
                    query_result={};
                    data_query={};
                },
                run_query : run_query
        },
        run_query : run_query
    };
}
