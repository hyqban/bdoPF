package service

type Config struct {
	AppName string `json:"appName"`
	Version string `json:"version"`
	Window  Window `json:"window"`
}

func NewConfig() *Config {
	return &Config{}
}

func (c *Config) ReadConfig() {
	
}
