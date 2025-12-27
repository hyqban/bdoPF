package main

import (
	"context"

	service "bdoPF/internal/service"
)

// App struct
type App struct {
	ctx context.Context
	DI  *service.DIContainer
}

// NewApp creates a new App application struct
func NewApp(di *service.DIContainer) *App {
	return &App{
		DI: di,
	}
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx

	a.DI.SetAppCtx(&a.ctx)
	a.DI.SetAssetsPath()

	httpserver := service.NewHttpServer(a.DI)
	a.DI.Register("httpServer", httpserver)
	addr := httpserver.Start()
	a.DI.SetAddr(addr)
}

func (a *App) GetAppCtx() context.Context {
	return a.ctx
}
