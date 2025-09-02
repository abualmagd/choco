import { changeWebLang } from "../utils/api";
import { notify } from "../utils/services";

export default (locales) => ({
  currentLang: locales.currentLanguage,

  async changeMyLanguage() {
    try {
      console.log("changeing");

      await changeWebLang(this.currentLang);

      window.location.reload();
    } catch (error) {
      console.log("err ", error);
      notify("error in change language" + error, true);
    }
  },
});
