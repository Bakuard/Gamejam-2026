class PullEventManager {
  constructor() {
    this.clearAll();
  }

  registerInbox(eventBoxName, ...eventNames) {
    for (const eventName of eventNames) {
      const inputBoxes = (this.eventToInputBoxes[eventName] ??= {});
      inputBoxes[eventBoxName] = false;
    }
  }

  setEvent(eventName) {
    const inputBoxes = (this.eventToInputBoxes[eventName] ??= {});
    Object.keys(inputBoxes).forEach((eventBoxName) => (inputBoxes[eventBoxName] = true));
  }

  checkEvent(eventBoxName, eventName) {
    const inputBoxes = this.eventToInputBoxes[eventName];
    return inputBoxes && inputBoxes[eventBoxName];
  }

  clearEvent(eventBoxName, eventName) {
    const inputBoxes = this.eventToInputBoxes[eventName];
    if (inputBoxes) inputBoxes[eventBoxName] = false;
  }

  clearAll() {
    this.eventToInputBoxes = {};
  }
}

export const pullEventManager = new PullEventManager();