console.log('Let\'s write JavaScript');
let currentSong = new Audio();
let songs;
let currFolder;

// Function to format time in MM:SS format
function formatTime(seconds) {
    if (isNaN(seconds) || seconds < 0) return "00:00";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
}

// Function to fetch and list songs in a folder
async function getSongs(folder) {
    currFolder = folder;
    let response = await fetch(`http://127.0.0.1:3000/project%202/${folder}`);
    let html = await response.text();

    let div = document.createElement("div");
    div.innerHTML = html;
    let links = div.getElementsByTagName("a");

    songs = [];
    for (let link of links) {
        if (link.href.endsWith(".mp3")) {
            songs.push(link.href.split(`/${folder}/`)[1].replace(/\\/g, "/"));
        }
    }

    // Display the songs in the playlist
    let songUL = document.querySelector(".songList ul");
    songUL.innerHTML = "";
    for (const song of songs) {
        songUL.innerHTML += `
            <li>
                <img class="invert" width="34" src="img/music.svg" alt="">
                <div class="info">
                    <div>${song.replaceAll("%20", " ")}</div>
                    <div>Artist Name</div>
                </div>
                <div class="playnow">
                    <span>Play Now</span>
                    <img class="invert" src="img/play.svg" alt="">
                </div>
            </li>`;
    }

    // Attach event listeners to play songs
    Array.from(document.querySelectorAll(".songList li")).forEach((li, index) => {
        li.addEventListener("click", () => playMusic(songs[index]));
    });

    return songs;
}

// Function to play a selected song
const playMusic = (track, pause = false) => {
    currentSong.src = `http://127.0.0.1:3000/project%202/${currFolder}/${track}`;
    if (!pause) {
        currentSong.play();
        document.querySelector("#play").src = "img/pause.svg";
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track);
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
};

// Function to display albums
async function displayAlbums() {
    console.log("Displaying albums");
    let response = await fetch(`/songs/`);
    let html = await response.text();

    let div = document.createElement("div");
    div.innerHTML = html;
    let links = div.getElementsByTagName("a");

    let cardContainer = document.querySelector(".cardContainer");
    cardContainer.innerHTML = "";

    for (let link of links) {
        if (link.href.includes("/songs") && !link.href.includes(".htaccess")) {
            let folder = link.href.split("/").slice(-2)[0];
            let metadataResponse = await fetch(`http://127.0.0.1:3000/project%202/songs/${folder}/info.json`);
            let metadata = await metadataResponse.json();

            cardContainer.innerHTML += `
                <div data-folder="${folder}" class="card">
                    <div class="play">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M5 20V4L19 12L5 20Z" stroke="#141B34" fill="#000" stroke-width="1.5" stroke-linejoin="round"></path>
                        </svg>
                    </div>
                    <img src="http://127.0.0.1:3000/project%202/songs/${folder}/cover.jpg" alt="">
                    <h2>${metadata.title}</h2>
                    <p>${metadata.description}</p>
                </div>
                </div>`;
        }
    }

    // Add event listeners to cards
    document.querySelectorAll(".card").forEach(card => {
        card.addEventListener("click", async () => {
            let folder = card.dataset.folder;
            songs = await getSongs(`songs/${folder}`);
            playMusic(songs[0]);
        });
    });
}

// Main function to initialize the app
async function main() {
    // Fetch and play songs from default folder
    await getSongs("songs/default");
    playMusic(songs[0], true);

    // Display all albums
    await displayAlbums();

    // Play/pause event
    document.querySelector("#play").addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            document.querySelector("#play").src = "img/pause.svg";
        } else {
            currentSong.pause();
            document.querySelector("#play").src = "img/play.svg";
        }
    });

    // Next and previous functionality
    document.querySelector("#next").addEventListener("click", () => {
        let currentIndex = songs.indexOf(currentSong.src.split("/").pop());
        if (currentIndex + 1 < songs.length) {
            playMusic(songs[currentIndex + 1]);
        }
    });

    document.querySelector("#previous").addEventListener("click", () => {
        let currentIndex = songs.indexOf(currentSong.src.split("/").pop());
        if (currentIndex - 1 >= 0) {
            playMusic(songs[currentIndex - 1]);
        }
    });

    // Volume control
    document.querySelector(".range input").addEventListener("change", e => {
        currentSong.volume = e.target.value / 100;
    });

    // Seekbar functionality
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.offsetWidth) * 100;
        currentSong.currentTime = (percent / 100) * currentSong.duration;
    });

    // Update song time and seekbar
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${formatTime(currentSong.currentTime)} / ${formatTime(currentSong.duration)}`;
        document.querySelector(".circle").style.left = `${(currentSong.currentTime / currentSong.duration) * 100}%`;
    });
}

main();

