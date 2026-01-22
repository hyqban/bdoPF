package model

type ItemRaw struct {
	Id   string `json:"id"`
	Name string `json:"name"`
	Icon string `json:"icon"`
}

type SearchItem struct {
	Item      ItemRaw
	NameLower string
}

type SearchResult struct {
	Item  *ItemRaw
	Score int
}