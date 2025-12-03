import { DOCUMENT, Inject, Injectable, Renderer2, RendererFactory2 } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class ThemeService {
    private renderer: Renderer2;
    private currentTheme = 'lightskyblue';

    constructor(@Inject(DOCUMENT) private document: Document, rendererFactory: RendererFactory2) {
        this.renderer = rendererFactory.createRenderer(null, null);
        const savedTheme = localStorage.getItem('app-theme');

        if (savedTheme) {
            this.setTheme(savedTheme);
        } else {
            this.setTheme(this.currentTheme);
        }
    }

    setTheme(themeName: string) {
        this.document.body.classList.forEach((className) => {
            if (className.startsWith('theme-')) {
                this.renderer.removeClass(this.document.body, className);
            }
        });

        const themeClass = `theme-${themeName}`;
        this.renderer.addClass(this.document.body, themeClass);
        localStorage.setItem('app-theme', themeName);
    }

    getCurrentTheme() {
        return this.currentTheme;
    }
}
