import { updateUserData } from "../utils/api";
import { notify } from "../utils/services";

export default (user) => ({
  user: user,
  editable: false,
  name: user?.name ?? "",
  userPhone: user?.phone ?? "",
  addresses: user?.addresses ?? [],
  isLoading: false,

  toggleEditable() {
    this.editable = !this.editable;
  },

  async logUserOut() {
    try {
      await logoutCurrentUser();
      notify("logout successfully");
    } catch (error) {
      notify(error);
    }
  },

  async updateMyUser() {
    try {
      (this.isLoading = true),
        await updateUserData(
          {
            name: this.name,
            phone: this.userPhone,
          },
          user.id
        );
      notify("updated well");
    } catch (error) {
      notify(error, true);
      this.isLoading = false;
    } finally {
      this.isLoading = false;
    }
  },
});
