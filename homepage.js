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
  remove
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

//vars
let user_parser = localStorage.getItem("user-parser");
let parseclass_cont = document.getElementById("parseclass-default-div");
let backgroundImgInput = "";
let username = "";

let parser = [
  {
    activated: "",
    birthday: "",
    disabled: "",
    email: "",
    firstname: "",
    lastname: "",
    middlename: "",
    regular: "",
    section: "",
    suffix: "",
    temporarypass: "",
    type: "",
    yearlvl: "",
    profile: "",
  },
];
let status = [
  {
    current_sem: "",
    ongoing: "",
    academicref: "",
  },
];
let allsubjects = [];
let siti_brain = [];

setScreenSize(window.innerWidth, window.innerHeight);
window.addEventListener("load", async function () {
  document.getElementById("loading_animation_div").style.display = "none";
  username = await getparser_username(user_parser);
  await getUser(user_parser).then(async () => {

    if (parser[0].suffix === "none") {
      parser[0].suffix = "";
    }
    // localStorage.setItem(
    //   "parser-fullname",
    //   parser[0].firstname + " " + parser[0].lastname + " " + parser[0].suffix
    // );
    await getAcadStatus().then(() => {
      bookmarkBubble();
      document.getElementById("homepage_div").style.display = "flex";
      viewLatestAnnouncement();
      if (parser[0].type === "student") {
        document.getElementById("student_nav").style.display = "flex";
        if (status[0].ongoing === "true") {
          document.getElementById("search-parseclass-div").style.display =
            "flex";
          document.getElementById("notyetstarted_div").style.display = "none";
          document.getElementById("parseclass-default-div").style.display =
            "flex";
          loadStudentSubjects();
        } else {
          loadStudentSubjects();
          document.getElementById("parseclass-default-div").style.display =
            "none";
          document.getElementById("search-parseclass-div").style.display =
            "none";
          document.getElementById("notyetstarted_div").style.display = "flex";
        }
        //show
        showBodyWrapper("home_all_sec");
        selectNavIcon("homelobby_img");
        selectNavLbl("homelobby_lbl");
        changeHomeLbl("lobby_title", "Home");
        selectNavIcon("homelobby_imgx");
        selectNavLbl("homelobby_lblx");

        //hide
        hideBodyWrapper("game_student_sec");
        hideBodyWrapper("library_student_sec");
        hideBodyWrapper("honors_teacher_sec");
        hideBodyWrapper("chatgpt_all_sec");
        hideBodyWrapper("share_teacher_sec");
        hideBodyWrapper("quiz_teacher_sec");

        revertNavIcon("homegame_img");
        revertNavLbl("homegame_lbl");

        revertNavIcon("homelibrary_img");
        revertNavLbl("homelibrary_lbl");

        revertNavIcon("homehonors_img");
        revertNavLbl("homehonors_lbl");

        revertNavIcon("homechatbot_img");
        revertNavLbl("homechatbot_lbl");

        // revertNavIcon("homechatbot_imgx");
        // revertNavLbl("homechatbot_lblx");

        revertNavIcon("homeshare_img");
        revertNavLbl("homeshare_lbl");

        revertNavIcon("homequiz_img");
        revertNavLbl("homequiz_lbl");
      } else {
        document.getElementById("myJourney_btn").style.display = "none";
        document.getElementById("teacher_nav").style.display = "flex";
        if (status[0].ongoing === "true") {
          document.getElementById("search-parseclass-div").style.display =
            "flex";
          document.getElementById("notyetstarted_div").style.display = "none";
          document.getElementById("parseclass-default-div").style.display =
            "flex";
          loadTeacherSubjects();
        } else {
          document.getElementById("parseclass-default-div").style.display =
            "none";
          document.getElementById("search-parseclass-div").style.display =
            "none";
          document.getElementById("notyetstarted_div").style.display = "flex";
        }
        //show
        showBodyWrapper("home_all_sec");
        selectNavIcon("homelobby_img");
        selectNavLbl("homelobby_lbl");
        changeHomeLbl("lobby_title", "Home");
        selectNavIcon("homelobby_imgx");
        selectNavLbl("homelobby_lblx");
        //hide
        hideBodyWrapper("game_student_sec");
        hideBodyWrapper("library_student_sec");
        hideBodyWrapper("honors_teacher_sec");
        hideBodyWrapper("chatgpt_all_sec");
        hideBodyWrapper("share_teacher_sec");
        hideBodyWrapper("quiz_teacher_sec");

        revertNavIcon("homegame_img");
        revertNavLbl("homegame_lbl");

        revertNavIcon("homelibrary_img");
        revertNavLbl("homelibrary_lbl");

        revertNavIcon("homehonors_img");
        revertNavLbl("homehonors_lbl");

        revertNavIcon("homechatbot_img");
        revertNavLbl("homechatbot_lbl");

        // revertNavIcon("homechatbot_imgx");
        // revertNavLbl("homechatbot_lblx");

        revertNavIcon("homeshare_img");
        revertNavLbl("homeshare_lbl");

        revertNavIcon("homequiz_img");
        revertNavLbl("homequiz_lbl");
      }
    });
  });
});
document.getElementById("sidebar_btn").addEventListener("click", function () {
  showSidebar();
  let startX = 0;
  let endX = 0;
  document.addEventListener("touchstart", (event) => {
    startX = event.touches[0].clientX;
  });
  document.addEventListener("touchend", (event) => {
    endX = event.changedTouches[0].clientX;
    if (startX - endX > 50) {
      hideSidebar();
    }
  });
});
document.getElementById("logout_btn").addEventListener("click", function () {
  logout();
});
document.getElementById("homelobby_btn").addEventListener("click", function () {
  loadStudentSubjects();
  showBodyWrapper("home_all_sec");
  selectNavIcon("homelobby_img");
  selectNavLbl("homelobby_lbl");
  changeHomeLbl("lobby_title", "Home");

  //revert
  hideBodyWrapper("game_student_sec");
  revertNavIcon("homegame_img");
  revertNavLbl("homegame_lbl");

  hideBodyWrapper("library_student_sec");
  revertNavIcon("homelibrary_img");
  revertNavLbl("homelibrary_lbl");

  hideBodyWrapper("chatgpt_all_sec");
  revertNavIcon("homechatbot_img");
  revertNavLbl("homechatbot_lbl");

  hideBodyWrapper("quiz_teacher_sec");
  revertNavIcon("homequiz_img");
  revertNavLbl("homequiz_lbl");
});
document.getElementById("homegame_btn").addEventListener("click", function () {
  showBodyWrapper("game_student_sec");
  selectNavIcon("homegame_img");
  selectNavLbl("homegame_lbl");
  changeHomeLbl("lobby_title", "Game");

  //revert
  hideBodyWrapper("home_all_sec");
  revertNavIcon("homelobby_img");
  revertNavLbl("homelobby_lbl");

  hideBodyWrapper("library_student_sec");
  revertNavIcon("homelibrary_img");
  revertNavLbl("homelibrary_lbl");

  hideBodyWrapper("chatgpt_all_sec");
  revertNavIcon("homechatbot_img");
  revertNavLbl("homechatbot_lbl");

  hideBodyWrapper("quiz_teacher_sec");
  revertNavIcon("homequiz_img");
  revertNavLbl("homequiz_lbl");
});
document
  .getElementById("homelibrary_btn")
  .addEventListener("click", function () {
    showBodyWrapper("library_student_sec");
    selectNavIcon("homelibrary_img");
    selectNavLbl("homelibrary_lbl");
    changeHomeLbl("lobby_title", "Library");

    //revert
    hideBodyWrapper("home_all_sec");
    revertNavIcon("homelobby_img");
    revertNavLbl("homelobby_lbl");

    hideBodyWrapper("game_student_sec");
    revertNavIcon("homegame_img");
    revertNavLbl("homegame_lbl");

    hideBodyWrapper("chatgpt_all_sec");
    revertNavIcon("homechatbot_img");
    revertNavLbl("homechatbot_lbl");

    hideBodyWrapper("quiz_teacher_sec");
    revertNavIcon("homequiz_img");
    revertNavLbl("homequiz_lbl");

    document.querySelectorAll('.yt-vid-wrapper').forEach(async (element) => {
      element.style.display = 'flex';
    });

  });
document
  .getElementById("homechatbot_btn")
  .addEventListener("click", async function () {
    showBodyWrapper("chatgpt_all_sec");
    document.getElementById("chatgpt_all_sec").style.display = "flex";
    scrollToBottom();
    selectNavIcon("homechatbot_img");
    selectNavLbl("homechatbot_lbl");
    changeHomeLbl("lobby_title", "ChatBot");

    //revert
    hideBodyWrapper("home_all_sec");
    revertNavIcon("homelobby_img");
    revertNavLbl("homelobby_lbl");

    hideBodyWrapper("game_student_sec");
    revertNavIcon("homegame_img");
    revertNavLbl("homegame_lbl");

    hideBodyWrapper("library_student_sec");
    revertNavIcon("homelibrary_img");
    revertNavLbl("homelibrary_lbl");

    hideBodyWrapper("quiz_teacher_sec");
    revertNavIcon("homequiz_img");
    revertNavLbl("homequiz_lbl");
    await getTriggerInputs();

  });
document
  .getElementById("homelobby_btnx")
  .addEventListener("click", function () {
    showBodyWrapper("home_all_sec");
    selectNavIcon("homelobby_imgx");
    selectNavLbl("homelobby_lblx");
    changeHomeLbl("lobby_title", "Home");

    //revert
    hideBodyWrapper("honors_teacher_sec");
    revertNavIcon("homehonors_img");
    revertNavLbl("homehonors_lbl");

    hideBodyWrapper("share_teacher_sec");
    revertNavIcon("homeshare_img");
    revertNavLbl("homeshare_lbl");

    // hideBodyWrapper("chatgpt_all_sec");
    // revertNavIcon("homechatbot_imgx");
    // revertNavLbl("homechatbot_lblx");

    hideBodyWrapper("quiz_teacher_sec");
    revertNavIcon("homequiz_img");
    revertNavLbl("homequiz_lbl");
  });
document
  .getElementById("homehonors_btn")
  .addEventListener("click", function () {
    showBodyWrapper("honors_teacher_sec");
    selectNavIcon("homehonors_img");
    selectNavLbl("homehonors_lbl");
    changeHomeLbl("lobby_title", "Honors");

    //revert
    hideBodyWrapper("home_all_sec");
    revertNavIcon("homelobby_imgx");
    revertNavLbl("homelobby_lblx");

    hideBodyWrapper("share_teacher_sec");
    revertNavIcon("homeshare_img");
    revertNavLbl("homeshare_lbl");

    // hideBodyWrapper("chatgpt_all_sec");
    // revertNavIcon("homechatbot_imgx");
    // revertNavLbl("homechatbot_lblx");

    hideBodyWrapper("quiz_teacher_sec");
    revertNavIcon("homequiz_img");
    revertNavLbl("homequiz_lbl");
  });
document.getElementById("homeshare_btn").addEventListener("click", function () {
  showBodyWrapper("share_teacher_sec");
  showBodyWrapper("share_teacher_wrapper");
  selectNavIcon("homeshare_img");
  selectNavLbl("homeshare_lbl");
  changeHomeLbl("lobby_title", "Share");

  //revert
  hideBodyWrapper("home_all_sec");
  revertNavIcon("homelobby_imgx");
  revertNavLbl("homelobby_lblx");

  hideBodyWrapper("honors_teacher_sec");
  revertNavIcon("homehonors_img");
  revertNavLbl("homehonors_lbl");

  // hideBodyWrapper("chatgpt_all_sec");
  // revertNavIcon("homechatbot_imgx");
  // revertNavLbl("homechatbot_lblx");

  hideBodyWrapper("quiz_teacher_sec");
  revertNavIcon("homequiz_img");
  revertNavLbl("homequiz_lbl");
});
// document.getElementById("homechatbot_btnx").addEventListener("click", function () {
//     showBodyWrapper("chatgpt_all_sec");
//     selectNavIcon("homechatbot_imgx");
//     selectNavLbl("homechatbot_lblx");
//     changeHomeLbl("lobby_title", "ChatBot");

//     //revert
//     hideBodyWrapper("home_all_sec");
//     revertNavIcon("homelobby_imgx");
//     revertNavLbl("homelobby_lblx");

//     hideBodyWrapper("honors_teacher_sec");
//     revertNavIcon("homehonors_img");
//     revertNavLbl("homehonors_lbl");

//     hideBodyWrapper("share_teacher_sec");
//     revertNavIcon("homeshare_img");
//     revertNavLbl("homeshare_lbl");
// });

document.getElementById("homequiz_btn").addEventListener("click", function () {
  showBodyWrapper("quiz_teacher_sec");
  selectNavIcon("homequiz_img");
  selectNavLbl("homequiz_lbl");
  changeHomeLbl("lobby_title", "Quiz");

  //revert
  hideBodyWrapper("home_all_sec");
  revertNavIcon("homelobby_imgx");
  revertNavLbl("homelobby_lblx");

  hideBodyWrapper("honors_teacher_sec");
  revertNavIcon("homehonors_img");
  revertNavLbl("homehonors_lbl");

  hideBodyWrapper("share_teacher_sec");
  revertNavIcon("homeshare_img");
  revertNavLbl("homeshare_lbl");

  // hideBodyWrapper("chatgpt_all_sec");
  // revertNavIcon("homechatbot_imgx");
  // revertNavLbl("homechatbot_lblx");
});
document.getElementById("game-1").addEventListener("click", function () {
  window.location.href = "https://parseitlearninghub.github.io/game-flipcard/";
});
document.getElementById("game-2").addEventListener("click", function () {
  window.location.href =
    "https://parseitlearninghub.github.io/game-fruitmania/";
});
document.getElementById("game-4").addEventListener("click", function () {
  window.location.href = "https://parseitlearninghub.github.io/game-guesspick/";
});
document.getElementById("game-3").addEventListener("click", function () {
  window.location.href = "./parserslearninghub/index.html";
});

document
  .getElementById("announcement-div")
  .addEventListener("click", (event) => {
    document.getElementById("allannouncement-div").style.display = "flex";
    document.getElementById("allannouncement-div").style.animation =
      "fadeScaleUp 0.25s ease-in-out forwards";

    let startY = 0;
    let endY = 0;
    document.addEventListener("touchstart", (event) => {
      startY = event.touches[0].clientY;
    });
    document.addEventListener("touchend", (event) => {
      endY = event.changedTouches[0].clientY;
      if (endY - startY > 300) {
        document.getElementById("allannouncement-div").style.animation =
          "fadeScaleDown 0.25s ease-in-out forwards";
      }
    });
  });


document.getElementById("community_btn").addEventListener("click", (event) => {
  event.preventDefault();
  window.location.href = "https://parseitlearninghub.github.io/community/";
});
document.getElementById("myProfile_btn").addEventListener("click", (event) => {
  event.preventDefault();
  localStorage.setItem("active-parser-type", parser[0].type);
  window.location.href = "profile.html";
});

document.getElementById("myJourney_btn").addEventListener("click", (event) => {
  window.location.href = "myjourney.html";
});

document.getElementById("settings_btn").addEventListener("click", (event) => {
  event.preventDefault();
  document.getElementById("nofeature").style.display = "flex";
  setTimeout(() => {
    document.getElementById("nofeature").style.display = "none";
  }, 1000);
});


document.getElementById("background-1").addEventListener("click", (event) => {
  hideBackground("background-2");
  hideBackground("background-3");
  hideBackground("background-4");
  document.getElementById("select-bg-img").style.display = "block";
  backgroundImgInput = "4.png";
});
document.getElementById("background-2").addEventListener("click", (event) => {
  hideBackground("background-1");
  hideBackground("background-3");
  hideBackground("background-4");
  document.getElementById("select-bg-img").style.display = "block";
  backgroundImgInput = "1.png";
});
document.getElementById("background-3").addEventListener("click", (event) => {
  hideBackground("background-1");
  hideBackground("background-2");
  hideBackground("background-4");
  document.getElementById("select-bg-img").style.display = "block";
  backgroundImgInput = "2.png";
});
document.getElementById("background-4").addEventListener("click", (event) => {
  hideBackground("background-1");
  hideBackground("background-3");
  hideBackground("background-2");
  document.getElementById("select-bg-img").style.display = "block";
  backgroundImgInput = "3.png";
});
document.getElementById("select-bg-img").addEventListener("click", (event) => {
  showBackground("background-1");
  showBackground("background-2");
  showBackground("background-3");
  showBackground("background-4");
  document.getElementById("share-announcement-btn").style.display = "none";
  document.getElementById("select-bg-img").style.display = "none";
});
document
  .getElementById("share-announcement-btn")
  .addEventListener("click", (event) => {
    submitAnnouncement();
  });
document.getElementById("reloadpage").addEventListener("click", (event) => {
  window.location.reload();
});

//functions
function hideBackground(element) {
  document.getElementById(element).style.display = "none";
  document.getElementById("share-announcement-btn").style.display = "flex";
}
function showBackground(element) {
  document.getElementById(element).style.display = "block";
}
function setScreenSize(width, height) {
  document.body.style.width = width + "px";
  document.body.style.height = height + "px";
}
function showSidebar() {
  document.getElementById("sidebar_div").style.zIndex = "100";
  document.getElementById("sidebar_div").style.display = "flex";
  document.getElementById("sidebar_frame").style.animation =
    "showsidebar 0.3s ease-in-out forwards";
}
function hideSidebar() {
  document.getElementById("sidebar_frame").style.animation =
    "hidesidebar 0.3s ease-in-out forwards";
  setTimeout(() => {
    document.getElementById("sidebar_div").style.zIndex = "-1";
  }, 300);
}
function logout() {
  localStorage.removeItem("user-parser");
  window.location.href = "login.html";
}
function showBodyWrapper(id) {
  document.getElementById(id).style.display = "block";
}
function selectNavIcon(id) {
  document.getElementById(id).style.filter =
    "invert(30%) sepia(59%) saturate(7076%) hue-rotate(350deg) brightness(88%) contrast(120%)";
}
function selectNavLbl(id) {
  document.getElementById(id).style.color = "#f30505";
}
function hideBodyWrapper(id) {
  document.getElementById(id).style.display = "none";
}
function revertNavIcon(id) {
  document.getElementById(id).style.filter =
    "invert(54%) sepia(8%) saturate(27%) hue-rotate(319deg) brightness(91%) contrast(85%)";
}
function revertNavLbl(id) {
  document.getElementById(id).style.color = "#808080";
}
function changeHomeLbl(id, type) {
  document.getElementById(id).innerText = type;
}
function getCurrentDayName() {
  let today = new Date();
  let weekdays = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  return weekdays[today.getDay()];
}
let ongoing_previousData = null;
async function changesInOngoing() {
  const statusRef = child(
    dbRef,
    "PARSEIT/administration/academicyear/status/ongoing"
  );
  onValue(
    statusRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const currentData = snapshot.val();
        if (ongoing_previousData === null) {
          //console.log('Ongoing:', currentData);
        } else {
          //console.log('Ongoing:', currentData);
          if (ongoing_previousData !== currentData) {
            if (currentData === "true") {
              status[0].ongoing = "true";
              document.getElementById("search-parseclass-div").style.display =
                "flex";
              document.getElementById("notyetstarted_div").style.display =
                "none";
              document.getElementById("parseclass-default-div").style.display =
                "flex";
            } else {
              status[0].ongoing = "false";
              document.getElementById("search-parseclass-div").style.display =
                "none";
              document.getElementById("notyetstarted_div").style.display =
                "flex";
              document.getElementById("parseclass-default-div").style.display =
                "none";
            }
            window.location.reload();
          }
        }
        ongoing_previousData = currentData;
      } else {
        console.log("No data available");
      }
    },
    (error) => {
      console.error("Error reading data:", error);
    }
  );
}
changesInOngoing();

let sem_previousData = null;
async function changesInSem() {
  const statusRef = child(
    dbRef,
    "PARSEIT/administration/academicyear/status/current_sem"
  );
  onValue(
    statusRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const currentData = snapshot.val();
        if (sem_previousData === null) {
        } else {
          if (sem_previousData !== currentData) {
            status[0].current_sem = "1";
            if (currentData === "2") {
              status[0].current_sem = "2";
            }
            document.getElementById("search-parseclass-div").style.display =
              "flex";
            document.getElementById("notyetstarted_div").style.display = "none";
            document.getElementById("parseclass-default-div").style.display =
              "flex";
            window.location.reload();
          }
        }
        sem_previousData = currentData;
      } else {
        console.log("No data available");
      }
    },
    (error) => {
      console.error("Error reading data:", error);
    }
  );
}
changesInSem();
let academicref_previousData = null;
async function changesInAcademicRef() {
  const statusRef = child(
    dbRef,
    "PARSEIT/administration/academicyear/status/academic_ref"
  );
  onValue(
    statusRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const currentData = snapshot.val();
        if (academicref_previousData === null) {
          // console.log('Ongoing:', currentData);
        } else {
          // console.log('Ongoing:', currentData);
          if (academicref_previousData !== currentData) {
            document.getElementById("search-parseclass-div").style.display =
              "flex";
            document.getElementById("notyetstarted_div").style.display = "none";
            document.getElementById("parseclass-default-div").style.display =
              "flex";
            window.location.reload();
            //document.getElementById("class-sort").style.display = "flex";
          }
        }
        academicref_previousData = currentData;
      } else {
        console.log("No data available");
      }
    },
    (error) => {
      console.error("Error reading data:", error);
    }
  );
}
changesInAcademicRef();
async function getAcadStatus() {
  const ref = child(dbRef, "PARSEIT/administration/academicyear/status/");
  await get(ref).then((snapshot) => {
    status[0].current_sem = snapshot.val().current_sem;
    status[0].ongoing = snapshot.val().ongoing;
    status[0].academicref = snapshot.val().academic_ref;
  });
}
function getUser(id) {
  return new Promise((resolve, reject) => {
    const dbRef = ref(database);
    get(child(dbRef, "PARSEIT/administration/students/" + id))
      .then((snapshot) => {
        if (snapshot.exists()) {
          parser[0].activated = snapshot.val().activated;
          parser[0].birthday = snapshot.val().birthday;
          parser[0].disabled = snapshot.val().disabled;
          parser[0].email = snapshot.val().email;
          parser[0].firstname = snapshot.val().firstname;
          parser[0].lastname = snapshot.val().lastname;
          parser[0].middlename = snapshot.val().middlename;
          parser[0].regular = snapshot.val().regular;
          parser[0].section = snapshot.val().section;
          parser[0].suffix = snapshot.val().suffix;
          parser[0].temporarypass = snapshot.val().temporarypass;
          parser[0].type = snapshot.val().type;
          parser[0].yearlvl = snapshot.val().yearlvl;
          resolve();
        } else {
          get(child(dbRef, "PARSEIT/administration/teachers/" + id)).then(
            (snapshot) => {
              if (snapshot.exists()) {
                parser[0].activated = snapshot.val().activated;
                parser[0].birthday = snapshot.val().birthday;
                parser[0].disabled = snapshot.val().disabled;
                parser[0].email = snapshot.val().email;
                parser[0].firstname = snapshot.val().firstname;
                parser[0].lastname = snapshot.val().lastname;
                parser[0].middlename = snapshot.val().middlename;
                parser[0].suffix = snapshot.val().suffix;
                parser[0].temporarypass = snapshot.val().temporarypass;
                parser[0].type = snapshot.val().type;
                resolve();
              }
            }
          );
        }
      })
      .catch((error) => {
        alert("Error getting user info");
        reject(error);
      });
  });
}
async function submitAnnouncement() {
  const dateInput = getCurrentDayName();
  const timeInput = getTimeWithAMPM();
  const headerInput = document.getElementById("body-share-header").value;
  const descriptionInput = document.getElementById(
    "body-share-description"
  ).value;

  if (!dateInput || !timeInput || !headerInput) {
    return;
  }

  const newAnnouncement = {
    date: dateInput,
    time: timeInput,
    header: headerInput,
    description: descriptionInput,
    background_img: backgroundImgInput,
    authorid: user_parser,
    month: formatDate(new Date()),
  };

  const dbRef = ref(database, "PARSEIT/administration/announcement/");
  const newAnnouncementRef = push(dbRef);

  try {
    await set(newAnnouncementRef, newAnnouncement).then(() => {
      document.getElementById("check_animation_div").style.display = "flex";
      setTimeout(() => {
        document.getElementById("check_animation_div").style.display = "none";
        document.getElementById("body-share-header").value = "";
        document.getElementById("body-share-description").value = "";
        backgroundImgInput = "";
        showBackground("background-1");
        showBackground("background-2");
        showBackground("background-3");
        showBackground("background-4");
      }, 2000);
    });
  } catch (error) {
    console.error("Error submitting announcement: ", error);
  }
}
function getTimeWithAMPM() {
  const now = new Date();
  const options = {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true, // To use 12-hour format with AM/PM
  };
  const timeString = new Intl.DateTimeFormat("en-US", options).format(now);
  return timeString;
}
function viewLatestAnnouncement() {
  const date_announcement_lbl = document.getElementById(
    "date_announcement_lbl"
  );
  const announcement_lbl = document.getElementById("announcement_lbl");
  const time_announcement_lbl = document.getElementById(
    "time_announcement_lbl"
  );
  const dbRef = ref(database, "PARSEIT/administration/announcement/");
  const latestAnnouncementQuery = query(dbRef, orderByKey(), limitToLast(1));

  onValue(
    latestAnnouncementQuery,
    (snapshot) => {
      if (snapshot.exists()) {
        let latestAnnouncement = null;

        snapshot.forEach((childSnapshot) => {
          latestAnnouncement = childSnapshot.val();
        });

        if (latestAnnouncement) {
          date_announcement_lbl.innerText =
            latestAnnouncement.date || "[Date not available]";
          announcement_lbl.innerText =
            latestAnnouncement.header || "[Message not available]";
          time_announcement_lbl.innerText =
            latestAnnouncement.time || "[Time not available]";
          document.getElementById(
            "announcement-div"
          ).style.backgroundImage = `url(assets/announcement/${latestAnnouncement.background_img || "4.png"
          })`;
          date_announcement_lbl.style.color = "#323232";
          announcement_lbl.style.color = "#323232";
          time_announcement_lbl.style.color = "#323232";

          if (latestAnnouncement.background_img === "4.png") {
            date_announcement_lbl.style.color = "#fefefe";
            announcement_lbl.style.color = "#fefefe";
            time_announcement_lbl.style.color = "#fefefe";
          }
        }
      } else {
        document.getElementById("announcement-div").style.backgroundImage =
          "url(assets/announcement/4.png)";
        date_announcement_lbl.innerText = "There is no announcement";
        date_announcement_lbl.style.color = "#fefefe";
        announcement_lbl.innerText = "Seems like you are all caught up!";
        announcement_lbl.style.color = "#fefefe";
        time_announcement_lbl.style.color = "#fefefe";
      }
    },
    (error) => {
      console.error("Error fetching announcement: ", error);
    }
  );
}
function viewAllAnnouncement() {
  const dbRef = ref(database, "PARSEIT/administration/announcement/");
  const latestAnnouncementQuery = query(dbRef, orderByKey());

  onValue(
    latestAnnouncementQuery,
    (snapshot) => {
      if (snapshot.exists()) {
        let announcementcont = document.getElementById("allannouncement-body");
        announcementcont.innerHTML = "";

        let appendAnnouncementHTML = "";
        const snapshotData = snapshot.val();
        const reversedsnapshot = Object.entries(snapshotData).reverse();

        reversedsnapshot.forEach(([key, value]) => {
          appendAnnouncementHTML += `
            <div class="allannouncement-wrapper">
            <div class="alldate">
            <span class="announcemonth">${value.month}</span>
            <span class="announceday">${value.date}</span>
            <span class="announcetime">${value.time}</span>
            </div>
            <div class="allheader">${value.header}</div>
            <div class="alldescription" >${value.description}</div>
            </div>`;
        });
        announcementcont.innerHTML = appendAnnouncementHTML;
      } else {
        document.getElementById("announcement-div").style.backgroundImage =
          "url(assets/announcement/4.png)";
        date_announcement_lbl.innerText = "There is no announcement";
        date_announcement_lbl.style.color = "#fefefe";
        announcement_lbl.innerText = "Seems like you are all caught up!";
        announcement_lbl.style.color = "#fefefe";
        time_announcement_lbl.style.color = "#fefefe";
      }
    },
    (error) => {
      console.error("Error fetching announcement: ", error);
    }
  );
}
viewAllAnnouncement();
function formatDate(date) {
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const month = months[date.getMonth()]; // Get the month name
  const day = date.getDate(); // Get the day of the month
  const year = date.getFullYear(); // Get the year

  return `${month} ${day}, ${year}`;
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
async function setParser_username() {
  document.getElementById("parser_username").innerText =
    "@" + (await getparser_username(user_parser));
}
setParser_username();
async function setparserBanners(id) {
  const bannerRef = child(
    dbRef,
    `PARSEIT/administration/students/${id}/banner`
  );
  const profileRef = child(
    dbRef,
    `PARSEIT/administration/students/${id}/profile`
  );

  const teacherBannerRef = child(
    dbRef,
    `PARSEIT/administration/teachers/${id}/banner`
  );
  const teacherProfileRef = child(
    dbRef,
    `PARSEIT/administration/teachers/${id}/profile`
  );

  const snapshot = await get(bannerRef);
  const snapshot2 = await get(profileRef);
  const snapTeacher = await get(teacherBannerRef);
  const snapTeacher2 = await get(teacherProfileRef);
  if (snapshot.exists()) {
    document.getElementById(
      "sidebar_header"
    ).style.backgroundImage = `url(assets/profiles/${snapshot.val()})`;
  } else {
    if (snapTeacher.exists()) {
      document.getElementById(
        "sidebar_header"
      ).style.backgroundImage = `url(assets/profiles/${snapTeacher.val()})`;
    } else {
      document.getElementById(
        "sidebar_header"
      ).style.backgroundImage = `url(assets/profiles/default_banner.png`;
    }
  }

  if (snapshot2.exists()) {
    document.getElementById(
      "parser_profile"
    ).src = `assets/profiles/${snapshot2.val()}`;
  } else {
    if (snapTeacher2.exists()) {
      document.getElementById(
        "parser_profile"
      ).src = `assets/profiles/${snapTeacher2.val()}`;
    } else {
      document.getElementById(
        "parser_profile"
      ).src = `assets/profiles/default_profile.png`;
    }
  }
}
setparserBanners(user_parser);

function loadTeacherSubjects() {
  if (parser[0].type === "teacher") {
    document.getElementById("class-sort").style.display = "flex";
    document.getElementById("class-sort-all").checked = true;
  }
  let semesterToCheck = status[0].current_sem;
  const acadref = status[0].academicref;
  if (semesterToCheck === "2") {
    semesterToCheck = "second-sem";
  } else {
    semesterToCheck = "first-sem";
  }
  const databaseRef = ref(
    database,
    "PARSEIT/administration/parseclass/" + acadref
  );
  get(databaseRef)
    .then((snapshot) => {
      if (snapshot.exists()) {
        parseclass_cont.innerHTML = "";
        let parseClassAppend = "";
        const data = snapshot.val();
        for (const yearLevel in data) {
          if (data[yearLevel][semesterToCheck]) {
            const semesterData = data[yearLevel][semesterToCheck];
            for (const subject in semesterData) {
              const subjectData = semesterData[subject];
              if (typeof subjectData === "object") {
                for (const key in subjectData) {
                  if (key === "name" || key === "unit") {
                  } else {
                    const parseclass_img = subject.replace(/\s+/g, "");
                    if (user_parser === subjectData[key].teacher_id) {
                      allsubjects.length = 0;
                      allsubjects.push(subject);
                      allsubjects.push(subjectData.name);
                      allsubjects.push(key);

                      parseClassAppend += `
                                        <div id="${parseclass_img}" data-id="${subject} ${subjectData.name
                        } ${key}" class="parseclass-default-wrapper parseclass" onclick="localStorage.setItem('parser-username', '${username.replace(
                          /\s+/g,
                          ""
                        )}');
                                        localStorage.setItem('parser-parseroom', '${subjectData[
                          key
                        ].parseclass_id.replace(/\s+/g, "")}');
                                        localStorage.setItem('parseroom-acadref', '${acadref}');
                                        localStorage.setItem('parseroom-sem', '${semesterToCheck}');
                                        localStorage.setItem('parseroom-section', '${key}');
                                        localStorage.setItem('parseroom-yearlvl', '${yearLevel}');
                                        localStorage.setItem('parseroom-code', '${subject}');
                                        localStorage.setItem('parseroom-name', '${subjectData.name
                        }');
                                        window.location.href = 'parseroom.html';" 
                                        style="background-image: url('assets/parseclass/${parseclass_img.toUpperCase()}.jpg');"
                                        value ="">
                                        <div class="parseclass-default-gradient">
                                        <span class="parsesched-default-span">
                                        <div class='sched-all-container'>
                                        <section class="sched-all-wrapper">
                                        `;
                      for (const schedule in subjectData[key].schedule) {
                        if (
                          subjectData[key].schedule[schedule].day ===
                          returnCurrentDay()
                        ) {
                          parseClassAppend += `
                                                <div class="parseclass-sched-single">
                                                <label for="" class="parseclass-day-lbl">${subjectData[key].schedule[schedule].day} (${subjectData[key].schedule[schedule].room})</label>
                                                <label for="" class="parseclass-time-lbl">${subjectData[key].schedule[schedule].start}-${subjectData[key].schedule[schedule].end}</label>
                                                </div>
                                                `;
                        }
                      }
                      parseClassAppend += `
                                        </section>
                                        </div>
                                        </span>
                                        <span class="parseclass-default-span">
                                        <label for="" class="parseclass-header-lbl">${subject} (${key})</label><br/>
                                        <label for="" class="parseclass-header-sublbl">${subjectData.name}</label>
                                        </span>
                                        </div>
                                        </div>`;

                      parseclass_cont.innerHTML = parseClassAppend;
                    }
                  }
                }
              }
            }
          }
        }
      } else {
        console.log("No data available");
      }
    })
    .catch((error) => {
      console.error("Error fetching data:", error);
    });
}
function loadStudentSubjects() {
  let semesterToCheck = status[0].current_sem;
  const acadref = status[0].academicref;
  if (semesterToCheck === "2") {
    semesterToCheck = "second-sem";
  } else {
    semesterToCheck = "first-sem";
  }
  const databaseRef = ref(
    database,
    "PARSEIT/administration/parseclass/" + acadref
  );
  get(databaseRef)
    .then((snapshot) => {
      if (snapshot.exists()) {
        parseclass_cont.innerHTML = "";
        let parseClassAppend = "";
        const data = snapshot.val();
        for (const yearLevel in data) {
          if (data[yearLevel][semesterToCheck]) {
            const semesterData = data[yearLevel][semesterToCheck];
            for (const subject in semesterData) {
              const subjectData = semesterData[subject];
              if (typeof subjectData === "object") {
                for (const section in subjectData) {
                  if (section === "name" || section === "unit") {
                  } else {
                    for (const parser in subjectData[section].members) {
                      if (parser === user_parser) {
                        //for (const schedule in subjectData[section].schedule){
                        // const scheduleItem = subjectData[section].schedule[schedule];
                        // let startSched = '';
                        // let endSched = '';
                        // let daySched = 'No Schedule Today';
                        allsubjects.length = 0;
                        allsubjects.push(subject);
                        allsubjects.push(subjectData.name);
                        allsubjects.push(section);
                        const parseclass_img = subject.replace(/\s+/g, "");
                        parseClassAppend += `
                                                <div id="${parseclass_img}" data-id="${subject} ${subjectData.name
                          } ${section}" class="parseclass-default-wrapper parseclass" onclick="localStorage.setItem('parser-username', '${username.replace(
                            /\s+/g,
                            ""
                          )}');
                                                localStorage.setItem('parser-parseroom', '${subjectData[
                            section
                          ].parseclass_id.replace(
                            /\s+/g,
                            ""
                          )}');
                                                localStorage.setItem('parseroom-acadref', '${acadref}');
                                                localStorage.setItem('parseroom-sem', '${semesterToCheck}');
                                                localStorage.setItem('parseroom-section', '${section}');
                                                localStorage.setItem('parseroom-yearlvl', '${yearLevel}');
                                                localStorage.setItem('parseroom-code', '${subject}');
                                                localStorage.setItem('parseroom-name', '${subjectData.name
                          }');
                                                window.location.href = 'parseroom.html';"
                                                style="background-image: url('assets/parseclass/${parseclass_img.toUpperCase()}.jpg');"
                                                value ="">
                                                <div class="parseclass-default-gradient">
                                                <span class="parsesched-default-span"><div class='sched-all-container'>
                                                <section class="sched-all-wrapper">`;

                        for (const schedule in subjectData[section].schedule) {
                          if (
                            subjectData[section].schedule[schedule].day ===
                            returnCurrentDay()
                          ) {
                            // const startObject = convertToTimeObject(scheduleItem.start);
                            // const endObject = convertToTimeObject(scheduleItem.end);
                            //console.log(startObject, endObject);

                            // if (isTimeInRange(startObject, endObject)) {
                            //     //console.log("The current time is between");
                            //     startSched = scheduleItem.start;
                            //     endSched = scheduleItem.end;
                            //     daySched = scheduleItem.day;
                            // }

                            parseClassAppend += `
                                                        <div class="parseclass-sched-single">
                                                        <label for="" class="parseclass-day-lbl">${subjectData[section].schedule[schedule].day} (${subjectData[section].schedule[schedule].room})</label>
                                                        <label for="" class="parseclass-time-lbl">${subjectData[section].schedule[schedule].start}-${subjectData[section].schedule[schedule].end}</label>
                                                        </div>
                                                        `;
                          }
                        }
                        parseClassAppend += `
                                            </section>
                                            </div>
                                            </span>
                                            <span class="parseclass-default-span">
                                            <label for="" class="parseclass-header-lbl">${subject} (${section})</label><br/>
                                            <label for="" class="parseclass-header-sublbl">${subjectData.name}</label>
                                            </span>
                                            </div>
                                            </div>`;
                        parseclass_cont.innerHTML = parseClassAppend;
                      }
                    }
                  }
                }
              }
            }
          }
        }
      } else {
        console.log("No data available");
      }
    })
    .catch((error) => {
      console.error("Error fetching data:", error);
    });
}
function reloadTeacherSubjects(year) {
  let semesterToCheck = status[0].current_sem;
  const acadref = status[0].academicref;
  if (semesterToCheck === "2") {
    semesterToCheck = "second-sem";
  } else {
    semesterToCheck = "first-sem";
  }
  const databaseRef = ref(
    database,
    "PARSEIT/administration/parseclass/" + acadref
  );
  get(databaseRef)
    .then((snapshot) => {
      if (snapshot.exists()) {
        parseclass_cont.innerHTML = "";
        let parseClassAppend = "";
        const data = snapshot.val();
        // Iterate only inside "year-lvl-1"
        if (data[year] && data[year][semesterToCheck]) {
          const semesterData = data[year][semesterToCheck];
          for (const subject in semesterData) {
            const subjectData = semesterData[subject];
            if (typeof subjectData === "object") {
              for (const key in subjectData) {
                if (key === "name" || key === "unit") {
                  // Skip "name" and "unit" keys
                } else {
                  const parseclass_img = subject.replace(/\s+/g, "");
                  if (user_parser === subjectData[key].teacher_id) {
                    allsubjects.length = 0;
                    allsubjects.push(subject);
                    allsubjects.push(subjectData.name);
                    allsubjects.push(key);
                    parseClassAppend += `
                        <div id="${parseclass_img}" data-id="${subject} ${subjectData.name
                      } ${key}" class="parseclass-default-wrapper parseclass" onclick="localStorage.setItem('parser-username', '${username.replace(
                        /\s+/g,
                        ""
                      )}');
                        localStorage.setItem('parser-parseroom', '${subjectData[
                        key
                      ].parseclass_id.replace(/\s+/g, "")}');
                        localStorage.setItem('parseroom-acadref', '${acadref}');
                        localStorage.setItem('parseroom-sem', '${semesterToCheck}');
                        localStorage.setItem('parseroom-section', '${key}');
                        localStorage.setItem('parseroom-yearlvl', '${year}');
                        localStorage.setItem('parseroom-code', '${subject}');
                        localStorage.setItem('parseroom-name', '${subjectData.name
                      }');
                        window.location.href = 'parseroom.html';" 
                        style="background-image: url('assets/parseclass/${parseclass_img.toUpperCase()}.jpg');"
                        value ="">
                        <div class="parseclass-default-gradient">
                        <span class="parsesched-default-span">
                        <div class='sched-all-container'>
                        <section class="sched-all-wrapper">
                      `;
                    for (const schedule in subjectData[key].schedule) {
                      if (
                        subjectData[key].schedule[schedule].day ===
                        returnCurrentDay()
                      ) {
                        parseClassAppend += `
                            <div class="parseclass-sched-single">
                            <label for="" class="parseclass-day-lbl">${subjectData[key].schedule[schedule].day} (${subjectData[key].schedule[schedule].room})</label>
                            <label for="" class="parseclass-time-lbl">${subjectData[key].schedule[schedule].start}-${subjectData[key].schedule[schedule].end}</label>
                            </div>
                          `;
                      }
                    }
                    parseClassAppend += `
                        </section>
                        </div>
                        </span>
                        <span class="parseclass-default-span">
                        <label for="" class="parseclass-header-lbl">${subject} (${key})</label><br/>
                        <label for="" class="parseclass-header-sublbl">${subjectData.name}</label>
                        </span>
                        </div>
                        </div>`;
                    parseclass_cont.innerHTML = parseClassAppend;
                  }
                }
              }
            }
          }
        }
        if (parseclass_cont.innerHTML === "") {
          console.log("No data available");
        }
      } else {
        console.log("No data available");
      }
    })
    .catch((error) => {
      console.error("Error fetching data:", error);
    });
}

function returnCurrentDay() {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return days[dayOfWeek];
}
function isTimeInRange(startTime, endTime) {
  // Get current date and time
  const now = new Date();

  // Create date objects for the start time and end time
  const start = new Date(now);
  const end = new Date(now);

  // Set the start time (e.g., 2:30 PM)
  start.setHours(startTime.hours, startTime.minutes, 0, 0);

  // Set the end time (e.g., 4:00 PM)
  end.setHours(endTime.hours, endTime.minutes, 0, 0);

  // Check if current time is within the range
  return now >= start && now <= end;
}
function convertToTimeObject(timeString) {
  // Parse the time string (e.g., "2:30 PM") into hours and minutes
  const [time, period] = timeString.split(" "); // Split time and period (AM/PM)
  let [hours, minutes] = time.split(":"); // Split hours and minutes
  // Convert string values to numbers
  hours = parseInt(hours, 10);
  // Convert 12-hour format to 24-hour format
  if ((period === "PM" && hours < 12) || (period === "pm" && hours)) {
    hours += 12;
  } else if (
    (period === "AM" && hours === 12) ||
    (period === "am" && hours === 12)
  ) {
    hours = 0;
  }
  // Return the time object
  return {
    hours: hours,
    minutes: minutes,
  };
}

function displaySelectedYear() {
  const selectedYear = document.querySelector('input[name="year"]:checked');

  if (selectedYear) {
    //alert("You selected: " + selectedYear.value);
    if (selectedYear.value === "all") {
      loadTeacherSubjects();
    } else if (selectedYear.value === "year-lvl-1") {
      reloadTeacherSubjects("year-lvl-1");
    } else if (selectedYear.value === "year-lvl-2") {
      reloadTeacherSubjects("year-lvl-2");
    } else if (selectedYear.value === "year-lvl-3") {
      reloadTeacherSubjects("year-lvl-3");
    } else if (selectedYear.value === "year-lvl-4") {
      reloadTeacherSubjects("year-lvl-4");
    }
  }
}

document.querySelectorAll('input[name="year"]').forEach((radio) => {
  radio.addEventListener("click", displaySelectedYear);
});
document.getElementById("searchparseclass_txt").addEventListener("input", (event) => {
  updateResults();
});
function fuzzy_match(text, search) {
  search = search.replace(/\s/g, "").toLowerCase();
  let search_position = 0;

  for (let n = 0; n < text.length; n++) {
    let text_char = text[n];
    if (
      search_position < search.length &&
      text_char.toLowerCase() === search[search_position]
    ) {
      search_position += 1;
    }
  }
  return search_position === search.length;
}
function updateResults() {
  const searchInput = document.getElementById("searchparseclass_txt").value;

  const subjectElements = document.querySelectorAll(
    ".parseclass-default-wrapper"
  );

  subjectElements.forEach((subject) => {
    const subjectText = subject.dataset.id;
    const isMatch = fuzzy_match(subjectText, searchInput);

    if (isMatch) {
      subject.classList.remove("hidden");
      subject.classList.add("highlight");
    } else {
      // Hide the element if no match
      subject.classList.add("hidden");
      subject.classList.remove("highlight");
    }
  });
}
function scrollToBottom() {
  const element = document.getElementById("chatbot-body");
  if (element) {
    element.scrollTop = element.scrollHeight;
  }
}
const screenHeight = window.innerHeight;
window.addEventListener('resize', () => {
  const currentHeight = window.innerHeight;
  if (screenHeight > currentHeight) {
    document.getElementById("chatbot-footer").style.bottom = "0px";
  }
  else {
    document.getElementById("chatbot-footer").style.bottom = "60px";
  }
  scrollToBottom();
});
document.getElementById("chatbot-txt").addEventListener("input", () => {
  scrollToBottom();
});
async function getApikey() {
  const apikeyRef = child(dbRef, "PARSEIT/administration/chatbot_apikeys/");
  const snapshot = await get(apikeyRef);
  if (snapshot.exists()) {
    const currentData = snapshot.val().key;
    return currentData;
  } else {
    return null;
  }
}


let rejections = ['no', 'not', 'dont', 'stop', 'end', 'quit', 'cancel', 'nevermind', 'sorry', 'nope', 'ayaw', 'nah', 'nay', 'no way', 'no thanks', 'nothing', 'negative', 'dili'];
let approval = ['sige', 'go', 'yes', 'ok', 'sure', 'yep', 'yeah', 'yay', 'please', 'okay', 'alright', 'go ahead', 'sure thing', 'of course', 'yes please', 'yes sir', 'yes ma\'am', 'yes master', 'yeah sure', 'yep sure', 'yay sure', 'please yes', 'sir yes', 'ma\'am yes', 'master yes', 'aye aye'];

document.getElementById("chatbot-send-btn").addEventListener("click", async function (event) {
  const userInput = document.getElementById("chatbot-txt").value;

  document.getElementById("chatbot-body").innerHTML += `
  <section class="chatbot-wrapper chatbot-parser-wrapper">
  <div class="chatbot-parser-message">
  <span>${userInput}</span>
  </div>
  <div class="chatbot-parser-profile"><img class="chatbot-parser-img" src="assets/profiles/furina_2.png" alt=""/>
  </div>
  </section>`;
  document.getElementById("chatbot-txt").value = '';

  const userInputLower = userInput.toLowerCase();

  const response = await interpretInput(userInputLower, siti_brain);
  if (response !== null) {
    await getResponse(response);
  }
  else {
    console.log("No response found");
  }
  // try {
  //   const response = await axios.post('https://api.openai.com/v1/chat/completions', {
  //     model: "gpt-4o-mini",
  //     messages: [
  //       { "role": "user", "content": userInput },
  //     ],
  //   }, {
  //     headers: {
  //       'Authorization': `Bearer ${await getApikey()}`,
  //       'Content-Type': 'application/json',
  //     }
  //   });
  //   //document.getElementById("response").innerHTML = "AI: " + response.data.choices[0].message.content;
  //   document.getElementById("chatbot-body").innerHTML += `<section class="chatbot-wrapper chatbot-gpt-wrapper">
  //             <div class="chatbot-gpt-profile">
  //               <img
  //                 class="chatbot-gpt-img"
  //                 src="assets/icons/ChatGPT.png"
  //                 alt=""
  //               />
  //             </div>
  //             <div class="chatbot-gpt-message">
  //               <span
  //                 >${response.data.choices[0].message.content}</span
  //               >
  //             </div>
  //           </section>`;
  // }
  // catch (error) {
  //   document.getElementById("chatbot-body").innerHTML += `<section class="chatbot-wrapper chatbot-gpt-wrapper">
  //             <div class="chatbot-gpt-profile">
  //               <img
  //                 class="chatbot-gpt-img"
  //                 src="assets/icons/ChatGPT.png"
  //                 alt=""
  //               />
  //             </div>
  //             <div class="chatbot-gpt-message">
  //               <span>Can't answer your question right now. Please try again later.</span>
  //             </div>
  //           </section>`;
  // }
  scrollToBottom();
});


async function getTriggerInputs() {
  const refPath = ref(database, 'PARSEIT/siti_chatbot/');
  await onValue(
    refPath,
    (snapshot) => {
      siti_brain = [];
      if (snapshot.exists()) {
        const chatbotData = snapshot.val(); // All chatbot data

        for (const chatbotId in chatbotData) {
          const chatbot = chatbotData[chatbotId];

          if (chatbot.trigger_input) {
            const triggerInput = chatbot.trigger_input;

            if (typeof triggerInput === "object" && !Array.isArray(triggerInput)) {
              for (const key in triggerInput) {
                siti_brain.push(triggerInput[key]);
              }
            } else if (Array.isArray(triggerInput)) {
              triggerInput.forEach((item) => siti_brain.push(item));
            } else if (typeof triggerInput === "string") {
              siti_brain.push(triggerInput);
            }
          }
        }

      } else {
        //console.log("No data available");
      }
    },
    (error) => {
      //console.error("Error fetching data:", error);
    }
  );
}

async function interpretInput(text, search) {
  text = text.replace(/\s/g, "").toLowerCase();

  let bestMatchTerm = null;
  let bestMatchScore = 0;
  for (let originalTerm of search) {
    let term = originalTerm.replace(/\s/g, "").toLowerCase();

    let match_score = 0;
    let search_position = 0;
    for (let n = 0; n < text.length; n++) {
      let text_char = text[n];
      if (
        search_position < term.length &&
        text_char === term[search_position]
      ) {
        search_position += 1;
        match_score += 1;
      }
    }

    if (match_score > bestMatchScore) {
      bestMatchTerm = originalTerm;
      bestMatchScore = match_score;
    }
  }
  return bestMatchScore > 0 ? bestMatchTerm : null;
}
async function getResponse(trigger_input) {
  const refPath = ref(database, 'PARSEIT/siti_chatbot/');
  await onValue(refPath, (snapshot) => {
    if (snapshot.exists()) {
      const chat_id = snapshot.val();
      for (const id in chat_id) {
        const chat = chat_id[id];
        if (chat.trigger_input) {
          if (Array.isArray(chat.trigger_input)) {
            chat.trigger_input.forEach((item) => {
              if (item === trigger_input) {
                const response = chat.response;
                displayChatbotResponse(response);
              }
            });
          } else {
            if (chat.trigger_input === trigger_input) {
              const response = chat.response;
              displayChatbotResponse(response);
            }
          }
        }
      }
    } else {
      console.log('No data available');
    }
  }, (error) => {
    console.error('Error fetching data:', error);
  });
}

function displayChatbotResponse(response) {
  const chatbotBody = document.getElementById("chatbot-body");

  const chatWrapper = document.createElement('section');
  chatWrapper.classList.add('chatbot-wrapper', 'chatbot-siti-wrapper');

  const profileDiv = document.createElement('div');
  profileDiv.classList.add('chatbot-siti-profile');

  const img = document.createElement('img');
  img.classList.add('chatbot-siti-img');
  img.src = "assets/icons/siti-icon.png";
  img.alt = "Siti Icon";

  profileDiv.appendChild(img);

  const messageDiv = document.createElement('div');
  messageDiv.classList.add('chatbot-siti-message');

  const messageSpan = document.createElement('span');
  messageDiv.appendChild(messageSpan);

  chatWrapper.appendChild(profileDiv);
  chatWrapper.appendChild(messageDiv);
  chatbotBody.appendChild(chatWrapper);
  typeWriterEffect(messageSpan, response, 20);
}
function typeWriterEffect(element, text, speed) {
  let i = 0;

  function typeWriter() {
    if (i < text.length) {
      element.innerHTML += text.charAt(i);
      i++;
      setTimeout(typeWriter, speed);
    }
  }
  typeWriter();
}



function bookmarkBubble() {
  if (parser[0].type === "student") {
    const chatBubble = document.querySelector('.bookmark-bubble');
    chatBubble.style.display = 'flex';
    let isDragging = false;
    let offsetX, offsetY;
    chatBubble.addEventListener('click', (e) => {
      const membersRef = ref(database, `PARSEIT/administration/students/${user_parser}/assignments/`);
      onValue(membersRef, async (membersRefSnapshot) => {
        if (membersRefSnapshot.exists()) {
          document.getElementById('bookmark-wrapper-body').innerHTML = '';
          for (const assignment in membersRefSnapshot.val()) {
            if (status[0].academicref === membersRefSnapshot.val()[assignment].acadref) {
              const assignmentDetails = ref(database, `PARSEIT/administration/parseclass/${membersRefSnapshot.val()[assignment].acadref}/${membersRefSnapshot.val()[assignment].yearlvl}/${membersRefSnapshot.val()[assignment].sem}/${membersRefSnapshot.val()[assignment].subject}/${membersRefSnapshot.val()[assignment].section}/assignment/${assignment}/`);
              onValue(assignmentDetails, async (assignmentDetailsSnapshot) => {

                const bookmarkWrapper = document.createElement('section');
                bookmarkWrapper.className = 'bookmark-wrapper';
                const titleSection = document.createElement('section');
                titleSection.className = 'assignment-title';

                const activityTitleSpan = document.createElement('span');
                activityTitleSpan.className = 'assign-top activity-title';
                activityTitleSpan.textContent = assignmentDetailsSnapshot.val().header;

                const subjectCodeSpan = document.createElement('span');
                subjectCodeSpan.className = 'assign-code';
                subjectCodeSpan.textContent = membersRefSnapshot.val()[assignment].subject;

                titleSection.appendChild(activityTitleSpan);


                const datesSection = document.createElement('section');
                datesSection.className = 'assignment-title';
                datesSection.appendChild(subjectCodeSpan);

                const postedDateSpan = document.createElement('span');
                postedDateSpan.className = 'assign-bot';
                postedDateSpan.textContent = 'Due ' + formatDateTime(assignmentDetailsSnapshot.val().duedate);

                const dueDateSpan = document.createElement('span');
                dueDateSpan.className = 'assign-bot';
                dueDateSpan.textContent = 'Posted ' + formatDateTime(assignmentDetailsSnapshot.val().date);

                datesSection.appendChild(postedDateSpan);

                titleSection.appendChild(dueDateSpan);

                bookmarkWrapper.appendChild(titleSection);
                bookmarkWrapper.appendChild(datesSection);

                bookmarkWrapper.addEventListener('click', async (event) => {
                  bookmarkWrapper.style.transform = `translateX(0)`;
                  localStorage.setItem('parseroom-acadref', membersRefSnapshot.val()[assignment].acadref);
                  localStorage.setItem('parseroom-sem', membersRefSnapshot.val()[assignment].sem);
                  localStorage.setItem('parseroom-section', membersRefSnapshot.val()[assignment].section);
                  localStorage.setItem('parseroom-yearlvl', membersRefSnapshot.val()[assignment].yearlvl);
                  localStorage.setItem('parseroom-code', membersRefSnapshot.val()[assignment].subject);
                  window.location.href = `viewassignment.html?assignment=${assignment}`;
                });




                document.getElementById('bookmark-wrapper-body').appendChild(bookmarkWrapper);
                document.getElementById('bookmark-assignments-container').style.transform = 'translateY(0)';

                //archive
                let startX = 0;
                let currentX = 0;
                let isSwiped = false;


                bookmarkWrapper.addEventListener('touchstart', (e) => {
                  startX = e.touches[0].clientX;
                  isSwiped = false;
                });
                bookmarkWrapper.addEventListener('touchmove', (e) => {
                  currentX = e.touches[0].clientX;
                  const deltaX = currentX - startX;
                  if (deltaX < 0) {
                    bookmarkWrapper.style.transform = `translateX(${deltaX}px)`;
                  }
                });
                bookmarkWrapper.addEventListener('touchend', () => {
                  const deltaX = currentX - startX;
                  if (deltaX < -300) {
                    isSwiped = true;
                    bookmarkWrapper.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
                    bookmarkWrapper.style.transform = 'translateX(-100%)';
                    bookmarkWrapper.style.opacity = '0';
                    setTimeout(async () => {
                      bookmarkWrapper.remove();
                      await remove(ref(database, `PARSEIT/administration/students/${user_parser}/assignments/${assignment}/`));
                    }, 300);
                  } else {
                    bookmarkWrapper.style.transform = `translateX(0)`;
                  }

                  bookmarkBubble
                  startX = 0;
                  currentX = 0;
                });
              });


            }

          }
        }
        else {
          document.getElementById('bookmark-assignments-container').style.transform = 'translateY(0)';
        }
      });
    });

    // For touch events, use touchstart, touchmove, touchend
    chatBubble.addEventListener('touchstart', (e) => {
      // Use touchstart to begin dragging
      isDragging = true;

      // Get the position of the first touch point
      offsetX = e.touches[0].clientX - chatBubble.getBoundingClientRect().left;
      offsetY = e.touches[0].clientY - chatBubble.getBoundingClientRect().top;

      // Disable transition during dragging for smoother experience
      chatBubble.style.transition = 'none';
    });

    // Handle the touch move
    document.addEventListener('touchmove', (e) => {
      if (isDragging) {
        // Get the new position of the bubble
        const newX = e.touches[0].clientX - offsetX;
        const newY = e.touches[0].clientY - offsetY;

        // Constrain the bubble to the screen
        const screenHeight = window.innerHeight;
        const bubbleHeight = chatBubble.offsetHeight;
        const minY = 25; // Top constraint
        const maxY = screenHeight - bubbleHeight - 25; // Bottom constraint (20px from bottom)

        // Set the new position
        chatBubble.style.left = `${newX}px`;
        chatBubble.style.top = `${Math.max(minY, Math.min(newY, maxY))}px`;  // Ensure top doesn't go out of bounds
        chatBubble.style.position = 'fixed';  // Ensure it stays fixed relative to the viewport
      }
    });

    // Handle touch end (drag stop)
    document.addEventListener('touchend', () => {
      isDragging = false;

      // Snap to the closest side with a smooth transition
      const screenWidth = window.innerWidth;
      const bubbleRect = chatBubble.getBoundingClientRect();

      if (bubbleRect.left < screenWidth / 2) {
        // Stick to the left side
        chatBubble.style.left = '25px';
      } else {
        // Stick to the right side
        chatBubble.style.left = `${screenWidth - bubbleRect.width - 25}px`;
      }

      // Re-enable transition after dragging stops for smooth movement
      chatBubble.style.transition = 'left 0.5s ease, top 0.5s ease';  // Transition for left and top properties
    });
  }
}

document.getElementById('book-assignments-header').addEventListener('click', async (e) => {
  await getAcadStatus().then(() => {
    bookmarkBubble();
    document.getElementById('bookmark-assignments-container').style.transform = 'translateY(100%)';
  });

});
function formatDateTime(datetime) {
  const date = new Date(datetime);
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  const formattedDate = date.toLocaleDateString('en-US', options);
  const hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const formattedTime = `${hours % 12 || 12}:${minutes} ${ampm}`;
  return `${formattedDate}`;
}

document.getElementById('mySaves-btn').addEventListener('click', async () => {
  await getMysaves();
});

document.querySelectorAll('.yt-vid-wrapper').forEach((element) => {
  element.addEventListener('click', (event) => {
    const id = event.currentTarget.getAttribute('data-id');
    window.location.href = `library.html?id=${id}&title=${event.currentTarget.querySelector('.ytlib-title').innerText}`;
  });
});

async function getMysaves() {
  document.querySelectorAll('.yt-vid-wrapper').forEach(async (element) => {
    const id = element.getAttribute('data-id');
    await get(ref(database, `PARSEIT/library/videos/${id}/saves/${user_parser}`)).then(async (snapshot) => {
      if (!snapshot.exists()) {
        element.style.display = 'none';
      }

    });
  });
}