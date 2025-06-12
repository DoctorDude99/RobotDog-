//include the servo library
#include <Servo.h>

//include the LCD library
#include <LiquidCrystal.h>

//creates an LCD object. Parameters: (rs, enable, d4, d5, d6, d7)
/*he parameters are telling the arduino which pins the LCD screen
will use. All of the pins used need some type of data or instruction
from the arduino. Pin 13 is the register select, it interprets whether 
the LCD is displaying characters or performing a demand such as clearing the screen.
Pin 12 is enable, which tells the LCD when to accept data from the arduino.
Pins 5 through 2 are the data pins and are used to send over the character data
and commands from the arduino
*/
LiquidCrystal lcd(13, 12, 5, 4, 3, 2);

//initializing the Servo objects
Servo backRight;
Servo backLeft;
Servo frontRight;
Servo frontLeft;

//initializing the variable that will hold certain points of time
int time;


/*
The following variables are the different positions for the servo motors.
Since a lot of Servos move a lot of times it is way easier to initialize them
all at the start.
You'll notice there are some different varaibles for the back legs specifically,
this is because the way they are positioned on the robot is technically
opposite to the front legs. Because of I need to tell the arduino that the
back Servos are moving in a different direction than the front motors, though
on the robot they appear to be moving to roughly the same angle
*/
//leg fully straight
int legStraight = 90;
//front leg fully down
int legDown = 175;
//back leg fully down
int backlegDown = 5;
//back leg partially down to achieve stepping movement
int stepBL = 20; 
//front leg partially down to achieve stepping movement
int stepFL = 140; 

/**
setup in c++ works the same as setup on p5/js. We're setting up everything we 
need before the program starts running.
First serial feedback is established so the arduino can send print serial data
to the serial monitor.
Then the servo motors initialized before are told what pin they will be attached to
and receive data from.
The LCD screen is told it will be operating with 16 characters and 2 
lines (16, 2) and the LCD screen is cleared before the program starts
for good measure.
Lastly the time variable is set to 0 to signify the start of the program
is at 0 seconds. (this honestly could have been done before too)
*/
void setup() {
  Serial.begin(9600);

  //back right leg attached to pin 8
  backRight.attach(8, 500, 2500);
  //back left leg attached to pin 9
  backLeft.attach(9, 500, 2500);

  //front right leg attached to pin 10
  frontRight.attach(10, 500, 2500);
  //front left leg attached to pin 11
  frontLeft.attach(11, 500, 2500);

//telling lcd screen how many characters and lines it will be working with
//and clearing the screen
  lcd.begin(16, 2);
  lcd.clear();
//time set to 0
  time = 0;

}

void loop() {

/****
SERIAL DATA AND SWITCH CASE
If serial data is detected, the following code will play out.
The incoming data (inByte) is stored in a variable and read using Serial.read().
The LCD's "cursor" as in where the LCD will begin writing text from is set to 
character index 0 at line index 1 since nothing is on it yet.
While it is changed later, it's easier if I put it here so I don't have to explain
it in the methods. Also in previous versions of the code characters were being written
at that index.

Next is the switch statement, the most important structure in the project. The 
switch statement is connected to the incoming data variable (inByte), depending
on what inByte is sent from the p5 sketch, different functions will be called.
These functions instruct the servos and LCD screen on what to do/what pose to make.
The time = millis() will be explained later on when we get to the idle behaviours.
All of the poses are stored in separate functions to make the code easier to
read and go through, especially since a lot of stuff is going on when the
robot moves.
*/
//if serial data is available
  if(Serial.available() > 0){

    int inByte = Serial.read();

    lcd.setCursor(0, 1);


    switch(inByte){
      case 0:
      //default
      defaultPos();

      delay(5);
      break;

      case 1:
      //sit
      sit();

      break;

      case 2:
      //stand
      stand();

      break;
      
      case 3:
      //lay down
      time = millis();
      layDown();
      break;

      case 4:
      //Only right walk is triggered here as leftWalk() will be triggered 
      //in rightWalk(). I'll explain this more once we get to the walking
      //functions.
     rightWalk();
      break;

      case 5:
     //lay down
     time = millis();
     hi();
     break;

    }
  
  /****
  IDLE BEHAVIOURS
  There are three idle behaviours that are progressions of one another and are
  all dependent on time. 
  before I get into that I need to fully explain the time variable.
  The time variable is the time at which the last idle behaviour was triggered
  or the last time a certain pose was triggered. 
  At the beginning it's 0 since nothing has happened, but gets updated based on
  what poses get triggered or if the last idle pose was triggered.
  currentTime is the current time subtracted by the time value.
  Depending on currentTime the idle behaviours will activate.
  It's essentially a timer counting from time, after 15 seconds one
  idle pose will trigger, after 20 the next, etc.
  The reason time is set to millis() during certain poses and at the last idle
  behaviour is to reset the currentTime timer. By resetting it during a pose,
  it will ensure the idle behaviours won't trigger that pose which can get
  annoying. It resets at the last idle behaviour to reset the timer and begin the 
  count down to the idle behaviours again.

  The first idle behaviour is the robot getting droopy eyed by changing 
  the expression on the LCD screen, it is triggered after 15 seconds.
  The second idle behaviour is the robot shutting it's eyes and gets
  triggered after 20 seconds.
  The last idle behaviour is the robot falling asleep momentarily then getting back 
  up by calling the layDown() function. The reason it get's back up is because
  the robot is trying to prefrom the last pose and layDown() at the same time 
  which causes layDown() to trigger for a few seconds then go back to
  the old pose.
  At first I tried removing it but quickly realized it gave a nice effect of
  the robot falling asleep, then getting back up.

  */
  int currentTime = millis() - time;

//in between 15 and 20 seconds
  if(currentTime > 15000 && currentTime < 20000){
    //setting a new face
    lcd.clear();
    lcd.setCursor(0, 1);
    lcd.print("     .w.       ");
    //in between 20 and 30 seconds
  }else if(currentTime > 20000 && currentTime < 30000){
    //setting a new face
    lcd.clear();
    lcd.setCursor(0, 1);
      lcd.print("     >w<       ");
      //after 30 seconds
  }else if(currentTime > 30000 ){
    //lay down and reset timer
    layDown();
    time = millis();
  }
    
    //small delay for performance
    delay(5);
    //inByte displayed in serial monitor for diagnostics
    Serial.println(inByte);

  }


}

/***
HI FUNCTION
Occurs in response to the user saying "hello" to the robot.
Both back legs go down and front legs go straight and the LCD screen
displays the robot's face with the message "hi" next to it, giving the
effect the robot is responding
*/
void hi(){
 backRight.write(backlegDown);
 backLeft.write(backlegDown);


 frontLeft.write(legStraight);
frontRight.write(legStraight);
 delay(5);


 //face
 lcd.setCursor(0, 1);
 lcd.print("owo \"hi!\"      ");
 delay(5);

}

/**
DEFAULT POSITION
Basically just the robot sitting down with a unique expression, it tells
me when the robot has reset since it will only trigger if no user input
has been detected yet. The unique is expression is to make it look
like the robot has just woken up.
The sitting effect is given by having both the back legs down but the 
front legs sit up.
*/
void defaultPos(){
        backRight.write(backlegDown);
      backLeft.write(backlegDown);

      frontRight.write(legStraight);
      frontLeft.write(legStraight);

  lcd.setCursor(0, 1);
  lcd.print("     0wo       ");
}

/**
SITTING POSITION  
Uses the same trick as default position, again a different face though
to show that the command has been triggered. The face represents
the robot's calm face.
*/
void sit(){
        backRight.write(backlegDown);
      backLeft.write(backlegDown);

      frontRight.write(legStraight);
      frontLeft.write(legStraight);

      lcd.setCursor(0, 1);
      lcd.print("     owo       ");

      delay(5);
}

/***
STAND FUNCTION
All legs are set to 90 degrees (the straight lef position).
This is because 90 degrees was the same for both front and back legs.
The face represents the alert face of the robot.
*/
void stand(){
        backRight.write(legStraight);
      backLeft.write(legStraight);

      frontRight.write(legStraight);
      frontLeft.write(legStraight);

      lcd.setCursor(0, 1);
      lcd.print("     OwO       ");

      delay(5);
}

/***
LAYDOWN FUNCTION
Called upon user request and in one of the idle behaviours as mentioned
previously.
All legs are position down on the floor and the robot makes an asleep face.
*/
void layDown(){
      backRight.write(backlegDown);
      backLeft.write(backlegDown);

      frontRight.write(legDown);
      frontLeft.write(legDown);

      lcd.setCursor(0, 1);
      lcd.print("     -w-       ");

      delay(5);
}

/**

RIGHTWALK
Now we're at the more interesting pose functions.
Walking is split into two functions, rightWalk and leftWalk. 
rightWalk moves the right side of the robot's body while leftWalk moves
the left. Opposite legs (backRight and frontLeft in this case) are moved
to their partial walking positions then moved back to neutral position.
With this motion the robot is leaning forward then pushing itself forward
by returning to the leg straight position. 
Delays are necessary as these steps are incremental, the robot cannot
step then straighten it's legs at the same time. The delays are also longer
to allow time for the robot to take each step.
You can imagine this stepping system as similar to how a toy soldier walks.

At the end the leftWalk() function is called, once the right side of the body moves
the left side will move.
*/
void rightWalk(){
    lcd.setCursor(0, 1);
      lcd.print("     OwO       ");
  //first step
  //this leg moves
     backRight.write(stepBL); 
     delay(5);
     backLeft.write(legStraight); 

      frontRight.write(legStraight); 
      delay(5);
      //this leg moves
      frontLeft.write(stepFL);
      delay(500);

      //returning everything to neutral
      backRight.write(legStraight);
      backLeft.write(legStraight);
      frontRight.write(legStraight);
      frontLeft.write(legStraight);
      delay(100);

      leftWalk();
}

/**
LEFTWALK
Again, opposing legs are moving (backLeft and frontRight in this case) then 
go back to the straight leg position the same as in rightWalk().
The rightWalk() is called at the end of the leftWalk for the right side to move too.
By having both functions call eachother at the end, it creates a cycle where one
side moves, then the other.
It creates a smooth walking cycle.
Also the face is both of these functions represent the robots alert face.
*/
void leftWalk(){
  delay(100);
lcd.setCursor(0, 1);
      lcd.print("     OwO       ");
      //second step
      backRight.write(legStraight);
      delay(5);
      //this leg moves
      backLeft.write(stepBL);

      //this leg moves
      frontRight.write(stepFL);
      delay(5);
      frontLeft.write(legStraight);
      delay(500);

      //returning everything to neutral
      backRight.write(legStraight);
      backLeft.write(legStraight);
      frontRight.write(legStraight);
      frontLeft.write(legStraight);
      delay(100);

      rightWalk();

}
