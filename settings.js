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

import { getAuth, signInWithEmailAndPassword, sendPasswordResetEmail, } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-auth.js";

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

const auth = getAuth();

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

let user_parser = localStorage.getItem("user-parser");


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

document.getElementById("canceladdchatbot-btn").addEventListener("click", function () {
    window.location.href = "homepage.html";
});


document.getElementById("changepass_btn").addEventListener("click", function () {
    get(child(dbRef, "PARSEIT/administration/students/" + user_parser)).then((snapshot) => {
        if (snapshot.exists()) {
            sendResetEmail(user_parser);
        } else {
            get(child(dbRef, "PARSEIT/administration/teachers/" + user_parser)).then((snapshot) => {
                if (snapshot.exists()) {
                    sendResetEmail(user_parser);
                }
            });
        }
    })
});

function showMessage(message) {
    document.getElementById("msg_lbl").innerText = message;
    document.getElementById("notif_div").style.display = "flex";
}

function sendResetEmail(id) {
    get(child(dbRef, "PARSEIT/administration/students/" + id)).then((snapshot) => {
        if (snapshot.exists()) {
            const email = snapshot.val().email;
            sendPasswordResetEmail(auth, email);
            showMessage("Please check your email, thank you!");
        } else {
            get(child(dbRef, "PARSEIT/administration/teachers/" + id)).then((snapshot) => {
                if (snapshot.exists()) {
                    const email = snapshot.val().email;
                    sendPasswordResetEmail(auth, email);
                    showMessage("Please check your email, thank you!");
                }
            });
        }
    });
}

document.getElementById("notifclose_btn").addEventListener("click", function () {
    document.getElementById("notif_div").style.display = "none";
});

document.getElementById("changeemail_btn").addEventListener("click", function () {
    window.location.href = "changeemail.html";
});
