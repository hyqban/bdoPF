import { Component, computed, inject, OnInit, signal, ViewChild } from '@angular/core';
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
import { OpenFolderDialog, XmlToJson } from '../../../../wailsjs/go/service/GameData';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
    CheckForUpdates,
    DownloadUpdates,
    StartUpdate,
} from '../../../../wailsjs/go/service/Updater';

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
    folderPath: string = '';
    private _snackBar = inject(MatSnackBar);
    convert = signal(false);

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
    readonly DEBOUNCE_TIME = 500;

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

    onFIlesSelected() {
        OpenFolderDialog().then((res) => {
            this.folderPath = res['folderPath'];
        });
    }

    async xmlToJson(locale: string) {
        console.log(locale);

        this.convert.set(true);
        const res = await OpenFolderDialog();
        this.folderPath = res['folderPath'];

        XmlToJson(this.folderPath, locale).then((res) => {
            this.convert.set(false);

            this._snackBar.open(res['msg'], 'Diss', {
                horizontalPosition: 'center',
                verticalPosition: 'top',
            });
        });
    }

    checkForUpdates() {
        CheckForUpdates(this.configService.config().version).then((res) => {
            console.log(res);
            if (res['code'] === '200' && res['url']) {
                this.configService.config.update((state) => ({
                    ...state,
                    newVersion: {
                        ...state.newVersion,
                        downloadUrl: res['url'],
                        version: res['version'],
                    },
                }));
            }
            this._snackBar.open(res['msg'], 'Diss', {
                horizontalPosition: 'right',
                verticalPosition: 'top',
            });
        });
    }

    downloadUpdates() {
        console.log(this.configService.config().newVersion);

        DownloadUpdates().then((res) => {
            if (res['code'] === '200') {
                this.configService.config.update((state) => ({
                    ...state,
                    newVersion: {
                        ...state.newVersion,
                        download: true,
                    },
                }));
                this._snackBar.open(res['msg'], 'Diss', {
                    horizontalPosition: 'right',
                    verticalPosition: 'top',
                });
            }
        });
    }

    startUpdate() {
        StartUpdate().then(() => {});
    }
}
