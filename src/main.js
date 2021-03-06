// VUSA
// - Very Unreliable Speech Assistant

import axios from 'axios';
import { responsesDict, vusaOpens } from './dict';

// here we go!
let speaking = false;
const speakButton = document.querySelector('.mic');
const speechArea = document.querySelector('.speech-area');

// Because chrome only accepts the webkit prefixed functions, just make everything the same
// by putting it to the same var
var SpeechRecognition = SpeechRecognition || webkitSpeechRecognition;
var SpeechRecognitionEvent = SpeechRecognitionEvent || webkitSpeechRecognitionEvent;

const recognition = new SpeechRecognition();

// some rules for our vusa
recognition.interimResults = true;
recognition.lang = 'en-US';



// Handles speech ending, either by button click or stopping speaking
const handleSpeechEnd = () => {
  let currentUsah = document.querySelector('p.usah.current');
  recognition.stop();
  
  // clean the last said bubble if they didn't say anything
  if (currentUsah !== null && currentUsah.textContent === '• • •') {
    currentUsah.remove();
  }
  
  // reset the stuff
  speaking = false;
  speakButton.classList.remove('on');
};

// randomises a response from a set in a given Array
const vusaRandoms = (responses) => {
  vusaResponse(responses[Math.floor(Math.random() * responses.length)]);
};

// sets up the vusa bubble with the response
const vusaResponse = (response) => {
  let vusa = document.createElement('p');
  vusa.classList.add('vusa');
  vusa.textContent = response;
  speechArea.appendChild(vusa);
};

// sets up the vusa bubble with an image
const vusaImage = (img, attr) => {
  let vusa = document.createElement('p');
  vusa.classList.add('vusa', 'vusa-img');
  vusa.innerHTML = `<img src="${img}" alt="image" /><span class="attribution">${attr}</span>`;
  speechArea.appendChild(vusa);
}

// this is the main brains of the operation.
// we take the speech and put it through a few filters
// to check what we're dealing with and send a reply
// we don't return out after the first reply on purpose
// because we are okay with vusa replying 2-3 times if
// the context requires her to
// eg: hi, how are you will allow vusa to respond with
// hi there! i am fine, how about you?
const vusaAssist = (speech) => {
  let answered = false; // to ensure we can say something at the end
  speech = speech.toLowerCase();
  
  // Normal responses
  for (let key in responsesDict) {
    let keyRegex = new RegExp(`\\b${key}\\b`, "g");
    if (keyRegex.test(speech)) {
      vusaResponse(responsesDict[key]);
      answered = true;
    }
  }
  
  // Open command
  let openCmd = /open (\w*)/i;
  if (speech.match(openCmd)) {
    let cmd = openCmd.exec(speech);
    answered = true;
    
    if (vusaOpens.hasOwnProperty(cmd[1])) {
      // this is just for fun! :P
      let lazyResponses = [
        "Can't you type, o lazy one?",
        "Wow you are lazy!",
        "One minute with me, and you've already forsaken the keyboard?",
        "What will you do without me, hmm?",
        "Why yes of course!",
      ];
      window.open(vusaOpens[cmd[1]]);
      vusaRandoms(lazyResponses);
    } else {
      vusaResponse("I'm sorry, but I don't know what that is!");
    }
  }
  
  // Time - Left intentionally vague for some fun!
  if (speech.includes('time')) {
    const now = new Date;
    let hours = now.getHours();
    let minutes = (now.getMinutes() < 10) ? "0" + now.getMinutes() : now.getMinutes();
    let timeOfDay;
    if (hours < 10) {
      timeOfDay = "morning";
    } else if (hours < 13) {
      timeOfDay = "day";
    } else if (hours < 16) {
      timeOfDay = "afternoon";
    } else if (hours < 20) {
      timeOfDay = "evening";
    } else {
      timeOfDay = "night"
    }
    vusaResponse(`Currently it's ${hours}:${minutes} in the ${timeOfDay}`);
    answered = true;
  }
  
  // Date
  if (speech.includes('date') || speech.includes('day')) {
    const now = new Date;
    const weekDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const date = now.getDate()+"";
    let lastDate = date.charAt(date.length - 1);
    const suffix = (lastDate === "1") ? "st" : (lastDate === "2") ? "nd" : (lastDate === "3") ? "rd" : "th";
    const dayOfWeek = weekDays[now.getDay()];
    const monthOfYear = months[now.getMonth()];
    const dateString = `${dayOfWeek} the ${date}${suffix} of ${monthOfYear}, ${now.getFullYear()}`;
    
    vusaResponse(`It's ${dateString} today`);
    answered = true;
  }
  
  // APIs here...
  
  // GIPHY
  // One problem I'm having with "gif" is saying it and having
  // the API pick it up as "gif"... currently, give, jiffy etc...
  // maybe have a find/replace for all "gif" sounding words to just
  // do the GIPHY?
  let giphyCmd = /gif (\w*)/i;
  if (speech.match(giphyCmd)) {
    let cmd = giphyCmd.exec(speech);
    answered = true;
    
    let giphy = cmd[1];
    
    // if using this, maybe change the API key here to your own ->
    axios.get(`https://api.giphy.com/v1/gifs/random?api_key=Ad45OKeJSw5AxL9F4QvcuAQnuZmIkK6w&tag=${giphy}&rating`)
      .then(function (res) {
        return res.data;
      })
      .then(function (res) {
        vusaImage(res.data.image_url, `<a target="_blank" href="${res.data.url}">GIPHY</a>`);
      })
      .catch(function (error) {
        console.log(error);
      });
  }
  
  
  // Didn't find anything to answer?
  if (!answered) {
    let unanswered = [
      "I'm sorry, what was that?",
      "I seem to be a bit slow today, can you repeat that?",
      "I didn't quite catch that...",
      "You talkin' to me?",
      "Err... what now?"
    ];
    vusaRandoms(unanswered);
  }
}

// Click on the mic button to start speaking
speakButton.addEventListener('click', function(e) {
  e.preventDefault();
  speaking = !speaking;
  this.classList.toggle('on');
  
  if (speaking) {
    // set up the user bubble
    let usah = document.createElement('p');
    usah.classList.add('usah', 'current');
    usah.textContent = "• • •";
    speechArea.appendChild(usah);
    
    // let's recognise some voices!
    recognition.start();
  } else {
    handleSpeechEnd();
  }
});

// on speech end
recognition.onspeechend = function() {
  // maybe put in a small timer so it allows user like a few milliseconds
  // before stopping speech recognition?
  handleSpeechEnd();
}

// the result
recognition.onresult = function(e) {
  let currentUsah = document.querySelector('p.usah.current');
  
  // map out the results into a readable string
  let speech = Array.from(e.results)
    .map(result => result[0])
    .map(result => result.transcript)
    .join('');
  
  if (speech != '') {
    currentUsah.textContent = speech;
  }
  
  // check the speech bubble on final result
  if (e.results[0].isFinal) {
    currentUsah.classList.remove('current');
    // now we have the final speech
    // we can go through the apis and actually assist...
    vusaAssist(speech);
  }
}
