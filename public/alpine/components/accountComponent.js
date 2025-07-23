window.accountComponent = (user) => ({
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
      window.notify("logout successfully");
    } catch (error) {
      window.notify(error);
    }
  },

  async updateMyUser() {
    try {
      (this.isLoading = true),
        await window.updateUserData(
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
