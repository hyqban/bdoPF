import { Component, signal, WritableSignal } from '@angular/core';
import { ThemeService } from '../../services/theme-service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';

import { GetResourcePath } from '../../../../wailsjs/go/service/DIContainer';
import { OpenFolderDialog, XmlToJson } from '../../../../wailsjs/go/service/GameData';
import { SearchService } from '../../services/search-service';
import { ItemDetails } from '../../layout/item-details/item-details';

@Component({
    selector: 'app-home',
    imports: [
        ItemDetails,
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
        });
    }

    xmlToJson() {
        XmlToJson(this.folderPath, 'en').then((res) => {
            console.log(res);
        });
    }
}
