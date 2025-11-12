package service

import (
	CP "bdoPF/internal/interfaces"

	"github.com/wailsapp/wails/v2/pkg/runtime"
)

type Window struct {
	ctxProvider         CP.ContextProvider
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

func NewWindow(provider CP.ContextProvider) *Window {
	return &Window{
		ctxProvider: provider,
	}
}

func (window *Window) WindwoClose() {
	runtime.Quit(window.ctxProvider.GetAppCtx())
}

func (window *Window) WindowSetAlwaysOnTop(top bool) {
	runtime.WindowSetAlwaysOnTop(window.ctxProvider.GetAppCtx(), top)
}

func (window *Window) IsWindowFullscreen() bool {
	return runtime.WindowIsFullscreen(window.ctxProvider.GetAppCtx())
}

func (window *Window) WindowFullscreen() {
	runtime.WindowFullscreen(window.ctxProvider.GetAppCtx())
}

func (window *Window) WindowUnfullscreen() {
	runtime.WindowUnfullscreen(window.ctxProvider.GetAppCtx())
}

func (window *Window) WindowMinimise() {
	runtime.WindowMinimise(window.ctxProvider.GetAppCtx())
}

func (window *Window) WindowGetSize() map[string]int {
	w, h := runtime.WindowGetSize(window.ctxProvider.GetAppCtx())
	return map[string]int{"w": w, "h": h}
}

func (window *Window) WindowSetSize(w int, h int) {
	runtime.WindowSetSize(window.ctxProvider.GetAppCtx(), w, h)
}

func (window *Window) WindowGetPosition() map[string]int {
	x, y := runtime.WindowGetPosition(window.ctxProvider.GetAppCtx())
	return map[string]int{"x": x, "y": y}
}
