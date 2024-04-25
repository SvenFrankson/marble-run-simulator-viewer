Write-Debug "Make Build for Marble Run Simulator Viewer"

if (Test-Path "../marble-run-simulator-viewer-build") {
    Remove-Item "../marble-run-simulator-viewer-build" -Recurse -Force
}
New-Item "../marble-run-simulator-viewer-build" -ItemType "directory"


Copy-Item -Path "./*" -Destination "../marble-run-simulator-viewer-build/" -Recurse -Force -Exclude ".git", "src", "lib", ".vscode"

New-Item "../marble-run-simulator-viewer-build/lib" -ItemType "directory"
New-Item "../marble-run-simulator-viewer-build/lib/mummu" -ItemType "directory"
Copy-Item -Path "./lib/mummu/mummu.js" -Destination "../marble-run-simulator-viewer-build/lib/mummu/mummu.js"
New-Item "../marble-run-simulator-viewer-build/lib/nabu" -ItemType "directory"
Copy-Item -Path "./lib/nabu/nabu.js" -Destination "../marble-run-simulator-viewer-build/lib/nabu/nabu.js"

New-Item "../marble-run-simulator-viewer-build/lib/marble-run-simulator-core" -ItemType "directory"
Copy-Item -Path "./lib/marble-run-simulator-core/marble-run-simulator-core.js" -Destination "../marble-run-simulator-viewer-build/lib/marble-run-simulator-core/marble-run-simulator-core.js"
New-Item "../marble-run-simulator-viewer-build/lib/marble-run-simulator-core/datas" -ItemType "directory"
Copy-Item -Path "./lib/marble-run-simulator-core/datas/*" -Destination "../marble-run-simulator-viewer-build/lib/marble-run-simulator-core/datas/" -Recurse -Force

Copy-Item -Path "./lib/babylon.js" -Destination "../marble-run-simulator-viewer-build/lib/babylon.js"
Copy-Item -Path "./lib/babylonjs.loaders.js" -Destination "../marble-run-simulator-viewer-build/lib/babylonjs.loaders.js"

Get-ChildItem -Path "../marble-run-simulator-viewer-build/" "*.blend" -Recurse | ForEach-Object { Remove-Item -Path $_.FullName }
Get-ChildItem -Path "../marble-run-simulator-viewer-build/" "*.blend1" -Recurse | ForEach-Object { Remove-Item -Path $_.FullName }
Get-ChildItem -Path "../marble-run-simulator-viewer-build/" "*.babylon.manifest" -Recurse | ForEach-Object { Remove-Item -Path $_.FullName }
Get-ChildItem -Path "../marble-run-simulator-viewer-build/" "*.log" -Recurse | ForEach-Object { Remove-Item -Path $_.FullName }
Get-ChildItem -Path "../marble-run-simulator-viewer-build/" "*.xcf" -Recurse | ForEach-Object { Remove-Item -Path $_.FullName }
Get-ChildItem -Path "../marble-run-simulator-viewer-build/" "*.d.ts" -Recurse | ForEach-Object { Remove-Item -Path $_.FullName }
Get-ChildItem -Path "../marble-run-simulator-viewer-build/" "*.pdn" -Recurse | ForEach-Object { Remove-Item -Path $_.FullName }

Remove-Item -Path "../marble-run-simulator-viewer-build/.gitignore"
Remove-Item -Path "../marble-run-simulator-viewer-build/init_repo.bat"
Remove-Item -Path "../marble-run-simulator-viewer-build/make_build.ps1"
Remove-Item -Path "../marble-run-simulator-viewer-build/tsconfig.json"

(Get-Content "../marble-run-simulator-viewer-build/index.html").Replace('./lib/babylon.max.js', './lib/babylon.js') | Set-Content "../marble-run-simulator-viewer-build/index.html"