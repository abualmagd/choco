import { loginEmail, registerEmail } from "../utils/api";
import { notify } from "../utils/services";

export default () => ({
  isLoginView: true,
  email: null,
  password: null,
  name: null,
  phone: null,
  promise: "waiting",
  showPassword: false,

  init() {
    window.openAuthModal = () => {
      console.log("runded open modal");
      this.$nextTick(() => {
        this.$refs.dialog.showModal();
      });
    };
  },

  toggleState() {
    this.isLoginView = !this.isLoginView;
  },

  toggleShowPassword() {
    this.showPassword = !this.showPassword;
  },

  async LoginWithEmail() {
    this.promise = "loading";
    try {
      await loginEmail({
        email: this.email,
        password: this.password,
      });
      this.promise = "done";
      notify("logined seccussfully");
      this.$refs.dialog.close();
      const queryString = window.location.search;
      const urlParams = new URLSearchParams(queryString);
      const backto = urlParams.get("backto") ?? "";
      const url = window.location.origin + "/" + backto;
      setTimeout(window.location.replace(url), 2000);
    } catch (error) {
      notify(error, true);
      this.promise = "done";
    } finally {
      this.promise = "waiting";
    }
  },

  async RegisterUser() {
    this.promise = "loading";
    try {
      await registerEmail({
        email: this.email,
        password: this.password,
        name: this.name,
        phone: this.phone,
      });
      this.promise = "done";
      notify("registerd seccussfully");
      this.$refs.dialog.close();
    } catch (error) {
      notify(error, true);
      this.promise = "done";
    } finally {
      this.promise = "waiting";
    }
  },
});
