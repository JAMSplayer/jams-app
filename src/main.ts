//import { invoke } from "@tauri-apps/api/core";

let newSongEl: HTMLButtonElement | null;
let playerEl: HTMLAudioElement | null;
let player: object | null;

//async function greet() {
//  if (greetMsgEl && greetInputEl) {
//    // Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
//    greetMsgEl.textContent = await invoke("greet", {
//      name: greetInputEl.value,
//    });
//  }
//}

let loadPlayer = function(src: string) {
  const div = document.createElement("div");
  const audio = document.createElement("audio");
  audio.src = src;
  div.append(audio);
  playerEl.replaceChildren(div);
}

window.addEventListener("DOMContentLoaded", () => {
  playerEl = document.querySelector("#player");
  loadPlayer("http://localhost:12345/3509bad03dc869dec883c7b44662c3503d2517fa9e828bb64f4dbe719d3837bf__BegBlag.mp3");

  newSongEl = document.querySelector("#new-song");
  newSongEl.addEventListener("click", () => {
    console.log("click.");
    loadPlayer("http://localhost:12345/test.mp3");
  })
});
