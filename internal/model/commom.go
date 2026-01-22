package model

type ResourcePath struct {
	RootPath   string
	AssetsPath string
	File       string
	Icon       string
	Locale     string
	Png        string
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