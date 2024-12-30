let currentSong = new Audio();
let songs;
let currFolder;
function formatTime(seconds) {
  // Calculate minutes and seconds
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  // Format with leading zeros if needed
  const formattedMinutes = minutes.toString().padStart(2, "0");
  const formattedSeconds = remainingSeconds.toString().padStart(2, "0");

  // Combine minutes and seconds
  return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder) {
  currFolder = folder;
  let a = await fetch(`http://127.0.0.1:3000/project%202/${folder}/`);
  let response = await a.text();

  let div = document.createElement("div");
  div.innerHTML = response;
  let as = div.getElementsByTagName("a");

  songs = [];
  for (let index = 0; index < as.length; index++) {
    const element = as[index];
    if (element.href.endsWith(".mp3")) {
      songs.push(element.href.split(`/${folder}/`)[1].replace(/\\/g, "/"));
    }
  }
}

const playMusic = (track, pause = false) => {
  currentSong.src = `/${currFolder}/` + track;
  if (!pause) {
    currentSong.play();
    play.src = "pause.svg";
  }

  document.querySelector(".songinfo").innerHTML = decodeURI(track);
  document.querySelector(".songtime").innerHTML = "00:00/00:00";
};
async function displayAlbums() {
  console.log("displaying albums")
  let a = await fetch(`http://127.0.0.1:3000/project%202/songa/${folder}/`)
  let response = await a.text();
  let div = document.createElement("div")
  div.innerHTML = response;
  let anchors = div.getElementsByTagName("a")
  let cardContainer = document.querySelector(".cardContainer")
  let array = Array.from(anchors)
  for (let index = 0; index < array.length; index++) {
      const e = array[index]; 
      if (e.href.includes("/songs") && !e.href.includes(".htaccess")) {
          let folder = e.href.split("/").slice(-2)[0]
          // Get the metadata of the folder
          let a = await fetch(`/songs/${folder}/info.json`)
          let response = await a.json(); 
          cardContainer.innerHTML = cardContainer.innerHTML + ` <div data-folder="${folder}" class="card">
          <div class="play">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                  xmlns="http://www.w3.org/2000/svg">
                  <path d="M5 20V4L19 12L5 20Z" stroke="#141B34" fill="#000" stroke-width="1.5"
                      stroke-linejoin="round" />
              </svg>
          </div>

          <img src="/songs/${folder}/cover.jpg" alt="">
          <h2>${response.title}</h2>
          <p>${response.description}</p>
      </div>`
      }
  }

  // Load the playlist whenever card is clicked
  Array.from(document.getElementsByClassName("card")).forEach(e => { 
      e.addEventListener("click", async item => {
          console.log("Fetching Songs")
          songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)  
          playMusic(songs[0])

      })
  })
}

async function main() {
  await getSongs("songs/cs");

  playMusic(songs[0], true);
  //display all the albums in the page...


  let songUL = document
    .querySelector(".songList")
    .getElementsByTagName("ul")[0];
  songUL.innerHTML = "";
  // Show all the songs in the playlist
  for (const song of songs) {
    songUL.innerHTML += `<li>
                <img class="invert" width="34" src="music.svg" alt="">
                <div class="info">
                    <div> ${song.replaceAll("%20", " ")}</div>
                    <div>Harry</div>
                </div>
                <div class="playnow">
                    <span>Play Now</span>
                    <img class="invert" src="play.svg" alt="">
                </div> 
              </li>`;
  }
  // Attach event listeners to each song
  Array.from(
    document.querySelector(".songList").getElementsByTagName("li")
  ).forEach((e) => {
    const songName = e
      .querySelector(".info")
      .firstElementChild.innerHTML.trim();
    e.querySelector(".playnow").addEventListener("click", () =>
      playMusic(songName)
    );
  });
}

// Attach an event listener to play, next, and previous
play.addEventListener("click", () => {
  if (currentSong.paused) {
    currentSong.play();
    play.src = "pause.svg";
  } else {
    currentSong.pause();
    play.src = "play.svg";
  }
});
// listen for time update event
currentSong.addEventListener("timeupdate", () => {
  console.log(currentSong.currentTime, currentSong.duration);
  document.querySelector(".songtime").innerHTML = `${formatTime(
    currentSong.currentTime
  )}/${formatTime(currentSong.duration)}`;
  document.querySelector(".circle").style.left =
    (currentSong.currentTime / currentSong.duration) * 100 + "%";
});

//Add an event listner to seekbar
document.querySelector(".seekbar").addEventListener("click", (e) => {
  let percent = e.offsetX / e.target.getBoundingClientRect().width;
  document.querySelector(".circle").style.left = percent * 100 + "%";
  currentSong.currentTime = (percent / currentSong.duration) * 100;
});
//add a event listner to hamburger
document.querySelector(".hamburger").addEventListener("click", () => {
  document.querySelector(".left").style.left = "0";
});
//add a event listner to close button
document.querySelector(".close").addEventListener("click", () => {
  document.querySelector(".left").style.left = "-120%";
});
//add event listener to previous and next button
previous.addEventListener("click", () => {
  let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
  if (index - 1 > 0) {
    playMusic(songs[index - 1]);
  }
});
next.addEventListener("click", () => {
  currentSong.pause();
  let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
  if (index + 1 < songs.length) {
    playMusic(songs[index + 1]);
  }
});
//add an event listener to volume range
document
  .querySelector(".range")
  .getElementsByTagName("input")[0]
  .addEventListener("click", (e) => {
    console.log(e.target.value);

    currentSong.volume = parseInt(e.target.value) / 100;
  });


main();
