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
  b6UTxQ: {
      longURL: "https://www.tsn.ca",
      userID: "aJ48lW"
  },
  i3BoGr: {
      longURL: "https://www.google.ca",
      userID: "aJ48lW"
  },
  i3BoGl: {
    longURL: "https://www.google.ca",
    userID: "aJ48lM"
}
};


const users = {
  "user1RandomID": {
    id: "user1RandomID",
    email: "user@example.com",
    password: bcrypt.hashSync("ok", salt)
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: bcrypt.hashSync("dishwasher-funk", salt)
  }
}

//Helper function
const urlsForUser = (id) => {
  const filteredURLs = {};
  const keys = Object.keys(urlDatabase);
  for (let key of keys) {
    if(urlDatabase[key]["userID"] === id ){
      filteredURLs[key] = urlDatabase[key];
    }
  }
   return filteredURLs;
}


const addNewUser = (email, password) => {
  // Create a user id ... generate a unique id
  const userId = Math.random().toString(36).substring(2, 8);
  // Create a new user object
  const hashedPassword = bcrypt.hashSync(password, salt);
  const newUser = {
    id: userId,
    email,
    password: hashedPassword,
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
    if (users[userId].email === email) {
      return users[userId];
    }
  }
  return null;
};

app.get("/", (req, res) => {
  const userId = req.cookies['user_id'];
  const user = users[userId];
  if (!user){
    return res.redirect("/login");
  }
  res.redirect("/urls");

  res.send("Hello!");
});

app.get("/register", (req, res) => {
  //Display the register form
  const templateVars = { user: null };
  res.render("register", templateVars);
});


//Handling register form submitted


app.post("/register", (req, res) => {
  // Extract the email and password from the form
  // req.body (body-parser) => get the info from our form
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, salt)
  // validation: check that the user is not already in the database
  const user = getUserByEmail(email);
  if (email === "" || password === "" || user) {
    res.status(400);
    res.send('None shall pass');
  } else {
    const userId = addNewUser(email, hashedPassword);
    // Setting the cookie in the user's browser
    res.cookie('user_id', userId);
    res.redirect("/urls");
  }
});



app.get("/login", (req, res) => {
  //Display the register form
  const templateVars = { user: null };
  res.render("login", templateVars);

});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  let hashPw = getUserByEmail(email, users)["password"]
  const isPasswordCorrect = bcrypt.compareSync(password,hashPw );
  console.log(isPasswordCorrect);
  //const userId = req.cookies['user_id'];
  const user = getUserByEmail(email);
  if (!user){
    return res.status(403).send("Invalid credentials. Please <a href='/login'>Login</a>");
  }
  if(!isPasswordCorrect) {
    return res.status(403).send("Invalid credentials. Please <a href='/login'>Login</a>");
  } else  {
    res.cookie("user_id", user.id);
    console.log(user);
    res.redirect("/urls");
  }
  
});



app.get("/urls", (req, res) => {
  // read the user id from the cookies
  const userId = req.cookies['user_id'];
  // retrieve the user object from users db
  if(!userId) {
    res.status(401).send("You must <a href='/login'>Login</a> first");
    return
  }
  //userdatabase needs to pass if it is moved to helper file.
  const updatedURLs = urlsForUser(userId);
  const currentUser = users[userId];
  const templateVars = { urls: updatedURLs, user: currentUser };
  res.render("urls_index", templateVars);
});

app.post("/logout", (req, res) => {
  res.clearCookie('user_id', { path: '/' });
  res.redirect("/login");
});

app.post("/urls", (req, res) => {
  const userID = req.cookies['user_id'];
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = {longURL: req.body.longURL, userID: userID} ;
  console.log(req.body.longURL);
  console.log(urlDatabase);
  console.log(shortURL);
  res.redirect(`/urls/${shortURL}`);
});



app.get("/urls/new", (req, res) => {
  // read the user id value from the cookies
  const userId = req.cookies['user_id'];
  if (!userId) {
    res.redirect("/login");
  }
  // retrieve the user object from users db
  const currentUser = users[userId];
  const templateVars = { user: currentUser };
  res.render("urls_new", templateVars);
});



app.get("/urls/:id", (req, res) => {
  const userId = req.cookies['user_id'];
  //retrieve the user object from user db
  if(!userId) {
    return res.send("Login to Edit!!");
  }
  const currentUser = users[userId];
  const templateVars = { shortURL: req.params.id, longURL: urlDatabase[req.params.id].longURL, user: currentUser };
  res.render("urls_show", templateVars);
});

app.post("/urls/:id", (req, res) => {
  const shortURL = req.params.id;
  urlDatabase[shortURL].longURL = req.body.updateUrl; // udateUrl is from urls_show(name)
  res.redirect("/urls");
});

app.get("/u/:shortURL", (req, res) => {
  // const longURL = ...
  const longURL = urlDatabase[req.params.shortURL].longURL;
  if (!longURL) {
    
    return res.send("<html><body>Error!!</body></html>\n");
    
  }
  res.redirect(longURL);
});


app.post("/urls/:id/delete", (req, res) => {
  const userId = req.cookies['user_id'];
  if (userId) {
    const urls = urlsForUser(userId);
    const id = req.params.id;
    const url = urls[id];
    if(url){
      delete urlDatabase[id];
    }
     res.redirect("/urls");;
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

