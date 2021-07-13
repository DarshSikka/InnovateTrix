//import dependencies
const electron = require("electron");
const { spawn } = require("child_process");
require("dotenv").config();
const mongoose = require("mongoose");
const { app, BrowserWindow, Menu, ipcMain } = electron;
const url = require("url");
const path = require("path");
const User = require("./models/auth/User");
const bcrypt = require("bcrypt");
// done importing
//define the main window to use later
let signUpWindow;
let MainWindow;
ipcMain.on("auth:add", (e, val) => {
  const [username, password] = val;
  User.findOne({ username, password }, (err, result) => {
    if (!result) {
    }
  });
});
ipcMain.on("redirect:add", (e, val) => {
  if (val == "openSignupPopup") {
    signUpWindow?.loadURL(
      url.format({
        pathname: path.join(__dirname, "views/signupWindow.html"),
        protocol: "file:",
        slashes: true,
      })
    );
  }
});
// Ipc main configuration for authentication
ipcMain.on("user:add", (e, val) => {
  let earlyErrors = new Array();
  const [username, email, password, confirm] = val;
  const userObj = { username, email, password, confirm };
  //Use python language for validation
  const python = spawn("python3", ["python/validation.py"]);
  python.stdin.write(`${password}\n`);
  python.stdin.write(`${confirm}\n`);
  python.stdout.on("data", (data) => {
    const dat = data.toString();
    const json = JSON.parse(dat);
    console.log(json);
    if (json.type === true) {
      earlyErrors = json.errors;
    }
    // Done validation
  });
  //Check for user in mongoose
  User.findOne({ $or: [{ username: username }, { email: email }] }).exec(
    (err, result) => {
      const Mod = new User(userObj);
      let errors = [...earlyErrors];
      console.log(errors);
      if (!result && errors.length == 0) {
        //If not found then save the user
        console.log("user created");
        Mod.save();
        console.log(Mod._id);
        signUpWindow.webContents.send("success:add", "User saved");
      } else {
        //If result is found then send errors to the user
        if (result?.email === Mod.email) {
          errors.push("Email is taken");
        }
        if (result?.username === Mod.username) {
          errors.push("Username is taken");
        }
        console.log("errors near email", errors);
        signUpWindow.webContents.send("error:add", errors);
      }
    }
  );
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
        label: "Signup",
        click() {},
      },
    ],
  },
];
// set up the main window when app is ready
app.on("ready", () => {
  signUpWindow =
    //make the signUpWindow
    new BrowserWindow({
      width: 1000,
      height: 800,
      webPreferences: {
        // Enable electron to be used in vanilla code
        nodeIntegration: true,
        contextIsolation: false,
        enableRemoteModule: true,
      },
    });
  MainWindow = new BrowserWindow({
    width: 1500,
    height: 900,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
    },
  });
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
  try {
    require("electron-reloader")(module, {
      debug: true,
      watchRenderer: true,
    });
  } catch (_) {
    console.log("Error");
  }
}
