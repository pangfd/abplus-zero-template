import { Component, Inject, Input, ChangeDetectionStrategy } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { SettingsService, ALAIN_I18N_TOKEN } from '@delon/theme';
import { InputBoolean } from '@delon/util';

import { I18NService } from '@core';
import { UserServiceProxy, ChangeUserLanguageDto } from '@shared/service-proxies/service-proxies';

@Component({
  selector: 'header-i18n',
  template: `
  <nz-dropdown nzPlacement="bottomRight">
    <div *ngIf="showLangText" nz-dropdown>
      <i nz-icon type="global"></i>
      {{ 'menu.lang' | translate}}
      <i nz-icon type="down"></i>
    </div>
    <i *ngIf="!showLangText" nz-dropdown nz-icon type="global"></i>
    <ul nz-menu>
      <li nz-menu-item *ngFor="let item of langs" [nzSelected]="item.code === curLangCode"
        (click)="change(item.code)">
          <span role="img" [attr.aria-label]="item.text" class="pr-xs">{{item.abbr}}</span>
          {{item.text}}
      </li>
    </ul>
  </nz-dropdown>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderI18nComponent {

  /** Whether to display language text */
  @Input() @InputBoolean() showLangText = true;

  get langs() {
    return this.i18n.getLangs();
  }

  get curLangCode() {
    return this.settings.layout.lang;
  }

  constructor(
    private userService: UserServiceProxy,
    private settings: SettingsService,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    @Inject(DOCUMENT) private doc: any,
  ) {
  }

  change(lang: string) {
    const spinEl = this.doc.createElement('div');
    spinEl.setAttribute('class', `page-loading ant-spin ant-spin-lg ant-spin-spinning`);
    spinEl.innerHTML = `<span class="ant-spin-dot ant-spin-dot-spin"><i></i><i></i><i></i><i></i></span>`;
    this.doc.body.appendChild(spinEl);

    this.i18n.use(lang);
    this.settings.setLayout('lang', lang);

    const input = new ChangeUserLanguageDto();
    input.languageName = lang;

    // Tips 调用该接口只能在组件上调用，放i18n.use()方法内，会导致startup时调用i18n.use()多一次api调用且引起reload
    this.userService.changeLanguage(input).subscribe(() => {
      abp.utils.setCookieValue(
        'Abp.Localization.CultureName',
        lang,
        new Date(new Date().getTime() + 5 * 365 * 86400000), // 5 year
        abp.appPath
      );

      setTimeout(() => this.doc.location.reload());
    });
  }
}
