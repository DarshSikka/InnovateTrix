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
      filters: [
        "Medical",
        "Hospital Help",
        "Home Survival for Patients",
        "Food",
        "General",
      ],
    };
  },
  methods: {
    signupRedirect() {
      ipcRenderer.send("redirect:add", "openSignupPopup");
    },
    resourceRedirect() {
      ipcRenderer.send("redirect:add", "openResourcePopup");
    },
    filtering(e) {
      e.preventDefault();
      const [a, b, c, d, f] = e.target;
      const marr = [a, b, c, d, f];
      let newFilters = new Array();
      marr.forEach((ele) => {
        console.log(ele.checked);
        if (ele.checked) {
          newFilters.push(ele.value);
        }
      });
      this.filters = newFilters;
      let ef = document.querySelector("input[srch]");
      const newVisible = this.resources.filter((m) => {
        return m.name.includes(ef.value) && this.filters.includes(m.category);
      });
      this.visible = newVisible;
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
    loginRedirect() {
      ipcRenderer.send("redirect:add", "openLoginPopup");
    },
    search(e) {
      const newVisible = this.resources.filter((m) => {
        return (
          m.name.includes(e.target.value) && this.filters.includes(m.category)
        );
      });
      this.visible = newVisible;
    },
    logout() {
      localStorage.removeItem("userid");
      ipcRenderer.send("reload:add");
    },
    voulunteer() {
      ipcRenderer.send("voulunteer:add", {
        username: this.user.username,
        email: this.user.email,
      });
      alert("Added to voulunteer list!");
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
