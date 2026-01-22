package service

var DynamicStringsMap = map[string]any{
	"approach": map[string]any{
		"fishing":    "1",
		"node":       "0",
		"shop":       "21",
		"house":      "5",
		"gathering":  "6",
		"processing": "4",
		"cooking":    "3",
		"alchemy":    "2",
		"makelist":   "22",
	},
	"manufacture": map[string]any{
		"MANUFACTURE_SHAKE":             "12",
		"MANUFACTURE_GRIND":             "11",
		"MANUFACTURE_FIREWOOD":          "15",
		"MANUFACTURE_DRY":               "10",
		"MANUFACTURE_THINNING":          "14",
		"MANUFACTURE_HEAT":              "13",
		"MANUFACTURE_ALCHEMY":           "2",
		"MANUFACTURE_COOK":              "3",
		"MANUFACTURE_ROYALGIFT_ALCHEMY": "17",
		"MANUFACTURE_ROYALGIFT_COOK":    "16",
		"MANUFACTURE_CRAFT":             "18",
	},
}

var LocalesMap = []map[string]any{
	{
		"locale": "en",
		"name":   "English",
		"messages": map[string]any{
			"nav": map[string]any{
				"crafting":     "Crafting Notes",
				"bossSchedule": "Boss Schedule",
				"quicklyNotes": "Quick Notes",
				"sites":        "Useful Links",
				"settings":     "Settings",
			},
			"craft": map[string]any{
				"placeholder": "Search item",
				"recipe":      "Recipe",
			},
			"settings": map[string]any{
				"update":   "Check for updates",
				"download": "Download",
				"install":  "Install & Restart",
				"report":   "Report an issue",
				"discord":  "Community",
				"github":   "Github",
			},
		},
	},
	{
		"locale": "de",
		"name":   "Deutsch",
		"messages": map[string]any{
			"nav": map[string]any{
				"crafting":     "Herstellungsnotizen",
				"bossSchedule": "Boss-Zeitplan",
				"quicklyNotes": "Schnelle Notizen",
				"sites":        "Seiten",
				"settings":     "Einstellungen",
			},
			"craft": map[string]any{
				"placeholder": "Artikel suchen",
				"recipe":      "Rezept",
			},
			"settings": map[string]any{
				"update":   "Updates",
				"download": "Herunterladen",
				"install":  "Inst. & Neustart",
				"report":   "Problem melden",
				"discord":  "Community",
				"github":   "Github",
			},
		},
	},
	{
		"locale": "fr",
		"name":   "Français",
		"messages": map[string]any{
			"nav": map[string]any{
				"crafting":     "Notes d'Artisanat",
				"bossSchedule": "Horaire des Boss",
				"quicklyNotes": "Notes Rapides",
				"sites":        "Sites",
				"settings":     "Paramètres",
			},
			"craft": map[string]any{
				"placeholder": "Rechercher un article",
				"recipe":      "Recette",
			},
			"settings": map[string]any{
				"update":   "Mises à jour",
				"download": "Télécharger",
				"install":  "Inst. & Relancer",
				"report":   "Signaler",
				"discord":  "Communauté",
				"github":   "Github",
			},
		},
	},
	{
		"locale": "sp",
		"name":   "Español",
		"messages": map[string]any{
			"nav": map[string]any{
				"crafting":     "Notas de Creación",
				"bossSchedule": "Horario de Jefes",
				"quicklyNotes": "Notas Rápidas",
				"sites":        "Sitios",
				"settings":     "Ajustes",
			},
			"craft": map[string]any{
				"placeholder": "Buscar artículo",
				"recipe":      "Receta",
			},
			"settings": map[string]any{
				"update":   "Actualizaciones",
				"download": "Descargar",
				"install":  "Inst. y Reiniciar",
				"report":   "Informar",
				"discord":  "Comunidad",
				"github":   "Github",
			},
		},
	},
}
