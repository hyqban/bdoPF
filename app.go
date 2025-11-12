package main

import (
	"context"
	"os"
	"path/filepath"

	// service "bdoPF/internal/service"

	"github.com/wailsapp/wails/v2/pkg/runtime"
)

// App struct
type App struct {
	ctx        context.Context
	// window     *service.Window
	rootPath   string
	assetsPath string
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{}
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx

	a.AppPath()
	// window := service.NewWindow(a)

	// a.window = window
}

func (a *App) GetAppCtx() context.Context {
	return a.ctx
}

func (a *App) AppPath() {
	assets_path := map[string]string{"dev": "frontend/public", "production": "public"}

	// dev & production
	env := runtime.Environment(a.ctx).BuildType

	// bdoPF/build/bin
	exePath, _ := os.Executable()

	if env == "dev" {
		exePath = filepath.Dir(exePath)
		exePath = filepath.Dir(exePath)
	}

	appDir := filepath.Dir(exePath)

	a.rootPath = appDir
	a.assetsPath = filepath.Join(appDir, assets_path[env])
}