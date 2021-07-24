const { ipcRenderer } = require("electron");
const app = Vue.createApp({
  name: "Application",
  data() {
    return {
      tasks: [],
      user: {},
      assignment: {},
    };
  },
  methods: {
    done() {
      console.log(this.assignment.task._doc._id);
      ipcRenderer.send("task:clear", {
        id: this.assignment.task._doc._id,
        username: this.user._doc.username,
      });
      alert("Marked as done!");
      window.location.reload();
    },
    assign(id) {
      if (!this.assignment.resource) {
        console.log(id);
        ipcRenderer.send("assign:add", {
          id,
          assignedTo: this.user._doc.username,
        });
        alert("Assigned to you!");
        window.location.reload();
      } else {
        alert("You are already assigned a delivery!");
      }
    },
  },
  mounted() {
    ipcRenderer.send("asktask:add", localStorage.getItem("userid"));
    ipcRenderer.on("render:add", (e, val) => {
      this.tasks = val;
      console.log(val);
    });
    ipcRenderer.send("taskuser:add", localStorage.getItem("userid"));
    ipcRenderer.on("userrender:add", (e, val) => {
      this.user = val;
      ipcRenderer.send("getassigned:add", this.user._doc.username);
    });
    ipcRenderer.on("renderassigned:add", (e, val) => {
      this.assignment = val;
      console.log(val);
    });
  },
});
app.mount("#app");
