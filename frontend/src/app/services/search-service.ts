import { Injectable, signal, WritableSignal } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { GetAddr, GetImgPath } from '../../../wailsjs/go/service/DIContainer';
import { SearchResultItem, ItemInfo, BreadCrumbs, Item } from '../shared/models/model';
import { ReadFileById, ReadDynamicStrings } from '../../../wailsjs/go/service/FileHandler';
import { DynamicStrings } from '../shared/models/model';

@Injectable({
    providedIn: 'root',
})
export class SearchService {
    // searchHistory = new SearchHistory();
    env = '';
    addr = '';
    query = signal('');
    searchResults = signal<Item[]>([]);
    currentItem: WritableSignal<ItemInfo> = signal<ItemInfo>({
        itemKey: '',
        itemName: '',
        itemIcon: '',
        itemDesc: '',
        gathering: [],
    });
    breadCrumbs = signal<BreadCrumbs>({
        data: [],
        amount: [1],
        index: 0,
        length: 0,
    });
    imgPath: Record<string, string> = {};
    dynamicStrings: DynamicStrings = {
        apporach: {},
        manufacture: {},
        workshop: {},
    };

    constructor(private sanitizer: DomSanitizer) {}

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

    setCurrentItem(el: ItemInfo) {
        console.log(el);
    }

    addSearchResults(searchResults: SearchResultItem[]) {
        this.searchResults.set(searchResults);
    }

    cleanSearchHistory() {
        this.searchResults.set([]);
    }

    async selectItem(ele: Item): Promise<Record<string, any>> {
        this.cleanBreadCrumbs();

        if (
            this.isEmpty(this.dynamicStrings.apporach) ||
            this.isEmpty(this.dynamicStrings.manufacture) ||
            this.isEmpty(this.dynamicStrings.workshop)
        ) {
            this.getDynamicStrings();
        }

        this.breadCrumbs.update((el) => {
            el.data.push(ele);
            el.length += 1;

            return { ...el };
        });

        let itemInfo: Record<string, any> = await ReadFileById(ele.id);
        return itemInfo;
    }

    nextQueryAndSetCurrentItem(id: string) {
        ReadFileById(id).then((res) => {
            if (res.itemKey) {
                this.currentItem.set(res as ItemInfo);
            }
        });
    }

    nextQuery(ele: Item) {
        this.breadCrumbs.update((el) => {
            el.amount.push(Number(ele.count));
            el.data.push(ele);
            el.index += 1;
            el.length += 1;
            return { ...el };
        });
        this.nextQueryAndSetCurrentItem(ele.id);
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
        // last icon
        if (index + 1 === this.breadCrumbs().length) {
            return;
        }

        this.breadCrumbs.update((el) => {
            if (index === 0) {
                el.data.length = 1;
                el.amount.length = 1;
                el.index = 0;
                el.length = 1;

                this.nextQueryAndSetCurrentItem(
                    this.breadCrumbs().data[this.breadCrumbs().index].id
                );
                return { ...el };
            }

            if (index + 1 < el.length) {
                const newData = el.data.slice(0, index + 1);
                const newAmout = el.amount.slice(0, index + 1);
                el.index = index;
                el.length = index + 1;

                this.nextQueryAndSetCurrentItem(
                    this.breadCrumbs().data[this.breadCrumbs().index].id
                );
                return {
                    ...el,
                    data: newData,
                    amount: newAmout,
                };
            }
            return { ...el };
        });
    }

    calculateDeltaAmount(count: string): number {
        console.log('count: ', count, this.breadCrumbs());

        const len = this.breadCrumbs().length;
        let total: number = 1;

        if (len === 1) {
            return Number(count);
        }
        if (len > 1) {
            total = this.breadCrumbs().amount[len - 1] * Number(count);
        }
        return total;
    }

    totalAmout(count: string): number {
        const len = this.breadCrumbs().length;
        let total: number = 1;

        if (len === 1) {
            return Number(count);
        }
        if (len > 1) {
            this.breadCrumbs().amount.forEach((el) => {
                total *= Number(el);
            });
            total *= Number(count);
        }
        return total;
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

    isEmpty(obj: any): boolean {
        for (const prop in obj) {
            return false;
        }
        return true;
    }
    getDynamicStrings() {
        this.dynamicStrings = {
            apporach: {},
            manufacture: {},
            workshop: {},
        };

        ReadDynamicStrings().then((res) => {
            if (res['msg'] === '') {
                this.dynamicStrings = { ...res } as DynamicStrings;
            }
        });
    }

    getDinamicString(key: string, feild: string) {
        if (key === 'apporach') {
            return this.dynamicStrings.apporach[feild] ?? '';
        } else if (key === 'manufacture') {
            return this.dynamicStrings.manufacture[feild] ?? '';
        } else if (key === 'workshop') {
            return this.dynamicStrings.workshop['90' + feild] ?? '';
        } else {
            return '';
        }
    }
}
