import {
  chromium,
  firefox,
  webkit,
  BrowserType,
  BrowserContext,
  Page,
  ChromiumBrowser,
  FirefoxBrowser,
  WebKitBrowser,
  LaunchOptions,
  BrowserContextOptions
} from 'playwright';

import {browserName, launchOptions, contextOptions} from '../playwright.conf';

const browsers = {chromium, firefox, webkit};
export type BrowserInstance = ChromiumBrowser | FirefoxBrowser | WebKitBrowser;
export type BrowserTypes = BrowserType<BrowserInstance>;
export type PlaywrightParams = {
  browser: BrowserTypes,
  launchOptions: LaunchOptions,
  contextOptions: BrowserContextOptions
};

class Playwright {
  private browser: BrowserTypes;
  private launchOptions: LaunchOptions;
  private contextOptions: BrowserContextOptions;
  private context: BrowserContext;

  public page: Page;

  constructor({browser, launchOptions: _launchOptions, contextOptions: _contextOptions}: PlaywrightParams) {
    this.browser = browser;
    this.launchOptions = _launchOptions;
    this.contextOptions = _contextOptions;
  }

  async launchBrowser() {
    if (!this.context) {
      console.log(`Launch browser ${browserName} with`, this.launchOptions);

      const browserInstance: BrowserInstance = await this.browser.launch(this.launchOptions);
      this.context = await browserInstance.newContext(this.contextOptions);

      // Default timeout used to wait for selector/actions reuiring timeout
      this.context.setDefaultTimeout(2000);
    }
  }

  async newPage(): Promise<Page> {
    if (this.page && !this.page.isClosed()) {
      await this.page.close();
    }

    if (!this.context) {
      await this.launchBrowser();
    }
    this.page = await this.context.newPage();
    return this.page;
  }

  /**
   *
   * @param timeoutInSeconds number of seconds to wait (default: 1000s)
   */
  async pause(timeoutInSeconds = 1000, msg?: string) {
    console.log(`Warning : pause done for ${timeoutInSeconds}s` + (msg ? ` (${msg})` : ''));
    await this.page.waitForTimeout(timeoutInSeconds * 1000);
  }
}

export const test = new Playwright({browser: browsers[browserName], launchOptions, contextOptions});
export function page(): Page {
  return test.page;
}

export function debug() {
  test.pause();
}
