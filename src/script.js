window.addEventListener("DOMContentLoaded", () => {
    const upload = new UploadModal("#upload");
});

class UploadModal {
    filename = "";
    isCopying = false;
    isUploading = false;
    progress = 0;
    progressTimeout = null;
    state = 0;
    analFile;

    constructor(el) {
        this.el = document.querySelector(el);
        this.el?.addEventListener("click", this.action.bind(this));
        this.el?.querySelector("#file")?.addEventListener("change", this.fileHandle.bind(this));

        console.log(this.el?.querySelector("#drop"))

        const dropzoneOne = this.el?.querySelector("#drop")
        dropzoneOne.addEventListener('dragover', this.dropHandler.bind(this));

        this.el?.querySelector("#drop")?.addEventListener("drop", this.dropHandler.bind(this));
    }

    action(e) {
        this[e.target?.getAttribute("data-action")]?.();
        this.stateDisplay();
    }

    cancel() {
        this.isUploading = false;
        this.progress = 0;
        this.progressTimeout = null;
        this.state = 0;
        this.stateDisplay();
        this.progressDisplay();
        this.fileReset();
    }

    file() {
        this.el?.querySelector("#file").click();
    }

    fileDisplay(name = "") {
        this.filename = name;

        const fileValue = this.el?.querySelector("[data-file]");
        if (fileValue) fileValue.textContent = this.filename;

        this.el?.setAttribute("data-ready", this.filename ? "true" : "false");
    }

    fileHandle(e) {
        return new Promise(() => {
            const {target} = e;
            if (target?.files.length) {
                let reader = new FileReader();
                reader.onload = e2 => {
                    this.fileDisplay(target.files[0].name);
                };
                reader.readAsDataURL(target.files[0]);
            }
        });
    }

    fileReset() {
        const fileField = this.el?.querySelector("#file");
        if (fileField) fileField.value = null;

        this.fileDisplay();
    }

    progressDisplay() {
        const progressValue = this.el?.querySelector("[data-progress-value]");
        const progressFill = this.el?.querySelector("[data-progress-fill]");
        const progressTimes100 = Math.floor(this.progress * 100);

        if (progressValue) progressValue.textContent = `${progressTimes100}%`;
        if (progressFill) progressFill.style.transform = `translateX(${progressTimes100}%)`;
    }

    async progressLoop() {
        this.progressDisplay();

        if (this.isUploading) {
            if (this.progress === 0) {
                await new Promise(res => setTimeout(res, 10));
            }
            if (this.progress < 1) {
                this.progress += 0.01;
                this.progressTimeout = setTimeout(this.progressLoop.bind(this), 10);/////////change me
            } else if (this.progress >= 1) {
                this.progressTimeout = setTimeout(() => {
                    if (this.isUploading) {
                        this.success();
                        this.stateDisplay();
                        this.progressTimeout = null;
                    }
                }, 250);
            }
        }
    }

    drop(ev) {
        console.log("drop");
    }

    dropHandler(ev) {
        ev.preventDefault();
        if (ev.dataTransfer.items) {
            [...ev.dataTransfer.items].forEach((item, i) => {
                if (item.kind === "file", item.getAsFile() != null) {
                    const file = item.getAsFile();
                    this.fileDisplay(file.name);
                    this.analFile = file;
                    console.log(`… file[${i}].name = ${file}`);
                }
            });
        }
    }

    stateDisplay() {
        this.el?.setAttribute("data-state", `${this.state}`);
    }

    success() {
        console.log("success")
        this.isUploading = false;
        this.state = 3;
        this.stateDisplay();
        this.loadFile(this.analFile)
    }

    upload() {
        console.log("upload");
        if (!this.isUploading) {
            this.isUploading = true;
            this.progress = 0;
            this.state = 1;
            this.progressLoop();
        }
    }

    loadFile(file) {

        const formData = new FormData();
        formData.append('file', file);

        fetch('/upload', {
            method: 'POST',
            body: formData,
        })
            .then(response => response.text())
            .then(data => console.log(data));
    };
}