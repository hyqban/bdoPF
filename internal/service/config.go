package service

import (
	"encoding/json"
	"fmt"
	"os"
	"strings"
)

var CONFIG_PATH = "config.json"
var DEFAULT_VERSION = "1.0.0"
// var DEFAULT_VERSION = "0.0.9"

type LatestApp struct {
	Version     string `json:"version"`
	Download    bool   `json:"download"`
	DownloadUrl string `json:"downloadUrl"`
}

type Config struct {
	DI         *DIContainer `json:"-"`
	AppName    string       `json:"appName"`
	Version    string       `json:"version"`
	Window     Window       `json:"window"`
	Theme      string       `json:"theme"`
	Locale     string       `json:"locale"`
	NewVersion LatestApp    `json:"newVersion"`
}

func NewConfig(di *DIContainer) *Config {

	config, err := loadAndValidateConfig(CONFIG_PATH)

	if err != nil {
		panic(fmt.Sprintf("Fatal: failed to load configuration: %v", err))
	}
	config.DI = di
	return config
}

func (cf *Config) ReadConfig() Config {
	return *cf
}

func getDefaultConfig() *Config {
	return &Config{
		AppName: "bdoPF",
		Version: DEFAULT_VERSION,
		Theme:   "lightskyblue",
		Locale:  "en",
		NewVersion: LatestApp{
			Version:     "",
			Download:    false,
			DownloadUrl: "",
		},
		Window: Window{
			OnTop:               false,
			Width:               600,
			Height:              768,
			MaxWidth:            1920,
			MaxHeight:           1080,
			MinWidth:            420,
			MinHeight:           560,
			IsFullScreen:        false,
			IsWidgetMode:        false,
			DefaultWidgetWidth:  200,
			DefaultWidgetHeight: 100,
			WidgetWidth:         200,
			WidgetHeight:        100,
		},
	}
}

func enforceSystemFields(cfg *Config) {
	has := HasLatestVersion(strings.Split(cfg.NewVersion.Version, "."), strings.Split(DEFAULT_VERSION, "."))

	if !has {
		cfg.NewVersion.DownloadUrl = ""
		cfg.NewVersion.Version = ""
		cfg.NewVersion.Download = false
	}

	cfg.Version = DEFAULT_VERSION
}

func writeConfigToFile(cfg *Config, filePath string) error {
	data, err := json.MarshalIndent(cfg, "", "    ")
	if err != nil {
		return fmt.Errorf("failed to marshal config: %w", err)
	}

	if err := os.WriteFile(filePath, data, 0644); err != nil {
		return fmt.Errorf("failed to write config file to %s: %w", filePath, err)
	}
	return nil
}

func (cfg *Config) ReceiveConfigUpdate(raw map[string]any) {

	b, err := json.Marshal(raw)

	if err != nil {
		fmt.Println(err)
		return
	}

	var config Config
	err = json.Unmarshal(b, &config)

	if err != nil {
		fmt.Println(err)
		return
	}

	writeConfigToFile(&config, CONFIG_PATH)
}

func loadAndValidateConfig(filePath string) (*Config, error) {
	cfg := getDefaultConfig()

	data, err := os.ReadFile(filePath)

	if os.IsNotExist(err) {
		fmt.Printf("Config file does not exist, creating default: %s\n", filePath)

		if err := writeConfigToFile(cfg, filePath); err != nil {
			return nil, fmt.Errorf("failed to create default config file: %w", err)
		}
		return cfg, nil
	}

	if err != nil {
		return nil, fmt.Errorf("failed to read config file: %w", err)
	}

	err = json.Unmarshal(data, cfg)
	if err != nil {
		return nil, fmt.Errorf("failed to parse config JSON or invalid format: %w", err)
	}

	enforceSystemFields(cfg)

	err = writeConfigToFile(cfg, filePath)
	if err != nil {
		fmt.Printf("Warning: failed to update config file with missing fields: %v\n", err)
	}

	return cfg, nil
}

func (cfg *Config) SaveConfig() bool {

	fh := cfg.DI.GetFileHandler()

	if fh == nil {
		fmt.Println("Failed to Obtain fileHandler.")
		return false
	}

	err := writeConfigToFile(cfg, CONFIG_PATH)

	if err != nil {
		return false
	}

	return true
}

func (cfg *Config) StartupPrepare(envPath string) {
	// locales
	// dynamic_string.json
	fh := cfg.DI.GetFileHandler()

	// dynamic_strings.json
	// tpath := fh.PathJoin(envPath, "dynamic_strings.json")
	somethingPrepare(fh, DynamicStringsMap, envPath, "dynamic_strings.json")

	// de.json, en.json, fr.json, sp.json
	os.MkdirAll(fh.PathJoin(cfg.DI.ResourcePath.AssetsPath, cfg.DI.ResourcePath.Locale), os.ModePerm)

	for _, el := range LocalesMap {
		temppath, _ := el["locale"].(string)
		somethingPrepare(fh, el, envPath, cfg.DI.ResourcePath.Locale, temppath+".json")
	}

}

func somethingPrepare(fh *FileHandler, tmap map[string]any, fPath ...string) {
	tpath := fh.PathJoin(fPath...)
	data, err := os.ReadFile(tpath)
	if os.IsNotExist(err) {
		// byt, _ := json.MarshalIndent(tmap, "", " ")
		// err = os.WriteFile(tpath, byt, 0644)
		f, err := os.Create(tpath)
		if err != nil {
			fmt.Println("write err:", err)
			return
		}
		defer f.Close()

		enc := json.NewEncoder(f)
		enc.SetEscapeHTML(false)
		enc.SetIndent("", "    ")

		if err := enc.Encode(tmap); err != nil {
			fmt.Println("encode err:", err)
		}
		return
	}

	var dsm map[string]any
	err = json.Unmarshal(data, &dsm)
	if err != nil {
		fmt.Println("line 197: ", err)
		return
	}

	changed := mergeDefault(dsm, tmap)
	if changed {
		fmt.Println("changed.")
		f, err := os.Create(tpath)
		if err != nil {
			fmt.Println("write err:", err)
			return
		}
		defer f.Close()

		enc := json.NewEncoder(f)
		enc.SetEscapeHTML(false)
		enc.SetIndent("", "    ")

		if err := enc.Encode(dsm); err != nil {
			fmt.Println("encode err:", err)
		}
	}
}

func mergeDefault(dst, def map[string]any) (changed bool) {
	for k, defVal := range def {
		dstVal, exists := dst[k]

		if !exists {
			dst[k] = defVal
			changed = true
			continue
		}

		dstMap, ok1 := dstVal.(map[string]any)
		defMap, ok2 := defVal.(map[string]any)

		if ok1 && ok2 {
			if mergeDefault(dstMap, defMap) {
				changed = true
			}
		}
	}
	return
}
