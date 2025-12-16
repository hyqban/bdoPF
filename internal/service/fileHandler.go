package service

import (
	model "bdoPF/internal/model"
	"encoding/json"
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
	DI          *DIContainer
	searchIndex model.SearchIndex
}

func NewFileHandler(di *DIContainer) *FileHandler {
	fh := FileHandler{}

	fh.DI = di
	return &fh
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
		// content, ok := fh.ReadFile(localePath, v)
		content, ok := fh.ReadFile(fh.PathJoin(localePath, v))

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

func (fh *FileHandler) ReadFile(path string) (map[string]interface{}, bool) {
	data := make(map[string]interface{})

	_, err := os.Stat(path)

	if err != nil {
		return data, false
	}

	file, err := os.Open(path)

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

func (fh *FileHandler) ReadFileById(id string) model.ItemInfo {
	var itemInfo model.ItemInfo

	returnData, found := fh.ReadFile(fh.PathJoin(fh.DI.GetResourcePath().AssetsPath, fh.DI.GetResourcePath().File, fh.DI.locale, id+".json"))

	if !found {
		return itemInfo
	}

	bytes, err := json.Marshal(returnData)

	if err != nil {
		return itemInfo
	}

	err = json.Unmarshal(bytes, &itemInfo)

	if err != nil {
		return itemInfo
	}

	return itemInfo
}

func (fh *FileHandler) QueryByName(item string) []model.ItemRaw {
	if fh.DI.locale == "" || fh.searchIndex.Locale == "" || fh.searchIndex.Locale != fh.DI.locale {
		fh.readSearchIndexJson()
	}

	var itemToSearch SearchableItems
	for _, v := range fh.searchIndex.Data {
		itemToSearch = append(itemToSearch, v)
	}

	matches := fuzzy.FindFrom(item, itemToSearch)
	results := []model.ItemRaw{}

	for _, match := range matches {
		originalItem := itemToSearch[match.Index]

		results = append(results, model.ItemRaw{
			Id:   originalItem.Id,
			Name: originalItem.Name,
			Icon: originalItem.Icon,
		})
		// if match.Score >= 50 {
		// }
	}
	return results
}

func (fh *FileHandler) readSearchIndexJson() {
	siPath := fh.PathJoin(fh.DI.GetResourcePath().RootPath, fh.DI.GetResourcePath().AssetsPath, fh.DI.GetResourcePath().File, fh.DI.GetLocale())

	data, _ := fh.ReadFile(fh.PathJoin(siPath, "search_index.json"))
	jsonBytes, err := json.Marshal(data)

	if err != nil {
	}

	targetMap := make(map[string]model.ItemRaw)

	err = json.Unmarshal(jsonBytes, &targetMap)
	if err != nil {
	}

	fh.searchIndex.Locale = fh.DI.locale
	fh.searchIndex.Data = targetMap
}

func (fh *FileHandler) ReadDynamicStrings() map[string]interface{} {
	data := map[string]interface{}{
		"apporach":    map[string]string{},
		"manufacture": map[string]string{},
		"workshop":    map[string]string{},
		"msg":         "",
	}

	var dynamic_strings model.DynamicStrings
	tempDynamicStrings, empty := fh.ReadFile(fh.PathJoin(fh.DI.ResourcePath.AssetsPath, "dynamic_strings.json"))

	if !empty {
		data["msg"] = "Failed to Read dynamic_strings.json: File is empty or not found"
		return data
	}

	bytes, err := json.Marshal(tempDynamicStrings)

	if err != nil {
		data["msg"] = "json.Marshal failed for dynamic_strings.json"
		return data
	}

	err = json.Unmarshal(bytes, &dynamic_strings)

	if err != nil {
		data["msg"] = "json.Unmarshal failed to convert to DynamicStrings"
		return data
	}

	var str map[string]string
	tempStrings, empty := fh.ReadFile(fh.PathJoin(fh.DI.ResourcePath.AssetsPath, fh.DI.ResourcePath.File, fh.DI.locale, "string.json"))

	if !empty {
		data["msg"] = "Failed to Read string.json: File is empty or not found"
		return data
	}

	bytes, err = json.Marshal(tempStrings)

	if err != nil {
		data["msg"] = "json.Marshal failed for string.json"
		return data
	}

	err = json.Unmarshal(bytes, &str)

	if err != nil {
		data["msg"] = "json.Unmarshal failed to convert to string"
		return data
	}

	for k, v := range dynamic_strings.Approach {
		data["apporach"].(map[string]string)[k] = str[v]
	}
	for k, v := range dynamic_strings.Manufacture {
		data["manufacture"].(map[string]string)[k] = str[v]
	}
	for k, v := range str {

		if strings.HasPrefix(k, "90") {
			data["workshop"].(map[string]string)[k] = v
		}
	}
	return data
}

// func (fh *FileHandler) createJsonFile(data interface{}, fileName string, path string) {
// 	flag := os.O_WRONLY | os.O_CREATE | 

// }