const{urlsForUser, addNewUser, getUserByEmail,generateRandomString} = require('./helpers.js');
const{urlDatabase, users} = require('./database.js');

const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const response = require("express");
const cookieParser = require('cookie-parser');
const { v4: uuidv4 } = require('uuid');
const { reset } = require("nodemon");
const bcrypt = require('bcryptjs');
const salt = bcrypt.genSaltSync(10);
const cookieSession = require('cookie-session')

app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");

app.use(cookieSession({
  name: 'session',
  keys: ["key1", "key2"],
  maxAge: 24 * 60 * 60 * 1000 
}));



app.get("/", (req, res) => {
  const userId = req.session['user_id'];
  const user = users[userId];
  if (!user){
    return res.redirect("/login");
  }
  res.redirect("/urls");
});

app.get("/register", (req, res) => {
  //Display the register form
  if(req.session.user_id){
    res.redirect("/urls");
  }else {
    const templateVars = { user: null };
    res.render("register", templateVars);
  }
  
});

//Handling register form submitted
app.post("/register", (req, res) => {
  // Extract the email and password from the form
  const email = req.body.email;
  const password = req.body.password;
  // check if user already exists
  const user = getUserByEmail(email, users);
  if (email === "" || password === "" || user) {
    res.status(400);
    res.send("Please input valid credential <a href='/register'>Register</a> ");
  } else {
     const user = addNewUser(email, bcrypt.hashSync(password, salt), users);
    // Setting the cookie in the user's browser
    req.session.user_id = user.id;
    const id = user.id;
    users[id] = user;
    res.redirect("/urls");
  }
});

app.get("/login", (req, res) => {
  //Display the register form
  if(req.session.user_id){
    res.redirect("/urls");
  } else {
    const templateVars = { user: null };
  res.render("login", templateVars);
  
  }
  
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = getUserByEmail(email, users);

  if (!user){
    return res.status(403).send("Invalid credentials. Please <a href='/login'>Login</a>");
  }
  //password hashed
  let hashPw = getUserByEmail(email, users)["password"];

  const isPasswordCorrect = bcrypt.compareSync(password,hashPw );
  
  if(!isPasswordCorrect) {
    return res.status(403).send("Invalid credentials. Please <a href='/login'>Login</a>");
  } else  {
   req.session.user_id = user.id;
   res.redirect("/urls");
  }
  
});

app.get("/urls", (req, res) => {
  // read the user id from the cookies
  const userId = req.session['user_id'];
  // retrieve the user object from users db
  console.log("urls: "+userId)
  if(!userId) {
    res.status(401).send("You must <a href='/login'>Login</a> first");
    return
  }
  const updatedURLs = urlsForUser(userId, urlDatabase);
  const currentUser = users[userId];
  const templateVars = { 
    urls: updatedURLs, 
    user: currentUser 
  };
  console.log(urlDatabase);
  res.render("urls_index", templateVars);
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});

app.post("/urls", (req, res) => {
  const userID = req.session.user_id;
  const shortURL = generateRandomString();
  if(!userID){
    return res.send("<a href='/login'>Login</a> to add an url!!")
  }
  urlDatabase[shortURL] = {
    longURL: req.body.longURL, 
    userID: userID
  };
  res.redirect(`/urls/${shortURL}`);
});
 
app.get("/urls/new", (req, res) => {
  // read the user id value from the cookies
  const userId = req.session.user_id;
  if (!userId) {
    res.redirect("/login");
  } else {
  // retrieve the user object from users db
  const currentUser = users[userId];
  const templateVars = { user: currentUser };
  res.render("urls_new", templateVars);
  }
});

app.get("/urls/:shortURL", (req, res) => {
  const userId = req.session.user_id;
  //retrieve the user object from user db
  if(!userId) {
    return res.send("<a href='/login'>Login</a> to Edit!!");
  }
  if(urlDatabase[req.params.shortURL].userID !== userId){
    return res.send("Don't have permission!!");
  }
  const currentUser = users[userId];
  const templateVars = { 
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL].longURL, 
    user: currentUser
   };
   
  res.render("urls_show", templateVars);
});

app.post("/urls/:id", (req, res) => {
  const shortURL = req.params.id;
  const userId = req.session.user_id;
  // udateUrl is from urls_show(name)
  if(!userId){
    return res.send ("<a href='/login'>Login</a> to Edit!!");
  }
  if(urlDatabase[shortURL].userID !== userId){
    return res.send("Don't have permission to Edit this URL!!");
  }
  urlDatabase[shortURL].longURL = req.body.updateUrl; 
  res.redirect("/urls");
});

app.get("/u/:shortURL", (req, res) => {

  if(!urlDatabase[req.params.shortURL]){
    return res.send ("shortURL hasn't been created.");
  }
  const longURL = urlDatabase[req.params.shortURL].longURL;
  if (!longURL) {
    
    return res.send("<html><body>Error!!</body></html>\n");
    
  }
  res.redirect(longURL);
});


app.post("/urls/:id/delete", (req, res) => {

  const userId = req.session.user_id;

  if (userId) {
    const urls = urlsForUser(userId, urlDatabase);
    const id = req.params.id;
    const url = urls[id];

    if(urlDatabase[id].userID !== userId){
      return res.send("Don't have permission to Delete this URL!!");
    }
    if(url){
      delete urlDatabase[id];
    }
     res.redirect("/urls");;
  } else {
    return res.send("Please login to Delete");
  }
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

