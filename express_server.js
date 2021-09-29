const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const  response  = require("express");
const cookieParser = require('cookie-parser');
const { v4: uuidv4 } = require('uuid');
const { reset } = require("nodemon");

app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");


function generateRandomString() {
  let result = '';
  let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let charactersLength = characters.length;
  for (let i = 0; i < charactersLength; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));

  }
  return result.substring(0, 6);

};


const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
}


const addNewUser = (email, password) => {
  // Create a user id ... generate a unique id
  const userId = Math.random().toString(36).substring(2, 8);
  // Create a new user object
  const newUser = {
    id: userId,
    email,
    password,
  };
  // Add the user to the database
  // Read the value associated with the key
  // nameOfTheobject[key]
  // how you add a value to an object
  // nameOfTheobject[key] = value
  users[userId] = newUser;
  return userId;
};

const getUserByEmail = (email) => {
   for (let userId in users) {
    if(users[userId].email === email) {
      return users[userId];
    }

   }
   return null;
 };
 
//  const validUser = (email, password) => {
//    const user = getUserEmail(email);
//    //check that the email & password are not empty strings
//    if (user && user.password !== "" && user && user.password !== password ) {
//      return user.id;
//    } else {
//      return res.status(403);
//    }
//  };


app.get("/register", (req,res) => {
  //Display the register form
  const templateVars = {user: null};
  res.render("register", templateVars);
});


//Handling register form submitted
 app.post("/register", (req, res) => {
  // Extract the email and password from the form
  // req.body (body-parser) => get the info from our form
  const email = req.body.email;
  const password = req.body.password;
  // validation: check that the user is not already in the database
  const user = getUserByEmail(email);
  if(email === "" || password === "" || user){
    res.status(400);
    res.send('None shall pass');
  } else {
    const userId = addNewUser(email, password); 
    // Setting the cookie in the user's browser
    res.cookie('user_id', userId);
    res.redirect("/urls");
  }
    
  
  
 });


app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls", (req, res) => {
  // read the user id from the cookies
  const userId = req.cookies['user_id'];
   // retrieve the user object from users db
   const currentUser = users[userId];
  const templateVars = { urls: urlDatabase, user: currentUser };
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
});

app.get("/urls/new", (req, res) => {
    // read the user id value from the cookies
    const userId = req.cookies['user_id'];
    // retrieve the user object from users db
    const currentUser = users[userId];
   const templateVars = {user: currentUser};
  res.render("urls_new", templateVars);
});



app.get("/urls/:shortURL", (req, res) => {
  const userId = req.cookies['user_id'];
  //retrieve the user object from user db
  const currentUser = users[userId];
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], user: currentUser };
  res.render("urls_show", templateVars);
});

app.post("/urls/:id", (req, res) => {
  const shortURL = req.params.id;
  urlDatabase[shortURL] = req.body.updateUrl; // udateUrl is from urls_show(name)
  res.redirect("/urls");
});

app.get("/u/:shortURL", (req, res) => {
  // const longURL = ...
  const longURL = urlDatabase[req.params.shortURL];
  if (!longURL) {
    res.send("<html><body>Error!!</body></html>\n");
    return;
  }
  res.redirect(longURL);
});


app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});


app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.post("/login",(req, res) => {

  res.cookie("username", req.body.username);
  //console.log("req", req);
  res.redirect("/urls");
});

app.post("/logout", (req,res) => {
  res.clearCookie('user_id', {path:'/'});
  res.redirect("/urls");
});




app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});



app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

