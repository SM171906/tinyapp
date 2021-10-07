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
const bcrypt = require('bcryptjs');
const salt = bcrypt.genSaltSync(10);

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
};

module.exports = {
  urlDatabase,
  users
};