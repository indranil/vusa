// VUSA
// - Very Unreliable Speech Assistant

var speaking = false;
let speakButton = document.querySelector('.mic');
let speechArea = document.querySelector('.speech-area');

// Because chrome only accepts the webkit prefixed functions, just make everything the same
// by putting it to the same var
var SpeechRecognition = SpeechRecognition || webkitSpeechRecognition;
var SpeechGrammarList = SpeechGrammarList || webkitSpeechGrammarList;
var SpeechRecognitionEvent = SpeechRecognitionEvent || webkitSpeechRecognitionEvent;



const recognition = new SpeechRecognition();
const grammarList = new SpeechGrammarList();

// create the grammar list?

// some rules for our vusa
recognition.interimResults = true;
recognition.lang = 'en-US';
// recognition.grammars = grammarList;


// Some functions needed
let handleSpeechEnd = () => {
  let currentUsah = document.querySelector('p.usah.current');
  recognition.stop();
  
  // clean the last said bubble if they didn't say anything
  if (currentUsah.textContent === '• • •') {
    currentUsah.remove();
  }
  
  // reset the stuff
  speaking = false;
  speakButton.classList.remove('on');
};


speakButton.addEventListener('click', function(e) {
  e.preventDefault();
  speaking = !speaking;
  this.classList.toggle('on');
  
  // set up the thingy
  if (speaking) {
    let usah = document.createElement('p');
    usah.classList.add('usah', 'current');
    usah.textContent = '• • •';
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
  }
}
