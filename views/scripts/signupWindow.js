(function () {
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
        console.log(e.target[4].files);
        const reader = new FileReader();
        if (e.target[4].files.length > 0) {
          reader.onload = (res) => {
            const fileUrl = res.target.result;
            ipcRenderer.send("user:add", [
              e.target[0].value,
              e.target[1].value,
              e.target[2].value,
              e.target[3].value,
              fileUrl,
            ]);
          };
          reader.readAsDataURL(e.target[4].files[0]);
        } else {
          ipcRenderer.send("user:add", [
            e.target[0].value,
            e.target[1].value,
            e.target[2].value,
            e.target[3].value,
            "https://www.timeshighereducation.com/sites/default/files/byline_photos/anonymous-user-gravatar_0.png",
          ]);
        }
      },
      signin() {
        ipcRenderer.send("redirect:add", "openLoginPopup");
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
})();
