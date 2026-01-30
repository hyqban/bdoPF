package service

import (
	"bdoPF/internal/model"
	"bytes"
	"fmt"
	"io"
	"os"
	"os/exec"
	"path/filepath"
	"runtime"
	"strconv"
	"strings"
	"syscall"
)

type Updater struct {
	DI            *DIContainer
	systemType    string
	appVersion    string
	latestVersion string
	downloadUrl   string
	changeLog     string
	CurrentExe    string
	newExe        string
}

func NewUpdater(di *DIContainer) *Updater {
	up := Updater{}
	up.DI = di
	up.checkSystemType()

	return &up
}

func (up *Updater) checkSystemType() {
	up.systemType = runtime.GOARCH
}

func (up *Updater) HasLatestVersion(newVersion, appVersion string) {
	newv := strings.Split(newVersion, ".")
	appv := strings.Split(appVersion, ".")

	for i := 0; i < 3; i++ {
		nv, _ := strconv.Atoi(newv[i])
		av, _ := strconv.Atoi(appv[i])

		if av > nv {
			return
		}

		if nv > av {
			up.latestVersion = newVersion
			return
		}
	}
}

func (up *Updater) parseResponse(body map[string]any, resp *model.ResponseMsg) {
	tag_name, ok := body["tag_name"].(string)

	if !ok {
		return
	}

	up.HasLatestVersion(tag_name[1:], up.appVersion)

	if up.latestVersion == "" {
		resp.Code = "100"
		resp.Msg = "This version is up to date."
		return
	}

	assets, _ := body["assets"].([]any)

	for _, v := range assets {
		info := v.(map[string]any)
		// [bdoPF amd64.ex]
		exeSlice := strings.Split(info["name"].(string), "_")

		// [amd64 exe]
		if strings.Split(exeSlice[1], ".")[0] == up.systemType {
			up.downloadUrl = info["browser_download_url"].(string)
			break
		}
	}
}

func (up *Updater) AppCheckForUpdates() model.ResponseMsg {
	// {
	// 	"message":"Not Found",
	// 	"documentation_url":"https://docs.github.com/rest/releases/releases#get-the-latest-release",
	// 	"status":"404"
	// }
	url := "https://api.github.com/repos/hyqban/bdoPF/releases/latest"

	header := map[string]string{
		"X-GitHub-Api-Version": "2022-11-28",
		"Accept":               "application/vnd.github+json",
	}
	var responseMsg model.ResponseMsg
	responseBody, ok := NewRequest(&responseMsg, "GET", url, header)

	if !ok {
		return responseMsg
	}

	up.parseResponse(responseBody, &responseMsg)

	if up.downloadUrl != "" && up.latestVersion != "" {
		cf := Resolve[*Config](up.DI, "config")
		cf.NewVersion.Version = up.latestVersion
		cf.NewVersion.DownloadUrl = up.downloadUrl

		_ = cf.SaveConfig()

		responseMsg.Code = "200"
		responseMsg.Msg = "New version available."
		responseMsg.Data = map[string]string{
			"downloadUrl": cf.NewVersion.DownloadUrl,
			"newVersion":  cf.NewVersion.Version,
		}
	}
	return responseMsg
}

func (up *Updater) DownloadUpdates() model.ResponseMsg {
	var responseMsg model.ResponseMsg

	cf := Resolve[*Config](up.DI, "config")
	up.CurrentExe = cf.AppName + "_" + up.systemType + ".exe"
	latestAppPath := filepath.Join("tmp", up.CurrentExe)

	header := map[string]string{
		"X-GitHub-Api-Version": "2022-11-28",
		"Accept-Encoding":      "gzip, deflate",
	}
	bodyBytes, ok := NewRequestForDownload(&responseMsg, "GET", cf.NewVersion.DownloadUrl, header)

	fmt.Println("ok: ", ok)
	if !ok {
		return responseMsg
	}

	dir := filepath.Dir(latestAppPath)
	fmt.Println("latestAppPath: ", latestAppPath)
	fmt.Println("dir: ", dir)

	if dir != "" && dir != "." {
		if err := os.MkdirAll(dir, os.ModePerm); err != nil {
			responseMsg.Code = "100"
			responseMsg.Msg = fmt.Sprintf("Failed to create directory for download: %v", err)
		}
	}

	out, err := os.Create(latestAppPath)
	if err != nil {
		responseMsg.Code = "100"
		responseMsg.Msg = fmt.Sprintf("Failed to create file for download: %v", err)
	}
	defer out.Close()

	if _, err = io.Copy(out, bytes.NewReader(bodyBytes)); err != nil {
		responseMsg.Code = "100"
		responseMsg.Msg = fmt.Sprintln("Download failed.")
	}

	cf.NewVersion.Download = true
	_ = cf.SaveConfig()

	responseMsg.Code = "200"
	responseMsg.Msg = "Download completed successfully."
	return responseMsg
}

func (up *Updater) StartUpdate() {
	// 1. Get the absolute path of the currently running executable (working directory)
	fh := Resolve[*FileHandler](up.DI, "fileHandler")

	exeCutePath := fh.GetExePath()

	up.CurrentExe = "bdoPF_" + up.systemType + ".exe"

	oldExe := filepath.Join(exeCutePath, up.CurrentExe)

	// 2. Path to the downloaded new EXE (assumed in tmp directory)
	// Use filepath.Abs if you need absolute path resolution
	newExe := filepath.Join(exeCutePath, "tmp", up.CurrentExe)

	// if the latest app not exsit, but newVersion had downloadUrl and download=true
	isExist := fh.pathExists(newExe)

	if !isExist {
		_ = up.AppCheckForUpdates()
		_ = up.DownloadUpdates()
	}
	// 3. Build the CMD batch script to replace the running exe:
	// - loop until the old EXE is deletable (ensures main process exited)
	// - move the new EXE into place
	// - start the new EXE
	// - self-delete the batch script
	batPath := filepath.Join(os.TempDir(), "update_script.bat")

	installDir := filepath.Dir(oldExe)
	batContent := fmt.Sprintf(`
	@echo off
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

	if err := os.WriteFile(batPath, []byte(batContent), 0644); err != nil {
		return
	}

	cmd := exec.Command("cmd", "/c", batPath)

	cmd.SysProcAttr = &syscall.SysProcAttr{
		HideWindow:    true,
		CreationFlags: syscall.CREATE_NEW_PROCESS_GROUP, // create no window
	}

	if err := cmd.Start(); err != nil {
		return
	}
	os.Exit(0)
}
