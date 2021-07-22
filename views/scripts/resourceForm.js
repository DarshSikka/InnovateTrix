const { ipcRenderer } = require("electron");
const app = Vue.createApp({
  name: "Application",
  data() {
    return {
      usr: {},
      code: "",
    };
  },
  methods: {
    rel() {
      ipcRenderer.send("reload:add");
    },
    async submit(e) {
      console.log(e.target);
      e.preventDefault();
      const [
        nam,
        category,
        dummy1,
        city,
        state,
        country,
        complete,
        pin,
        dummy2,
        description,
        photo1,
      ] = e.target;
      const reader = new FileReader();
      let image;
      reader.onload = (event) => {
        image = event.target.result;
        const neededObject = {
          name: nam.value,
          category: category.value,
          address: {
            city: city.value,
            state: state.value,
            country: country.value,
            completeAddress: complete.value,
            pincode: pin.value,
          },
          image,
          createdBy: {
            username: this.usr.username,
            profile: this.usr.profiele,
            email: this.usr.email,
          },
          description: description.value,
        };
        ipcRenderer.send("resource:add", neededObject);
      };
      reader.readAsDataURL(photo1.files[0]);
    },
  },
  mounted() {
    ipcRenderer.send("resuser:add", localStorage.getItem("userid"));
    console.log("req");
    ipcRenderer.on("userrender:add", (e, usr) => {
      this.usr = usr;
      console.log("user rendered");
    });
    ipcRenderer.on("created:add", (e, val) => {
      this.code = val;
    });
  },
});
app.mount("#vueapp");
