import { computed, Injectable, signal } from '@angular/core';
import { SetLocale } from '../../../wailsjs/go/service/DIContainer';
import { DynamicStrings } from '../shared/models/model';
import { ReadDynamicStrings } from '../../../wailsjs/go/service/FileHandler';

export interface Locale {
    locale: string;
    name: string;
}

@Injectable({
    providedIn: 'root',
})
export class I18nService {
    // locales = [
    //     "en": { ...},
    //     "sp": { ...},
    // ]
    // langs = [ { "en": "English"}, ... ]
    // current_locale = ("en")

    private _locales = signal<Record<string, any>>({});
    private _langs = signal<Record<string, string>>({});
    private _currentLang = signal<string>('en');

    locales = this._locales.asReadonly();
    langs = this._langs.asReadonly();
    currentLang = this._currentLang.asReadonly();
    dynamicStrings: DynamicStrings = {
        apporach: {},
        manufacture: {},
        workshop: {},
    };

    currentLocale = computed(() => {
        const lang = this._currentLang();
        this.getDynamicStrings();
        return this._locales()[lang] ?? {};
    });

    constructor() {}

    setLocales(data: Record<string, any>) {
        this._locales.set(data);
    }

    setLangs(langs: Record<string, string>) {
        this._langs.set(langs);
    }

    setCurrentLang(lang: string) {
        this._currentLang.set(lang);
    }

    choiceLang() {
        if (this.currentLang() in this.langs()) {
        } else {
            Object.keys(this.langs()).forEach((k) => {
                this._currentLang.set(this.langs()[k]);
                return;
            });
        }
    }

    t(key: string): any {
        const keys = key.split('.');

        let val: any = this.currentLocale()?.messages;

        for (const k of keys) {
            if (val && typeof val === 'object' && k in val) {
                val = val[k];
            } else {
                return key;
            }
        }
        return val;
    }

    getDynamicStrings() {
        this.dynamicStrings = {
            apporach: {},
            manufacture: {},
            workshop: {},
        };

        ReadDynamicStrings().then((res) => {
            if (res['msg'] === '') {
                this.dynamicStrings = { ...res } as DynamicStrings;
            }
        });
    }

    getDinamicString(key: string, feild: string) {
        if (key === 'apporach') {
            return this.dynamicStrings.apporach[feild] ?? '';
        } else if (key === 'manufacture') {
            return this.dynamicStrings.manufacture[feild] ?? '';
        } else if (key === 'workshop') {
            return this.dynamicStrings.workshop['90' + feild] ?? '';
        } else {
            return '';
        }
    }
}
export function providerI18n(initialData: Record<string, any>) {
    const service = new I18nService();
    service.setLocales(initialData['locales']);
    service.setLangs(initialData['langs'] ?? {});
    service.choiceLang();

    SetLocale(service.currentLang()).then(() => {});

    return {
        provide: I18nService,
        useValue: service,
    };
}
