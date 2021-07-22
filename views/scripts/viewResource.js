const { ipcRenderer } = require("electron");
const app = Vue.createApp({
  name: "Application",
  data() {
    return {
      dat: {},
      mailtothisguy: "",
      user: {},
    };
  },
  methods: {
    mailSend() {
      const address = document.querySelector("[name=txtar]").value;
      if (!address) {
        return alert("Please enter the address");
      }
      ipcRenderer.send("mail:add", {
        subject: `Interest shown in ${this.dat.name}`,
        content: `The user of Resource sharer, namely ${this.user.username} aka <${this.user.email}> is interested in using ${this.dat.name}
        Their address is ${address}`,
        from: this.user.username,
        to: this.dat.createdBy?.username,
        resourceId: this.dat._id,
      });
      alert(`A message has been sent to ${this.dat.createdBy.username}`);
      ipcRenderer.send("window:clear", "viewResource");
    },
  },
  mounted() {
    ipcRenderer.send("viewresourceuser:add", localStorage.getItem("userid"));
    ipcRenderer.on("userrender:add", (e, val) => {
      this.usr = val;
    });
    ipcRenderer.send("rgit:add", localStorage.getItem("resid"));
    ipcRenderer.on("resourcerender:add", (e, val) => {
      this.dat = val;
      this.mailtothisguy = `mailto:${this.dat.createdBy.email}`;
    });
    ipcRenderer.on("userrender:add", (e, val) => {
      this.user = val;
    });
  },
});
app.mount("#app");
