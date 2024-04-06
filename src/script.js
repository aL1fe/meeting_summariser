window.addEventListener("DOMContentLoaded", () => {
    const upload = new UploadModal("#upload", "#loader");
});

class UploadModal {
    filename = "";
    isCopying = false;
    isUploading = false;
    progress = 0;
    progressTimeout = null;
    state = 0;
    analFile;

    constructor(el, loader) {
        this.el = document.querySelector(el);
        this.loader = document.querySelector(loader);
        this.el?.addEventListener("click", this.action.bind(this));
        this.el?.querySelector("#file")?.addEventListener("change", this.fileHandle.bind(this));
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
                    this.analFile = target.files[0];
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

       this.el.style.display = 'none';
       this.loader.style.display = 'block';

        fetch('/upload', {
            method: 'POST',
            body: formData,
        }).then((response) => {
            var reader = response.body.getReader();
            var bytesReceived = 0;
            return reader.read().then(function processResult(result) {
                if (result.done) {
                    console.log('Fetch complete');
                    return;
                }
                bytesReceived += result.value.length;
                console.log('Received', bytesReceived, 'bytes of data so far');
                return reader.read().then(processResult);
            });
        });
    };
}

gsap.config({trialWarn: false});
let select = s => document.querySelector(s),
    toArray = s => gsap.utils.toArray(s),
    loaderSVG = select('#loaderSVG'),
    allEll = toArray('.ell'),
    colorArr = ['#359EEE', '#FFC43D', '#EF476F', '#03CEA4'];

let colorInterp = gsap.utils.interpolate(colorArr);

gsap.set(loaderSVG, {
    visibility: 'visible'
});

function animate(el, count) {
    let tl = gsap.timeline({
        defaults: {
            ease: 'sine.inOut'
        },
        repeat: -1
    });
    gsap.set(el, {
        opacity: 1 - count / (allEll.length),
        stroke: colorInterp(count / (allEll.length))
    })

    tl.to(el, {
        attr: {
            ry: `-=${count * 2.3}`,
            rx: `+=${count * 1.4}`
        },
        ease: 'sine.in'
    })
        .to(el, {
            attr: {
                ry: `+=${count * 2.3}`,
                rx: `-=${count * 1.4}`
            },
            ease: 'sine'
        })
        .to(el, {
            duration: 1,
            rotation: -180,
            transformOrigin: '50% 50%'
        }, 0).timeScale(0.5)
}

allEll.forEach((c, i) => {
    gsap.delayedCall(i / (allEll.length - 1), animate, [c, i + 1])
});
gsap.to('#aiGrad', {
    duration: 4,
    delay: 0.75,
    attr: {
        x1: '-=300',
        x2: '-=300'
    },
    scale: 1.2,
    transformOrigin: '50% 50%',
    repeat: -1,
    ease: 'none'
});
gsap.to('#ai', {
    duration: 1,
    scale: 1.1,
    transformOrigin: '50% 50%',
    repeat: -1,
    yoyo: true,
    ease: 'sine.inOut'
});