//import dependencies
const electron = require("electron");
require("dotenv").config();
const mongoose = require("mongoose");
const { app, BrowserWindow, Menu, ipcMain } = electron;
const url = require("url");
const path = require("path");
const User = require("./models/auth/User");
// done importing

//define the main window to use later
let MainWindow;

// Ipc main configuration for authentication
ipcMain.on("user:add", (e, val) => {
  console.log(val, e);
  const [username, email, password] = val;
  const userObj = { username, email, password };
  const distinctNeed = { username, email };
  User.findOne(distinctNeed, (err, result) => {
    console.log(err, result);
    if (!result) {
      const Mod = new User(userObj);
      Mod.save();
    } else {
      let errors = new Array();
      if (result.email === User.email) {
        errors.push("Email is taken");
      }
      if (result.username === User.username) {
        errors.push("Username is taken");
      }
      MainWindow.webContents.send("error:add", errors);
    }
  });
});
//done

//connect to the mongodb via mongoose.js
mongoose.connect(
  process.env.DB_URI,
  {
    useUnifiedTopology: true,
    useNewUrlParser: true,
  },
  (err) => {
    if (err) throw err;
    console.log("Connected to the database");
  }
);
//Make the menu template for it to appear on top
const MenuMainTemplate = [
  {
    label: "App",
    submenu: [
      {
        label: "Add",
        click() {
          console.log("Hello World");
        },
      },
    ],
  },
];
// set up the main window when app is ready
app.on("ready", () => {
  MainWindow =
    //make the MainWindow
    new BrowserWindow({
      webPreferences: {
        // Enable electron to be used in vanilla code
        nodeIntegration: true,
        contextIsolation: false,
        enableRemoteModule: true,
      },
    });

  //load the mainWindow.html file into the window
  MainWindow.loadURL(
    url.format({
      pathname: path.join(__dirname, "views/mainWindow.html"),
      protocol: "file:",
      slashes: true,
    })
  );
  //Build the menu from the menu template array
  const menu = Menu.buildFromTemplate(MenuMainTemplate);

  //Set the menu as the app menu
  Menu.setApplicationMenu(menu);
});

//Insert developer tools if not production environment

if (process.env.NODE_ENV !== "production") {
  MenuMainTemplate.push({
    label: "Developer Tools",
    submenu: [
      {
        label: "Toggle Dev Tools",
        click(item, win) {
          win.toggleDevTools();
        },
      },
      { role: "reload" },
    ],
  });
}
