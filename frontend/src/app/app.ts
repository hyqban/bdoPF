import { Component, Signal, signal, WritableSignal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CustomeTitleBar } from './home/custome-title-bar/custome-title-bar';
import { WindowServicee } from './services/window-servicee';

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

    constructor(private windowService: WindowServicee) {
        this.isWidgetMode = this.windowService.getIsWidgetMode();
    }

    protected exitWidgetMode() {
        this.windowService.exitWidgetMode();
    }

    // protected appDir() {
    //     AppPath().then((res) => {
    //         this.app = res;
    //         console.log(res);
    //     });
    // }
}
