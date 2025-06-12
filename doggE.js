//serial variables
/***
SERIAL VARIABLES (p5.serial)
These are all of the variables used for the serial data section of the project.
What's going on is that the p5 sketch will send data to the arduino and it will
respond accordingly.
serial is the variable that will hold the SerialPort object, using this variable I can 
access the methods relating to SerialPort which I need such as turning on and opening
the serial port.
portName is the port that I'm sending data through, I define the name of the port I'm gonna send the data to
and can tell p5 to send it there.
inData is incoming data sent from the arduino, it's not really being used in this project and was used for
testing and making the appropriate functions for the SerialPort object to function. 
In this project inData just told me whether something went wrong with the serial port.
Lastly, outByte is the main variable used. It is the variable holding the data being sent to the
arduino. This project runs mostly off of sending data to the arduino.
****/
let serial;
let portName = '/dev/tty.usbserial-0001';
let inData;
let outByte = 0;

/*
HANDPOSE VARIABLES (ml5.js)
These are all of the variables being used for detecting the hands.
video is just the variable holding the webcam video. It's gonna be displayed on the 
p5 sketch so we can see how the handPose model is tracking my hands.
Lastly, the hands arrays is storing all of the data pertaining to the hand(s) detected.
Each index in the array holds one hand that is detected, we're only going to be using one hand so
we only need to access the first index of the array. 
*******/
let video;
let handPose;
let hands = [];

/******

SPEECH VARIABLES (p5.speech)
Language is the language that p5.speech will be interpreting the speech in.
speechRec is where all of the speech data is being stored and will be initialized
to the p5.SpeechRec object in set up. I'm using this variable to access everything related
to speech needed later on.
Continous determines whether p5.speech is recording speech only once or constantly.
Interim determines whether p5.speech will wait for us to pause, then interpret the speech, 
or be constantly interpreting speech without pauses.
******/
let lang;
let speechRec;
let continous;
let interim;
/******
PRELOAD
In this program preload is being used to load the ml5 models. These needs to be done before anything else as they are 
used throughout the program. They basically grab the model or classifier from a server somewhere and store them in a variable,
the variables are then used to populate the corresponding arrays.*/
function preload(){
	handPose = ml5.handPose( {flipped: true} );
}

/****
"GOT" FUNCTIONS
These functions are populating are arrays/variables that store the data pertaining to the ml5 handposes/speech classification.
Basically the data TO these functions and then deciding what to do with them. All we're doing
with these functions now is storing them in an array or variable that we can use later on in the program.
*****/
function gotHands(results){
	hands = results;	
}

function gotSpeech(){
	
	//if there is speech being recorded, console log the speech
	if(speechRec.resultValue){

		console.log(speechRec);
	}
	
	//displaying all the speech detcted on the p5 sketch with red colour and size 40
	textSize(40);
	fill(255,0,0);
	text(speechRec, width/2, length/2);
	
}

/*********
SETUP
Another very important function, it takes place after preload but before the main program starts running.
First of all we're setting up the canvas like we always do with the camera friendly dimensions.
Next we use create capture to store the live video feed in the video variable, this basically acts like an image
that is constantly redrawn as the webcam changes. We use video.hide() ot hide the original video feed



******/
function setup() {
	createCanvas(640, 480);
	//video setup
	video = createCapture(VIDEO, {flipped: true});
	video.hide();
	
	//serial set up
	
	//creating the serialPort object which we can use to access everything relating to serialPort
	serial = new p5.SerialPort();
	//turning on the serial port for receiving data, 'data' means we're sending data, serialEvent
	//is the function storing 
	serial.on('data', serialEvent);
	serial.on('error', serialError);
	serial.list();
	serial.open(portName);
	
	//handpose set up
	handPose.detectStart(video, gotHands);
	
	//speech set up
	//setting language 
	lang = navigator.language || 'en-US';
	speechRec = new p5.SpeechRec(lang, gotSpeech);
	
	//continous is true, speech will processed throughout the sketch, not just once at the setup.
	continous = true;
	//interim is true, speech will processed without waiting for the user to pause
	interim = true;
	
	//starting the speech recording and telling it what we decided to do with interim and continous.
	speechRec.start(continous, interim);
	
}

/***
SERIAL EVENT AND SERIAL ERROR

serial event is the funcrtion interpreting anything the arduino send to p5, it's
reading the serial data then storing it in the global variable.

Serial error will take the error occurred in from the arduino and display it in the console.
***/

function serialEvent(){
	let inByte = serial.read();
	
	inData = inByte;
}

function serialError(err){
	print("something went wrong with the serial port: " + err);
}

/*****
TOKENIZER
Tokenizer takes an input string and breaks it down into an array, where each word represents one
index of the array. wordRegex (regular expression) is what's telling p5 how to seperate the String
into words. The slashes and characters may seem random but they are actually describing to p5 
what data to extract from the String and how to do it.
****/
function tokenizer(input) {

    let wordRegex = /\w+/g;

    let tokens = input.match(wordRegex);

    return tokens;
}


function draw(){
	
	/******
	Setting up the p5 sketch look. I'm displaying the video and showing what
	outByte (the outgoing data) is at the current moment so I can keep track of it.
	serial.write is writing the data to the arduino
	******/
	//setting up a black background
	background(0);
	//displaying the video on the screen
	image(video, 0, 0);
	
	//creating red text and setting size
	fill(255,0 ,0 );
	textSize(30);
	
	//sending the data to the arduino
	serial.write(outByte);
		
	//displaying outByte on the p5 sketch
	text(outByte, 30, 40);
	
	
	/*************
	SPEECH CODE
	**********/
	
	/***
	Setting up the speech to appear on the p5 display. I took the 
	String that p5.speech was getting and displayed it on the screen with
	a black box behind it for readability
	**/
	//creating a black rectangle
	fill(0,0,0);
	rect(0, 50, 400, 30);
	
	//setting text size, colour, and position
	textSize(15);
	fill(255,0,0);
	text(speechRec.resultString, 0, 60);
	
	/***
	TOKENIZER APPLICATION
	Here the tokenizer is actually being used. If there speech input detected
	the input is stored in a String, that String is sent to the tokenizer to be broken
	down into an array of individual words which is logged to the console so I can see how
	it's being broken down. 
	
	Find is then used on the tokens array. The way find works is pretty interesting, 
	essentially make a small function inside the find() method that will return an 
	element of the array that matches the parameters you set.
	The next step is telling p5 "if you find this word, change the outgoing data"
	***/
	
	if (speechRec.resultString) {
		//storing detected speech String into another String
      let inputString = speechRec.resultString;
		//storing tokens in 
			let tokens = tokenizer(inputString);
			console.log(tokens);
		
		//javaScript find method

		//the element returned is stored in a variable
		let found = tokens.find(function (element) {
   		 return element == "up";
			});
		//if the variable is "up" change outByte
		if(found == "up"){
			outByte = 2;
		}
		
		let sit = tokens.find(function (element) {
   		 return element == "down";
			});
		if(sit == "down"){
			outByte = 1;
		}
		
		let rest = tokens.find(function (element) {
   		 return element == "rest";
			});
		if(rest == "rest"){
			outByte = 3;
		}
		
		let walk = tokens.find(function (element) {
   		 return element == "walk";
			});
		
		if(walk == "walk"){
			outByte = 4;
		}
		
		let wave = tokens.find(function(element){
			return element == "hello";
		});
		if(wave == "hello"){
			outByte = 5;
		}
		
	}//speech recognition
    
	
	/*************
	HANDPOSE CODE
	This entire if-statement houses all the information and interactions pertaining to the hand gestures.
	If a hand is detected a variable called hand is initialized to the first hand the program sees. 
	From there other variables are initialized to points on the hand and used later on.
	The rest of the if-statements detect certain ratios and movements of the hand, detecting certain
	hand gestures.


	
	The way the code is written makes it so only one hand can control the robot. At first this might
	seem like a drawback but it's actually good since multiple inputs at the same time would close
	the serial connection.
	*******************************/
	
	if(hands.length > 0){//hands start
		//initializing hand to the first detected hand in the array
		let hand = hands[0];
		
		//initialzing variables to hold points on the hand
		let index = hand.index_finger_tip;
		let wrist = hand.wrist;
		let indexMCP = hand.index_finger_mcp;
		let middle = hand.middle_finger_tip;
		let middleMCP = hand.middle_finger_mcp;
		
		//red circle at the index finger for checking how finger movements are being tracked
		fill(255, 0, 0)
		circle(index.x, index.y, 10);
		
		//blue circle at the middle finger for checking how finger movements are being tracked
		fill(0, 0, 255)
		circle(middle.x, middle.y, 10);
		
		//getting index ratios of index and middle finger (this part is explained more later on)
		let IR = ratioDist(wrist, index, indexMCP);
		let MR = ratioDist(wrist, middle, middleMCP);
		
		//positive means pointed up, negative means pointed down
		let wristToIndex = wrist.y - index.y;
		let wristToMCP = wrist.y - indexMCP.y;
		
		//make sure wristToMCP is not negative (absolute value)
		if(wristToMCP < 0){
			wristToMCP*=-1;
		}
		//takes the the ratio of the y values to determine whether pointing up or down
		//newRatio roughly tells me the direction the finger is pointing in which is 
		//essential in determining certain hand gestures like pointing up/down
		let newRatio = (wristToIndex/wristToMCP) * 100;
		
		//diagnostic printing
		print("direction: "+ newRatio);
		print("index ratio: "+ IR);
		
		//pointing up
		//stand up
		if(IR > 175 && MR < 175 && newRatio > 150){
			outByte = 2;
		//pointing down
		//sit
		}else if(IR > 180 && MR < 175 && newRatio < -150){
			outByte = 1;
		}
		//flat hand
		//lie down
		else if(wristToIndex < 20 && MR < 175 && newRatio > -20){
			outByte = 3;
		}
		//walk
		//two fingers down
		if(IR > 200 && MR > 200 && newRatio < -150){
			outByte = 4;
		}
	
	}//hands
		
}//draw

//calculates the ratio from the tip of the finger to the base of the wrist
//tip of the given finger, base of the given finger, and wrist location of the hand
/***
RATIODIST
ratioDist is a very important custom function that helps determine what the pose of the hand is.
Using the parameters, the wrist, tip of a certain finger, and base of a certain finger, it calculates
the ratio of the finger to the palm of the hand at any given moment. For example, if the index finger is fully
extended, the ratio should be ~200 since it is a similar size to the palm, the ratio of the finger to palm 2/1
(the multipliy by 100 is there just to make the number easier to read).
But basically using this method I can track the position of the finger.
***/
function ratioDist(wrist, tip, base){
	let tipToWrist = dist(tip.x, tip.y, wrist.x, wrist.y);
	let baseToWrist = dist(base.x, base.y, wrist.x, wrist.y);

	let ratio = (tipToWrist/baseToWrist) *100; 
	return ratio;
}
