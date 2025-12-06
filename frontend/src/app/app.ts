import { Component, Signal, signal, WritableSignal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { WindowServicee } from './services/window-servicee';
import { CustomeTitleBar } from './layout/custome-title-bar/custome-title-bar';

@Component({
    selector: 'app-root',
    imports: [RouterOutlet, CustomeTitleBar],
    templateUrl: './app.html',
    styleUrl: './app.scss',
})
export class App {
    protected readonly title = signal('frontend');
    protected isWidgetMode!: WritableSignal<boolean>;

    app: any = {};

    constructor(protected windowService: WindowServicee) {
        this.isWidgetMode = this.windowService.getIsWidgetMode();
    }

    protected exitWidgetMode() {
        this.windowService.exitWidgetMode();
    }
}
