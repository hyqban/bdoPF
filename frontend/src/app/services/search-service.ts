import { Injectable, signal } from '@angular/core';
import { GetAddr, GetImgPath } from '../../../wailsjs/go/service/DIContainer';
import { SearchResultItem, ItemInfo, BreadCrumbs } from '../shared/models/model';

@Injectable({
    providedIn: 'root',
})
export class SearchService {
    // searchHistory = new SearchHistory();
    env = '';
    addr = '';
    query = signal('');
    searchResults = signal<SearchResultItem[]>([]);
    currentItem = signal<ItemInfo>;
    breadCrumbs = signal<BreadCrumbs>({
        data: [],
        amount: [1],
        index: 0,
        length: 0,
    });
    imgPath: Record<string, string> = {};

    ngOnInit() {
        this.getAddr();
        this.getImgPath();
    }

    getAddr(): void {
        GetAddr()
            .then((addr: string) => {
                this.addr = addr;
            })
            .catch((err) => {
                console.log(err);
            });
    }

    getImgPath(): void {
        GetImgPath().then((res) => {
            this.env = res['env'];
            this.imgPath = {
                png: res['png'],
                icon: res['icon'],
            };
        });
    }

    imgPathJoin(folderPath: string, iconPath: string): string {
        if (folderPath && iconPath) {
            if (this.env === 'dev') {
                // dev:   http://127.0.0.1:51780\public\product_icon_png/00000874.png
                // build: http://127.0.0.1:51780/public/127.0.0.1:51780\public\product_icon_png/00000874.png
                return (
                    'http://' + this.addr + '/public/' + folderPath + '/' + iconPath.toLowerCase()
                );
            }
            return 'http://' + folderPath + '/' + iconPath.toLowerCase();
        }
        return '';
    }

    addSearchResults(searchResults: SearchResultItem[]) {
        this.searchResults.set(searchResults);
    }

    cleanSearchHistory() {
        this.searchResults.set([]);
    }

    addBreadCrumb(bd: SearchResultItem, amount: string) {
        this.breadCrumbs.update((el) => {
            const newData = [...el.data, bd];
            const newAmout = [...el.amount, Number(amount)];
            el.index += 1;
            el.length += 1;

            return {
                ...el,
                data: newData,
                amount: newAmout,
            };
        });
    }

    selectBreadCrumb(index: number) {
        this.breadCrumbs.update((el) => {
            if (index === 0) {
                el.data.length = 1;
                el.amount.length = 1;
                el.index = 0;
                el.length = 1;
                return { ...el };
            }

            if (index + 1 <= el.length) {
                const newData = el.data.slice(0, index + 1);
                const newAmout = el.amount.slice(1, index + 1);
                el.index = index;
                el.length = index + 1;

                return {
                    ...el,
                    data: newData,
                    amount: newAmout,
                };
            }
            return { ...el };
        });
    }

    cleanBreadCrumbs() {
        this.breadCrumbs.update((el) => {
            el.data.length = 0;
            el.amount.length = 1;
            el.index = 0;
            el.length = 0;

            return { ...el };
        });
    }
}
