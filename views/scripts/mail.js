const { ipcRenderer } = require("electron");
const app = Vue.createApp({
  name: "Application",
  data() {
    return {
      mails: [],
    };
  },
  methods: {
    resolveid(id) {
      ipcRenderer.send("resolve:add", id);
      console.log(id);
    },
  },
  mounted() {
    ipcRenderer.send("mailuser:add", localStorage.getItem("userid"));
    ipcRenderer.on("userrender:add", (e, val) => {
      ipcRenderer.send("askmail:add", val._doc.username);
    });
    ipcRenderer.on("mailrender:add", (e, val) => {
      this.mails = val;
      console.log(val);
      console.log(this.mails);
    });
  },
});
app.mount("#app");
