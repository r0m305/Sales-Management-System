var mysql = require ("mysql2");
var bodyParser = require ("body-parser");
var express = require("express");
var nodemailer = require ("nodemailer");

var con = mysql.createConnection ({
    host: 'localhost',
    user: 'root',
    password: 'final',
    database: 'salesdatabase'
});
var transporter = nodemailer.createTransport({
                service: 'gmail',
                host: 'smtp.gmail.com',
                port: 465,
                secure: true,
                auth: {
                    user: "clinicsalesdb@gmail.com",
                    pass: "jtkm vwcz dson yemt"
                }
            });
function sendEmail (subject, html) {
    var mailOptions = {
            from:"clinicsalesdb@gmail.com",
            to: "lewiswaigwa30@gmail.com",
            subject: subject,
            html: html
        };
        transporter.sendMail(mailOptions, function(err, info) {
            if (error) {
                console.log (error);
            } else {
                console.log ("Email sent!");
            }
        });
}
    
function dateAppend(num) {
    var num1=num.toString();
    if (num==13) {
        num1+="th";
    } else if (num1.endsWith("11")) {
        num1+="th";
    } else if (num1.endsWith("1")) {
        num1+="st";
    } else if (num1.endsWith("2")) {
        num1+="nd";
    } else if (num1.endsWith("3")) {
        num1+="rd";
    } else {
        num1+="th";
    }
    return num1;
};

function daysInMonth (myMonth) {
    var thirty = [
        'September',
        'April',
        'June',
        'November'
    ];
    var myYear = Number(new Date().getFullYear());
    if (myMonth in thirty) {
        return 30;
    } else if (myMonth=="February") {
        if (myYear%4==0) {
            return 29;
        } else {
            return 28;
        }
    } else {
        return 31;
    }
}
con.connect (function(err) {
    if (err) throw err;
    console.log ("Connected to Database!");
});

var app = express();
app.use(bodyParser.urlencoded({extended:false}));
app.use(express.static('public'));
app.get('/', function(req, res) {
    res.sendFile (__dirname + "/sales.html");
});
app.get('/stock', function(req, res) {
    res.sendFile(__dirname+"/stock.html");
})

app.post ("/register", function(req, res) {
    const dateObj = new Date();
    const months = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December'
    ];
    var date = dateObj.getDate();
    var month = months[dateObj.getMonth()];
    var year = dateObj.getFullYear();
    var time = dateObj.toLocaleTimeString();
    var {item,amount,price} = req.body;
    var item1 = item.toLowerCase();
    var sql = "INSERT INTO sales (item, amount, price, date, month, year, time) VALUES (?, ?, ?, ?, ?, ?, ?)";
    con.query (sql, [item1, amount, price, date, month, year, time], function(err, result) {
        if (err) throw err;
        console.log ("Sale added!");
    });
    var sql1 = "SELECT * FROM stock WHERE item=?";
    con.query(sql1, [item1], function(err, result) {
        if (result.length > 0) {
            var amount1 = Number(result[0].amount) - Number(amount);
            var command = "UPDATE stock SET amount=? WHERE item=?";
            con.query(command, [amount1, item1], function(err, result) {
                if (err) throw err;
                console.log ("Stock records updated!");
            });
        } else {
            res.status(404).send ("The item you have sold was not found in the stock records. Please include it!!")
        }
    })
});

app.get ('/todaysales', function(req, res) {
    var today = new Date().getDate();
    var mysql = "SELECT * FROM sales WHERE date=?";
    con.query (mysql, [today], function(err, result) {
        if (err) throw err;
        let html =`
        <!DOCTYPE html>
        <html>
        <head>
        <title>Search results</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
        table {
        border-collapse: collapse;
        width: 70%;
        }
        th, td {
        border-bottom: 2px solid black;
        padding: 5px;
        text-align: left;
        }
        tr:nth-child(even) {
        background-color: #f2f2f2;
        }
        tr:hover {
        background-color: rgb(173, 241, 218);
        }
        a {
        font-size: large;
        }
        @media only screen and (max-width: 768px) {
            table {
                width: 100%;
            }
        }
@media only screen and (max-width: 600px) {
    table {
        width: 100%;
    }
}
@media only screen and (max-width: 480px) {
    table {
        width: 100%;
    }
}
        </style>
        </head>
        <body>
        <h1>Sales made today:</h1>
        <table>
        <tr>
        <th>ID</th>
        <th>Item</th>
        <th>Amount</th>
        <th>Price</th>
        <th>Date of sale</th>
        <th>Month of sale</th>
        <th>Year</th>
        <th>Time of Sale</th>
        </tr>`;
        let total = 0;
        let count = 1;
        result.forEach(sale => {
            total+=sale.price;
            html+=`
            <tr>
            <td>${count}</td>
            <td>${sale.item}</td>
            <td>${sale.amount}</td>
            <td>Ksh.${sale.price}</td>
            <td>${dateAppend(sale.date)}</td>
            <td>${sale.month}</td>
            <td>${sale.year}</td>
            <td>${sale.time}</td>
            </tr>`;
            count+=1;
        });
        html+= `
        </table><br>
        <h2>Total sales for today: Ksh.${total}</h2>
        <a href="/">Return to Home Page</a>
        </body>
        </html>`;
        res.send(html);
    });
});

app.get ('/sendsales', function(req, res) {
    var today = new Date().getDate();
    var mysql = "SELECT * FROM sales WHERE date=?";
    con.query (mysql, [today], function(err, result) {
        if (err) throw err;
        console.log ("Connected to database!");
        let html =`
        <!DOCTYPE html>
        <html>
        <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
        table {
        border-collapse: collapse;
        width: 70%;
        }
        th, td {
        border-bottom: 2px solid black;
        padding: 5px;
        text-align: left;
        }
        tr:nth-child(even) {
        background-color: #f2f2f2;
        }
        tr:hover {
        background-color: rgb(173, 241, 218);
        }
        a {
        font-size: large;
        }
        </style>
        </head>
        <body>
        <h1>Sales made today:</h1>
        <table>
        <tr>
        <th>ID</th>
        <th>Item</th>
        <th>Amount</th>
        <th>Price</th>
        <th>Date of sale</th>
        <th>Month of sale</th>
        <th>Year</th>
        <th>Time of Sale</th>
        </tr>`;
        let total = 0;
        let count = 1;
        result.forEach(sale => {
            total+=sale.price;
            html+=`
            <tr>
            <td>${count}</td>
            <td>${sale.item}</td>
            <td>${sale.amount}</td>
            <td>Ksh.${sale.price}</td>
            <td>${dateAppend(sale.date)}</td>
            <td>${sale.month}</td>
            <td>${sale.year}</td>
            <td>${sale.time}</td>
            </tr>`;
            count+=1;
        });
        html+= `
        </table><br>
        <h2>Total sales: Ksh.${total}</h2>
        <a href="/">Return to Home Page</a>
        </body>
        </html>`;
        sendEmail ("Today's Sales", html);

    });
});

app.post('/view', function(req, res) {
    var {month} = req.body;
    var mysql = "SELECT * FROM sales WHERE month=?";
    con.query (mysql, [month], function(err, result) {
        if (err) throw err;
        console.log ("Search complete");
        let html =`
        <!DOCTYPE html>
        <html>
        <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Search results</title>
        <style>
        table {
        border-collapse: collapse;
        width: 70%;
        }
        th, td {
        border-bottom: 2px solid black;
        padding: 5px;
        text-align: left;
        }
        tr:nth-child(even) {
        background-color: #f2f2f2;
        }
        tr:hover {
        background-color: rgb(173, 241, 218);
        }
        @media only screen and (max-width: 768px) {
            table {
                width: 100%;
            }
        }
}
@media only screen and (max-width: 600px) {
    table {
        width: 100%;
    }
}
@media only screen and (max-width: 480px) {
    table {
        width: 100%;
    }
}
        </style>
        </head>
        <body>
        <h1>Sales made in ${month}</h1>
        <table>
        <tr>
        <th>ID</th>
        <th>Item</th>
        <th>Amount</th>
        <th>Price</th>
        <th>Date of sale</th>
        <th>Month of sale</th>
        <th>Year</th>
        <th>Time of Sale</th>
        </tr>`;
        let total = 0;
        let count = 0;
        result.forEach(sale => {
            total+=sale.price;
            html+=`
            <tr>
            <td>${sale.id}</td>
            <td>${sale.item}</td>
            <td>${sale.amount}</td>
            <td>Ksh.${sale.price}</td>
            <td>${dateAppend(sale.date)}</td>
            <td>${sale.month}</td>
            <td>${sale.year}</td>
            <td>${sale.time}</td>
            </tr>`;
            count+=1;
        });
        html+= `
        </table><br>
        <h2>Total sales: Ksh.${total}</h2>
        <a href="/">Return to Home Page</a>
        </body>
        </html>`;
        res.send(html);
    });
});
app.post ("/contact", function(req, res) {
    var {name, email, subject, message} = req.body;
    var mailtosend = `
    <!DOCTYPE html>
    <html>
    <head></head>
    <body>
    <p>Name of sender: <b>${name}</b></p>
    <p>Sender's email: <b>${email}</b></p><br>
    <p>Message: <b>${message}</b></p>
    </body>
    </html>`;
    sendEmail(subject, mailtosend);
});

app.post ('/addstock', function(req, res) {
    var {item, amount} = req.body;
    var item1 = item.toLowerCase();
    var mysql = "SELECT * FROM stock WHERE item=?";
    con.query(mysql, [item1], function(err, result) {
        if (err) throw err;
        console.log("Search complete!")
        if (result.length > 0 && result[0].amount !=undefined) {
            var amount1 = Number((result[0].amount))+Number(amount);
            var command = "UPDATE stock SET amount=? WHERE item=?";
            con.query(command, [amount1, item1], function(err, result) {
                if (err) throw err;
                console.log("Record updated!")
            });
        } else {
            console.log("Item not found in stock.");
            res.status(404).send("Item not found in stock.");
        }
    });
});

app.post('/newstock', function(req, res) {
    var {item1, amount1} = req.body;
    var item2 = item1.toLowerCase();
    var check = "SELECT * FROM stock WHERE item=?";
    con.query(check, [item2], function(err, result) {
        if (err) throw err;
        if (result.length > 0) {
            console.log("Item already exists in stock.");
            res.status(400).send("Item already exists in stock.");
            return;
        } else {
            var mysql = "INSERT INTO stock (item, amount) VALUES (?, ?)";
            con.query(mysql, [item2, amount1], function(err, result) {
            if (err) throw err;
            console.log("New item registered!");
        });
        }
    });
    
});

app.get('/deplete', function(req, res) {
    var sql = "SELECT * FROM stock WHERE amount<=?";
    var remaining = 20;
    con.query(sql, [remaining], function(err, result) {
        let html =`
        <!DOCTYPE html>
        <html>
        <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Search results</title>
        <style>
        table {
        border-collapse: collapse;
        width: 50%;
        }
        th, td {
        border-bottom: 2px solid black;
        padding: 5px;
        text-align: left;
        }
        tr:nth-child(even) {
        background-color: #f2f2f2;
        }
        tr:hover {
        background-color: rgb(173, 241, 218);
        }
        @media only screen and (max-width: 768px) {
            table {
                width: 100%;
            }
        }
}
@media only screen and (max-width: 600px) {
    table {
        width: 100%;
    }
}
@media only screen and (max-width: 480px) {
    table {
        width: 100%;
    }
}
        </style>
        </head>
        <body>
        <h1>Depleting items</h1>
        <table>
        <tr>
        <th>ID</th>
        <th>Item</th>
        <th>Amount Remaining</th>
        </tr>`;
        let count = 1;
        result.forEach(item => {
            html+=`
            <tr>
            <td>${count}</td>
            <td>${item.item}</td>
            <td>${item.amount}</td>
            </tr>`;
            count+=1;
        });
        html+= `
        </table><br>
        <a href="/stock">Return to Stock Management Page</a>
        </body>
        </html>`;
        res.send(html);
    });
});

app.get('/stocklist', function(req, res) {
    var sql="SELECT * FROM stock";
    con.query(sql, function(err, result) {
        let html =`
        <!DOCTYPE html>
        <html>
        <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Stock list</title>
        <style>
        table {
        border-collapse: collapse;
        width: 50%;
        }
        th, td {
        border-bottom: 2px solid black;
        padding: 5px;
        text-align: left;
        }
        tr:nth-child(even) {
        background-color: #f2f2f2;
        }
        tr:hover {
        background-color: rgb(173, 241, 218);
        }
        @media only screen and (max-width: 768px) {
            table {
                width: 100%;
            }
        }
}
@media only screen and (max-width: 600px) {
    table {
        width: 100%;
    }
}
@media only screen and (max-width: 480px) {
    table {
        width: 100%;
    }
}
        </style>
        </head>
        <body>
        <h1>Items available in stock</h1>
        <table>
        <tr>
        <th>ID</th>
        <th>Item</th>
        <th>Amount Remaining</th>
        </tr>`;
        let count = 1;
        result.forEach(item => {
            html+=`
            <tr>
            <td>${count}</td>
            <td>${item.item}</td>
            <td>${item.amount}</td>
            </tr>`;
            count+=1;
        });
        html+= `
        </table><br>
        <a href="/stock">Return to Stock Management Page</a>
        </body>
        </html>`;
        res.send(html);
    })
})

PORT = 3000;
app.listen (PORT, function() {
    console.log ("Server running on http://localhost:3000");
});