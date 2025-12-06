package service

import (
	"github.com/wailsapp/wails/v2/pkg/runtime"
)

type Window struct {
	DI                  *DIContainer
	OnTop               bool `json:"onTop"`
	Width               int  `json:"width"`
	Height              int  `json:"height"`
	MaxWidth            int  `json:"maxWidth"`
	MaxHeight           int  `json:"maxHeight"`
	MinWidth            int  `json:"minWidth"`
	MinHeight           int  `json:"minHeight"`
	IsFullScreen        bool `json:"isFullScreen"`
	IsWidgetMode        bool `json:"isWidgetMode"`
	DefaultWidgetWidth  int  `json:"defaultWidgetWidth"`
	DefaultWidgetHeight int  `json:"defaultWidgetHeight"`
	WidgetWidth         int  `json:"widgetWidth"`
	WidgetHeight        int  `json:"widgetHeight"`
}

func NewWindow(di *DIContainer) *Window {
	return &Window{
		DI: di,
		// ctxProvider: provider,
	}
}

func (window *Window) WindwoClose() {
	hs := window.DI.GetHttpServer()

	if hs == nil {
	}

	hs.Stop()
	// runtime.Quit(window.ctxProvider.GetAppCtx())
	runtime.Quit(*window.DI.GetAppCtx())
}

func (window *Window) WindowSetAlwaysOnTop(top bool) {
	runtime.WindowSetAlwaysOnTop(*window.DI.GetAppCtx(), top)
}

func (window *Window) IsWindowFullscreen() bool {
	return runtime.WindowIsFullscreen(*window.DI.GetAppCtx())
}

func (window *Window) WindowFullscreen() {
	runtime.WindowFullscreen(*window.DI.GetAppCtx())
}

func (window *Window) WindowUnfullscreen() {
	runtime.WindowUnfullscreen(*window.DI.GetAppCtx())
}

func (window *Window) WindowMinimise() {
	runtime.WindowMinimise(*window.DI.GetAppCtx())
}

func (window *Window) WindowGetSize() map[string]int {
	w, h := runtime.WindowGetSize(*window.DI.GetAppCtx())
	return map[string]int{"w": w, "h": h}
}

func (window *Window) WindowSetSize(w int, h int) {
	runtime.WindowSetSize(*window.DI.GetAppCtx(), w, h)
}

func (window *Window) WindowGetPosition() map[string]int {
	x, y := runtime.WindowGetPosition(*window.DI.GetAppCtx())
	return map[string]int{"x": x, "y": y}
}
