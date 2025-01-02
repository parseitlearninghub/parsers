import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-app.js";
import {
    getDatabase,
    ref,
    get,
    child,
    onValue,
    query,
    orderByKey,
    limitToLast,
    push,
    set,
    update
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
const dbRef = ref(database)

//variables
let user_parser = localStorage.getItem("user-parser");
//listeners
await setScreenSize(window.innerWidth, window.innerHeight);
window.addEventListener("load", async function () {
    document.getElementById("loading_animation_div").style.display = "none";
    // if (active_parser_type === "teacher") {
    //     document.getElementById("teacher-year").style.display = "none";
    //     document.getElementById("teacher-section").style.display = "none";
    //     document.getElementById("span-yearlvl").style.display = "none";
    //     document.getElementById("span-section").style.display = "none";
    // }
    document.getElementById("span-username").style.display = "flex";
    document.getElementById("span-tag").style.display = "flex";
    await getCreds(user_parser, active_parser_type);
});

// document.getElementById("details-btn").addEventListener('click', (event) => {
//     document.getElementById("body-parseroom-div").style.animation = "parseroom-slideOut 0.6s ease-out forwards";
//     document.getElementById("details-parseroom-div").style.animation = "parseroom-slideOut 0.6s ease-out forwards";
// });

// document.getElementById("info-btn").addEventListener('click', (event) => {
//     document.getElementById("body-parseroom-div").style.animation = "parseroom-slideIn 0.6s ease-out forwards";
//     document.getElementById("details-parseroom-div").style.animation = "parseroom-slideIn 0.6s ease-out forwards";
// });

document.getElementById("editbanner-btn").addEventListener('click', (event) => {
    document.getElementById("changeCover").style.display = "block";
    document.getElementById("body-parseroom-div").style.animation = "parseroom-slideIn 0.6s ease-out forwards";
    document.getElementById("details-parseroom-div").style.animation = "parseroom-slideIn 0.6s ease-out forwards";
});
document.getElementById("profile-avatar").addEventListener('click', (event) => {
    document.getElementById("changeProfile").style.display = "block";
    document.getElementById("body-parseroom-div").style.animation = "parseroom-slideIn 0.6s ease-out forwards";
    document.getElementById("details-parseroom-div").style.animation = "parseroom-slideIn 0.6s ease-out forwards";
});
document.getElementById("closeprofile-btn").addEventListener('click', (event) => {
    document.getElementById("body-parseroom-div").style.animation = "none";
    document.getElementById("details-parseroom-div").style.animation = "none";
    window.location.href = "homepage.html";
});

const active_parser_type = localStorage.getItem("active-parser-type");
//banners
document.getElementById("default_bg").addEventListener('click', (event) => {
    setNewBanner("default_cover.png", "default_banner.png", active_parser_type);
});
document.getElementById("furina_bg").addEventListener('click', (event) => {
    setNewBanner("furina_bg.png", "furina_banner.png", active_parser_type);
});
document.getElementById("mavuika_bg").addEventListener('click', (event) => {
    setNewBanner("mavuika_bg.png", "mavuika_banner.png", active_parser_type);
});
document.getElementById("nahida_bg").addEventListener('click', (event) => {
    setNewBanner("nahida_bg.png", "nahida_banner.png", active_parser_type);
});
document.getElementById("raiden_bg").addEventListener('click', (event) => {
    setNewBanner("raiden_bg.png", "raiden_banner.png", active_parser_type);
});
document.getElementById("venti_bg").addEventListener('click', (event) => {
    setNewBanner("venti_bg.png", "venti_banner.png", active_parser_type);
});
document.getElementById("zhongli_bg").addEventListener('click', (event) => {
    setNewBanner("zhongli_bg.png", "zhongli_banner.png", active_parser_type);
});

//profiles
document.getElementById("default_profile").addEventListener('click', (event) => {
    setNewProfile("default_profile.png", active_parser_type);
});
document.getElementById("mavuika_profile").addEventListener('click', (event) => {
    setNewProfile("mavuika_1.png", active_parser_type);
});
document.getElementById("mavuika2_profile").addEventListener('click', (event) => {
    setNewProfile("mavuika_2.png", active_parser_type);
});
document.getElementById("furina_profile").addEventListener('click', (event) => {
    setNewProfile("furina_1.png", active_parser_type);
});
document.getElementById("furina2_profile").addEventListener('click', (event) => {
    setNewProfile("furina_2.png", active_parser_type);
});
document.getElementById("nahida_profile").addEventListener('click', (event) => {
    setNewProfile("nahida_1.png", active_parser_type);
});
document.getElementById("nahida2_profile").addEventListener('click', (event) => {
    setNewProfile("nahida_2.png", active_parser_type);
});
document.getElementById("raiden_profile").addEventListener('click', (event) => {
    setNewProfile("raiden_1.png", active_parser_type);
});
document.getElementById("raiden2_profile").addEventListener('click', (event) => {
    setNewProfile("raiden_2.png", active_parser_type);
});
document.getElementById("venti_profile").addEventListener('click', (event) => {
    setNewProfile("venti_1.png", active_parser_type);
});
document.getElementById("venti2_profile").addEventListener('click', (event) => {
    setNewProfile("venti_2.png", active_parser_type);
});
document.getElementById("zhongli_profile").addEventListener('click', (event) => {
    setNewProfile("zhongli_1.png", active_parser_type);
});
document.getElementById("zhongli2_profile").addEventListener('click', (event) => {
    setNewProfile("zhongli_2.png", active_parser_type);
});









//functions
async function setScreenSize(width, height) {
    document.body.style.width = width + "px";
    document.body.style.height = height + "px";
}

async function getparser_username(id) {
    const usernameRef = child(dbRef, `PARSEIT/username/`);
    const snapshot = await get(usernameRef);
    if (snapshot.exists()) {
        const currentData = snapshot.val();
        for (const username of Object.keys(currentData)) {
            if (currentData[username] === id) {
                return username;
            }
        }
        return null;
    } else {
        console.log("No data available");
        return null;
    }
}
async function getCreds(username, type) {
    const usernameRef = child(dbRef, `PARSEIT/administration/${type}s/${username}`);
    const snapshot = await get(usernameRef);
    if (snapshot.exists()) {
        snapshot.val();
        document.getElementById('profile-fullname').innerText = snapshot.val().firstname + " " + snapshot.val().lastname;
        document.getElementById('span-username').innerText = await getparser_username(username);
        document.getElementById('span-section').innerText = snapshot.val().section;
        if (snapshot.val().yearlvl === "1") {
            document.getElementById('span-yearlvl').innerText = "Freshman";
        }
        else if (snapshot.val().yearlvl === "2") {
            document.getElementById('span-yearlvl').innerText = "Sophomore";
        }
        else if (snapshot.val().yearlvl === "3") {
            document.getElementById('span-yearlvl').innerText = "Junior";
        }
        else if (snapshot.val().yearlvl === "4") {
            document.getElementById('span-yearlvl').innerText = "Senior";
        }
    } else {
        console.log("No data available");
        return null;
    }
}
async function setparserBanners(id) {
    const coverRef = child(dbRef, `PARSEIT/administration/students/${id}/cover`);
    const profileRef = child(dbRef, `PARSEIT/administration/students/${id}/profile`);

    const teacherCoverRef = child(dbRef, `PARSEIT/administration/teachers/${id}/cover`);
    const teacherProfileRef = child(dbRef, `PARSEIT/administration/teachers/${id}/profile`);

    const snapshot = await get(coverRef);
    const snapshot2 = await get(profileRef);
    const snapTeacher = await get(teacherCoverRef);
    const snapTeacher2 = await get(teacherProfileRef);
    if (snapshot.exists()) {
        document.getElementById('profile-banner').style.backgroundImage = `url(assets/profiles/${snapshot.val()})`;
    }
    else {
        if (snapTeacher.exists()) {
            document.getElementById('profile-banner').style.backgroundImage = `url(assets/profiles/${snapTeacher.val()})`;
        }
        else {
            document.getElementById('profile-banner').style.backgroundImage = `url(assets/profiles/default_cover.png`;
        }

    }


    if (snapshot2.exists()) {
        document.getElementById('avatar-img').src = `assets/profiles/${snapshot2.val()}`;
        document.getElementById('avatar-img').style.display = `block`;
    }
    else {
        if (snapTeacher2.exists()) {
            document.getElementById('avatar-img').src = `assets/profiles/${snapTeacher2.val()}`;
            document.getElementById('avatar-img').style.display = `block`;
        }
        else {
            document.getElementById('avatar-img').src = `assets/profiles/default_profile.png`;
            document.getElementById('avatar-img').style.display = `block`;
        }
    }
} setparserBanners(user_parser);
async function setNewBanner(cover, banner, type) {
    if (type === "student") {
        await update(ref(database, "PARSEIT/administration/students/" + user_parser), {
            cover: cover,
            banner: banner,
        }).then(() => {
            setparserBanners(user_parser);
            document.getElementById("body-parseroom-div").style.animation = "parseroom-slideOut 0.6s ease-out forwards";
            document.getElementById("details-parseroom-div").style.animation = "parseroom-slideOut 0.6s ease-out forwards";
            setTimeout(() => {
                document.getElementById("changeCover").style.display = "none";
            }, 600);
        });
    }
    else {
        await update(ref(database, "PARSEIT/administration/teachers/" + user_parser), {
            cover: cover,
            banner: banner,
        }).then(() => {
            setparserBanners(user_parser);
            document.getElementById("body-parseroom-div").style.animation = "parseroom-slideOut 0.6s ease-out forwards";
            document.getElementById("details-parseroom-div").style.animation = "parseroom-slideOut 0.6s ease-out forwards";
            setTimeout(() => {
                document.getElementById("changeCover").style.display = "none";
            }, 600);
        });
    }


}
async function setNewProfile(profile, type) {
    if (type === "student") {
        await update(ref(database, "PARSEIT/administration/students/" + user_parser), {
            profile: profile,

        }).then(() => {
            setparserBanners(user_parser);
            document.getElementById("body-parseroom-div").style.animation = "parseroom-slideOut 0.6s ease-out forwards";
            document.getElementById("details-parseroom-div").style.animation = "parseroom-slideOut 0.6s ease-out forwards";
            setTimeout(() => {
                document.getElementById("changeProfile").style.display = "none";
            }, 600);
        });
    }
    else {
        await update(ref(database, "PARSEIT/administration/teachers/" + user_parser), {
            profile: profile,

        }).then(() => {
            setparserBanners(user_parser);
            document.getElementById("body-parseroom-div").style.animation = "parseroom-slideOut 0.6s ease-out forwards";
            document.getElementById("details-parseroom-div").style.animation = "parseroom-slideOut 0.6s ease-out forwards";
            setTimeout(() => {
                document.getElementById("changeProfile").style.display = "none";
            }, 600);
        });
    }

}
let startX = 0;
let endX = 0;
document.addEventListener('touchstart', (event) => {
    startX = event.touches[0].clientX;
});
document.addEventListener('touchend', async (event) => {
    endX = event.changedTouches[0].clientX;

    if (endX - startX > 100) {

        document.getElementById("body-parseroom-div").style.animation = "parseroom-slideOut 0.6s ease-out forwards";
        document.getElementById("details-parseroom-div").style.animation = "parseroom-slideOut 0.6s ease-out forwards";
        setTimeout(() => {
            document.getElementById("changeProfile").style.display = "none";
            document.getElementById("changeCover").style.display = "none";
        }, 600);
    }
});
getPosts();
async function getPosts() {
    const commentsRef = ref(database, `PARSEIT/community/posts/`);
    const container = document.getElementById("profile-posts");
    onValue(commentsRef, async (snapshot) => {
        container.innerHTML = ``;
        if (snapshot.exists()) {
            const data = snapshot.val();
            const dataArray = Object.entries(data);
            const reversedArray = dataArray.reverse();
            const reversedData = Object.fromEntries(reversedArray);
            for (const post in reversedData) {
                const id = reversedData[post].student_id;
                if (id === user_parser) {
                    console.log(id);
                    const username = reversedData[post].username;
                    const context = reversedData[post].description;
                    const time = formatTime(reversedData[post].time);

                    let currentProfile = 'default_profile.png';
                    // Fetch the profile asynchronously
                    const profileStudentRef = ref(database, `PARSEIT/administration/students/${id}/`);
                    const profileStudentSnapshot = await get(profileStudentRef);

                    if (profileStudentSnapshot.exists()) {
                        currentProfile = profileStudentSnapshot.val().profile;
                    } else {
                        const profileTeacherRef = ref(database, `PARSEIT/administration/teachers/${id}/`);
                        const profileTeacherSnapshot = await get(profileTeacherRef);

                        if (profileTeacherSnapshot.exists()) {
                            currentProfile = profileTeacherSnapshot.val().profile || 'default_profile.png';
                        }
                    }

                    container.innerHTML += `
                    <section class="post-wrapper-cont">
                    <section class="post-top">
                    <section class="img-side">
                        <img
                        class="user-img"
                        src="assets/profiles/${currentProfile}"
                        alt=""
                        />
                    </section>
                    <section class="user-side">
                        <span class="username-post">@${username}</span>
                        <span class="date-post">${time}</span>
                    </section>
                    </section>
                    <section class="post-body">${context}</section>
                    <section class="post-bottom" onclick="window.location.href='answers.html?postID=${post}'">View Answers</section>
                    </section>`;

                }
                container.innerHTML += `<section class="fillers"></section><section class="fillers"></section>`;
            }
        }
        else {
            container.innerHTML += `
            <section class="comment-box">
                <div class="comment-wrapper nocomment">
                    <span class="nocomment">No Comment Yet...</span>
                </div>
            </section>`;
        }

    });
}

function formatTime(timestamp) {
    // Ensure the timestamp is a valid number
    const timestampNumber = Number(timestamp);
    if (isNaN(timestampNumber)) {
        console.error("Invalid timestamp:", timestamp);
        return "Invalid time";
    }

    const now = new Date(timestampNumber);

    return new Intl.DateTimeFormat("en-US", {
        timeZone: "Asia/Manila", // Specifies Philippine Time
        month: "long",
        day: "2-digit",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
    }).format(now);
}
