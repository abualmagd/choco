window.addressComponent = (address) => ({
  id: address?.id ?? null,
  street: address?.street,
  city: address?.city ?? "",
  state: address?.state ?? "",
  country: address?.country ?? "",
  isDefault: address?.isDefault ?? false,
  editable: false,
  show: false,

  showInputs() {
    this.show = !this.show;
    this.editable = !this.editable;
  },
  toggleEditable() {
    this.editable = !this.editable;
  },

  async updateAddress() {
    if (this.id) {
      console.log("update address");
      try {
        await window.updateAddress({
          id: this.id,
          street: this.street,
          city: this.city,
          state: this.state,
          country: this.country,
          isDefault: this.isDefault,
          zipCode: "5555",
        });

        window.notify("address updated");
      } catch (error) {
        window.notify(error, true);
      }
    } else {
      console.log("new address create");
      try {
        await window.addNewAddress({
          street: this.street,
          city: this.city,
          state: this.state,
          country: this.country,
          isDefault: this.isDefault,
          zipCode: "5555",
        });

        window.notify("address created");
      } catch (error) {
        window.notify(error, true);
      }
    }
  },
});
