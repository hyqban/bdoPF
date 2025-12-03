package main

import (
	"context"
	"fmt"

	service "bdoPF/internal/service"
)

// App struct
type App struct {
	ctx context.Context
	// window     *service.Window
	DI *service.DIContainer
	// rootPath   string
	// assetsPath string

	// fileHandler *service.FileHandler
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
	fmt.Println("-----------------")

	httpserver := service.NewHttpServer(a.DI)
	a.DI.Register("httpServer", httpserver)
	addr := httpserver.Start()
	a.DI.SetAddr(addr)
}

// func (a *App) ReceivePoints(fh *service.FileHandler) {
// 	a.fileHandler = fh
// }

func (a *App) GetAppCtx() context.Context {
	return a.ctx
}

// func (a *App) SetHttpSercer(addr string, name string, httpServer *service.HttpServer) {
// 	a.DI.SetAddr(addr)
// 	a.DI.Register(name, httpServer)
// }
