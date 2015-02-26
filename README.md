# semantics3-node

semantics3-node is a Node client for accessing the Semantics3 Products API, which provides structured information for a large number of products.
See https://www.semantics3.com for more information.

API documentation can be found at https://www.semantics3.com/docs/

## Installation

semantics3-node can be installed through the npm:
```
$ npm install semantics3-node
```
To build and install from the latest source:
```
$ git clone git@github.com:Semantics3/semantics3-node.git
$ npm install semantics3-node/
```

## Requirements

* oauth

## Getting Started

In order to use the client, you must have both an API key and an API secret. To obtain your key and secret, you need to first create an account at
https://www.semantics3.com/
You can access your API access credentials from the user dashboard at https://www.semantics3.com/dashboard/applications

### Setup Work

Let's lay the groundwork.

```javascript
var api_key = 'SEM3xxxxxxxxxxxxxxxxxxxxxx';
var api_secret = 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx';
var sem3 = require('semantics3-node')(api_key,api_secret);
```

### First Request aka 'Hello World':

Let's run our first request! We are going to run a simple search for the word "iphone" as follows:

```javascript

// Build the request
sem3.products.products_field( "search", "iphone" );

// Run the request
sem3.products.get_products(
   function(err, products) {
      if (err) {
         console.log("Couldn't execute request: get_products");
         return;
      }
    // View results of the request
    console.log( "Results of request:\n" + JSON.stringify( products ) );
   }
);
```

Alternatively, you can send a raw JSON string
```javascript
var endpoint = "products";
var method = "GET";
var jsonStr = '{"search" : "nike"}';

sem3.run_query(endpoint, jsonStr, method, function(err, products) {
    if (err) {
        return console.error("Couldn't execute query: get_products");
    }
    
    console.log( products );
});
```



## Sample Requests

The following requests show you how to interface with some of the core functionality of the Semantics3 Products API:

### Pagination

The example in our "Hello World" script returns the first 10 results. In the following examples, we'll scroll to subsequent pages, beyond our initial request:


```javascript
// Build the request
sem3.products.products_field( "search", "iphone" );

// Run the request
sem3.products.get_products(
   function(err, products) {
      if (err) {
         console.log("Couldn't execute request: get_products");
         return;
      }
      
      // View results of the request
      console.log( "Results of request:\n" + JSON.stringify( products ) );
      
      // Go to the next page
      sem3.products.iterate_products(
         function(err, products) {
            if (err) {
               console.log("Couldn't execute request: iterate_products");
               return;
            }
            console.log( "Successfully retrieved next page of products:\n", JSON.stringify( products ) );
         }
      );
   }
);
```

### UPC Query

Running a UPC/EAN/GTIN query is as simple as running a search query:

```javascript
// Build the request
sem3.products.products_field( "upc", "883974958450" );
sem3.products.products_field( "field", ["name","gtins"] );
sem3.products.products_field( "offset", 1 );

// Let's make a modification - say we no longer want the offset attribute
sem3.products.remove( "products", "offset" );

// Run the request
sem3.products.get_products(
   function(err, products) {
      if (err) {
         console.log("Couldn't execute request: get_products");
         return;
      }
    
      // View the results of the request
      console.log( "Results of request:\n" + JSON.stringify( products ) );
   }
);
```

### URL Query

Get the picture? You can run URL queries as follows:

```javascript
sem3.products.products_field( "url", "http://www.walmart.com/ip/15833173" );
sem3.products.get_products(
   function(err, products) {
      if (err) {
         console.log("Couldn't execute request: get_products");
         return;
      }
      console.log( "Results of request:\n" + JSON.stringify( products ) );
   }
);
```

### Price Filter

Filter by price using the "lt" (less than) tag:

```javascript
sem3.products.products_field( "search", "iphone" );
sem3.products.products_field( "price", "lt", 30 );
sem3.products.get_products(
   function(err, products) {
      if (err) {
         console.log("Couldn't execute request: get_products");
         return;
      }
      console.log( "Results of request:\n" + JSON.stringify( products ) );
   }
);
```

### Category ID Query

To lookup details about a cat_id, run your request against the categories resource:

```javascript
sem3.categories.categories_field( "cat_id", "4992" );
sem3.categories.get_categories(
   function(err, categories) {
      if (err) {
         console.log("Couldn't execute request: get_categories");
         return;
      }
      console.log( "Results of request:\n" + JSON.stringify( categories ) );
   }
);
```

## Webhooks
You can use webhooks to get near-real-time price updates from Semantics3. 

### Creating a webhook

You can register a webhook with Semantics3 by sending a POST request to `"webhooks"` endpoint.
To verify that your URL is active, a GET request will be sent to your server with a `verification_code` parameter. Your server should respond with `verification_code` in the response body to complete the verification process.

```javascript
var params = {
    webhook_uri : "http://mydomain.com/webhooks-callback-url"
};

sem3.run_query("webhooks", params, "POST", function(err, response){
    if(err)
        return console.error(err);

    var webhookObject = JSON.parse(response);
    console.log( webhookObject[ "id" ] );
    console.log( webhookObject[ "webhook_uri" ] );
});

```
To fetch existing webhooks
```javascript
sem3.run_query("webhooks", null, "GET", function(err, response){
    if(err)
        return console.error(err);

    var webhooksArr = JSON.parse(response);
    console.log( webhooksArr );
});
```

To remove a webhook
```javascript
var webhook_id = '7JcGN81u';
var endpoint = "webhooks/" + webhook_id ;

sem3.run_query( endpoint, null, "DELETE", function(err, response){
    if(err)
        return console.error(err);

    console.log( response );
});

```

### Registering events
Once you register a webhook, you can start adding events to it. Semantics3 server will send you notifications when these events occur.
To register events for a specific webhook send a POST request to the `"webhooks/{webhook_id}/events"` endpoint

```javascript
var params = {
    "type": "price.change",
    "product": {
        "sem3_id": "1QZC8wchX62eCYS2CACmka"
    },
    "constraints": {
        "gte": 10,
        "lte": 100
    }
};

var webhook_id = '7JcGN81u';
var endpoint = "webhooks/" + webhook_id + "/events";

sem3.run_query(endpoint, params, "POST", function(err, response){
    if(err)
        return console.error(err);

    var eventObject = JSON.parse(response);
    console.log( eventObject[ "id" ] );
    console.log( eventObject[ "type" ] );
    console.log( eventObject[ "product" ] );
});
```

To fetch all registered events for a give webhook
```javascript
var webhook_id = '7JcGN81u';
var endpoint = "webhooks/" + webhook_id + "/events";

sem3.run_query(endpoint, null, "GET", function(err, response){
    if(err)
        return console.error(err);

    var eventArr = JSON.parse(response);
    console.log( eventArr );
});
```

### Webhook Notifications
Once you have created a webhook and registered events on it, notifications will be sent to your registered webhook URI via a POST request when the corresponding events occur. Make sure that your server can accept POST requests. Here is how a sample notification object looks like
```javascript
{
    "type": "price.change",
    "event_id": "XyZgOZ5q",
    "notification_id": "X4jsdDsW",
    "changes": [{
        "site": "abc.com",
        "url": "http://www.abc.com/def",
        "previous_price": 45.50,
        "current_price": 41.00
    }, {
        "site": "walmart.com",
        "url": "http://www.walmart.com/ip/20671263",
        "previous_price": 34.00,
        "current_price": 42.00
    }]
}
```

### Additional utility methods

| method        | Description           
| ------------- |:-------------
| `sem3.products.get_results_json()`     | returns the result json string from the previous query
| `sem3.products.clear()`                | clears all the fields in the query
| `sem3.run_query(endpoint, rawJson, method, callback)`  | You can use this method to send raw JSON string in the request


## Contributing

Use GitHub's standard fork/commit/pull-request cycle.  If you have any questions, email <support@semantics3.com>.

## Author

* Sivamani VARUN <varun@semantics3.com>
* GOVIND Chandrasekhar <govind@semantics3.com>
* Nagappan Nachiappan <nagappan@semantics3.com>

## Copyright

Copyright (c) 2015 Semantics3 Inc.

## License

    The "MIT" License
    
    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:
    
    The above copyright notice and this permission notice shall be included in
    all copies or substantial portions of the Software.
    
    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
    OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
    THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
    FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
    DEALINGS IN THE SOFTWARE.


