let currentSong = new Audio();
let songs;
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

async function getSongs() {
  let a = await fetch("http://127.0.0.1:3000/project%202/songs/");
  let response = await a.text();

  let div = document.createElement("div");
  div.innerHTML = response;
  let as = div.getElementsByTagName("a");

  let songs = [];
  for (let index = 0; index < as.length; index++) {
    const element = as[index];
    if (element.href.endsWith(".mp3")) {
      songs.push(element.href.split("/songs/")[1].replace(/\\/g, "/"));
    }
  }
  return songs;
}

const playMusic = (track, pause = false) => {
  currentSong.src = "/songs/" + track;
  if (!pause) {
    currentSong.play();
    play.src = "pause.svg";
  }

  document.querySelector(".songinfo").innerHTML = decodeURI(track);
  document.querySelector(".songtime").innerHTML = "00:00/00:00";
};

async function main() {
  songs = await getSongs();
  console.log(songs);
  playMusic(songs[0], true);

  let songUL = document
    .querySelector(".songList")
    .getElementsByTagName("ul")[0];
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
document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("click",(e)=>{
  console.log(e.target.value);
  
  currentSong.volume = parseInt(e.target.value)/100;
})

main();
