import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-app.js";
import {
    getAuth,
    createUserWithEmailAndPassword,
} from "https://www.gstatic.com/firebasejs/10.13.1/firebase-auth.js";
import {
    getDatabase,
    ref,
    get,
    child,
    update,
    remove,
    set,
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
const auth = getAuth();
const database = getDatabase(app);
const dbRef = ref(database);

//global variables
const userparser = localStorage.getItem("name-parser");
const emailparser = localStorage.getItem("email-parser");
const id = localStorage.getItem("activate-parser");
let type = localStorage.getItem("type-parser");;

//pre-tasks
window.addEventListener("load", function () {
    sendVerificationCode(id, emailparser, generateUniqueID());
    document.getElementById("loading_animation_div").style.display = "none";
    setScreenSize(window.innerWidth, window.innerHeight);
    document.getElementById("verification_div").style.display = "block";
    document.body.style.backgroundImage = "url(assets/ctu_argao_banner_600px.jpg)";


});

//processes
disableResend();
document.getElementById("userparser_lbl").innerHTML = userparser;
document.getElementById("email_lbl").innerHTML = censorEmail(emailparser);

document.getElementById("resend_btn").addEventListener("click", function () {
    countdownVerification();
    sendVerificationCode(id, emailparser, generateUniqueID());
});
document.getElementById("verify_btn").addEventListener("click", function () {
    const userinput_code = document.getElementById("verificationcode_txt").value;
    submitVerificationCode(id, userinput_code);
});
document.getElementById("cancel_btn").addEventListener("click", function () {
    cancelActivation(id, type);
});

//for activation
document.getElementById("step1_btn").addEventListener("click", (event) => {
    event.preventDefault();
    const username = document.getElementById("txtusername").value;
    if (username === "") {
        document.getElementById("txtusername").style.border = "1px solid red";
        document.getElementById("txtusername").style.animation = "shake 0.3s ease-in-out";
    }
    else {
        document.getElementById("txtusername").style.border = "1px solid #e0e0e0";
        document.getElementById("txtusername").style.animation = "none";
        checkUsername(username);
    }

});
document.getElementById("step2_btn").addEventListener("click", (event) => {
    event.preventDefault();
    openSection(3);
    hideSection(1, 2);
});
document.getElementById("step3_btn").addEventListener("click", (event) => {
    event.preventDefault();
    const password = document.getElementById("txtpassword").value;
    const confirm = document.getElementById("txtconfirmpass").value;
    if (password === "") {
        document.getElementById("txtpassword").style.border = "1px solid red";
        document.getElementById("txtpassword").style.animation = "shake 0.3s ease-in-out";
    }
    else if (confirm === "") {
        document.getElementById("txtconfirmpass").style.border = "1px solid red";
        document.getElementById("txtconfirmpass").style.animation = "shake 0.3s ease-in-out";
    }
    else {
        if (password.length < 8) {
            document.getElementById("txtpassword").style.border = "1px solid red";
            document.getElementById("txtpassword").style.animation = "shake 0.3s ease-in-out";
            document.getElementById("txtconfirmpass").style.border = "1px solid #e0e0e0";
            document.getElementById("txtconfirmpass").style.animation = "none";
        }
        else {
            if (password === confirm) {
                const username = document.getElementById("txtusername").value;
                createParser(emailparser, password, id, username);
            }
            else {
                document.getElementById("txtpassword").style.border = "1px solid red";
                document.getElementById("txtpassword").style.animation = "shake 0.3s ease-in-out";
                document.getElementById("txtconfirmpass").style.border = "1px solid red";
                document.getElementById("txtconfirmpass").style.animation = "shake 0.3s ease-in-out";
            }
        }
    }
});

editdetails_btn.addEventListener("click", (event) => {
    event.preventDefault();
    openSignup();
});


//functions
function setScreenSize(width, height) {
    document.body.style.width = width + "px";
    document.body.style.height = height + "px";
}

function censorEmail(email) {
    const [local, domain] = email.split('@');
    const visibleLocal = local.slice(0, 4);
    const censoredLocal = visibleLocal + '*'.repeat(local.length - 4);
    return censoredLocal + '@' + domain;
}

function countdownVerification() {
    document.getElementById("resend_btn").disabled = true;
    document.getElementById("resend_btn").style.opacity = "50%";
    let countdownNumber = 120;

    const countdownElement = document.getElementById("resend_btn");
    const countdownInterval = setInterval(() => {
        countdownElement.innerHTML = "Resend Code(" + countdownNumber + ")";
        countdownNumber--;
        if (countdownNumber < 0) {
            clearInterval(countdownInterval);
            document.getElementById("resend_btn").disabled = false;
            countdownElement.innerHTML = "Resend Code";
            document.getElementById("resend_btn").style.opacity = "100%";
        }
    }, 1000);
}


function generateUniqueID() {
    return Math.random().toString(36).substr(2, 5);
}

function sendVerificationCode(id, email, code) {
    (function () {
        emailjs.init({
            publicKey: "8FZVk4TobsyaJxcCJ",
        });
    })();

    //for testing purposes
    //document.getElementById("verificationcode_txt").value = code;

    const type = localStorage.getItem("type-parser");
    updateDBVerification(id, code, type); //this supposed to go

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


}

function disableResend() {
    let countdownNumber = 30;
    const countdownElement = document.getElementById("resend_btn");
    const countdownInterval = setInterval(() => {
        countdownElement.innerHTML = "Resend Code(" + countdownNumber + ")";
        countdownNumber--;
        if (countdownNumber < 0) {
            clearInterval(countdownInterval);
            document.getElementById("resend_btn").disabled = false;
            countdownElement.innerHTML = "Resend Code";
            document.getElementById("resend_btn").style.opacity = "100%";
        }
    }, 1000);
}

function submitVerificationCode(id, code) {
    const dbRef = ref(database);
    get(child(dbRef, "PARSEIT/administration/students/" + id))
        .then((snapshot) => {
            if (snapshot.exists()) {
                if (snapshot.val().verificationcode == code) {
                    openSignup();
                }
                else {
                    document.getElementById("verificationcode_div").style.border = "1px solid red";
                    document.getElementById("verificationcode_div").style.animation = "shake 0.3s ease-in-out";
                }
            }
            else {
                get(child(dbRef, "PARSEIT/administration/teachers/" + id)).then((snapshot) => {
                    if (snapshot.exists()) {
                        if (snapshot.val().verificationcode == code) {
                            openSignup();
                        }
                        else {
                            document.getElementById("verificationcode_div").style.border = "1px solid red";
                            document.getElementById("verificationcode_div").style.animation = "shake 0.3s ease-in-out";
                        }
                    }
                });
            }
        })
        .catch((error) => {

        });
}

function removeDBVerification(id, type) {
    remove(ref(database, "PARSEIT/administration/students/" + id + "/verificationcode"));
    remove(ref(database, "PARSEIT/administration/teachers/" + id + "/verificationcode"));

}


function cancelActivation(id, type) {
    if (type === "student") {
        remove(ref(database, "PARSEIT/administration/students/" + id + "/verificationcode")).then(() => {
            localStorage.removeItem("activate-parser");
            localStorage.removeItem("email-parser");
            localStorage.removeItem("name-parser");
            localStorage.removeItem("type-parser");
            window.location.href = "login.html";
        });
    } else {
        remove(ref(database, "PARSEIT/administration/teachers/" + id + "/verificationcode")).then(() => {
            localStorage.removeItem("activate-parser");
            localStorage.removeItem("email-parser");
            localStorage.removeItem("name-parser");
            localStorage.removeItem("type-parser");
            window.location.href = "login.html";
        });
    }

}

function openSignup() {
    document.getElementById("verification_div").style.display = "none";
    document.getElementById("div_fillout_container").style.display = "flex";
    document.body.style.backgroundImage = "none";
    openSection(1);
    hideSection(2, 3);

}

function openSection(a) {
    document.getElementById(`step${a}_cont`).style.display = "block";
    document.getElementById(`step${a}_circle`).style.backgroundColor = "#007AFF";
    document.getElementById(`step${a}_circle`).style.color = "#fefefe";
}

function hideSection(b, c) {
    const steps = [b, c];
    steps.forEach(step => {
        const stepElement = document.getElementById(`step${step}_cont`);
        const stepCircle = document.getElementById(`step${step}_circle`);
        stepElement.style.display = "none";
        stepCircle.style.backgroundColor = "#fefefe";
        stepCircle.style.color = "#007AFF";
    });
}

function checkUsername(username) {
    get(child(dbRef, "PARSEIT/username/" + username)).then((snapshot) => {
        if (snapshot.exists()) {
            document.getElementById("txtusername").style.border = "1px solid red";
            document.getElementById("txtusername").style.animation = "shake 0.3s ease-in-out";
        }
        else {
            openSection(2);
            hideSection(1, 3);
            populateParser(localStorage.getItem("activate-parser"), username);
        }
    });
}

function populateParser(id, username) {
    get(child(dbRef, "PARSEIT/administration/students/" + id)).then((snapshot) => {
        if (snapshot.exists()) {
            document.getElementById("confirm-id").innerText = snapshot.val().id;
            document.getElementById("confirm-fullname").innerText = localStorage.getItem("name-parser");
            document.getElementById("confirm-username").innerText = username;
            document.getElementById("confirm-birthday").innerText = snapshot.val().birthday;
            document.getElementById("confirm-email").innerText = localStorage.getItem("email-parser");
            document.getElementById("confirm-yrlvl").innerText = getYearType(snapshot.val().yearlvl);
            document.getElementById("confirm-section").innerText = snapshot.val().section;
            document.getElementById("confirm-regular").innerText = "(" + checkRegular(snapshot.val().regular) + ")";
        } else {
            document.getElementById("yearlvl_p").style.display = "none";
            document.getElementById("section_p").style.display = "none";
            get(child(dbRef, "PARSEIT/administration/teachers/" + id)).then((snapshot) => {
                if (snapshot.exists()) {
                    document.getElementById("confirm-id").innerText = snapshot.val().id;
                    document.getElementById("confirm-fullname").innerText = localStorage.getItem("name-parser");
                    document.getElementById("confirm-username").innerText = username;
                    document.getElementById("confirm-birthday").innerText = snapshot.val().birthday;
                    document.getElementById("confirm-email").innerText = localStorage.getItem("email-parser");
                }
            });
        }
    })
}

function getYearType(year) {
    if (year === "1") {
        return "Freshman"
    }
    if (year === "2") {
        return "Sophomore"
    }
    if (year === "3") {
        return "Junior"
    }
    if (year === "4") {
        return "Senior"
    }
}

function checkRegular(reg) {
    if (reg === "yes") {
        return "Regular"
    }
    else {
        return "Irregular"
    }
}

function createParser(email, password, id, username) {
    createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            updateParser(id, type, username);
        })
        .catch((error) => {
            // Handle errors
            console.error("Error signing up:", error.code, error.message);
        });
}

function updateParser(id, type, username) {
    if (type === "student") {
        update(ref(database, "PARSEIT/administration/students/" + id), {
            activated: "yes",
        })
            .then(() => {
                return removeDBVerification(id, type);
            })
            .then(() => {
                return set(ref(database, "PARSEIT/username/" + username), id);
            })
            .then(() => {
                localStorage.removeItem("email-parser");
                localStorage.removeItem("name-parser");
                localStorage.removeItem("activate-parser");
                localStorage.removeItem("type-parser");
                localStorage.setItem("user-parser", id);
                window.location.href = "homepage.html";
            })
            .catch((error) => {
                console.error("Error during activation process:", error);
                alert("An error occurred. Please try again later.");
            });
    }
    else {
        update(ref(database, "PARSEIT/administration/teachers/" + id), {
            activated: "yes",
        })
            .then(() => {
                return removeDBVerification(id, type);
            })
            .then(() => {
                return set(ref(database, "PARSEIT/username/" + username), id);
            })
            .then(() => {
                localStorage.removeItem("email-parser");
                localStorage.removeItem("name-parser");
                localStorage.removeItem("activate-parser");
                localStorage.removeItem("type-parser");
                localStorage.setItem("user-parser", id);
                window.location.href = "homepage.html";
            })
            .catch((error) => {
                console.error("Error during activation process:", error);
                alert("An error occurred. Please try again later.");
            });
    }

}