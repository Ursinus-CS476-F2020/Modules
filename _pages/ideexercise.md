---
layout: exercise
permalink: /Modules/IDE/Exercise
title: "CS173: Intro to Computer Science - Introduction to the NetBeans IDE"
excerpt: "CS173: Intro to Computer Science - Introduction to the NetBeans IDE"

info:
  prev: "./Module"
  instructions: "Modify the MyFirstProgram.java file to print hello to yourself (Hello followed by your name)."
  
processor:  
  correctfeedback: "Correct!!" 
  incorrectfeedback: "Try again"
  submitformlink: "https://www.google.com/webhp?igu=1"
  feedbackprocess: | 
    var pos = feedbackString.split();
  correctcheck: |
    pos.length > 1 && pos[0].equalsIgnoreCase("Hello")
 
files:
  - filename: "MyFirstProgram.java"
    name: myfirstprogram
    ismain: false
    isreadonly: false
    code: | 
        public class MyFirstProgram {
            public void main() {
                System.out.println("Hello");
            }
        }    

  - filename: "Excerpt from Main.java: body of main() function"
    ismain: true
    name: main
    isreadonly: false
    code: |
        File f = new File();
        f.x = 10;
        f.y = 5;
        f.print();
  
---