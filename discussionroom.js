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
  serverTimestamp,
  onDisconnect,
  push,
  set,
  update,
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

//variables
let user_parser = localStorage.getItem("user-parser");
let parseroom_username = localStorage.getItem("parser-username");
let active_profile = "";
let user_parser_type = localStorage.getItem("type-parser");
loadCensoredWords();
let censoredWordsArray = [];


const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
let parseroom_id = urlParams.get('discussionroom');
let name = urlParams.get('name');

//listeners
setScreenSize(window.innerWidth, window.innerHeight);
window.addEventListener("load", async function () {
  document.getElementById("loading_animation_div").style.display = "none";
  active_profile = await activeProfile(user_parser);
  getParseroomMessages();
  scrollToBottom();
  showParseroomDetails()
});

function showParseroomDetails() {
  document.getElementById("parsecode").innerHTML = name;
  document.getElementById("parsename").innerHTML = localStorage.getItem("parseroom-code");
}

window.addEventListener("resize", adjustChatbox);
adjustChatbox();
window.addEventListener("resize", scrollToBottom);
scrollToBottom();
document
  .getElementById("sendmessage-btn")
  .addEventListener("click", (event) => {
    submitMessage();
    getParseroomMessages();
    scrollToBottom();
  });
function scrollToBottom() {
  const element = document.getElementById("parseroom-body-wrapper");
  if (element) {
    element.scrollTop = element.scrollHeight; // Scroll to the bottom
  }
}
document.addEventListener("DOMContentLoaded", () => {
  scrollToBottom();
});
document
  .getElementById("closeparseroom-btn")
  .addEventListener("click", (event) => {
    window.location.href = "parseroom.html";
  });

document
  .getElementById("parsermessage-txt")
  .addEventListener("focus", (event) => {
    scrollToBottom();
  });


//functions
async function setScreenSize(width, height) {
  document.body.style.width = width + "px";
  document.body.style.height = height + "px";
}
function adjustChatbox() {
  const container = document.querySelector(".body-parseroom-div");
  container.style.height = `${window.innerHeight}px`;
}
async function getParseroomMessages() {
  const acadref = localStorage.getItem("parseroom-acadref");
  const yearlvl = localStorage.getItem("parseroom-yearlvl");
  const sem = localStorage.getItem("parseroom-sem");
  const subject = localStorage.getItem("parseroom-code");
  const section = localStorage.getItem("parseroom-section");
  const dbRef = ref(
    database,
    `PARSEIT/discussionrooms/${acadref}/${yearlvl}/${sem}/${subject}/${section}/${parseroom_id}/messages/`
  );
  const latestMessageQuery = query(dbRef, orderByKey());
  onValue(
    latestMessageQuery,
    (snapshot) => {
      if (snapshot.exists()) {
        let messagecont = document.getElementById("parseroom-body-wrapper");
        //messagecont.innerHTML = "";
        let appendMessageHTML = "<div class='filler-message'></div>";
        const snapshotData = snapshot.val();
        const reversedsnapshot = Object.entries(snapshotData);
        reversedsnapshot.forEach(([key, message]) => {
          message.description = censorWords(
            message.description,
            censoredWordsArray
          );
          if (message.from === user_parser) {
            if (message.sender_profile !== `${active_profile}`) {
              updateSenderProfile(parseroom_id, user_parser, active_profile);
            }

            if (message.to === "everyone") {
              appendMessageHTML += `
                        <div class="parseroom-message">
                        <section class="p-message p-message-me">
                        <section class="p-username p-username-me">@${message.from_username}</section>
                        <section class="p-description p-description-me"> ${message.description}</section>
                        </section>
                        <section class="p-profile p-profile-me">
                        <img id="parser-profile" class="parser-profile" src='${active_profile}' alt="" />
                        </section>
                        </div>`;
            } else {
              appendMessageHTML += `
                        <div class="parseroom-message">
                        <section class="p-message p-message-me" style="display: flex; align-items: center; justify-content: center;">
                        <section class="p-username p-username-me" style="display: none;">@${message.from_username}</section>
                        <section class="p-description p-description-me ping-whisper-me">You whispered to @${message.to_username}</section>
                        </section>
                        <section class="p-profile p-profile-me" style="display: none;">
                        <img id="parser-profile" class="parser-profile" src='${active_profile}' alt="" />
                        </section>
                        </div>`;
            }
          } else {
            if (message.to === "everyone") {
              appendMessageHTML += `
                        <div class="parseroom-message parseroom-message-others">
                        <section class="p-profile">
                        <img id="parser-profile" class="parser-profile" src='${message.sender_profile}' alt="" />
                        </section>
                        <section class="p-message">
                        <section class="p-username">@${message.from_username}</section>
                        <section class="p-description" onclick="
                        document.getElementById('parsermessage-txt').value += ' @${message.from_username} ';
                        "
                        >${message.description}</section>
                        </section>
                        </div>`;
            } else {
              if (message.to === user_parser) {
                appendMessageHTML += `
                        <div class="parseroom-message parseroom-message-others" style="display: flex; align-items: center; justify-content: center;">
                        <section class="p-profile" style="display: none;">
                        <img id="parser-profile" class="parser-profile" src='${message.sender_profile}' alt="" />
                        </section>
                        <section class="p-message" style="display: flex; align-items: center; justify-content: center;">
                        <section class="p-username" style="display: none;">@${message.from_username}</section>
                        <section class="p-description ping-whisper" style="width: 100%;" onclick="
                        document.getElementById('parsermessage-txt').value += ' @${message.from_username} ';
                        "
                        >@${message.from_username} whispered to you</section>
                        </section>
                        </div>`;
              }
            }
          }
        });
        messagecont.innerHTML = appendMessageHTML;

        let startX = 0;
        let currentX = 0;
        let isSwiped = false;

        document.querySelectorAll('.parseroom-message-others').forEach(element => {
          element.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            isSwiped = false;
          });

          element.addEventListener('touchmove', (e) => {
            currentX = e.touches[0].clientX;
            const deltaX = currentX - startX;

            if (deltaX > 0) {
              element.style.transform = `translateX(${deltaX}px)`;
            }
          });
          element.addEventListener('touchend', () => {
            const deltaX = currentX - startX;
            if (deltaX > 100) {
              isSwiped = true;
              element.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
              element.style.transform = 'translateX(0%)';
              setTimeout(async () => {
                const usernameElement = element.querySelector('.p-username');
                if (usernameElement) {
                  const username = usernameElement.textContent.trim();
                  document.getElementById('parsermessage-txt').value += username + ' ';
                  let username_trim = extractUsername(username);
                  let id = await getparser_id(username_trim);
                  if (id !== null) {
                    localStorage.setItem("active-whisper-id", id);
                    showPrivateMessages();
                    showWhisperTheme();
                  }
                }
              }, 300);
            } else {
              element.style.transform = `translateX(0)`; // Reset position
            }

            startX = 0;
            currentX = 0;
          });
        });

        scrollToBottom();
      } else {
      }
    },
    (error) => {
      console.error("Error fetching announcement: ", error);
    }
  );
}
async function submitMessage() {
  scrollToBottom();
  const messageInput = document.getElementById("parsermessage-txt").value;
  const username = await getparser_username(user_parser);
  const sender_profile = await activeProfile(user_parser);

  const acadref = localStorage.getItem("parseroom-acadref");
  const yearlvl = localStorage.getItem("parseroom-yearlvl");
  const sem = localStorage.getItem("parseroom-sem");
  const subject = localStorage.getItem("parseroom-code");
  const section = localStorage.getItem("parseroom-section");

  if (!messageInput) {
    return;
  }

  const newAnnouncement = {
    description: messageInput,
    from: user_parser,
    to: "everyone",
    to_username: "everyone",
    time: getMessageTime(),
    from_username: username,
    sender_profile: sender_profile,
  };

  const dbRef = ref(
    database,
    `PARSEIT/discussionrooms/${acadref}/${yearlvl}/${sem}/${subject}/${section}/${parseroom_id}/messages/`
  );
  const newAnnouncementRef = push(dbRef);

  try {
    await set(newAnnouncementRef, newAnnouncement);
    document.getElementById("parsermessage-txt").value = "";
    document.getElementById("parsermessage-txt").style.height = "40px";
    getParseroomMessages();
  } catch (error) {
    console.error("Error submitting announcement: ", error);
  }
}
function getMessageTime() {
  const date = new Date();

  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const month = months[date.getMonth()];
  const day = date.getDate();
  const year = date.getFullYear();
  const weekday = days[date.getDay()];
  let hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, "0"); // Add leading zero if needed
  const period = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;
  return `${month} ${day}, ${year} ${weekday} ${hours}:${minutes} ${period}`;
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
async function getparser_id(username) {
  const usernameRef = child(dbRef, `PARSEIT/username/${username}`);
  const snapshot = await get(usernameRef);
  if (snapshot.exists()) {
    return snapshot.val();
  } else {
    console.log("No data available");
    return null;
  }
}

function extractUsername(text) {
  const match = text.match(/@(\S+)/);
  const messageInput = document.getElementById("parsermessage-txt").value;
  const whisperInput = removeUsername(messageInput);
  if (match) {
    return match[1];
  }
  return getparser_id(whisperInput);
}
function removeUsername(text) {
  const match = text.match(/@\S+/);
  let newText = text;
  if (match) {
    newText = text.replace(match[0], "").trim();
    return newText;
  } else {
    return null;
  }
}

let startY = 0;
let endY = 0;
document.addEventListener("touchstart", (event) => {
  startY = event.touches[0].clientY;
});
document.addEventListener("touchend", async (event) => {
  endY = event.changedTouches[0].clientY;
  if (startY - endY > 400) {
    let messageInput = document.getElementById("parsermessage-txt").value;
    if (messageInput === "") {
      getParseroomMessages();
      hideWhisperTheme();
      errorWhisperTheme();
    } else {
      if (messageInput.includes("@")) {
        let username = extractUsername(messageInput);
        let id = await getparser_id(username);
        if (id !== null) {
          localStorage.setItem("active-whisper-id", id);
          showPrivateMessages();
          showWhisperTheme();
        } else {
          getParseroomMessages();
          errorWhisperTheme();
        }
      } else {
        getParseroomMessages();
        errorWhisperTheme();
      }
    }
  }
});
async function activeProfile(id) {
  const profileRef = child(
    dbRef,
    `PARSEIT/administration/students/${id}/profile`
  );
  const teacherProfileRef = child(
    dbRef,
    `PARSEIT/administration/teachers/${id}/profile`
  );

  const snapshot2 = await get(profileRef);
  const snapTeacher2 = await get(teacherProfileRef);

  if (snapshot2.exists()) {
    return `assets/profiles/${snapshot2.val()}`;
  } else {
    if (snapTeacher2.exists()) {
      return `assets/profiles/${snapTeacher2.val()}`;
    } else {
      return `assets/profiles/default_profile.png`;
    }
  }
}
async function updateSenderProfile(parseroom_id, user_parser, active_profile) {
  const senderRef = child(
    dbRef,
    `PARSEIT/administration/parseroom/${parseroom_id}/messages/`
  );
  const data = await get(senderRef);
  if (data.exists()) {
    data.forEach((childSnapshot) => {
      const childValue = childSnapshot.val();
      if (childValue.from === user_parser) {
        const childKey = childSnapshot.key;
        update(
          ref(
            database,
            `PARSEIT/administration/parseroom/${parseroom_id}/messages/${childKey}`
          ),
          {
            sender_profile: active_profile,
          }
        );
      }
    });
  }
}

function censorWords(sentence, wordsToCensor) {
  const escapedWords = wordsToCensor.map((word) =>
    word.replace(/[-[\]/{}()*+?.\\^$|]/g, "\\$&")
  );
  const regex = new RegExp(`\\b(${escapedWords.join("|")})\\b`, "gi");
  return sentence.replace(regex, (match) => "*".repeat(match.length));
}
async function loadCensoredWords() {
  const dbRef = ref(database, `PARSEIT/administration/forbiddenwords/`);

  onValue(dbRef, (snapshot) => {
    censoredWordsArray.length = 0;
    snapshot.forEach((childSnapshot) => {
      const data = childSnapshot.key;
      censoredWordsArray.push(data);
    });
  });
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
getMembersForDiscussionRoom();
let checkedMembers = [];
async function getMembersForDiscussionRoom() {
  const acadref = localStorage.getItem("parseroom-acadref");
  const yearlvl = localStorage.getItem("parseroom-yearlvl");
  const sem = localStorage.getItem("parseroom-sem");
  const subject = localStorage.getItem("parseroom-code");
  const section = localStorage.getItem("parseroom-section");
  const discussRoomBody = document.getElementById('creatediscussroom-body');



  const membersRef = ref(database, `PARSEIT/administration/parseclass/${acadref}/${yearlvl}/${sem}/${subject}/${section}/members`);
  onValue(membersRef, async (membersRefSnapshot) => {
    for (const studentid in membersRefSnapshot.val()) {
      const section = document.createElement('section');
      section.classList.add('discuss-member');
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.classList.add('member-chckbx');
      const checkboxId = `member-chckbx-${studentid}`;
      checkbox.id = checkboxId;
      const label = document.createElement('label');
      label.classList.add('member-chckbx-lbl');
      label.setAttribute('for', checkboxId);
      label.textContent = await getFullname(studentid);

      section.appendChild(checkbox);
      section.appendChild(label);
      discussRoomBody.appendChild(section);
      checkbox.addEventListener('change', () => {
        if (checkbox.checked) {
          checkedMembers.push(studentid);
        } else {

          checkedMembers = checkedMembers.filter((member) => member !== studentid);
        }
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
document.getElementById("check_discussionroom").addEventListener("click", () => {
  document.getElementById("creatediscussroom-container").style.display = "flex";
  let startY = 0;
  let endY = 0;
  document.addEventListener("touchstart", (event) => {
    startY = event.touches[0].clientY;
  });
  document.addEventListener("touchend", (event) => {
    endY = event.changedTouches[0].clientY;
    if (endY - startY > 300) {
      document.getElementById("creatediscussroom-container").style.display = "none";
    }
  });

});
document.getElementById("createroombtn").addEventListener("click", async () => {
  const acadref = localStorage.getItem("parseroom-acadref");
  const subject = localStorage.getItem("parseroom-code");
  const section = localStorage.getItem("parseroom-section");
  const groupname = document.getElementById("discussroomname-txt").value;
  const discussCode = user_parser + Date.now().toString() + acadref + subject + section;
  if (checkedMembers.length > 2 && groupname !== '') {
    await update(ref(database, `PARSEIT/discussionrooms/`), {
      [discussCode.replace(/\s+/g, "")]: {
        name: groupname,
        members: checkedMembers,
      }
    }).then(() => {
      document.getElementById("creatediscussroom-container").style.display = "none";
    })
  }
});