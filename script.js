
/* =========================================
   ACADEMIC PORTFOLIO
   Code-managed files; visitors view/download
   HTML + CSS + JavaScript only
========================================= */

/* 1. SETTINGS */
const ROLES = [
    "Student",
    "Web Developer",
    "Creative Thinker",
    "Future Professional"
];

/*
   2. ADD YOUR FILES HERE.

   Put your actual files inside the matching folders.
   Then add their paths to this list.

   Supported categories:
   quiz, long-quiz, midterms, finals, activity, project

   Example:
   {
       category: "quiz",
       name: "Quiz 1",
       path: "files/quiz/quiz-1.pdf",
       type: "pdf"
   }
*/

const PORTFOLIO_FILES = [
    // QUIZ
    // {
    //     category: "quiz",
    //     name: "Quiz 1",
    //     path: "files/quiz/quiz-1.pdf",
    //     type: "pdf"
    // },
    // {
    //     category: "quiz",
    //     name: "Quiz Image",
    //     path: "files/quiz/quiz-image.jpg",
    //     type: "image"
    // },

    // LONG QUIZ
    // {
    //     category: "long-quiz",
    //     name: "Long Quiz 1",
    //     path: "files/long-quiz/long-quiz-1.pdf",
    //     type: "pdf"
    // },

    // MIDTERMS
    // {
    //     category: "midterms",
    //     name: "Midterm Examination",
    //     path: "files/midterms/midterm.pdf",
    //     type: "pdf"
    // },

    // FINALS
    // {
    //     category: "finals",
    //     name: "Final Examination",
    //     path: "files/finals/final-exam.pdf",
    //     type: "pdf"
    // },

    // ACTIVITIES
    // {
    //     category: "activity",
    //     name: "Activity 1",
    //     path: "files/activities/activity-1.jpg",
    //     type: "image"
    // },

    // PROJECTS
    // {
    //     category: "project",
    //     name: "Project 1",
    //     path: "files/projects/project-1.pdf",
    //     type: "pdf"
    // }
];


/* 3. HELPERS */
const $ = (selector, root = document) =>
    root.querySelector(selector);

const $$ = (selector, root = document) =>
    [...root.querySelectorAll(selector)];

function toast(message) {
    const element = $("#toast");

    if (!element) return;

    element.textContent = message;
    element.classList.add("on");

    setTimeout(() => {
        element.classList.remove("on");
    }, 2200);
}

const yearElement = $("#yr");

if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
}


/* 4. TYPING ANIMATION */
(function typingAnimation() {
    const element = $("#typed");

    if (!element) return;

    let roleIndex = 0;
    let characterIndex = 0;
    let deleting = false;

    function tick() {
        const word = ROLES[roleIndex];

        if (deleting) {
            characterIndex--;
        } else {
            characterIndex++;
        }

        element.textContent = word.slice(0, characterIndex);

        let delay = deleting ? 50 : 100;

        if (!deleting && characterIndex === word.length) {
            deleting = true;
            delay = 1400;
        } else if (deleting && characterIndex === 0) {
            deleting = false;
            roleIndex = (roleIndex + 1) % ROLES.length;
            delay = 350;
        }

        setTimeout(tick, delay);
    }

    tick();
})();


/* 5. SCROLL REVEAL ANIMATION */
if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("show");
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.12
    });

    $$(".reveal").forEach(element => observer.observe(element));
} else {
    $$(".reveal").forEach(element => element.classList.add("show"));
}


/* 6. MOBILE MENU */
const menuButton = $("#menuBtn");
const menu = $("#menu");

if (menuButton && menu) {
    menuButton.addEventListener("click", () => {
        menu.classList.toggle("open");
    });

    $$("a", menu).forEach(link => {
        link.addEventListener("click", () => {
            menu.classList.remove("open");
        });
    });
}


/* 7. FILE ICONS */
function getFileIcon(filename, type = "") {
    const extension = (
        type || filename.split(".").pop()
    ).toLowerCase();

    const icons = {
        pdf: "📕",
        doc: "📘",
        docx: "📘",
        xls: "📗",
        xlsx: "📗",
        ppt: "📙",
        pptx: "📙",
        zip: "🗜️",
        txt: "📄",
        mp4: "🎬",
        mp3: "🎵",
        image: "🖼️",
        jpg: "🖼️",
        jpeg: "🖼️",
        png: "🖼️",
        gif: "🖼️",
        webp: "🖼️"
    };

    return icons[extension] || "📁";
}


/* 8. CATEGORY TABS */
let currentCategory = "quiz";

const tabs = $$(".tab");

tabs.forEach(tab => {
    tab.addEventListener("click", () => {
        tabs.forEach(item => {
            item.classList.remove("active");
            item.setAttribute("aria-selected", "false");
        });

        tab.classList.add("active");
        tab.setAttribute("aria-selected", "true");

        currentCategory = tab.dataset.cat;

        renderFiles();
    });
});


/* 9. RENDER FILES
   No upload, delete, or edit controls are created.
*/
function renderFiles() {
    const grid = $("#grid");
    const empty = $("#empty");

    if (!grid) return;

    grid.replaceChildren();

    const items = PORTFOLIO_FILES.filter(file =>
        file.category === currentCategory
    );

    if (empty) {
        empty.style.display = items.length ? "none" : "block";
    }

    items.forEach((file, index) => {
        const card = document.createElement("article");

        card.className = "card";
        card.style.animationDelay = `${index * 0.06}s`;

        const thumbnail = document.createElement("div");
        thumbnail.className = "thumb";

        const isImage =
            file.type === "image" ||
            /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(file.path);

        if (isImage) {
            const image = document.createElement("img");

            image.src = file.path;
            image.alt = file.name;
            image.loading = "lazy";

            image.addEventListener("error", () => {
                thumbnail.textContent = "🖼️";
            }, { once: true });

            thumbnail.appendChild(image);

            thumbnail.addEventListener("click", () => {
                openLightbox(file.path);
            });
        } else {
            thumbnail.textContent = getFileIcon(file.name, file.type);

            thumbnail.addEventListener("click", () => {
                window.open(file.path, "_blank", "noopener,noreferrer");
            });
        }

        const meta = document.createElement("div");
        meta.className = "meta";

        const name = document.createElement("div");
        name.className = "name";
        name.textContent = file.name;

        const details = document.createElement("small");
        details.textContent = (file.type || "FILE").toUpperCase();

        const actions = document.createElement("div");
        actions.className = "row";

        const viewLink = document.createElement("a");
        viewLink.href = file.path;
        viewLink.target = "_blank";
        viewLink.rel = "noopener noreferrer";
        viewLink.textContent = "View";

        const downloadLink = document.createElement("a");
        downloadLink.href = file.path;
        downloadLink.setAttribute("download", "");
        downloadLink.textContent = "Download";

        actions.append(viewLink, downloadLink);
        meta.append(name, details, actions);
        card.append(thumbnail, meta);

        grid.appendChild(card);
    });
}


/* 10. LIGHTBOX */
function openLightbox(source) {
    const lightbox = $("#lightbox");
    const image = $("#lbImg");

    if (!lightbox || !image) return;

    image.src = source;
    lightbox.classList.add("on");
    lightbox.setAttribute("aria-hidden", "false");
}

const lightbox = $("#lightbox");

if (lightbox) {
    lightbox.addEventListener("click", () => {
        lightbox.classList.remove("on");
        lightbox.setAttribute("aria-hidden", "true");

        const image = $("#lbImg");
        if (image) image.src = "";
    });
}


/* 11. PROFILE PHOTO
   Change the image path in your HTML, for example:
   <img id="avatarImg" src="assets/profile.jpg" alt="Profile photo">
*/


/* 12. VISITOR-ONLY MODE
   Remove old admin/edit/upload controls if present.
   All portfolio text is read-only.
*/
document.body.classList.remove("admin");

$$("[data-key]").forEach(element => {
    element.contentEditable = "false";
    element.removeAttribute("contenteditable");
});

[
    "#adminBtn",
    "#fileInput",
    "#avatarInput",
    "#dropzone",
    "#upload-form",
    ".upload-panel",
    ".admin-controls",
    ".edit-controls"
].forEach(selector => {
    $$(selector).forEach(element => element.remove());
});


/* 13. INITIALIZE */
renderFiles();
