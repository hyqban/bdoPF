package service

import (
	model "bdoPF/internal/model"
	"encoding/json"
	"fmt"
	"io"
	"os"
	"path/filepath"
	"strings"

	"github.com/sahilm/fuzzy"
)

type SearchResult struct {
	Score       int           `json:"score"`
	MatchString string        `json:"matchString"`
	Item        model.ItemRaw `json:"item"`
}

type SearchableItems []model.ItemRaw

func (s SearchableItems) Len() int {
	return len(s)
}
func (s SearchableItems) String(i int) string {
	return s[i].Name
}

func (s SearchableItems) Less(i, j int) bool {
	return s[i].Name < s[j].Name
}

func (s SearchableItems) Swap(i, j int) {
	s[i], s[j] = s[j], s[i]
}

type Locale struct {
	Locale   string                 `json:"locale"`
	Name     string                 `json:"name"`
	Messages map[string]interface{} `json:"messages"`
}

type FileHandler struct {
	DI *DIContainer
	// RootPath     string
	// AssetsPath   string
	// ResourcePath *model.ResourcePath
}

func NewFileHandler(di *DIContainer) *FileHandler {
	fh := FileHandler{}

	fh.DI = di
	return &fh
}

// func (fh *FileHandler) GetAppPAthandAssetsPath(rootPath string, AssetsPath string) {
// 	fh.rootPath = rootPath
// 	fh.AssetsPath = AssetsPath
// 	fh.ResourcePath = make(map[string]string)

// 	fh.ResourcePath["file"] = "gamecommondata"
// 	fh.ResourcePath["icon"] = "icons"
// 	fh.ResourcePath["locale"] = "locales"
// 	fh.ResourcePath["png"] = "product_icon_png"

// 	// rsPath := map[string]string{
// 	// 	"file":   "gamecommondata",
// 	// 	"icon":   "icons",
// 	// 	"locale": "locales",
// 	// 	"png":    "product_icon_png",
// 	// }

//		// for k, v := range rsPath {
//		// 	fh.ResourcePath[k] = v
//		// }
//	}
func (fh *FileHandler) GetWindowSize() {
	windowInterface, ok := fh.DI.Resolve("window")

	window := windowInterface.(*Window)

	if !ok {
		fmt.Println("Call window from di is failed.")
	}

	size := window.WindowGetSize()
	fmt.Printf("%+v", size)
}

func (fh *FileHandler) ListDir(path string) (map[string][]string, error) {
	dir := make(map[string][]string)
	files, err := os.ReadDir(path)

	if err != nil {
		return dir, nil
	}

	dir["folder"] = []string{}
	dir["file"] = []string{}

	for _, file := range files {
		if file.IsDir() {
			dir["folder"] = append(dir["folder"], file.Name())
		} else {
			dir["file"] = append(dir["file"], file.Name())
		}
	}
	return dir, nil
}

func (fh *FileHandler) PathJoin(elements ...string) string {
	return filepath.Join(elements...)

	// if fh.pathExists(tempPath) {
	// 	return tempPath, true
	// } else {
	// 	return "Path is valid.", false
	// }
}

func (fh *FileHandler) pathExists(path string) bool {
	_, err := os.Stat(path)
	return !os.IsNotExist(err)
}

func (fh *FileHandler) EnsureDir(dirPath string) error {
	return os.MkdirAll(dirPath, os.ModePerm)
}

func (fh *FileHandler) ReadLocales() map[string]interface{} {
	data := map[string]interface{}{
		"locales": make(map[string]interface{}),
		"langs":   make(map[string]string),
	}

	localePath := fh.PathJoin(fh.DI.ResourcePath.AssetsPath, fh.DI.ResourcePath.Locale)

	if localePath == "" {
		return data
	}

	dir, err := fh.ListDir(localePath)

	if err != nil {
		return data
	}

	for _, v := range dir["file"] {
		content, ok := fh.ReadFile(localePath, v)

		if !ok {
			return data
		}

		var ct Locale
		localeBytes, _ := json.Marshal(content)
		_ = json.Unmarshal(localeBytes, &ct)

		result := strings.Split(v, ".")

		if localesMap, ok := data["locales"].(map[string]interface{}); ok {
			localesMap[result[0]] = ct
		}

		if lang, ok := data["langs"].(map[string]string); ok {
			lang[ct.Locale] = ct.Name
		}
	}

	return data
}

func (fh *FileHandler) ReadFile(path string, fileName string) (map[string]interface{}, bool) {
	data := make(map[string]interface{})

	_, err := os.Stat(filepath.Join(path, fileName))

	if err != nil {
		return data, false
	}

	file, err := os.Open(filepath.Join(path, fileName))

	if err != nil {
		return data, false
	}

	content, err := io.ReadAll(file)

	if err != nil {
		return data, false
	}

	err = json.Unmarshal(content, &data)
	if err != nil {
		return data, false
	}
	return data, true
}

func (fh *FileHandler) ReadFileById() {

}

func (fh *FileHandler) ReadSearchIndexJson(item string, lang string) []model.ItemRaw {
	var itemToSearch SearchableItems
	// matchData := []model.ItemRaw{}

	siPath := fh.PathJoin(fh.DI.GetResourcePath().RootPath, fh.DI.GetResourcePath().AssetsPath, fh.DI.GetResourcePath().File, lang)

	data, _ := fh.ReadFile(siPath, "search_index.json")
	jsonBytes, err := json.Marshal(data)

	// fmt.Printf("%T", jsonBytes)

	if err != nil {
	}

	targetMap := make(map[string]model.ItemRaw)

	err = json.Unmarshal(jsonBytes, &targetMap)
	if err != nil {
	}

	for _, v := range targetMap {
		itemToSearch = append(itemToSearch, v)
	}

	matches := fuzzy.FindFrom(item, itemToSearch)
	results := []model.ItemRaw{}

	for _, match := range matches {
		if match.Score >= 50 {
			originalItem := itemToSearch[match.Index]

			results = append(results, model.ItemRaw{
				Id:   originalItem.Id,
				Name: originalItem.Name,
				Icon: originalItem.Icon,
			})
		}
	}

	return results
}
