const { ipcRenderer } = require("electron");

const app = Vue.createApp({
  name: "MyApp",
  data() {
    return {
      user: {
        profile:
          "https://www.timeshighereducation.com/sites/default/files/byline_photos/anonymous-user-gravatar_0.png",
      },
      resources: [],
      visible: [],
      displayhidden: false,
    };
  },
  methods: {
    signupRedirect() {
      ipcRenderer.send("redirect:add", "openSignupPopup");
    },
    resourceRedirect() {
      ipcRenderer.send("redirect:add", "openResourcePopup");
    },
    displayHidden() {
      this.displayhidden
        ? (this.displayhidden = false)
        : (this.displayhidden = true);
    },
    setRes(id) {
      localStorage.setItem("resid", id);
      console.log(id);
      ipcRenderer.send("redirect:add", "openViewResource");
    },
    search(e) {
      const newVisible = this.resources.filter((m) =>
        m.name.includes(e.target.value)
      );
      this.visible = newVisible;
    },
  },
  mounted() {
    ipcRenderer.on("userrender:add", (e, val) => {
      this.user = val;
      console.log(this.user);
    });
    if (localStorage.getItem("userid") != "undefined") {
      ipcRenderer.send("homeuser:add", localStorage.getItem("userid"));
    }
    ipcRenderer.send("requestall:add", "mainWindow");
    ipcRenderer.on("resrenderer:add", (e, val) => {
      this.resources = val;
      this.visible = val;
      console.log(val);
    });
  },
});
app.mount("#app");
