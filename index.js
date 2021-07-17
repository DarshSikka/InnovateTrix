//import dependencies
const electron = require("electron");
const { session } = require("electron");
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
ipcMain.on("homeuser:add", (e, val) => {
  User.findOne({ _id: val }, (err, result) => {
    if (!result) {
      throw new Error("Some problem with the user id");
    } else {
      MainWindow.webContents.send("userrender:add", {
        _id: result._id,
        username: result.username,
        profile: result.image,
        email: result.email,
      });
    }
  });
});
class Windows {
  signupWindow() {
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
    signUpWindow?.loadURL(
      url.format({
        pathname: path.join(__dirname, "views/signupWindow.html"),
        protocol: "file:",
        slashes: true,
      })
    );
  }
  loginWindowMaker() {
    loginWindow = new BrowserWindow({
      width: 1000,
      height: 800,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
        enableRemoteModule: true,
      },
    });
    loginWindow.loadURL(
      url.format({
        pathname: path.join(__dirname, "views/loginWindow.html"),
        protocol: "file:",
        slashes: true,
      })
    );
  }
}
const windowManager = new Windows();
let signUpWindow;
let MainWindow;
let loginWindow;
ipcMain.on("checkuser:add", (e, val) => {
  const { username, password } = val;
  console.log(val);
  User.findOne({ username, password }, (err, result) => {
    if (!result) {
      loginWindow.webContents.send("errorauth:add", {
        custom: {
          error: true,
          message: "Wrong username/password",
        },
      });
    } else {
      loginWindow.webContents.send("errorauth:add", {
        custom: {
          error: false,
          message: "Logged In",
        },
        data: result._id.toString(),
      });
      console.log(result._id);
      console.log(typeof result._id);
    }
  });
});
ipcMain.on("redirect:add", (e, val) => {
  switch (val) {
    case "openSignupPopup":
      windowManager.signupWindow();
      break;
    case "openLoginPopup":
      windowManager.loginWindowMaker();
      break;
  }
});
// Ipc main configuration for authentication
ipcMain.on("user:add", (e, val) => {
  let earlyErrors = new Array();
  const [username, email, password, confirm, image] = val;
  console.log(image);
  const userObj = { username, email, password, confirm, image };
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
    User.findOne({ $or: [{ username: username }, { email: email }] }).exec(
      (err, result) => {
        console.log("Execking");
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
  // Done validation
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
    role: "nothin",
    submenu: [
      {
        label: "Signup",
        role: "nothing",
        click() {},
      },
    ],
  },
];
// set up the main window when app is ready
app.on("ready", () => {
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
