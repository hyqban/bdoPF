package service

import (
	model "bdoPF/internal/model"
	"context"
	"fmt"
	"os"
	"path/filepath"

	"github.com/wailsapp/wails/v2/pkg/runtime"
)

type DIContainer struct {
	AppCtx         *context.Context
	Addr           string
	Env            string
	locale         string
	ResourcePath   model.ResourcePath
	Independencies map[string]interface{}
}

func NewDiContainer() *DIContainer {
	return &DIContainer{Independencies: make(map[string]interface{})}
}

func (di *DIContainer) Register(name string, instance interface{}) {
	di.Independencies[name] = instance
}

func (di *DIContainer) Resolve(name string) (ind interface{}, exist bool) {
	instance, ok := di.Independencies[name]

	if !ok {
		return nil, false
	}

	return instance, true
}

func (di *DIContainer) SetLocale(locale string) {
	fmt.Println("before: ", di.locale)
	di.locale = locale
	fmt.Println("after: ", di.locale)
}

func (di *DIContainer) GetLocale() string {
	return di.locale
}

func (di *DIContainer) SetAddr(addr string) {
	di.Addr = addr
}

func (di *DIContainer) GetAddr() string {
	return di.Addr
}

func (di *DIContainer) GetImgPath() map[string]string {
	fh := di.GetFileHandler()

	if fh != nil {
	}

	if di.Env == "dev" {
		return map[string]string{
			"env":  di.Env,
			"icon": di.ResourcePath.Icon,
			"png":  di.ResourcePath.Png,
		}
	}
	return map[string]string{
		"icon": fh.PathJoin(di.Addr, di.ResourcePath.AssetsPath, di.ResourcePath.Icon),
		"png":  fh.PathJoin(di.Addr, di.ResourcePath.AssetsPath, di.ResourcePath.Png),
	}
}

func (di *DIContainer) ListIndependencies() map[string]interface{} {
	temp := make(map[string]interface{})

	for k, v := range di.Independencies {
		temp[k] = v
	}
	return temp
}

func (di *DIContainer) SetAppCtx(appCtx *context.Context) {
	di.AppCtx = appCtx
}

func (di *DIContainer) GetAppCtx() *context.Context {
	return di.AppCtx
}

func (di *DIContainer) GetResourcePath() *model.ResourcePath {
	return &di.ResourcePath
}

func (di *DIContainer) SetAssetsPath() {
	assetsPath := map[string]string{"dev": "frontend/public", "production": "public"}

	resourcePath := model.ResourcePath{}

	env := runtime.Environment(*di.GetAppCtx()).BuildType
	di.Env = env

	exePath, _ := os.Executable()

	if env == "dev" {
		exePath = filepath.Dir(exePath)
		exePath = filepath.Dir(exePath)
	}

	rootPath := filepath.Dir(exePath)

	resourcePath.RootPath = rootPath
	resourcePath.AssetsPath = assetsPath[env]
	resourcePath.File = "gamecommondata"
	resourcePath.Icon = "icons"
	resourcePath.Locale = "locales"
	resourcePath.Png = "product_icon_png"
	di.ResourcePath = resourcePath
}

func (di *DIContainer) GetFileHandler() *FileHandler {
	fhInterface, found := di.Resolve("fileHandler")

	if !found {
		return nil
	}

	fh := fhInterface.(*FileHandler)
	return fh
}

func (di *DIContainer) GetHttpServer() *HttpServer {
	hsInterface, found := di.Resolve("httpServer")

	if !found {
		return nil
	}

	fh := hsInterface.(*HttpServer)
	return fh
}
