/*
* Simple test script to showcase use of semantics3-node to interface
* with Semantics3 Products API.
* 
* Quickstart guide: https://semantics3.com/quickstart
* API Documentation: https://semantics3.com/docs
*
* Author: Sivamani VARUN <varun@semantics3.com>
* Copyright (c) 2013 Semantics3 Inc.
*
* The MIT License from http://www.opensource.org/licenses/mit-license.php
*
* Permission is hereby granted, free of charge, to any person obtaining a copy
* of this software and associated documentation files (the "Software"), to deal
* in the Software without restriction, including without limitation the rights
* to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
* copies of the Software, and to permit persons to whom the Software is
* furnished to do so, subject to the following conditions:
* 
* The above copyright notice and this permission notice shall be included in
* all copies or substantial portions of the Software.
* 
* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
* IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
* FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
* AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
* LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
* OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
* THE SOFTWARE.
*/

//Register for your access credentials at https://semantics3.com
var api_key = 'SEM3xxxxxxxxxxxxxxxxxxxxxx';
var api_secret = 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx';
var sem3 = require('./../lib/main.js')(api_key,api_secret);

/*
 Sample query for retrieving products using Semantics3 Products API:
 
 The sample query shown below returns Toshiba branded products, belonging to the electronics category (ID 13658), that weigh >=1.0kg and <1.5kg (1500000 mg) and have retailed recently on the website newegg.com for >=USD 100, sorted in descending order of product name, limited to 5 results. 
*/

// Build the query
sem3.products.products_field( "cat_id", 4992 );
sem3.products.products_field( "brand", "Toshiba" );
sem3.products.products_field( "weight", "gte", 1000000 );
sem3.products.products_field( "weight", "lt", 1500000 );
sem3.products.products_field( "sitedetails", "name", "newegg.com" );
sem3.products.products_field( "sitedetails", "latestoffers", "currency", "USD" );
sem3.products.products_field( "sitedetails", "latestoffers", "price", "gte", 100 );

// Let's make a modification - say we no longer want the weight to be greater than 1000000 attribute
sem3.products.remove( "products", "brand", "weight" );

// Let's view the JSON query we just constructed. This is a good starting point to debug, if you are getting incorrect 
// results for your query
var constructedJson = sem3.products.get_query_json( "products" );
console.log( constructedJson );

// Make the query
sem3.products.get_products(
   function(err, products) {
      if (err) {
         console.log("Couldn't execute query: get_products");
         return;
      }   
    // View the results of the query
    console.log("Results of query:\n" + JSON.stringify( products ));
   }   
);

