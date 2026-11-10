
process.loadEnvFile(); // reads .env into process.env (built into Node 21.7+)
const express = require("express");
const crypt = require("crypto");
const app = express(); 
app.use(express.urlencoded({ extended: true }));

// Session storage: remembers who is logged in between page loads using a cookie
const session = require("express-session");
app.use(session({
	secret: process.env.SESSION_SECRET, // set in .env
	resave: false,
	saveUninitialized: false, // only create a session once someone logs in
	cookie: { httpOnly: true, sameSite: "lax" }
}));

// Serve the website pages from the public folder
const path = require("path");
app.use(express.static(path.join(__dirname, "public")));

const mysql = require("mysql2");
const pass = process.env.ROOTPASS; 
const conn = mysql.createConnection({host:"localhost",user:"root",password:pass,database:"paws",port:3306});


const hashRounds = 100;
const hashLength=64;
const salt = "salt";


conn.connect(function(err)
{
	if(err)
		console.log("Couldnt connect to MySQL",err);
	else
		console.log("Database connection established");
	
});

//
app.post("/register",function(req,res)
{
	let plainPass = req.body.password; 
	let username = req.body.userName;
	let email = req.body.email;
	let fname = req.body.fname;
	let lname = req.body.lname;
	let gpa = Number(req.body.gpa);
	hashedPass = crypt.pbkdf2Sync(plainPass,salt, hashRounds, hashLength, 'sha512').toString(`hex`);
	let sql = "insert into student (fname,lname,gpa,user_id, email,password,salt) values (?,?,?,?,?,?,?)";
	conn.query(sql,[fname,lname,gpa,username,email,hashedPass,salt],function(err,result)
	{
		if (err)
		{
			console.log("There was an error inserting a student",err);
			res.send('<p>Sign up failed. That username or email may already be taken. <a href="register.html">Try again</a></p>');
		}
		else
			res.send("<p> Hello,"+fname+" "+lname+" "+ '<a href="login.html">Login </a> here </p>');
	});
	
});

app.post("/login",function(req,res)
{
	let plainPass = req.body.password; 
	let email = req.body.email;
	let saltVal="salt";
	const pass = crypt.pbkdf2Sync(plainPass,
        saltVal, hashRounds, hashLength, 'sha512').toString(`hex`);
	let sql = 'select * from student where email=? and password = ?';
	conn.query(sql,[email,pass],function(err,result)
	{
		if(err)
			res.send(err);
		else
		{
			if (result.length === 0)
			{
				console.log('results of the query',result);
				res.send('<p>Your email or password is incorrect<br> <a href="login.html">Login </a> here </p> ');
			}
			else
			{
				// Start a fresh session for this user and remember their username
				req.session.regenerate(function(err)
				{
					if (err)
						return res.send("<p>Could not start your session. <a href=\"login.html\">Try again</a></p>");
					req.session.username = result[0].user_id;
					res.send(`<p>You have logged in successfully ${result[0].fname}<br>Go back to <a href="index.html">home</a></p>`);
				});
			}
		}
	});
});

// Tells the pages who is logged in (used by js/auth.js to fill in the nav)
app.get("/profile", function(req, res)
{
	if (req.session.username)
		res.json({ loggedIn: true, username: req.session.username });
	else
		res.json({ loggedIn: false, username: "Guest" });
});

// Ends the session and sends the user back to the homepage
app.get("/logout", function(req, res)
{
	req.session.destroy(function()
	{
		res.clearCookie("connect.sid");
		res.redirect("/index.html");
	});
});



app.listen(3000, function() { console.log("Site running at http://localhost:3000"); });