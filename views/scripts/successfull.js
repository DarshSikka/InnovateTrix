const { ipcRenderer } = require("electron");
const app = Vue.createApp({
  name: "Application",
  data() {
    return {
      lst: [],
    };
  },
  mounted() {
    ipcRenderer.send("getsuccess:add");
    ipcRenderer.on("render:add", (e, val) => {
      this.lst = val;
    });
  },
});
app.mount("#app");
