import { Injectable, signal, WritableSignal } from '@angular/core';

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
    locales: WritableSignal<any> = signal({});
    langs: Array<Map<string, string>> = [];
    current_locale: WritableSignal<Locale> = signal({ locale: '', name: '' });

    init() {
        
    }
}
