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

getSubmissions();
async function getSubmissions() {
    const type = localStorage.getItem("type-parser");
    const acadref = localStorage.getItem("parseroom-acadref");
    const yearlvl = localStorage.getItem("parseroom-yearlvl");
    const sem = localStorage.getItem("parseroom-sem");
    const subject = localStorage.getItem("parseroom-code");
    const section = localStorage.getItem("parseroom-section");
    const studentid = localStorage.getItem("user-parser");



    let members = [];

    const assignmentRef = ref(database, `PARSEIT/administration/parseclass/${acadref}/${yearlvl}/${sem}/${subject}/${section}/assignment/${assignmentcode}/`);
    onValue(assignmentRef, async (assignmentSnapshot) => {
        if (assignmentSnapshot.exists()) {

            const due = new Date(assignmentSnapshot.val().duedate);
            const totalscore = assignmentSnapshot.val().totalscore;
            const repository = assignmentSnapshot.val().repository;

            const membersRef = ref(database, `PARSEIT/administration/parseclass/${acadref}/${yearlvl}/${sem}/${subject}/${section}/members`);
            onValue(membersRef, async (membersRefSnapshot) => {
                const container = document.getElementById("assignment-container");
                container.innerHTML = "";

                if (membersRefSnapshot.exists()) {
                    const members = [];
                    let totalstudents = 0;
                    let completedstudents = 0;
                    for (const studentid in membersRefSnapshot.val()) {
                        const fullname = await getFullname(studentid);
                        members.push({ studentid, fullname });
                        totalstudents++;
                    }
                    members.sort((a, b) => a.fullname.localeCompare(b.fullname));


                    members.forEach(({ studentid, fullname }) => {
                        const assignmentWrapper = document.createElement("section");
                        assignmentWrapper.className = "student-assignment-wrapper-completed";

                        const topMenu = document.createElement("section");
                        topMenu.className = "top-menu-assignment";
                        topMenu.innerHTML = `
                            <span class="student-id">${studentid}</span>
                        `;
                        let color = '';
                        const completedData = assignmentSnapshot.val()?.completed?.[studentid];
                        if (completedData?.submitted) {
                            const submitted = new Date(completedData.submitted);
                            if (submitted > due) {
                                color = 'gray';

                            }
                            else {
                                color = 'green'

                            }
                            completedstudents++;
                        } else {
                            if (!Due(assignmentSnapshot.val().duedate)) {
                                color = 'yellow';
                            }

                            if (Due(assignmentSnapshot.val().duedate)) {
                                color = 'red';
                            }
                        }

                        let percentage = 0;

                        if (parseInt(totalstudents) !== 0) {
                            percentage = parseInt(completedstudents) / parseInt(totalstudents) * 100;
                        }


                        const progressSpan = document.getElementById('counter-progress-wrapper');
                        progressSpan.textContent = `${completedstudents} out of ${totalstudents} completed`;
                        const progressCircle = document.querySelector('.progress-circle .progress');
                        const radius = progressCircle.getAttribute('r');
                        const totalLength = 2 * Math.PI * radius;
                        progressCircle.style.strokeDasharray = totalLength;
                        progressCircle.style.strokeDashoffset = totalLength - (totalLength * percentage) / 100;
                        document.getElementById('bg-prograss-circle').style.stroke = '#e6e6e6';
                        document.querySelector('.progress-circle .percentage').textContent = `${Math.round(percentage)}%`;


                        topMenu.innerHTML += `<span class="student-status-${color}"></span>`;
                        assignmentWrapper.appendChild(topMenu);
                        const bottomMenu = document.createElement("section");
                        bottomMenu.className = "bottom-menu-assignment";

                        let currentscore = 0;
                        const test = assignmentSnapshot.val()?.completed?.[studentid];
                        if (test?.score) {
                            currentscore = test.score;
                            bottomMenu.innerHTML = `<span class="student-name">${fullname}</span><span class="student-score">${test.score}/${totalscore}</span>`;
                        }
                        else {
                            bottomMenu.innerHTML = `<span class="student-name">${fullname}</span><span class="student-score">0/${totalscore}</span>`;
                        }

                        assignmentWrapper.addEventListener("click", async (event) => {
                            window.location.href = `viewassignmentteacher.html?assignmentcode=${assignmentcode}&studentid=${studentid}&due=${assignmentSnapshot.val().duedate}&repository=${repository}&score=${currentscore}&perfect=${totalscore}`;
                        });
                        assignmentWrapper.appendChild(bottomMenu);
                        container.appendChild(assignmentWrapper);
                    });
                }
            });

        }


    });

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

document.getElementById("canceladdchatbot-btn").addEventListener("click", () => {
    window.location.href = `parseroom.html`;
});

document.getElementById("edit-assignment-btn").addEventListener("click", () => {
    window.location.href = `editassignment.html?assignmentcode=${assignmentcode}`;
});




