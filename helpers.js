const urlsForUser = (id, urlDatabase) => {
  const filteredURLs = {};
  const keys = Object.keys(urlDatabase);
  for (let key of keys) {
    if(urlDatabase[key]["userID"] === id ){
      filteredURLs[key] = urlDatabase[key];
    }
  }
   return filteredURLs;
}


const addNewUser = (email, password, users) => {
  // Create a user id ... generate a unique id
  const userId = Math.random().toString(36).substring(2, 8);
  // Create a new user object
  //const hashedPassword = bcrypt.hashSync(password, salt);
  users[userId] = { 
    id: userId,
    email,
    password: password,
  };
  const newUser = users[userId] ;
  return newUser;
};

const getUserByEmail = (email, users) => {
  for (let userId in users) {
    if (users[userId].email === email) {
      return users[userId];
    }
  }
  return null;
};

function generateRandomString() {
  let result = '';
  let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let charactersLength = characters.length;
  for (let i = 0; i < charactersLength; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));

  }
  return result.substring(0, 6);

};

module.exports = {
  urlsForUser,
  addNewUser,
  getUserByEmail,
  generateRandomString
};