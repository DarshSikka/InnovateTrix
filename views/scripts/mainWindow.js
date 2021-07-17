const { ipcRenderer } = require("electron");

const app = Vue.createApp({
  name: "MyApp",
  data() {
    return {
      user: {},
    };
  },
  methods: {
    signupRedirect() {
      ipcRenderer.send("redirect:add", "openSignupPopup");
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
  },
});
app.mount("#app");
