import { addNewAddress, updateAddress } from "../utils/api";
import { notify } from "../utils/services";

export default (address) => ({
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
        await updateAddress({
          id: this.id,
          street: this.street,
          city: this.city,
          state: this.state,
          country: this.country,
          isDefault: this.isDefault,
          zipCode: "5555",
        });

        notify("address updated");
      } catch (error) {
        notify(error, true);
      }
    } else {
      console.log("new address create");
      try {
        await addNewAddress({
          street: this.street,
          city: this.city,
          state: this.state,
          country: this.country,
          isDefault: this.isDefault,
          zipCode: "5555",
        });

        notify("address created");
      } catch (error) {
        notify(error, true);
      }
    }
  },
});
