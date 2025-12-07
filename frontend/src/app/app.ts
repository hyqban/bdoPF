import { Component, inject, signal, WritableSignal } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { WindowServicee } from './services/window-servicee';
import { CustomeTitleBar } from './layout/custome-title-bar/custome-title-bar';
import { BreadCrumbs } from './layout/bread-crumbs/bread-crumbs';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs';

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
    private router = inject(Router);

    currentUrl = toSignal(
        this.router.events.pipe(
            filter((e): e is NavigationEnd => e instanceof NavigationEnd),
            map((e: NavigationEnd) => e.url)
        ),
        { initialValue: this.router.url }
    );

    app: any = {};

    protected exitWidgetMode() {
        this.windowService.exitWidgetMode();
    }
}
