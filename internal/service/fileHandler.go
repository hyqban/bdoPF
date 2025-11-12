package service

import (
	"os"
	"path/filepath"
)

type FileHandler struct {
	rootPath     string
	assetsPath   string
	resourcePath map[string]string
}

func NewFileHandler(rootPath string, assetSPath string) *FileHandler {
	ft := FileHandler{}
	ft.rootPath = rootPath
	ft.assetsPath = assetSPath
	ft.resourcePath = make(map[string]string)

	rsPath := map[string]string{
		"file":   "commondata",
		"icon":   "icons",
		"locale": "locales",
		"png":    "product_icon_png",
	}

	for k, v := range rsPath {
		ft.resourcePath[k] = v
	}
	return &ft
}

func (ft *FileHandler) JoinPaths(elements ...string) string {
	return filepath.Join(elements...)
}

func (ft *FileHandler) Exists(path string) bool {
	_, err := os.Stat(path)
	return !os.IsNotExist(err)
}

func (ft *FileHandler) EnsureDir(dirPath string) error {
	return os.MkdirAll(dirPath, os.ModePerm)
}

func (ft *FileHandler) GetRourcePath() map[string]string {
	return ft.resourcePath
}

func (ft *FileHandler) ReadFile() {

}

func (ft *FileHandler) ReadFileById() {

}
