// src/store/bookerEvents.store.js

let BOOKER_EVENTS = [];

export const addBookerEvent = (event) => {
  BOOKER_EVENTS.unshift({
    _id: Date.now().toString(),
    createdAt: new Date(),
    ...event,
  });
};

export const getBookerEvents = () => {
  return BOOKER_EVENTS;
};
