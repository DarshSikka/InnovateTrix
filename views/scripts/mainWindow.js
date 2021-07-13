const { ipcRenderer } = require("electron");

const app = Vue.createApp({
  name: "MyApp",
  methods: {
    signupRedirect() {
      ipcRenderer.send("redirect:add", "openSignupPopup");
    },
  },
});

app.mount("#app");
