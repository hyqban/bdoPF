package main

import (
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
	app := NewApp()
	window := service.NewWindow(app)
	fileHandler := service.NewFileHandler(app.rootPath, app.assetsPath)

	// app.window = window

	// Create application with options
	err := wails.Run(&options.App{
		Title:     "bdoPF",
		Width:     600,
		Height:    768,
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
			window,
			fileHandler,
		},
	})

	if err != nil {
		println("Error:", err.Error())
	}
}
