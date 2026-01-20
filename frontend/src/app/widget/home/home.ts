import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { WindowServicee } from '../../services/window-servicee';
import { Clock } from '../clock/clock';

@Component({
    selector: 'widget-home',
    imports: [MatIconModule, Clock],
    templateUrl: './home.html',
    styleUrl: './home.scss',
})
export class Home {
    constructor(protected windowService: WindowServicee) {}

    protected exitWidgetMode() {
        this.windowService.exitWidgetMode();
    }
}
