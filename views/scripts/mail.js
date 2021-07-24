const { ipcRenderer } = require("electron");
const app = Vue.createApp({
  name: "Application",
  data() {
    return {
      mails: [],
      username: "",
    };
  },
  methods: {
    resolveid(id, m_id, address) {
      address = address.split("Their address is ")[1];
      ipcRenderer.send("resolve:add", id);
      console.log(address);
      ipcRenderer.send("task:add", {
        from: this.username,
        receiverAddress: address,
        resourceId: id,
      });
      alert(
        "Sent mail to our delivery voulunteers containing essential details"
      );
      ipcRenderer.send("mail:clear", m_id);
    },
  },
  mounted() {
    ipcRenderer.send("mailuser:add", localStorage.getItem("userid"));
    ipcRenderer.on("userrender:add", (e, val) => {
      this.username = val._doc.username;
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
