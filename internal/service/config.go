package service

import (
	"encoding/json"
	"fmt"
	"os"
)

type Config struct {
	DI      *DIContainer `json:"-"`
	AppName string       `json:"appName"`
	Version string       `json:"version"`
	Window  Window       `json:"window"`
	Theme   string       `json:"theme"`
	Locale  string       `json:"locale"`
}

func NewConfig(di *DIContainer) *Config {

	config, err := loadAndValidateConfig("config.json")

	if err != nil {
		panic(fmt.Sprintf("Fatal: failed to load configuration: %v", err))
	}
	config.DI = di
	return config
}

func getDefaultConfig() *Config {
	return &Config{
		AppName: "bdoPF",
		Version: "1.0",
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
			DefaultWidgetHeight: 100,
			WidgetWidth:         200,
			WidgetHeight:        100,
		},
	}
}

func enforceSystemFields(cfg *Config) {
	cfg.Version = "1.0"
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
