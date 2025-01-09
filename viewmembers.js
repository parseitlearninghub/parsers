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

let user_parser = localStorage.getItem("user-parser");
const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const assignmentcode = urlParams.get('assignmentcode');
let setusernametxt = '';

//preloads
setScreenSize(window.innerWidth, window.innerHeight);
window.addEventListener("load", function () {
    document.getElementById("loading_animation_div").style.display = "none";
    if (this.localStorage.getItem("type-parser") === "teacher") {
        document.getElementById("add-student-members-div").style.display = "flex";
    }
    getSubmissions();

});
function setScreenSize(width, height) {
    document.body.style.width = width + "px";
    document.body.style.height = height + "px";
    document.documentElement.style.height = height + "px";
}


async function getSubmissions() {
    const type = localStorage.getItem("type-parser");
    const acadref = localStorage.getItem("parseroom-acadref");
    const yearlvl = localStorage.getItem("parseroom-yearlvl");
    const sem = localStorage.getItem("parseroom-sem");
    const subject = localStorage.getItem("parseroom-code");
    const section = localStorage.getItem("parseroom-section");
    const studentid = localStorage.getItem("user-parser");

    const membersRef = ref(database, `PARSEIT/administration/parseclass/${acadref}/${yearlvl}/${sem}/${subject}/${section}/members`);
    onValue(membersRef, async (membersRefSnapshot) => {
        const container = document.getElementById("assignment-container");
        container.innerHTML = "";
        if (membersRefSnapshot.exists()) {
            const members = [];
            for (const studentid in membersRefSnapshot.val()) {
                const fullname = await getFullname(studentid);
                members.push({ studentid, fullname });
            }
            members.sort((a, b) => a.fullname.localeCompare(b.fullname));
            members.forEach(async ({ studentid, fullname }) => {
                const assignmentWrapper = document.createElement("section");
                assignmentWrapper.className = "student-assignment-wrapper-completed";
                const username = await getUsername(studentid);
                const topMenu = document.createElement("section");
                topMenu.className = "top-menu-assignment";
                topMenu.innerHTML = `
                            <span class="student-id-username">${studentid}</span>
                        `;

                topMenu.innerHTML += `<span class="student-id">@${username}</span>`;
                assignmentWrapper.appendChild(topMenu);
                const bottomMenu = document.createElement("section");
                bottomMenu.className = "bottom-menu-assignment";

                bottomMenu.innerHTML = `<span class="student-name">${fullname}</span><span class="student-score"></span>`;

                assignmentWrapper.appendChild(bottomMenu);


                assignmentWrapper.addEventListener("click", async (event) => {
                    setusernametxt = username;
                    navigator.clipboard.writeText(`@${username}`).then(() => {
                        assignmentWrapper.style.backgroundColor = '#f1f1f1d8';
                        setTimeout(() => {
                            assignmentWrapper.style.backgroundColor = '#fafafa';
                        }, 1000);
                    })
                });
                container.appendChild(assignmentWrapper);
            });
        }
    });

}

async function getFullname(studentid) {
    const dbRef = ref(database);
    return await get(child(dbRef, "PARSEIT/administration/students/" + studentid)).then((snapshot) => {
        if (snapshot.exists()) {
            if (snapshot.val().suffix === "none") {
                return `${snapshot.val().lastname}, ${snapshot.val().firstname}`
            }
            else {
                return `${snapshot.val().lastname}, ${snapshot.val().firstname} ${snapshot.val().suffix}`
            }
        }
    });
}

async function getUsername(studentid) {
    const dbRef = ref(database);
    return await get(child(dbRef, "PARSEIT/username/")).then((snapshot) => {
        if (snapshot.exists()) {
            for (const username in snapshot.val()) {
                if (snapshot.val()[username] === studentid) {
                    return username;
                }
            }
        }
    });
}

document.getElementById("canceladdchatbot-btn").addEventListener("click", () => {
    window.location.href = `parseroom.html?setusernametxt=${setusernametxt}`;
});

document.getElementById("members-add-btn").addEventListener("click", async () => {
    const type = localStorage.getItem("type-parser");
    const acadref = localStorage.getItem("parseroom-acadref");
    const yearlvl = localStorage.getItem("parseroom-yearlvl");
    const sem = localStorage.getItem("parseroom-sem");
    const subject = localStorage.getItem("parseroom-code");
    const section = localStorage.getItem("parseroom-section");
    const studentid = document.getElementById("members-add-txt").value;


    if (studentid === '') {
        errorElement("members-add-txt");
        return;
    }
    else {
        const studentRef = ref(database, `PARSEIT/administration/students/${studentid}/`);
        const student = await get(studentRef);
        const students = student.val();
        if (student.exists()) {
            const membersRef = ref(database, `PARSEIT/administration/parseclass/${acadref}/${yearlvl}/${sem}/${subject}/${section}/members`);
            const members = await get(membersRef);
            const newMembers = members.val();
            for (const studentkey in newMembers) {
                if (studentkey === studentid) {
                    errorElement("members-add-txt");
                }
                else {
                    const addMember = {
                        [studentid]: { finalgrade: '0' },
                    };
                    await update(membersRef, addMember);
                    window.location.reload();
                }
            }




        }
        else {
            errorElement("members-add-txt");
        }
    }

});
document.getElementById("members-remove-btn").addEventListener("click", async () => {
    const type = localStorage.getItem("type-parser");
    const acadref = localStorage.getItem("parseroom-acadref");
    const yearlvl = localStorage.getItem("parseroom-yearlvl");
    const sem = localStorage.getItem("parseroom-sem");
    const subject = localStorage.getItem("parseroom-code");
    const section = localStorage.getItem("parseroom-section");
    const studentid = document.getElementById("members-add-txt").value;


    if (studentid === '') {
        errorElement("members-add-txt");
        return;
    }
    else {
        const membersRef = ref(database, `PARSEIT/administration/parseclass/${acadref}/${yearlvl}/${sem}/${subject}/${section}/members/${studentid}/`);
        const members = await get(membersRef);
        if (members.exists()) {
            await remove(membersRef);
            window.location.reload();
        }
        else {
            errorElement("members-add-txt");
        }

    }

});
function errorElement(element) {
    document.getElementById(element).style.border = "0.4px solid #f30505";
    setTimeout(() => {
        document.getElementById(element).style.border = "0.4px solid #dcdcdc";
    }, 1000);
}