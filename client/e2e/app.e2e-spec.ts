import { ControlPage } from './app.po';

describe('control App', () => {
  let page: ControlPage;

  beforeEach(() => {
    page = new ControlPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
