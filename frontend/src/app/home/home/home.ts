import { Component, signal, WritableSignal } from '@angular/core';
import { ThemeService } from '../../services/theme-service';
import { BreadCrumbs } from '../../layout/bread-crumbs/bread-crumbs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';

import { GetWindowSize, ReadSearchIndexJson } from '../../../../wailsjs/go/service/FileHandler';
import { GetResourcePath } from '../../../../wailsjs/go/service/DIContainer';
import { OpenFolderDialog, XmlToJson } from '../../../../wailsjs/go/service/GameData';
import { SearchService } from '../../services/search-service';

@Component({
    selector: 'app-home',
    imports: [
        BreadCrumbs,
        MatFormFieldModule,
        MatInputModule,
        MatIconModule,
        MatButtonModule,
        FormsModule,
        MatButtonModule,
    ],
    templateUrl: './home.html',
    styleUrl: './home.scss',
})
export class Home {
    folderPath: string = '';
    rootPath = signal('');
    assetPath = signal('');

    constructor(protected themeService: ThemeService, protected searchService: SearchService) {
        GetResourcePath().then((res) => {
            this.rootPath.set(res.RootPath);
            this.assetPath.set(res.AssetsPath);
        });
    }

    changeTheme(themeName: string) {
        this.themeService.setTheme(themeName);
    }

    onFIlesSelected() {
        OpenFolderDialog().then((res) => {
            this.folderPath = res['folderPath'];
            console.log(this.folderPath);
        });
    }

    xmlToJson() {
        XmlToJson(this.folderPath, 'en').then((res) => {
            console.log(res);
        });
    }

    search() {
        ReadSearchIndexJson('rice', 'en').then((res) => {
            console.log(res);
        });
    }
    // ngAfterViewInit() {
    //     this.getWindowSize();
    // }

    // getWindowSize() {
    //     GetWindowSize().then((res) => {
    //         console.log(res);
    //     });
    // }
}
