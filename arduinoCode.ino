#include <Servo.h>

// include the library
#include <LiquidCrystal.h>

// Creates an LCD object. Parameters: (rs, enable, d4, d5, d6, d7)
LiquidCrystal lcd(13, 12, 5, 4, 3, 2);

Servo backRight;
Servo backLeft;

Servo frontRight;
Servo frontLeft;

int legStraight = 90;
int legDown = 175;
int backlegDown = 5;

int legStep = 70;
int legBack = 110;
int cm = 0;

// Define the number of samples to keep track of.  The higher the number,
// the more the readings will be smoothed, but the slower the output will
// respond to the input.  Using a constant rather than a normal variable lets
// use this value to determine the size of the readings array.
const int numReadings = 10;

int readings[numReadings];      // the readings from the analog input
int readIndex = 0;              // the index of the current reading
int total = 0;                  // the running total
int average = 0;                // the average

long readUltrasonicDistance(int triggerPin, int echoPin)
{
  pinMode(triggerPin, OUTPUT);  // Clear the trigger
  digitalWrite(triggerPin, LOW);
  delayMicroseconds(2);
  // Sets the trigger pin to HIGH state for 10 microseconds
  digitalWrite(triggerPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(triggerPin, LOW);
  pinMode(echoPin, INPUT);
  // Reads the echo pin, and returns the sound wave travel time in microseconds
  return pulseIn(echoPin, HIGH);
}


void setup() {
  // put your setup code here, to run once:
  Serial.begin(9600);

  backRight.attach(8, 500, 2500);
  backLeft.attach(9, 500, 2500);

  frontRight.attach(10, 500, 2500);
  frontLeft.attach(11, 500, 2500);

  lcd.begin(16, 2);
  lcd.clear();

    // initialize all the readings to 0:
  for (int thisReading = 0; thisReading < numReadings; thisReading++) {
    readings[thisReading] = 0;
  }

}

void loop() {
  //if serial data is availabke
  lcd.setCursor(5, 1);

//change this to a switch statement
  if(Serial.available() > 0){

    int inByte = Serial.read();

    /***
    STANDING/SITTING CODE
    inByte 1 is sit
    inByte 2 is stand
    */
    //default


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
      layDown();
      break;

      case 4:
      //walking
      forwardWalk1();

      break;
    }
 
    
    delay(5);
    Serial.println(inByte);

  }

      // measure the ping time in cm
 //cm = 0.01723 * readUltrasonicDistance(6, 7);

  //distROC(cm);

}

void defaultPos(){
        backRight.write(backlegDown);
      backLeft.write(backlegDown);

      frontRight.write(legStraight);
      frontLeft.write(legStraight);

      lcd.clear();
      lcd.setCursor(0, 1);
      lcd.print("     0vo     ");
}

void sit(){
        backRight.write(backlegDown);
      backLeft.write(backlegDown);

      frontRight.write(legStraight);
      frontLeft.write(legStraight);

      lcd.clear();
      lcd.setCursor(0, 1);
      lcd.print("     ovo     ");

      delay(5);
}

void stand(){
        backRight.write(legStraight);
      backLeft.write(legStraight);

      frontRight.write(legStraight);
      frontLeft.write(legStraight);

      lcd.clear();
      lcd.setCursor(0, 1);
      lcd.print("     OvO     ");

      delay(5);
}

void layDown(){
  backRight.write(backlegDown);
      backLeft.write(backlegDown);

      frontRight.write(legDown);
      frontLeft.write(legDown);

      lcd.clear();
      lcd.setCursor(0, 1);
      lcd.print("     -v- ");

      delay(5);
}

void forwardWalk1(){
  //first step
      backRight.write(legStep);
      backLeft.write(legBack);

      frontRight.write(legBack);
      frontLeft.write(legStep);
      delay(5);
      forwardWalk2();
}

void forwardWalk2(){
      //second step
      backRight.write(legBack);
      backLeft.write(legStep);

      frontRight.write(legStep);
      frontLeft.write(legBack);
      delay(5);
      forwardWalk1();

}

void distROC(int cm){
      //Distance ROC
      // measure the ping time in cm
  //cm = 0.01723 * readUltrasonicDistance(6, 7);

  //Serial.print(cm);
  //Serial.println("cm");
  delay(1); // Wait for 1 millisecond(s)


  // subtract the last reading:
  total = total - readings[readIndex];
  // read from the sensor:
  readings[readIndex] = cm;
  // add the reading to the total:
  total = total + readings[readIndex];
  // advance to the next position in the array:
  readIndex = readIndex + 1;

  // if we're at the end of the array...
  if (readIndex >= numReadings) {
    // ...wrap around to the beginning:
    readIndex = 0;
  }


  delay(1);        // delay in between reads for stability


 Serial.println("  ");
 // Serial.println("ROC: ");
  Serial.print( (readings[0] - readings[4] ) / 5 );
}
