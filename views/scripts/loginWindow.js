const { ipcRenderer } = require("electron");
const app = Vue.createApp({
  name: "Application",
  data() {
    return {
      errors: "",
      color: "red",
    };
  },
  methods: {
    login(e) {
      e.preventDefault();
      const [username, password] = e.target;
      ipcRenderer.send("checkuser:add", {
        username: username.value,
        password: password.value,
      });
    },
  },
  mounted() {
    ipcRenderer.on("errorauth:add", (e, val) => {
      console.log(val);
      if (val.custom?.error) {
        this.color = "red";
      } else {
        this.color = "green";
      }
      this.errors = val.custom?.message;
      console.log(this.color);
      this.userid = val.data;
      localStorage.setItem("userid", this.userid);
    });
  },
});
app.mount("#app");
