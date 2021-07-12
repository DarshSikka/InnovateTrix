//import dependencies
const electron = require("electron");
const { spawn } = require("child_process");
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
  let earlyErrors = new Array();
  const [username, email, password, confirm] = val;
  const userObj = { username, email, password, confirm };
  const distinctNeed = { username, email };
  const python = spawn("python3", ["python/validation.py"]);
  python.stdin.write(`${password}\n`);
  python.stdin.write(`${confirm}\n`);
  console.log(confirm === password);
  python.stdout.on("data", (data) => {
    const dat = data.toString();
    const json = JSON.parse(dat);
    console.log(json);
    if (json.type === true) {
      earlyErrors = json.errors;
    }
  });
  User.findOne({ $or: [{ username: username }, { email: email }] }).exec(
    (err, result) => {
      const Mod = new User(userObj);
      console.log(result);
      let errors = [...earlyErrors];
      if (!result && !errors) {
        Mod.save();
        MainWindow.webContents.send("success:add", "User saved");
      } else {
        if (result.email === Mod.email) {
          errors.push("Email is taken");
        }
        if (result.username === Mod.username) {
          errors.push("Username is taken");
        }
        console.log(errors);
        MainWindow.webContents.send("error:add", errors);
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
