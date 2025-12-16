package service

import "fmt"

var APPLICATION_VERSION = "1.0"

var DEFAULT_CONFIG = Config{
	AppName: "bdoPF",
	Version: APPLICATION_VERSION,
	Theme:   "lightskyblue",
	Locale:  "en",
	Window: Window{
		OnTop:               false,
		Width:               600,
		Height:              768,
		MaxWidth:            1920,
		MaxHeight:           1080,
		MinWidth:            300,
		MinHeight:           768,
		IsFullScreen:        false,
		IsWidgetMode:        false,
		DefaultWidgetWidth:  200,
		DefaultWidgetHeight: 200,
		WidgetWidth:         200,
		WidgetHeight:        100,
	},
}

type Config struct {
	DI      *DIContainer `json:"-"`
	AppName string       `json:"appName"`
	Version string       `json:"version"`
	Window  Window       `json:"window"`
	Theme   string       `json:"theme"`
	Locale  string       `json:"locale"`
}

func NewConfig(di *DIContainer) *Config {

	config := Config{
		DI: di,
	}

	fh := config.DI.GetFileHandler()

	if fh != nil {
		fmt.Print("Not found fileHandler point.")
		return &config
	}

	isExist := fh.pathExists("config.json")

	if !isExist {
		config.createDefaultConfigJson()
	}

	config.ReadConfig()
	return &config
}

func (cf *Config) createDefaultConfigJson() {
	cf.Version = DEFAULT_CONFIG.Version
	cf.Theme = DEFAULT_CONFIG.Theme
	cf.Locale = DEFAULT_CONFIG.Locale
	cf.Window.OnTop = DEFAULT_CONFIG.Window.OnTop
	cf.Window.Width = DEFAULT_CONFIG.Window.Width
	cf.Window.Height = DEFAULT_CONFIG.Window.Height
	cf.Window.MaxWidth = DEFAULT_CONFIG.Window.MaxWidth
	cf.Window.MaxHeight = DEFAULT_CONFIG.Window.MaxHeight
	cf.Window.MinWidth = DEFAULT_CONFIG.Window.MinWidth
	cf.Window.MinHeight = DEFAULT_CONFIG.Window.MinHeight
	cf.Window.IsFullScreen = DEFAULT_CONFIG.Window.IsFullScreen
	cf.Window.DefaultWidgetWidth = DEFAULT_CONFIG.Window.DefaultWidgetWidth
	cf.Window.DefaultWidgetHeight = DEFAULT_CONFIG.Window.DefaultWidgetHeight
	cf.Window.WidgetWidth = DEFAULT_CONFIG.Window.WidgetWidth
	cf.Window.WidgetHeight = DEFAULT_CONFIG.Window.WidgetHeight
}

func (cf *Config) ReadConfig() {

}
