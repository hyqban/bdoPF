package main

import (
	// hs "bdoPF/internal/httpserver"
	service "bdoPF/internal/service"
	"embed"

	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
)

//go:embed all:frontend/dist
var assets embed.FS

func main() {
	// Create an instance of the app structure
	di := service.NewDiContainer()

	app := NewApp(di)
	di.Register("app", app)
	// di.SetAppCtx(&app.ctx)
	// di.SetAssetsPath()

	// httpserver := service.NewHttpServer(di)
	// addr := httpserver.Start()
	// app.SetHttpSercer(addr, "httpserver", httpserver)
	// di.SetAddr(addr)
	// di.Register("httpserver", httpserver)

	config := service.NewConfig(di)
	di.Register("config", config)
	
	window := service.NewWindow(di)
	di.Register("window", window)

	fileHandler := service.NewFileHandler(di)
	di.Register("fileHandler", fileHandler)

	// app.ReceivePoints(fileHandler)


	gameData := service.NewGameData(di)
	di.Register("gameData", gameData)

	// Create application with options
	err := wails.Run(&options.App{
		Title:     "bdoPF",
		MinWidth:  config.Window.MinWidth,
		MinHeight: config.Window.MinHeight,
		Width:     config.Window.Width,
		Height:    config.Window.Height,
		Frameless: true,
		AssetServer: &assetserver.Options{
			Assets: assets,
		},
		// BackgroundColour: &options.RGBA{R: 27, G: 38, B: 54, A: 1},
		OnStartup: app.startup,
		Debug: options.Debug{
			OpenInspectorOnStartup: true,
		},
		CSSDragProperty: "widows",
		CSSDragValue:    "1",
		Bind: []interface{}{
			// app,
			di,
			window,
			fileHandler,
			config,
			gameData,
		},
	})

	if err != nil {
		println("Error:", err.Error())
	}
}
