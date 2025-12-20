import { Component, computed, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule, MatMenuTrigger } from '@angular/material/menu';
import { ThemeService } from '../../services/theme-service';
import { I18nService } from '../../services/i18n-service';
import { SetLocale } from '../../../../wailsjs/go/service/DIContainer';
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
        protected config: ConfigService
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

    changeLocale(str: string[], idx: number) {
        // str: ['de', 'Deutsch'];
        console.log(str);
        this.i18nService.setCurrentLang(str[idx]);
        this.searchService.cleanAllCache();
        // Notice go that langugae has changed
        SetLocale(str[idx]).then(() => {});
    }
}
