//import dependencies
const electron = require("electron");
const Resource = require("./models/data/Resource");
const { spawn } = require("child_process");
require("dotenv").config();
const mongoose = require("mongoose");
const { app, BrowserWindow, Menu, ipcMain } = electron;
const url = require("url");
const path = require("path");
const User = require("./models/auth/User");
const Mailbox = require("./models/data/Mailbox");
// done importing
//define the main window to use later
ipcMain.on("resolve:add", (e, val) => {
  console.log(val);
  Resource.findOneAndUpdate(
    { _id: val },
    { available: false },
    (err, result) => {
      console.log(result);
    }
  );
});
ipcMain.on("askmail:add", (e, val) => {
  Mailbox.find({ to: val }, (err, result) => {
    mailbox.webContents.send("mailrender:add", result);
  });
});
ipcMain.on("mailuser:add", (e, val) => {
  User.findOne({ _id: val }, (err, result) => {
    mailbox.webContents.send("userrender:add", result);
  });
});
ipcMain.on("viewresourceuser:add", (e, val) => {
  User.findOne({ _id: val }, (err, result) => {
    if (!result) {
      console.error("Guest RN");
    } else {
      resourceView.webContents.send("userrender:add", result._doc);
    }
  });
});
ipcMain.on("window:clear", (e, val) => {
  switch (val) {
    case "viewResource":
      resourceView.close();
  }
});
ipcMain.on("mail:add", (e, val) => {
  const { from, to, subject, content, resourceId } = val;
  const mail = new Mailbox({ from, to, subject, content, resourceId });
  mail.save();
});
ipcMain.on("reload:add", (e, val) => {
  app.relaunch();
  app.quit();
});
ipcMain.on("rgit:add", (e, val) => {
  Resource.findOne({ _id: val }, (err, result) => {
    resourceView.webContents.send("resourcerender:add", {
      ...result._doc,
      _id: result._doc._id.toString(),
    });
  });
});
ipcMain.on("resuser:add", (e, val) => {
  User.findOne({ _id: val }, (err, result) => {
    if (!result) {
      console.error("Some problem with the user id");
    } else {
      resourceWindow.webContents.send("userrender:add", {
        _id: result._id,
        username: result.username,
        profile: result.image,
        email: result.email,
      });
    }
  });
});
ipcMain.on("homeuser:add", (e, val) => {
  User.findOne({ _id: val }, (err, result) => {
    if (!result) {
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
  resourceWindowMaker() {
    resourceWindow = new BrowserWindow({
      width: 1000,
      height: 800,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
        enableRemoteModule: true,
      },
    });
    resourceWindow.loadURL(
      url.format({
        pathname: path.join(__dirname, "views/resourceForm.html"),
        protocol: "file:",
        slashes: true,
      })
    );
  }
  viewResourceMaker() {
    resourceView = new BrowserWindow({
      width: 800,
      height: 600,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
        enableRemoteModule: true,
      },
    });
    resourceView.loadURL(
      url.format({
        pathname: path.join(__dirname, "views/viewResource.html"),
        protocol: "file:",
        slashes: true,
      })
    );
  }
  mailboxWindow() {
    mailbox = new BrowserWindow({
      width: 800,
      height: 600,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
        enableRemoteModule: true,
      },
    });
    mailbox.loadURL(
      url.format({
        pathname: path.join(__dirname, "views/mail.html"),
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
let resourceWindow;
let resourceView;
let mailbox;
ipcMain.on("checkuser:add", (e, val) => {
  const { username, password } = val;
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
    }
  });
});
ipcMain.on("resource:add", (e, val) => {
  const rsrc = new Resource(val);
  rsrc.save();
  resourceWindow.webContents.send("created:add", rsrc._id.toString());
});
ipcMain.on("requestall:add", (e, val) => {
  Resource.find({ available: true })
    .sort({ createdAt: "descending" })
    .exec((err, result) => {
      switch (val) {
        case "mainWindow":
          MainWindow.webContents.send(
            "resrenderer:add",
            result.map((ele) => {
              const doc = ele._doc;
              doc._id = doc._id.toString();
              return doc;
            })
          );
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
    case "openResourcePopup":
      windowManager.resourceWindowMaker();
    case "openViewResource":
      windowManager.viewResourceMaker();
  }
});
// Ipc main configuration for authentication
ipcMain.on("user:add", (e, val) => {
  let earlyErrors = new Array();
  const [username, email, password, confirm, image] = val;
  const userObj = { username, email, password, confirm, image };
  //Use python language for validation
  const python = spawn("python3", ["python/validation.py"]);
  python.stdin.write(`${password}\n`);
  python.stdin.write(`${confirm}\n`);
  python.stdout.on("data", (data) => {
    const dat = data.toString();
    const json = JSON.parse(dat);
    if (json.type === true) {
      earlyErrors = json.errors;
    }
    User.findOne({ $or: [{ username: username }, { email: email }] }).exec(
      (err, result) => {
        const Mod = new User(userObj);
        let errors = [...earlyErrors];
        if (!result && errors.length == 0) {
          //If not found then save the user
          Mod.save();
          signUpWindow.webContents.send("success:add", "User saved");
        } else {
          //If result is found then send errors to the user
          if (result?.email === Mod.email) {
            errors.push("Email is taken");
          }
          if (result?.username === Mod.username) {
            errors.push("Username is taken");
          }
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
      {
        label: "mailbox",
        click() {
          windowManager.mailboxWindow();
        },
      },
    ],
  },
  {
    label: "Utility",
    submenu: [{ role: "reload" }],
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
