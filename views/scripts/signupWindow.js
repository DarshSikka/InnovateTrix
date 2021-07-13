const { ipcRenderer } = require("electron");
const app = Vue.createApp({
  name: "Application",
  data() {
    return {
      name: this.name,
      errors: "",
      success: "",
    };
  },
  methods: {
    submission: (e) => {
      e.preventDefault();
      console.log("getting event", e);
      ipcRenderer.send("user:add", [
        e.target[0].value,
        e.target[1].value,
        e.target[2].value,
        e.target[3].value,
      ]);
    },
  },
  mounted() {
    ipcRenderer.on("error:add", (e, value) => {
      this.errors = value.join(", ");
    });
    ipcRenderer.on("success:add", (e, value) => {
      this.success = value;
    });
  },
});

//ipcRenderer.on("error:add", (e, value) => {
//const ele = document.createElement("div");
//ele.appendChild(document.createTextNode(String(value)));
//document.body.appendChild(ele);*/
//});
app.mount("#app");
