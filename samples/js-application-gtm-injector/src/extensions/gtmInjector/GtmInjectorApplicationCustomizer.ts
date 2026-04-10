import { override } from '@microsoft/decorators';
import { BaseApplicationCustomizer } from '@microsoft/sp-application-base';
import { SPComponentLoader } from '@microsoft/sp-loader';

const GTM_ID: string = 'GTM-XXXXXXXX';

export default class GtmInjectorApplicationCustomizer
  extends BaseApplicationCustomizer<{}> {

  @override
  public async onInit(): Promise<void> {


    if ((window as any).__gtmLoaded) {
      return Promise.resolve();
    }
    (window as any).__gtmLoaded = true;

    console.log("GTM START");

    this._initDataLayer();

    await this._loadGTM();

    this._setupSPANavigation();

    return Promise.resolve();
  }

  private _initDataLayer(): void {
    (window as any).dataLayer = (window as any).dataLayer || [];

    (window as any).dataLayer.push({
      'gtm.start': new Date().getTime(),
      event: 'gtm.js'
    });

    console.log("dataLayer initialized");
  }

  private async _loadGTM(): Promise<void> {

    await SPComponentLoader.loadScript(
      `https://www.googletagmanager.com/gtm.js?id=${GTM_ID}`
    );
  }

  private _setupSPANavigation(): void {

    this._pushPageView();

    this.context.application.navigatedEvent.add(this, () => {
      this._pushPageView();
    });

    window.addEventListener('popstate', () => {
      this._pushPageView();
    });

    console.log("SPA tracking enabled");
  }

  private _pushPageView(): void {

    (window as any).dataLayer.push({
      event: 'page_view',
      page_path: window.location.pathname,
      page_title: document.title,
      page_location: window.location.href
    });
  }
}