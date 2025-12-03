package service

type Config struct {
	DI          *DIContainer
	fileHandler *FileHandler
	AppName     string `json:"appName"`
	Version     string `json:"version"`
	Window      Window `json:"window"`
}

func NewConfig(di *DIContainer, fh *FileHandler) *Config {
	return &Config{
		DI: di,
		fileHandler: fh,
	}
}

func (c *Config) ReadConfig() {

}
