import { resetBrowserState } from './state';

before(() => {
  resetBrowserState();
});

beforeEach(() => {
  resetBrowserState();
});

afterEach(() => {
  resetBrowserState();
});

after(() => {
  resetBrowserState();
});
