class MarbleRouter extends Nabu.Router {
    public homePage: Nabu.PanelPage;
    public homeButton: HTMLButtonElement;

    constructor(public game: Game) {
        super();
    }

    protected onFindAllPages(): void {
        this.homePage = document.getElementById("main-menu") as Nabu.PanelPage;
        this.homeButton = document.getElementById("home-button") as HTMLButtonElement;

        this.pages.push(this.game.soonView);
    }

    protected onUpdate(): void {}

    protected async onHRefChange(page: string, previousPage: string): Promise<void> {
        this.homeButton.style.display = "none";
        if (page.indexOf("?machineId=") != -1 || page.startsWith("#machine")) {
            let index: number;
            if (page.indexOf("?machineId=") != -1) {
                index = parseInt(page.split("?machineId=")[1]);
            }
            else {
                index = parseInt(page.replace("#machine?id=", ""));
            }
            if (isFinite(index)) {
                this.game.mode = GameMode.Demo;
                this.game.setCameraMode(CameraMode.Landscape);

                this.hideAll();
                this.homeButton.style.display = "block";

                let dataResponse = await fetch(SHARE_SERVICE_PATH + "machine/" + index.toFixed(0));
                if (dataResponse) {
                    let data = await dataResponse.json();
                    if (data) {
                        this.game.machine.dispose();
                        this.game.machine.deserialize(data);


                        this.game.machine.generateBaseMesh();
                        this.game.machine.instantiate().then(() => {
                            this.game.updateMachineAuthorAndName();
                            this.game.machine.play();
                            this.game.setCameraMode(CameraMode.Landscape);
                            document.getElementById("click-anywhere-screen").style.display = "none";
                        });
                    }
                }
            }
            else {
                location.hash = "#home";
                return;
            }
        }
        else if (page.startsWith("#home")) {
            if (this.game.machine.parts.length === 0) {
                this.game.machine.dispose();
                this.game.machine.deserialize(fallbackMachine);
            }
            if (!this.game.machine.instantiated) {
                await this.game.machine.generateBaseMesh();
                this.game.setCameraMode(CameraMode.Landscape);
                await this.game.machine.instantiate();
                document.getElementById("click-anywhere-screen").style.display = "none";
            }
            else {
                this.game.setCameraMode(CameraMode.Landscape);
            }
            
            this.show(this.homePage);

            this.game.mode = GameMode.Home;
            this.game.machine.play();
            this.game.updateMachineAuthorAndName();
        }
        else {
            location.hash = "#home";
            return;
        }
        this.game.toolbar.closeAllDropdowns();
        this.game.topbar.resize();
        this.game.toolbar.resize();
        this.game.machine.regenerateBaseAxis();
        this.game.updateMachineAuthorAndName();
    }
}
