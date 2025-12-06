import { computed, Injectable, signal } from '@angular/core';
import { SetLocale } from '../../../wailsjs/go/service/DIContainer';

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
    // current_locale = { locale: "en", name: "English"}
    // locales: WritableSignal<Record<string, any>> = signal<Record<string, any>>({});
    // // langs: Array<Record<string, string>> = [];
    // current_lang: WritableSignal<string> = signal('en');
    // // current_locale: WritableSignal<Locale> = signal({ locale: '', name: '' });
    // current_locale = computed(() => {
    //     const lang = this.current_lang();
    //     return this.locales()[lang] ?? {};
    // });
    // langs = computed(() => {
    //     const data: Record<string, string> = {};
    //     Object.keys(this.locales()).forEach((k) => {
    //         data[k] = this.locales()[k]?.name ?? k;
    //     });
    //     return data;
    // });

    // async init() {
    //     ReadLocales().then((res: any) => {
    //         if (Object.keys(res?.locales).length > 0 && Object.keys(res?.langs).length > 0) {
    //             this.locales.set(res.locales);
    //             this.langs = res?.langs;
    //         }
    //     });
    // }

    // setLanguage(lang: string) {
    //     if (this.locales()[lang]) {
    //         this.current_lang.set(lang);
    //     }
    // }
    private _locales = signal<Record<string, any>>({});
    private _langs = signal<Record<string, string>>({});
    private _currentLang = signal<string>('en');

    locales = this._locales.asReadonly();
    langs = this._langs.asReadonly();
    currentLang = this._currentLang.asReadonly();

    currentLocale = computed(() => {
        const lang = this._currentLang();
        return this._locales()[lang] ?? {};
    });

    constructor() {
        console.log('running...');
    }

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
