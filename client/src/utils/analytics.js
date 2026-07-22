export const trackEvent = (eventName, payload = {}) => {
  if (typeof window === 'undefined') {
    return;
  }

  const timestamp = new Date().toISOString();
  const event = {
    eventName,
    payload: {
      ...payload,
      timestamp
    },
    timestamp
  };

  window.__CONTACT_KEEP_ANALYTICS__ = window.__CONTACT_KEEP_ANALYTICS__ || [];
  window.__CONTACT_KEEP_ANALYTICS__.push(event);
};
