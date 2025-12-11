import { Component, signal, WritableSignal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { WindowServicee } from './services/window-servicee';
import { CustomeTitleBar } from './layout/custome-title-bar/custome-title-bar';
import { BreadCrumbs } from './layout/bread-crumbs/bread-crumbs';
import { useCurrentUrl } from './shared/router/route';

@Component({
    selector: 'app-root',
    imports: [RouterOutlet, CustomeTitleBar, BreadCrumbs],
    templateUrl: './app.html',
    styleUrl: './app.scss',
})
export class App {
    constructor(protected windowService: WindowServicee) {
        this.isWidgetMode = this.windowService.getIsWidgetMode();
    }
    protected readonly title = signal('frontend');
    protected isWidgetMode!: WritableSignal<boolean>;
    currentUrl = useCurrentUrl();

    app: any = {};

    protected exitWidgetMode() {
        this.windowService.exitWidgetMode();
    }
    
}
