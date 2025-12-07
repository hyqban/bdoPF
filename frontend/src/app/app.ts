import { Component, inject, OnInit, signal, WritableSignal } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet, Event as RouterEvent } from '@angular/router';
import { WindowServicee } from './services/window-servicee';
import { CustomeTitleBar } from './layout/custome-title-bar/custome-title-bar';
import { BreadCrumbs } from './layout/bread-crumbs/bread-crumbs';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map, Subscription } from 'rxjs';

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
    // private routerSubscription: Subscription | undefined;
    // currentUrl = signal('');

    // ngOnInit(): void {
    //     this.routerSubscription = this.router.events
    //         .pipe(
    //             filter(
    //                 (event: RouterEvent): event is NavigationEnd => event instanceof NavigationEnd
    //             ),
    //             map((e: NavigationEnd) => e.urlAfterRedirects)
    //         )
    //         .subscribe((path: string) => {
    //             this.currentUrl.set(path);
    //         });
    // }

    // ngOnDestroy(): void {
    //     this.routerSubscription?.unsubscribe();
    // }
    currentUrl = toSignal(
        this.router.events.pipe(
            filter((e): e is NavigationEnd => e instanceof NavigationEnd),
            map((e: NavigationEnd) => e.urlAfterRedirects)
        ),
        { initialValue: this.router.url }
    );

    app: any = {};

    protected exitWidgetMode() {
        this.windowService.exitWidgetMode();
    }
}
