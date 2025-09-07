import dayjs from "dayjs";

export default (createdAt) => ({
  myDate: createdAt,

  init() {
    this.format();
  },

  format() {
    this.myDate = dayjs(this.myDate).format("MMMM D, YYYY h:mm A");
  },
});
