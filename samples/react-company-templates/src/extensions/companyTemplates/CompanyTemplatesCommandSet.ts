import { Log } from '@microsoft/sp-core-library';
import {
  BaseListViewCommandSet,
  Command,
  IListViewCommandSetExecuteEventParameters,
  ListViewStateChangedEventArgs
} from '@microsoft/sp-listview-extensibility';
import { getThemeColor } from './themeHelper';
import DialogWrapper from './components/DialogWrapper';
import * as React from 'react';
import { CompanyTemplates } from './components/CompanyTemplates';
import { SPPermission } from "@microsoft/sp-page-context";

export interface ICompanyTemplatesCommandSetProperties { }

const LOG_SOURCE: string = 'CompanyTemplatesCommandSet';

export default class CompanyTemplatesCommandSet extends BaseListViewCommandSet<ICompanyTemplatesCommandSetProperties> {

  public onInit(): Promise<void> {
    Log.info(LOG_SOURCE, 'Initialized CompanyTemplatesCommandSet');

    this.handleCommands();
    return Promise.resolve();
  }

  public onExecute(event: IListViewCommandSetExecuteEventParameters): void {
    switch (event.itemId) {
      case 'COMPANY_TEMPLATES': {
        const templatesComponent = React.createElement(CompanyTemplates, { context: this.context });
        const wrapper = new DialogWrapper(templatesComponent);
        wrapper.show().catch(error => alert(error));
        break;
      }
      default:
        throw new Error('Unknown command');
    }
  }

  private handleCommands(): void {
    const templatesCmd: Command = this.tryGetCommand('COMPANY_TEMPLATES');

    const fillColor = getThemeColor("themeDarkAlt").replace('#', '%23');
    const exportSvg = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 2048 2048'%3E%3Cpath d='M608 128q45 0 77 9t58 24 46 31 40 31 44 23 55 10h992q27 0 50 10t40 27 28 41 10 50v451l-128-128V384H928q-31 0-54 9t-44 24-41 31-45 31-58 23-78 10H128v1152h640v128H0V256q0-27 10-50t27-40 41-28 50-10h480zm0 256q24 0 42-4t33-13 29-20 32-27q-17-15-31-26t-30-20-33-13-42-5H128v128h480zm1019 256l421 421v987H896V640h731zm37 384h165l-165-165v165zm256 128h-384V768h-512v1152h896v-768zm-768 512h512v128h-512v-128zm256-128h-256v-128h256v128zm0-256h-256v-128h256v128zm0-256h-256V896h256v128z' fill='${fillColor}'%3E%3C/path%3E%3C/svg%3E`;
    templatesCmd.iconImageUrl = exportSvg;

    // initial state of the command's visibility
    templatesCmd.visible = false;
    const userListPermission = new SPPermission(this.context.pageContext.list.permissions.value);
    if (userListPermission.hasPermission(SPPermission.addListItems)) {
      templatesCmd.visible = true;
    }

    this.context.listView.listViewStateChangedEvent.add(this, this._onListViewStateChanged);
  }


  private _onListViewStateChanged = (args: ListViewStateChangedEventArgs): void => {
    Log.info(LOG_SOURCE, 'List view state changed');
    this.raiseOnChange();
  }
}
