export default {
  instance: null,
  setInstance(instance) {
    this.instance = instance;
  },
  next() {
    if (this.instance) this.instance.go(">");
  },
  prev() {
    if (this.instance) this.instance.go("<");
  },
};
