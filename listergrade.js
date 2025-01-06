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


//preloads
setScreenSize(window.innerWidth, window.innerHeight);
window.addEventListener("load", async function () {
    document.getElementById("loading_animation_div").style.display = "none";
    document.getElementById("listergrade-title").innerText = await getFullname(urlParams.get('studentid'));

});
function setScreenSize(width, height) {
    document.body.style.width = width + "px";
    document.body.style.height = height + "px";
    document.documentElement.style.height = height + "px";
}

getSubmissions();
async function getSubmissions() {
    const active = urlParams.get('active');
    const activestudentid = urlParams.get('studentid');

    const membersRef = ref(database, `PARSEIT/administration/teachers/${user_parser}/honorroll/myclusters/${active}/cluster/${activestudentid}/subjects`);
    onValue(membersRef, async (membersRefSnapshot) => {
        const container = document.getElementById("assignment-container");
        container.innerHTML = "";

        if (membersRefSnapshot.exists()) {
            const members = [];
            for (const studentid in membersRefSnapshot.val()) {
                const fullname = membersRefSnapshot.val()[studentid].name;
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

                assignmentWrapper.appendChild(topMenu);
                const bottomMenu = document.createElement("section");
                bottomMenu.className = "bottom-menu-assignment";

                let currentGrade = membersRefSnapshot.val()[studentid].finalgrade;
                const inputElement = document.createElement('input');
                inputElement.type = 'number';
                inputElement.className = 'student-id';
                inputElement.id = 'finalgrade-txt';
                inputElement.value = currentGrade;
                inputElement.disabled = true;

                bottomMenu.appendChild(inputElement);
                topMenu.innerHTML = `<span class="student-name">${studentid}</span><span class="student-score"></span>
                                     <span class="student-name-id">${fullname}</span><span class="student-score"></span>`;

                assignmentWrapper.appendChild(bottomMenu);

                assignmentWrapper.addEventListener("click", async (event) => {
                    console.log(studentid);
                    navigator.clipboard.writeText(`@${username}`).then(() => {
                        assignmentWrapper.style.backgroundColor = '#f1f1f1d8';
                        inputElement.focus();
                        setTimeout(() => {
                            assignmentWrapper.style.backgroundColor = '#fafafa';
                        }, 1000);
                    })
                });

                inputElement.addEventListener("blur", async () => {
                    if (inputElement.value !== "") {

                        await update(ref(database, `PARSEIT/administration/teachers/${user_parser}/honorroll/myclusters/${active}/cluster/${activestudentid}/subjects/${studentid}/`), {
                            finalgrade: inputElement.value,

                        });

                        let totalunit = 0;
                        let grade = 0;
                        await get(child(dbRef, `PARSEIT/administration/teachers/${user_parser}/honorroll/myclusters/${active}/cluster/${activestudentid}/subjects`)).then(async (snapshot) => {
                            if (snapshot.exists()) {
                                for (const subject in snapshot.val()) {
                                    const subjectData = snapshot.val()[subject];
                                    const unit = parseFloat(subjectData.unit);
                                    const subjectgrade = parseFloat(subjectData.finalgrade);
                                    totalunit += unit;
                                    grade += (subjectgrade * unit);
                                }
                            }
                        });

                        let finalgrade = grade / totalunit;
                        await update(ref(database, `PARSEIT/administration/teachers/${user_parser}/honorroll/myclusters/${active}/cluster/${activestudentid}/`), {
                            unit: totalunit,
                            gpa: finalgrade.toFixed(2),
                        });

                    }
                    else {
                        inputElement.value = currentGrade;
                    }
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
    window.location.href = `homepage.html?draft=true`;
});


