console.log("Lets write JavaScript");
let currentSong = new Audio();
async function getSongs() {
  let a = await fetch("http://127.0.0.1:3000/songs/");
  let response = await a.text();
  console.log(response);
  let div = document.createElement("div");
  div.innerHTML = response;
  let as = div.getElementsByTagName("a");
  console.log(as);
  
  let songs = [];
  for (let index = 0; index < as.length; index++) {
    const element = as[index];
    if (element.href.endsWith(".mp3")) {
      songs.push(element.href.split("/songs/")[1]);
    }
  }
  return songs;
}
const playMusic = (track)=>{
  let audio = new Audio("/songs/" + track)
  audio.play()
}
async function main() {
  
  let songs = await getSongs()
  console.log(songs);
  let songUL =document.querySelector(".songList").getElementsByTagName("ul")[0];
  //show all the songs in playlist
  for (const song of songs) {
    songUL.innerHTML = songUL.innerHTML + `<li>
                <img class="invert" width="34" src="music.svg" alt="">
                <div class="info">
                    <div> ${song.replaceAll("%20"," ")}</div>
                    <div>Harry</div>
                </div>
                <div class="playnow">
                    <span>Play Now</span>
                    <img class="invert" src="playbar.svg" alt="">
                </div> </li>`;
  }
  // Attach a event listner to each song
  Array.from(document.querySelector(".songList").getElementsByTagName("li").forEach(e => {
    console.log(e.querySelector(".info").firstElementChild.innerHTML)
    playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim())
  }))
}
main();
