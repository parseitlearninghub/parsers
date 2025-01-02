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
const video_id = urlParams.get('id');
const video_title = urlParams.get('title');



//preloads
setScreenSize(window.innerWidth, window.innerHeight);
window.addEventListener("load", async function () {
    document.getElementById("loading_animation_div").style.display = "none";
    document.getElementById("ytlib-title").innerText = video_title;
    document.getElementById("ytlib-title").src
    document.getElementById("ytview_main").src = `https://www.youtube.com/embed/${video_id}`;
    await getSaves();


});
function setScreenSize(width, height) {
    document.body.style.width = width + "px";
    document.body.style.height = height + "px";
    document.documentElement.style.height = height + "px";
}

document.getElementById("closeprofile-btn").addEventListener("click", function () {
    window.location.href = "homepage.html";
});

document.getElementById("savevideo-btn").addEventListener("click", async function () {
    const id = video_id;
    await update(ref(database, `PARSEIT/library/videos/${id}/saves/`), {
        [user_parser]: Date.now(),
    });
    await getSaves();
});

document.getElementById("unsavevideo-btn").addEventListener("click", async function () {
    const id = video_id;
    await remove(ref(database, `PARSEIT/library/videos/${id}/saves/${user_parser}`));
    await getSaves();
});

async function getComments() {
    await get(ref(database, `PARSEIT/library/videos/${video_id}/comments/`)).then(async (snapshot) => {
        if (snapshot.exists()) {
            document.getElementById("unsavevideo-btn").style.display = "flex";
            document.getElementById("savevideo-btn").style.display = "none";
        }
    })
}

async function getSaves() {
    await get(ref(database, `PARSEIT/library/videos/${video_id}/saves/${user_parser}`)).then(async (snapshot) => {
        if (snapshot.exists()) {
            document.getElementById("unsavevideo-btn").style.display = "flex";
            document.getElementById("savevideo-btn").style.display = "none";
        }
        else {
            document.getElementById("savevideo-btn").style.display = "flex";
            document.getElementById("unsavevideo-btn").style.display = "none";
        }

    })
}
