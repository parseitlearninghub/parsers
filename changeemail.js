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

import { getAuth, signInWithEmailAndPassword, sendPasswordResetEmail, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-auth.js";

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
    window.location.href = "settings.html";
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


document.getElementById("verify-new-email-btn").addEventListener("click", function () {
    const email = document.getElementById("new-email-txt").value;
    const id = user_parser;
    if (email !== '') {
        sendVerificationCode(id, email, generateUniqueID());
    }
    else {
        errorElement("new-email-div");
    }

});


document.getElementById("verify-code-btn").addEventListener("click", function () {
    const code = document.getElementById("new-code-txt").value;
    const id = user_parser;
    if (code !== '') {
        submitVerificationCode(id, code)
    }
    else {
        errorElement("new-code-div");
    }

});

function generateUniqueID() {
    return Math.random().toString(36).substr(2, 5);
}

function sendVerificationCode(id, email, code) {
    const type = localStorage.getItem("type-parser");
    (function () {
        emailjs.init({
            publicKey: "8FZVk4TobsyaJxcCJ",
        });
    })();


    updateDBVerification(id, code, type);

    emailjs.send('service_g8cli5d', 'template_b0rhzue', {
        to_name: email,
        message: code,
    }).then((response) => {
        updateDBVerification(id, code);
    }).catch((error) => {
        console.log('FAILED...', error);
    });

}

function updateDBVerification(id, code, type) {
    if (type === "student") {
        update(ref(database, "PARSEIT/administration/students/" + id), {
            verificationcode: code,
        });
    }
    else {
        update(ref(database, "PARSEIT/administration/teachers/" + id), {
            verificationcode: code,
        });
    }

    showMessage("Please check your email, thank you!");
    document.getElementById("new-code-div").style.display = "flex";
}

function submitVerificationCode(id, code) {
    const dbRef = ref(database);
    get(child(dbRef, "PARSEIT/administration/students/" + id))
        .then((snapshot) => {
            if (snapshot.exists()) {
                if (snapshot.val().verificationcode == code) {
                    document.getElementById("confirmpass-div").style.display = "flex";
                    document.getElementById("changeemailaddress-btn").style.display = "block";
                    removeDBVerification(id, type);
                }
                else {
                    errorElement("new-code-div");
                }
            }
            else {
                get(child(dbRef, "PARSEIT/administration/teachers/" + id)).then((snapshot) => {
                    if (snapshot.exists()) {
                        if (snapshot.val().verificationcode == code) {
                            document.getElementById("confirmpass-div").style.display = "flex";
                            document.getElementById("changeemailaddress-btn").style.display = "block";
                            removeDBVerification(id, type);
                        }
                        else {
                            errorElement("new-code-div");
                        }
                    }
                });
            }
        })
        .catch((error) => {

        });
}

function removeDBVerification(id, type) {
    if (type === "student") {
        remove(ref(database, "PARSEIT/administration/students/" + id + "/verificationcode"));
    } else {
        remove(ref(database, "PARSEIT/administration/teachers/" + id + "/verificationcode"));
    }

}

function errorElement(element) {
    document.getElementById(element).style.border = "0.4px solid #f30505";
    setTimeout(() => {
        document.getElementById(element).style.border = "0.4px solid #dcdcdc";
    }, 1000);
}

document.getElementById("changeemailaddress-btn").addEventListener("click", async function () {
    const password = document.getElementById("confirmpass-txt").value;
    const new_email = document.getElementById("new-email-txt").value;
    const id = user_parser;
    const type = localStorage.getItem("type-parser");
    if (password !== '') {

        const signInAndDeleteUser = async (email, password, type, new_email) => {
            try {
                console.log("Signing in with email:", email);
                const userCredential = await signInWithEmailAndPassword(auth, email, password);
                console.log("User signed in:", userCredential.user.email);
                const user = auth.currentUser;
                if (user) {
                    await user.delete().then(() => {
                        createUserWithEmailAndPassword(auth, new_email, password)
                            .then(async (userCredential) => {
                                await updateParser(id, new_email, type);

                            })
                            .catch((error) => {
                                // Handle errors
                                console.error("Error signing up:", error.code, error.message);
                            });
                    });



                } else {
                    console.error("No user is signed in.");
                }
            } catch (error) {
                errorElement("confirmpass-div");
            }


        };
        const email = await getOldEmail(id);
        signInAndDeleteUser(email, password, type, new_email);
    }
    else {
        errorElement("confirmpass-div");
    }

});

async function getOldEmail(studentid) {
    const dbRef = ref(database);
    return await get(child(dbRef, "PARSEIT/administration/students/" + studentid)).then(async (snapshot) => {
        if (snapshot.exists()) {
            const email = snapshot.val().email;
            return email;
        }
        else {
            await get(child(dbRef, "PARSEIT/administration/students/" + studentid)).then((snapshot) => {
                if (snapshot.exists()) {
                    const email = snapshot.val().email;
                    return email;
                }
            });
        }
    });
}

async function updateParser(id, email, type) {
    if (type === "student") {
        update(ref(database, "PARSEIT/administration/students/" + id), {

            email: email,
        }).then(() => {
            localStorage.removeItem("user-parser");
            window.location.href = "index.html";
        })

    }
    else {
        update(ref(database, "PARSEIT/administration/teachers/" + id), {
            email: email,
        }).then(() => {
            localStorage.removeItem("user-parser");
            window.location.href = "index.html";
        })

    }
}