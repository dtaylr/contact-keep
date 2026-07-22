export const DEVICE_VIEWPORTS = [
  {
    label: 'desktop macbook',
    preset: 'macbook-13',
    tags: ['@desktop']
  },
  {
    label: 'ipad tablet',
    preset: 'ipad-2',
    orientation: 'landscape',
    tags: ['@tablet', '@ipad']
  },
  {
    label: 'iphone mobile',
    preset: 'iphone-x',
    tags: ['@mobile', '@iphone']
  },
  {
    label: 'android mobile',
    preset: 'samsung-s10',
    tags: ['@mobile', '@android']
  }
];

export const applyDeviceViewport = device => {
  if (device.preset) {
    if (device.orientation) {
      cy.viewport(device.preset, device.orientation);
      return;
    }

    cy.viewport(device.preset);
    return;
  }

  cy.viewport(device.width, device.height);
};
