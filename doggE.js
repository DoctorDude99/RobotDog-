//serial variables
let serial;
let portName = '/dev/tty.usbserial-0001';
let inData;
let outByte = 0;

//handpose variables
let video;
let handPose;
let hands = [];

//speech variables
let lang;
var talk;
let speechRec;
let continous;
let interim;

function preload(){
	handPose = ml5.handPose( {flipped: true} );
}

function gotHands(results){
	hands = results;	
}

function setup() {
	createCanvas(400, 300);
	//video setup
	video = createCapture(VIDEO, {flipped: true});
	video.hide();
	
	//serial set up
	serial = new p5.SerialPort();
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
	
	continous = true;
	interim = true;
	speechRec.start(continous, interim);
	
}

function gotSpeech(){
	
	if(speechRec.resultValue){
		//createP creates paragraph
		createP(speechRec.resultString);
		console.log(speechRec);
	}
	console.log(speechRec);
	//console.log(speechRec);
	textSize(40);
	fill(255,0,0);
	text(speechRec, width/2, length/2);
	
	/*
    if (speechRec.resultValue) {
      let said = speechRec.resultString;
      // Show user
      //output.html(said);
    }*/
}

function serialEvent(){
	let inByte = serial.read();
	
	inData = inByte;
}

function serialError(err){
	print("something went wrong with the serial port: " + err);
}

//tokenizer

function tokenizer(input) {

	//im gonna be honest i dont know what regex is
    const wordRegex = /\w+/g;

    const tokens = input.match(wordRegex);

    return tokens;
}


function draw(){
	background(0);
	image(video, 0, 0);
	
	fill(255,0 ,0 );
	textSize(30);
	
	serial.write(outByte);
		
	text(outByte, 30, 40);
	
	
	/*************
	SPEECH CODE
	**********/
	//let continous = true;
	//let interim = false;
	//speechRec.start(continous, interim);
	//text(outByte, 30, 40);
	fill(0,0,0);
	rect(0, 50, 400, 30);
	
	textSize(15);
	fill(255,0,0);
	text(speechRec.resultString, 0, 60);
	
		/***
	tokenizer test
	***/
	//const inputString = "Hello, world! This is a sample text.";
	//let inputString = speechRec.resultString;
	//const tokens = tokenizer(inputString);
	//console.log(tokens);
	
	if (speechRec.resultString) {
      let inputString = speechRec.resultString;
			const tokens = tokenizer(inputString);
			console.log(tokens);
		
		//javaScript find method

		// Method (return element > 0).
		let found = tokens.find(function (element) {
   		 return element == "up";
			});
		
		let sit = tokens.find(function (element) {
   		 return element == "down";
			});
		
		let rest = tokens.find(function (element) {
   		 return element == "rest";
			});
		
		let walk = tokens.find(function (element) {
   		 return element == "walk";
			});
		
		if(found == "up"){
			outByte = 2;
		}
		
		if(sit == "down"){
			outByte = 1;
		}
		
		if(rest == "rest"){
			outByte = 3;
		}
		
		if(walk == "walk"){
			outByte = 4;
		}
		
	}//speech recognition
    
	
	/*************
	HANDPOSE CODE
	**********/
	if(hands.length > 0){//hands start
		let hand = hands[0];
		
		let index = hand.index_finger_tip;
		let wrist = hand.wrist;
		let indexMCP = hand.index_finger_mcp;
		let middle = hand.middle_finger_tip;
		let middleMCP = hand.middle_finger_mcp;
		
		fill(255, 0, 0)
		circle(index.x, index.y, 10);
		
		fill(0, 0, 255)
		circle(middle.x, middle.y, 10);
		
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
		let newRatio = (wristToIndex/wristToMCP) * 100;
		
		//diagnostic printing
		//print("direction: "+ wristToIndex);
		print("new direction: "+ newRatio);
		print("index ratio: "+ IR);
		
		//pointing up
		//stand up
		if(IR > 175 && MR < 175 && newRatio > 150){
			outByte = 2;
		//pointing down
		//sit
		}else if(IR > 175 && MR < 175 && newRatio < -150){
			outByte = 1;
		}
		//flat hand
		//lie down
		else if(wristToIndex < 20 && MR < 175 && newRatio > -20){
			outByte = 3;
		}
		//walk
		//two fingers down
		if(IR > 175 && MR >175 && newRatio < -150){
			outByte = 4;
		}
	/*************
	KEYBOARD TEST CODE
	**********/
	//if(key >=1 && key <=5){
		//outByte = int(key);
		
	//}
	
	}//hands
		
}//draw

function ratioDist(wrist, tip, base){
	let tipToWrist = dist(tip.x, tip.y, wrist.x, wrist.y);
	let baseToWrist = dist(base.x, base.y, wrist.x, wrist.y);

	let ratio = (tipToWrist/baseToWrist) *100; 
	//print(ratio);
	return ratio;
}
