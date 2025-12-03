import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Home } from './home/home';
import { BossSchedule } from './boss-schedule/boss-schedule';
import { Settings } from './settings/settings';

const routes: Routes = [
    {
        path: '',
        component: Home,
    },
    {
        path: 'boss',
        component: BossSchedule,
    },
    {
        path: 'settings',
        component: Settings,
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes), Home],
    exports: [RouterModule],
})
export class HomeRoutingModule {}
