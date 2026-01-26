package service

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"runtime"
	"strconv"
	"strings"
	"syscall"
)

type Updater struct {
	Di            *DIContainer
	systemType    string
	appVersion    string
	latestVersion string
	downloadUrl   string
	changeLog     string
	CurrentExe    string
	NewExe        string
}

func NewUpdater(di *DIContainer) *Updater {
	return &Updater{
		Di: di,
	}
}

func (updater *Updater) checkSystemType() {
	switch runtime.GOARCH {
	case "amd64":
		updater.systemType = "amd64"
	case "arm64":
		updater.systemType = "arm64"
	default:
		updater.systemType = "Unknown"
	}
}

func (updater *Updater) CheckForUpdates(appVersion string) map[string]any {
	// {
	// 	"message":"Not Found",
	// 	"documentation_url":"https://docs.github.com/rest/releases/releases#get-the-latest-release",
	// 	"status":"404"
	// }
	// responseMsg := map[string]string{
	// 	"code": "200",
	// 	"msg":  "",
	// }
	respData := map[string]any{
		"code":    200,
		"msg":     "This version is up to date",
		"url":     "",
		"version": "",
	}

	updater.appVersion = appVersion
	updater.checkSystemType()
	// url := "https://api.github.com/repos/Hyqban/bdoPF/releases/latest"
	url := "https://api.github.com/repos/hyqban/bdoPF/releases/latest"

	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		respData["code"] = "100"
		respData["msg"] = "Failed to create HTTP request"
		return respData
	}

	req.Header.Set("Accept", "application/vnd.github+json")
	req.Header.Set("User-Agent", "go-debug-client")
	req.Header.Set("X-GitHub-Api-Version", "2022-11-28")

	client := &http.Client{}

	resp, err := client.Do(req)

	if err != nil {
		respData["code"] = "100"
		respData["msg"] = "HTTP request failed"
		return respData
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)

	if err != nil {
		respData["code"] = "100"
		respData["msg"] = "Failed to read response body"
		return respData
	}

	var res map[string]any

	err = json.Unmarshal(body, &res)

	if err != nil {
		respData["code"] = "100"
		respData["msg"] = "Failed to unmarshal response body"
		return respData
	}

	if len(res) == 0 {
		respData["code"] = "100"
		respData["msg"] = "No response data; please try checking for updates again"
		return respData
	}

	status, ok := res["status"]
	fmt.Println("ok: ", ok)

	// Can be obtain release latest
	if !ok {
		updater.parseResponse(res)

		fmt.Println("===============")
		if updater.appVersion == updater.latestVersion {
			return respData
		}

		if updater.downloadUrl != "" {
			fmt.Println("-----------")
			configInterface, _ := updater.Di.Resolve("config")

			cf := configInterface.(*Config)

			cf.NewVersion.DownloadUrl = updater.downloadUrl
			cf.NewVersion.Version = updater.latestVersion
			fmt.Println("version: ", cf.NewVersion.Version)
			_ = cf.SaveConfig()

			respData["code"] = "200"
			respData["msg"] = "New version available"
			respData["url"] = updater.downloadUrl
			respData["version"] = updater.latestVersion
			return respData
		}
	}

	// Nothing
	if status == "404" {
		respData["code"] = "100"
		respData["msg"] = "Repository has no releases"
	}
	return respData
}

func (updater *Updater) DownloadUpdates() map[string]any {
	respData := map[string]any{
		"code": 200,
		"msg":  "",
	}

	updater.checkSystemType()
	updater.CurrentExe = "bdoPF_" + updater.systemType + ".exe"
	filePath := filepath.Join("tmp", updater.CurrentExe)

	if updater.systemType == "Unknown" {
		respData["code"] = "100"
		respData["msg"] = "Unknown system type; cannot download updates"
		return respData
	}

	// if updater.downloadUrl == "" {
	// 	respData["code"] = "100"
	// 	respData["msg"] = "No download URL available"
	// 	return respData
	// }

	durl := ""
	configInterface, _ := updater.Di.Resolve("config")

	cf := configInterface.(*Config)
	durl = cf.NewVersion.DownloadUrl

	if durl == "" {
		respData["code"] = "100"
		respData["msg"] = "No download URL available"
		return respData
	}

	req, err := http.NewRequest("GET", durl, nil)
	if err != nil {
		respData["code"] = "100"
		respData["msg"] = fmt.Sprintf("Failed to create HTTP request: %v", err)
		return respData
	}

	// req.Header.Set("Accept", "application/vnd.github+json")
	// req.Header.Set("User-Agent", "go-debug-client")
	req.Header.Set("X-GitHub-Api-Version", "2022-11-28")
	req.Header.Set("Accept-Encoding", "gzip, deflate")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		// fmt.Println("HTTP GET failed:", err)
		respData["code"] = "100"
		respData["msg"] = fmt.Sprintf("Failed to download update: %v", err)
		return respData
	}
	defer resp.Body.Close()

	dir := filepath.Dir(filePath)
	if dir != "" && dir != "." {
		if err := os.MkdirAll(dir, 0o755); err != nil {
			// fmt.Println("Failed to create directory:", err)
			respData["code"] = "100"
			respData["msg"] = fmt.Sprintf("Failed to create directory for download: %v", err)
			return respData
		}
	}

	out, err := os.Create(filePath)
	if err != nil {
		// fmt.Println("Failed to create file:", err)
		respData["code"] = "100"
		respData["msg"] = fmt.Sprintf("Failed to create file for download: %v", err)
		return respData
	}
	defer out.Close()

	if _, err = io.Copy(out, resp.Body); err != nil {
		// fmt.Println("Download failed:", err)
		respData["code"] = "100"
		respData["msg"] = fmt.Sprintf("Download failed: %v", err)
		return respData
	}

	cf.NewVersion.Download = true
	_ = cf.SaveConfig()

	respData["code"] = "200"
	respData["msg"] = "Download completed successfully."

	return respData
}

func (updater *Updater) parseResponse(resp map[string]any) {
	tag_name, ok := resp["tag_name"].(string)
	if !ok {
		fmt.Println("Failed to parse tag_name")
		return
	}

	tagNameSlice := strings.Split(tag_name[1:], ".")
	appVersionSlice := strings.Split(updater.appVersion, ".")

	has := HasLatestVersion(tagNameSlice, appVersionSlice)
	if !has {
		fmt.Println("This version is up to date")
		return
	}

	assets, ok := resp["assets"].([]any)

	if !ok {
		fmt.Println("Failed to parse response assets")
		return
	}

	for _, v := range assets {
		body := v.(map[string]any)
		// bdoPF_amd64.rar
		infoSlice := strings.Split(body["name"].(string), "_")
		// [bdoPF amd64.exe]

		if strings.Split(infoSlice[1], ".")[0] == updater.systemType {

			downloadUrl := body["browser_download_url"].(string)

			updater.downloadUrl = downloadUrl
			updater.latestVersion = tag_name[1:]
			break
			// updater.CurrentExe = body["name"].(string)
			// if downloadUrl != "" {
			// }
		}
	}
}

func HasLatestVersion(newVersionSlice, appVersionSlice []string) bool {
	respVersionLength := len(newVersionSlice)
	appVersionLength := len(appVersionSlice)

	if respVersionLength >= appVersionLength {
		for i := 0; i < respVersionLength; i++ {
			if i <= appVersionLength && newVersionSlice[i] != appVersionSlice[i] {
				rv, err := strconv.Atoi(newVersionSlice[i])
				if err != nil {
					fmt.Println("Failed to convert version string to int:", err)
				}

				av, err := strconv.Atoi(appVersionSlice[i])
				if err != nil {
					fmt.Println("Failed to convert app version string to int:", err)
				}

				// has lateste version
				if rv > av {
					return true
				}
			}
		}
	}
	return false
}

func (updater *Updater) StartUpdate() {
	// 1. Get the absolute path of the currently running executable (working directory)
	excutePath, err := os.Getwd()

	if err != nil {
		fmt.Println("Failed to get current working directory:", err)
		return
	}

	updater.checkSystemType()

	if updater.systemType != "Unknown" {
	}

	updater.CurrentExe = "bdoPF_" + updater.systemType + ".exe"

	oldExe := filepath.Join(excutePath, updater.CurrentExe)

	// 2. Path to the downloaded new EXE (assumed in tmp directory)
	// Use filepath.Abs if you need absolute path resolution
	newExe := filepath.Join(excutePath, "tmp", updater.CurrentExe)

	// 3. Build the CMD batch script to replace the running exe:
	// - loop until the old EXE is deletable (ensures main process exited)
	// - move the new EXE into place
	// - start the new EXE
	// - self-delete the batch script
	batPath := filepath.Join(os.TempDir(), "update_script.bat")

	installDir := filepath.Dir(oldExe)
	batContent := fmt.Sprintf(`@echo off
set "oldExe=%s"
set "newExe=%s"
set "installDir=%s"

:loop
del /f /q "%%oldExe%%"
if exist "%%oldExe%%" (
	timeout /t 1 >nul
	goto loop
)

move /y "%%newExe%%" "%%oldExe%%"

rem Change back to the install directory before starting, to avoid config path issues
cd /d "%%installDir%%"
start "" "%%oldExe%%"

rem Self-delete the script
del "%%~f0"
`, oldExe, newExe, installDir)

	err = os.WriteFile(batPath, []byte(batContent), 0644)
	if err != nil {
		fmt.Println("Failed to create update script:", err)
		return
	}

	// 4. Execute the batch file using cmd
	cmd := exec.Command("cmd", "/c", batPath)

	// 5. Important: hide the cmd window on Windows and detach from parent process
	cmd.SysProcAttr = &syscall.SysProcAttr{
		HideWindow:    true,                             // hide console window for silent update
		CreationFlags: syscall.CREATE_NEW_PROCESS_GROUP, // CREATE_NO_WINDOW
	}

	err = cmd.Start()
	if err != nil {
		fmt.Println("Failed to start update command:", err)
		return
	}

	// 6. Exit immediately so the batch script can replace the executable
	fmt.Println("Application shutting down to apply update...")
	os.Exit(0)
}
