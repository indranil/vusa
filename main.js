// VUSA
// - Very Unreliable Speech Assistant

var speaking = false;
let speakButton = document.querySelector('.mic');
let speechArea = document.querySelector('.speech-area');

// Dictionaries & URLs & APIs
const responsesDict = {
  "hello": "Hi there!",
  "hi": "Hi there",
  "how are you": "I am fine! How about you?",
  "where are you from": "You know what, I'm not really sure! Github? Is that a place?",
  "who are you": "I'm VUSA, the Very Unique Speech Advisor!",
  "secret": "Shh! It's a secret!",
};

const vusaOpens = {
  'facebook': 'http://www.facebook.com',
  'github': 'http://github.com',
  'twitter': 'http://twitter.com',
  'google': 'http://google.com',
  'apple': 'http://apple.com',
  'bbc': 'http://bbc.com',
  'cnn': 'http://cnn.com',
  'yahoo': 'http://yahoo.com',
  'wikipedia': 'http://wikipedia.org',
  'youtube': 'http://youtube.com',
  'reddit': 'http://reddit.com',
  'netflix': 'http://netflix.com',
}

// Because chrome only accepts the webkit prefixed functions, just make everything the same
// by putting it to the same var
var SpeechRecognition = SpeechRecognition || webkitSpeechRecognition;
var SpeechRecognitionEvent = SpeechRecognitionEvent || webkitSpeechRecognitionEvent;

const recognition = new SpeechRecognition();

// some rules for our vusa
recognition.interimResults = true;
recognition.lang = 'en-US';



// Some functions needed
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

// sets up the vusa bubble with the response
const vusaResponse = (response) => {
  let vusa = document.createElement('p');
  vusa.classList.add('vusa');
  vusa.textContent = response;
  
  speechArea.appendChild(vusa);
};

const vusaAssist = (speech) => {
  speech = speech.toLowerCase();
  
  // Normal responses
  for (let key in responsesDict) {
    if (speech.includes(key)) {
      vusaResponse(responsesDict[key]);
    }
  }
  
  // Open command
  let openCmd = /open (\w*)/i;
  if (speech.match(openCmd)) {
    let cmd = openCmd.exec(speech);
    
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
      vusaResponse(lazyResponses[Math.floor(Math.random() * lazyResponses.length)]);
    } else {
      vusaResponse("I'm sorry, but I don't know what that is!");
    }
  }
}


speakButton.addEventListener('click', function(e) {
  e.preventDefault();
  speaking = !speaking;
  this.classList.toggle('on');
  
  // set up the user bubble
  if (speaking) {
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
  handleSpeechEnd();
}

// the result
recognition.onresult = function(e) {
  let currentUsah = document.querySelector('p.usah.current');
  let speech = Array.from(e.results)
    .map(result => result[0])
    .map(result => result.transcript)
    .join();
  
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
