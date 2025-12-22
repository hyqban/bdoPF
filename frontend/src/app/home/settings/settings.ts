import { Component, computed, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule, MatMenuTrigger } from '@angular/material/menu';
import { ThemeService } from '../../services/theme-service';
import { I18nService } from '../../services/i18n-service';
import { SetLocale } from '../../../../wailsjs/go/service/DIContainer';
import { ReeiveConfigUpdate } from '../../../../wailsjs/go/service/Config';
import { SearchService } from '../../services/search-service';
import { ConfigService } from '../../services/config-service';

type KeyValueComparator = (a: { key: any; value: any }, b: { key: any; value: any }) => number;

@Component({
    selector: 'app-settings',
    imports: [MatCardModule, MatButtonModule, MatIconModule, MatMenuModule],
    templateUrl: './settings.html',
    styleUrl: './settings.scss',
})
export class Settings {
    constructor(
        private themeService: ThemeService,
        protected i18nService: I18nService,
        private searchService: SearchService,
        protected configService: ConfigService
    ) {}

    @ViewChild(MatMenuTrigger) trigger!: MatMenuTrigger;

    langs = computed(() => {
        return Object.entries(this.i18nService.langs());
    });
    currentLang = computed(() => {
        let temp = '';
        for (const element of this.langs()) {
            if (element[0] === this.i18nService.currentLang()) {
                temp = element[1];
            }
        }
        return temp;
    });
    currentTheme = computed(() => this.themeService.getCurrentTheme());
    originalOrder: KeyValueComparator = (a, b) => 0;

    expand() {
        this.trigger.openMenu();
    }

    changeTheme(theme: string) {
        this.themeService.setTheme(theme);
    }

    spliteLang(str: string[], idx: number): string {
        // str: ['de', 'Deutsch'];
        return str[idx];
    }

    async changeLocale(str: string[], idx: number) {
        // str: ['de', 'Deutsch'];
        this.i18nService.setCurrentLang(str[idx]);
        this.searchService.cleanAllCache();
        // Notify Go that the app language has changed.
        await SetLocale(str[idx]);
        // this.config.locale.set(str[idx]);
        this.configService.config.update((el) => {
            el.locale = str[idx];
            return { ...el };
        });

        await ReeiveConfigUpdate(this.configService.submitFieldUpdate());
        localStorage.setItem('locale', str[idx]);
    }
}
