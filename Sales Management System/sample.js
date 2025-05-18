var mysql = require ("mysql2");
var bodyParser = require ("body-parser");
var express = require("express");
var nodemailer = require ("nodemailer");

var con = mysql.createConnection ({
    host: 'localhost',
    user: '',
    password: '',
    database: 'salesdatabase'
})

con.connect (function(err) {
    if (err) throw err;
    console.log ("Connected to Database!");
    con.query ("TRUNCATE TABLE stock", function(err, result) {
        if (err) throw err;
        console.log(result);
    })
})
