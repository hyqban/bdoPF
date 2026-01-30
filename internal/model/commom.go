package model

type ResponseMsg struct {
	Code string `json:"code"`
	Msg  string `json:"msg"`
	Data any    `json:"data"`
}

type LatestApp struct {
	Version     string `json:"version"`
	Download    bool   `json:"download"`
	DownloadUrl string `json:"downloadUrl"`
}

type ResourcePath struct {
	RootPath   string
	AssetsPath string
	File       string
	Icon       string
	Locale     string
	Png        string
}

type FileDir struct {
	files   []string
	folders []string
}

type DisplaySize struct {
	Width  int
	Height int
}
type DisplayResolution struct {
	IsCurrent    bool
	IsPrimary    bool
	Width        int
	Height       int
	Size         DisplaySize
	PhysicalSize DisplaySize
}

type Monitors struct {
	Monitors []DisplayResolution
}
