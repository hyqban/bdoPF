import { Component, computed, signal, WritableSignal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { WindowServicee } from './services/window-servicee';
import { CustomeTitleBar } from './layout/custome-title-bar/custome-title-bar';
import { BreadCrumbs } from './layout/bread-crumbs/bread-crumbs';
import { useCurrentUrl } from './shared/router/route';
import { Home } from './widget/home/home';

@Component({
    selector: 'app-root',
    imports: [RouterOutlet, CustomeTitleBar, BreadCrumbs, Home],
    templateUrl: './app.html',
    styleUrl: './app.scss',
})
export class App {
    constructor(protected windowService: WindowServicee) {}

    protected readonly title = signal('frontend');
    protected isWidgetMode = computed(() => this.windowService.getIsWidgetMode());
    currentUrl = useCurrentUrl();

    app: any = {};

    protected exitWidgetMode() {
        this.windowService.exitWidgetMode();
    }
}
