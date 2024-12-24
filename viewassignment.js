import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-app.js";
import {
    getDatabase,
    ref,
    get,
    child,
    update,
    remove,
    onValue,
} from "https://www.gstatic.com/firebasejs/10.13.1/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyCFqgbA_t3EBVO21nW70umJOHX3UdRr9MY",
    authDomain: "parseit-8021e.firebaseapp.com",
    databaseURL:
        "https://parseit-8021e-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "parseit-8021e",
    storageBucket: "parseit-8021e.appspot.com",
    messagingSenderId: "15166597986",
    appId: "1:15166597986:web:04b0219b1733780ae61a3b",
};
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const dbRef = ref(database);

const firebaseConfigAdmin = {
    apiKey: "AIzaSyCoIfQLbAq5gPil3COSauqfHNlv5P5tYXc",
    authDomain: "parseitadmin.firebaseapp.com",
    databaseURL: "https://parseitadmin-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "parseitadmin",
    storageBucket: "parseitadmin.firebasestorage.app",
    messagingSenderId: "1009498274532",
    appId: "1:1009498274532:web:69083f905357ae31b74af1"
};
const appAdmin = initializeApp(firebaseConfigAdmin, "ParseITAdmin");
const databaseAdmin = getDatabase(appAdmin);
const dbRefAdmin = ref(databaseAdmin);

let admin_id = localStorage.getItem("user-parser");


//preloads
setScreenSize(window.innerWidth, window.innerHeight);
window.addEventListener("load", function () {
    document.getElementById("loading_animation_div").style.display = "none";

});
function setScreenSize(width, height) {
    document.body.style.width = width + "px";
    document.body.style.height = height + "px";
    document.documentElement.style.height = height + "px";
}
const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const assignmentcode = urlParams.get('assignment');
function renderAssignmentUI() {
    const type = localStorage.getItem("type-parser");
    const acadref = localStorage.getItem("parseroom-acadref");
    const yearlvl = localStorage.getItem("parseroom-yearlvl");
    const sem = localStorage.getItem("parseroom-sem");
    const subject = localStorage.getItem("parseroom-code");
    const section = localStorage.getItem("parseroom-section");
    const studentid = localStorage.getItem("user-parser");



    if (type === "student") {
        const assignmentRef = ref(
            database,
            `PARSEIT/administration/parseclass/${acadref}/${yearlvl}/${sem}/${subject}/${section}/assignment/${assignmentcode}`
        );

        onValue(assignmentRef, async (snapshot) => {
            const assignment_cont = document.getElementById('trainchatbot-wrapper');
            assignment_cont.innerHTML = "";
            if (snapshot.exists()) {
                const assignment = snapshot.val();
                const assignment_title = assignment.header;

                const assignment_date = assignment.date;
                const assignment_duedate = assignment.duedate;
                const assignment_instruction = assignment.instructions;
                const assignment_repository = assignment.repository;

                const cancelButton = document.createElement('button');
                cancelButton.id = 'canceladdchatbot-btn';
                const imgElement = document.createElement('img');
                imgElement.className = 'canceladdcluster-btn';
                imgElement.src = 'assets/icons/arrow-left-solid.svg';
                cancelButton.appendChild(imgElement);
                assignment_cont.appendChild(cancelButton);

                cancelButton.addEventListener('click', (event) => {
                    window.location.href = 'parseroom.html';
                });

                const missingLabel = document.createElement("label");
                missingLabel.className = "missing-title";
                missingLabel.textContent = "Missing";


                const usernameRef = child(dbRef, `PARSEIT/administration/parseclass/${acadref}/${yearlvl}/${sem}/${subject}/${section}/assignment/${assignmentcode}/completed/${studentid}`);
                const myworkSnapshot = await get(usernameRef);
                if (!myworkSnapshot.exists()) {
                    if (Due(assignment_duedate)) {
                        assignment_cont.appendChild(missingLabel);
                    }

                }



                const headerSection = document.createElement('section');
                headerSection.className = 'header-title-wrapper';

                const dueLabel = document.createElement('label');
                dueLabel.className = 'header-due';
                dueLabel.textContent = `Due ${formatDateTime(assignment_duedate)}`;

                headerSection.appendChild(dueLabel);

                const titleLabel = document.createElement('label');
                titleLabel.className = 'header-title';
                titleLabel.textContent = assignment_title;
                headerSection.appendChild(titleLabel);

                const postedDateLabel = document.createElement('label');
                postedDateLabel.className = 'header-date';
                postedDateLabel.textContent = `Posted ${formatDateTime(assignment_date)}`;
                headerSection.appendChild(postedDateLabel);

                assignment_cont.appendChild(headerSection);

                const chatbotSection = document.createElement('section');
                chatbotSection.className = 'chatbot-data-wrapper';

                for (const file in assignment.attachedfile) {
                    const attachmentid = Date.now().toString();
                    const assignmentFileWrapper = document.createElement('section');
                    assignmentFileWrapper.className = 'assignment-file-wrapper';
                    assignmentFileWrapper.id = 'viewassignment-attachment-btn' + attachmentid;
                    chatbotSection.appendChild(assignmentFileWrapper);
                    const imgType = document.createElement('img');
                    imgType.className = 'img-type';

                    if (assignment.attachedfile.hasOwnProperty(file)) {
                        const fileDetails = assignment.attachedfile[file];
                        const filePath = fileDetails.filepath;
                        const fileExtension = filePath.split('.').pop().toLowerCase();

                        const fileHandlers = {
                            image: handleImage,
                            docx: handleDocx,
                            pdf: handlePdf,
                        };

                        const animations = {
                            fadeIn: {
                                container: "fadeScaleUp-bg 0.25s ease-in-out forwards",
                                content: "fadeScaleUp 0.25s ease-in-out forwards",
                            },
                            fadeOut: {
                                container: "fadeScaleDown-bg 0.25s ease-in-out forwards",
                                content: "fadeScaleDown 0.25s ease-in-out forwards",
                            },
                        };

                        if (['jpg', 'jpeg', 'png', 'gif'].includes(fileExtension)) {
                            imgType.src = 'assets/icons/image-solid.svg';
                            assignmentFileWrapper.appendChild(imgType);
                            assignmentFileWrapper.addEventListener("click", async (event) => {
                                document.getElementById('download-img-btn').setAttribute('value', filePath);
                                await fileHandlers.image(filePath, animations);

                            });

                        } else if (['doc', 'docx'].includes(fileExtension)) {
                            imgType.src = 'assets/icons/file-word-solid.svg';
                            assignmentFileWrapper.appendChild(imgType);
                            assignmentFileWrapper.addEventListener("click", async (event) => {
                                document.getElementById('download-word-btn').setAttribute('value', filePath);
                                await fileHandlers.docx(filePath, animations);

                            });
                        } else if (['pdf'].includes(fileExtension)) {
                            imgType.className = 'img-type-pdf';
                            imgType.src = 'assets/icons/file-pdf-solid.svg';
                            assignmentFileWrapper.appendChild(imgType);
                            assignmentFileWrapper.addEventListener("click", async (event) => {
                                document.getElementById('download-pdf-btn').setAttribute('value', filePath);
                                await fileHandlers.pdf(filePath, animations);

                            });
                        } else {
                            console.warn("Unsupported file type.");
                        }
                    }
                }


                assignment_cont.appendChild(chatbotSection);
                const instructionsLabel = document.createElement('label');
                instructionsLabel.className = 'assignment-instruction';
                instructionsLabel.textContent = 'Instructions';
                assignment_cont.appendChild(instructionsLabel);

                const instructionDetails = document.createElement('span');
                instructionDetails.className = 'assignment-instruction-details';
                instructionDetails.textContent = assignment_instruction;
                assignment_cont.appendChild(instructionDetails);

                const myWorkLabel = document.createElement('label');
                myWorkLabel.className = 'assignment-instruction';
                myWorkLabel.textContent = 'My Work';
                assignment_cont.appendChild(myWorkLabel);

                if (myworkSnapshot.exists()) {
                    if (myworkSnapshot.val().score !== undefined) {
                        const grade = document.createElement('span');
                        grade.className = 'assignment-instruction-details';

                        grade.textContent = `Score: ${myworkSnapshot.val().score}/${assignment.totalscore}`;
                        if (parseInt(myworkSnapshot.val().score) === parseInt(assignment.totalscore)) {
                            grade.textContent = `Score: ${myworkSnapshot.val().score}/${assignment.totalscore} ⭐⭐⭐`;
                        }
                        assignment_cont.appendChild(grade);
                    }

                }


                const myWorkSection = document.createElement('section');
                myWorkSection.className = 'assignment-file-wrapper';
                //assignment_cont.appendChild(myWorkSection);


                const attachButton = document.createElement('button');
                attachButton.className = 'mywork-btn';
                attachButton.textContent = 'Attach Assignment';

                // attachButton.addEventListener('click', () => {
                //     document.getElementById('fileInput').click();
                //     document.getElementById('fileInput').addEventListener('change', () => {
                //         document.getElementById("assigment-attachedfile-container").style.display = "block";
                //         const subject = localStorage.getItem("parseroom-code");
                //         const section = localStorage.getItem("parseroom-section");

                //         const file = document.getElementById('fileInput').files[0];
                //         if (!file) {
                //             console.error("No file selected.");
                //             return;
                //         }
                //         const reader = new FileReader();
                //         reader.onloadend = async () => {
                //             const base64FileContent = reader.result.split(",")[1];
                //             const token = await getApikey();
                //             const owner = "parseitlearninghub";
                //             const repo = "parseitlearninghub-storage";
                //             const filePath = `PARSEIT/storage/${studentid}/${section}/${subject}/${assignmentcode}/mywork/${file.name}`;
                //             await uploadFileToGitHub(token, owner, repo, filePath, base64FileContent, file.name, myWorkSection);
                //         };

                //         reader.onerror = () => {
                //         }
                //         reader.readAsDataURL(file);
                //     });

                // });

                const inputElement = document.createElement('input');
                inputElement.className = 'attach-mywork';
                inputElement.type = 'file';
                inputElement.id = 'fileInput';
                inputElement.accept = 'image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,video/*';


                if (assignment_repository === true) {
                    if (Due(assignment_duedate)) {
                        attachButton.remove();

                        const late = document.createElement('span');
                        late.className = 'assignment-late';
                        late.textContent = 'Submission of assignment is disabled.';
                        assignment_cont.appendChild(late);
                    }
                    else {
                        assignment_cont.appendChild(attachButton);
                    }
                }
                else {
                    assignment_cont.appendChild(attachButton);
                }


                assignment_cont.appendChild(inputElement);
                const fillers = document.createElement('section');
                fillers.className = 'fillers';
                assignment_cont.appendChild(fillers);

            }
        });
    }
}
renderAssignmentUI();
async function handleImage(fileUrl, animations) {
    const imgElement = document.getElementById("viewattachedfile-img");
    const container = document.getElementById("viewattachedfile-container");

    imgElement.src = fileUrl;
    container.style.display = "flex";
    container.style.animation = animations.fadeIn.container;
    imgElement.style.animation = animations.fadeIn.content;

    addTouchClose(container, imgElement, animations);
}
async function handleDocx(fileUrl, animations) {
    console.log(fileUrl);
    const container = document.getElementById("viewattachedfile-container-docx");
    const output = document.getElementById("output-wordfile");

    container.style.display = "flex";
    container.style.animation = animations.fadeIn.container;
    output.style.animation = animations.fadeIn.content;

    try {
        const response = await fetch(fileUrl);
        const arrayBuffer = await response.arrayBuffer();
        const result = await mammoth.convertToHtml({ arrayBuffer });
        output.innerHTML = result.value;
    } catch (error) {
        console.error("Error converting DOCX file:", error);
    }

    addTouchClose(container, output, animations);

}
async function handlePdf(fileUrl, animations) {
    const container = document.getElementById("viewattachedfile-container-pdf");
    const output = document.getElementById("output-pdffile");

    container.style.display = "flex";
    container.style.animation = animations.fadeIn.container;
    output.style.animation = animations.fadeIn.content;

    try {
        const pdf = await pdfjsLib.getDocument(fileUrl).promise;
        output.innerHTML = ""; // Clear previous content

        for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
            const page = await pdf.getPage(pageNumber);
            renderPdfPage(page, output);
        }
    } catch (error) {
        console.error("Error rendering PDF file:", error);
    }
    addTouchClose(container, output, animations);
}
function renderPdfPage(page, container) {
    const viewport = page.getViewport({ scale: 1 });
    const scale = Math.min(
        container.offsetWidth / viewport.width,
        container.offsetHeight / viewport.height
    );
    const scaledViewport = page.getViewport({ scale });

    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    canvas.width = scaledViewport.width * window.devicePixelRatio;
    canvas.height = scaledViewport.height * window.devicePixelRatio;
    canvas.style.width = `${scaledViewport.width}px`;
    canvas.style.height = `${scaledViewport.height}px`;
    context.scale(window.devicePixelRatio, window.devicePixelRatio);

    page.render({ canvasContext: context, viewport: scaledViewport }).promise.then(() => {
        container.appendChild(canvas);
    });
}
function addTouchClose(container, content, animations) {
    let startY = 0, endY = 0;
    container.addEventListener("touchstart", (event) => {
        startY = event.touches[0].clientY;
    });
    container.addEventListener("touchend", (event) => {
        endY = event.changedTouches[0].clientY;
        const dragDistance = endY - startY;
        if (dragDistance > 400) {
            content.style.animation = animations.fadeOut.content;
            container.style.animation = animations.fadeOut.container;
            setTimeout(() => {
                container.style.display = "none";
            }, 500);
        }
    });
}

function formatDateTime(datetime) {
    const date = new Date(datetime);
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    const formattedDate = date.toLocaleDateString('en-US', options);
    const hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedTime = `${hours % 12 || 12}:${minutes} ${ampm}`;
    return `${formattedDate} (${formattedTime})`;
}
function Due(date) {
    const currentDate = new Date();
    const targetDate = new Date(date);
    if (currentDate > targetDate) {
        return true;
    } else {
        return false;
    }
}
document.getElementById('download-pdf-btn').addEventListener('click', () => {
    const url = document.getElementById('download-pdf-btn').getAttribute('value');
    navigator.clipboard.writeText(url)
        .then(() => {
            document.getElementById('download-pdf-btn').innerText = 'Copied! Paste url in browser to download.';
            setTimeout(() => {
                document.getElementById('download-pdf-btn').innerText = 'Copy Link';
            }, 3500);
        })
        .catch(err => {
            document.getElementById('download-pdf-btn').innerText = 'Try again.';
            setTimeout(() => {
                document.getElementById('download-pdf-btn').innerText = 'Copy Link';
            }, 3500);
        });
});
document.getElementById('download-word-btn').addEventListener('click', () => {
    const url = document.getElementById('download-word-btn').getAttribute('value');
    navigator.clipboard.writeText(url)
        .then(() => {
            document.getElementById('download-word-btn').innerText = 'Copied! Paste url in browser to download.';
            setTimeout(() => {
                document.getElementById('download-word-btn').innerText = 'Copy Link';
            }, 3500);
        })
        .catch(err => {
            document.getElementById('download-word-btn').innerText = 'Try again.';
            setTimeout(() => {
                document.getElementById('download-word-btn').innerText = 'Copy Link';
            }, 3500);
        });
});
document.getElementById('download-img-btn').addEventListener('click', () => {
    const url = document.getElementById('download-img-btn').getAttribute('value');
    navigator.clipboard.writeText(url)
        .then(() => {
            document.getElementById('download-img-btn').innerText = 'Copied! Paste url in browser to download.';
            setTimeout(() => {
                document.getElementById('download-img-btn').innerText = 'Copy Link';
            }, 3500);
        })
        .catch(err => {
            document.getElementById('download-img-btn').innerText = 'Try again.';
            setTimeout(() => {
                document.getElementById('download-img-btn').innerText = 'Copy Link';
            }, 3500);
        });
});
async function getApikey() {
    const apikeyRef = child(dbRef, "PARSEIT/administration/apikeys/");
    const snapshot = await get(apikeyRef);
    if (snapshot.exists()) {
        const currentData = snapshot.val().githubtoken;
        return currentData;
    } else {
        return null;
    }
}
// async function uploadFileToGitHub(token, owner, repo, filePath, fileContent, filename, myWorkSection) {
//     const attachmentid = 'file-' + Date.now().toString();
//     const container = document.createElement('section');
//     container.className = 'attachedfile-container';
//     container.id = 'attachedfile-container';
//     const progressBarWrapper = document.createElement('section');
//     progressBarWrapper.className = 'progress-bar-wrapper';
//     progressBarWrapper.id = 'view' + attachmentid;
//     const progressBarFill = document.createElement('div');
//     progressBarFill.className = 'progress-bar-fill';
//     progressBarFill.id = attachmentid;
//     const label = document.createElement('label');
//     label.className = 'sticky-attached';
//     label.htmlFor = '';
//     label.textContent = filename;
//     progressBarWrapper.appendChild(progressBarFill);
//     progressBarWrapper.appendChild(label);
//     const removeSection = document.createElement('section');
//     removeSection.className = 'remove-attachedfile';
//     const removeImg = document.createElement('img');
//     removeImg.src = 'assets/icons/xmark-solid.svg';
//     removeImg.alt = '';
//     removeImg.className = 'remove-attachedfile-img';
//     removeSection.appendChild(removeImg);

//     removeSection.addEventListener('click', async (event) => {
//         container.remove();
//         const fileSha = await getSha(filePath);
//         await deleteFileGitHub(token, owner, repo, filePath, fileSha);
//     });

//     container.appendChild(progressBarWrapper);
//     container.appendChild(removeSection);
//     myWorkSection.appendChild(container);


//     const url = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`;
//     const data = {
//         message: "assignment attachment " + admin_id,
//         content: fileContent,
//     };

//     try {
//         const response = await fetch(url, {
//             method: "PUT",
//             headers: {
//                 "Authorization": `Bearer ${token}`,
//                 "Accept": "application/vnd.github.v3+json",
//             },
//             body: JSON.stringify(data),
//         });

//         const responseData = await response.json();

//         // progressBarWrapper.addEventListener("click", async (event) => {
//         //     const fileUrl = responseData.content.download_url;
//         //     const fileExtension = fileUrl.split('.').pop().toLowerCase();

//         //     const fileHandlers = {
//         //         image: handleImage,
//         //         docx: handleDocx,
//         //         pdf: handlePdf,
//         //     };

//         //     const animations = {
//         //         fadeIn: {
//         //             container: "fadeScaleUp-bg 0.25s ease-in-out forwards",
//         //             content: "fadeScaleUp 0.25s ease-in-out forwards",
//         //         },
//         //         fadeOut: {
//         //             container: "fadeScaleDown-bg 0.25s ease-in-out forwards",
//         //             content: "fadeScaleDown 0.25s ease-in-out forwards",
//         //         },
//         //     };

//         //     try {
//         //         if (['jpg', 'jpeg', 'png', 'gif'].includes(fileExtension)) {
//         //             await fileHandlers.image(fileUrl, animations);
//         //         } else if (['doc', 'docx'].includes(fileExtension)) {
//         //             await fileHandlers.docx(fileUrl, animations);
//         //         } else if (['pdf'].includes(fileExtension)) {
//         //             await fileHandlers.pdf(fileUrl, animations);
//         //         } else {
//         //             console.warn("Unsupported file type.");
//         //         }
//         //     } catch (error) {
//         //         console.error("Error handling file:", error);
//         //     }
//         // });
//         const progressBarFill = document.getElementById(attachmentid);
//         let progress = 0;
//         const interval = setInterval(async () => {
//             if (progress < 100) {
//                 progress += 1;
//                 progressBarFill.style.width = `${progress}%`;
//             } else {
//                 clearInterval(interval);
//             }

//             if (!response.ok) {
//                 document.getElementById("attachedfile-container").style.display = "none";
//                 return;
//             }
//             if (response.ok) {
//                 progressBarFill.style.width = `100%`;
//                 document.getElementById('fileInput').value = '';

//                 return responseData;
//             }

//         }, 100);
//         await addAttachment(responseData.content.download_url);
//     } catch (error) {
//         console.error("Error uploading file:", error);
//     }
// }
async function getSha(filePath) {
    const token = await getApikey();
    const owner = "parseitlearninghub";
    const repo = "parseitlearninghub-storage";

    const fileUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}/`;
    const response = await fetch(fileUrl, {
        headers: {
            "Authorization": `Bearer ${token}`,
            "Accept": "application/vnd.github.v3+json",
        },
    });

    const fileDetails = await response.json();
    const fileSha = fileDetails.sha;
    return fileSha;
}
async function addAttachment(filepath) {
    const acadref = localStorage.getItem("parseroom-acadref");
    const yearlvl = localStorage.getItem("parseroom-yearlvl");
    const sem = localStorage.getItem("parseroom-sem");
    const subject = localStorage.getItem("parseroom-code");
    const section = localStorage.getItem("parseroom-section");
    await update(ref(database, `PARSEIT/administration/parseclass/${acadref}/${yearlvl}/${sem}/${subject}/${section}/assignment/${assignmentcode}/completed/${admin_id}/`), {
        mywork: {
            filepath: filepath,
        },
    });

}
async function deleteFileGitHub(token, owner, repo, filePath, fileSha) {
    const url = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`;
    const data = {
        message: "delete file",
        sha: fileSha,
    };
    try {
        const response = await fetch(url, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Accept": "application/vnd.github.v3+json",
            },
            body: JSON.stringify(data),
        });

        const responseData = await response.json();

        if (!response.ok) {
            console.error("Error deleting file:", responseData);
            return;
        }

        // Handle successful deletion
        console.log("File deleted successfully:", responseData);

    } catch (error) {
        console.error("Error deleting file:", error);
    }


}
function getCurrentDateTime() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
}