/** More logical puzzles and riddles. */
import { m, m2, m3 } from "../build";
import type { ExtraSubject } from "./merge";

const extra: ExtraSubject = {
  "logical-puzzles": [
    m2("A clock shows 3:15. What is the angle between the hour and minute hands?", ["7.5°", "0°", "15°", "30°"], "The minute hand is at 90°. The hour hand is at 90° + 15 × 0.5° = 97.5°. Difference: 7.5°.", { check: "abs(30*3 - 5.5*15)" }),
    m2("If you rearrange the letters of 'LISTEN', you can make which word?", ["SILENT", "SILVER", "LISTED", "STOLEN"], "LISTEN and SILENT use the same six letters (so does TINSEL)."),
    m2("How many times does the digit 7 appear in the numbers from 1 to 100?", ["20", "10", "11", "19"], "Ten times in the units place (7, 17, …, 97) and ten times in the tens place (70–79).", { check: "20" }),
    m2("A man has 3 daughters. Each daughter has one brother. How many children does he have?", ["4", "6", "3", "5"], "All three daughters share the same one brother: 3 + 1 = 4."),
    m2("If 3 cats catch 3 mice in 3 minutes, how many cats are needed to catch 100 mice in 100 minutes?", ["3", "100", "33", "300"], "Each cat catches one mouse every 3 minutes; 3 cats catch 100 mice in 100 minutes."),
    m3("Two trains are 100 km apart on the same track, approaching each other at 50 km/h each. A bird flies back and forth between them at 75 km/h until they meet. How far does the bird fly?", ["75 km", "100 km", "50 km", "150 km"], "The trains meet in 100 / (50 + 50) = 1 hour, so the bird flies 75 km.", { check: "75*100/(50+50)" }),
    m2("Which is heavier: a kilogram of iron or a kilogram of cotton?", ["Both weigh the same", "Iron", "Cotton", "It depends on the weather"], "Both weigh one kilogram."),
    m2("A box contains 5 red and 5 blue socks. In the dark, what is the minimum number you must take out to be sure of a matching pair?", ["3", "2", "6", "5"], "With two colours, the third sock must match one of the first two (pigeonhole principle)."),
    m3("You have 8 identical-looking balls; one is heavier. With a simple balance, what is the minimum number of weighings needed to find it for certain?", ["2", "3", "1", "4"], "Weigh 3 vs 3. If balanced, weigh the remaining 2. If not, take the heavier 3 and weigh 1 vs 1."),
    m2("A brick weighs 1 kg plus half a brick. How much does the brick weigh?", ["2 kg", "1.5 kg", "1 kg", "3 kg"], "w = 1 + w/2, so w/2 = 1 and w = 2 kg.", { check: "2" }),
    m2("How many months have 28 days?", ["All 12", "1", "2", "6"], "Every month has at least 28 days."),
    m3("A rope ladder hangs over a ship's side with its bottom rung touching the water. Rungs are 20 cm apart. If the tide rises by 60 cm, how many rungs are under water?", ["None (or just the bottom one)", "3", "4", "2"], "The ship floats and rises with the tide, so the ladder stays in the same position relative to the water."),
    m2("If yesterday was Sunday, what day will it be the day after tomorrow?", ["Wednesday", "Tuesday", "Thursday", "Monday"], "Today is Monday, tomorrow Tuesday, the day after tomorrow Wednesday."),
    m3("Three switches outside a room control three bulbs inside. You may enter the room only once. How can you tell which switch controls which bulb?", ["Turn on switch 1 for a few minutes, turn it off, turn on switch 2, then enter: lit = 2, warm and off = 1, cold and off = 3", "Turn all switches on and enter", "Turn on one switch and guess the rest", "It cannot be done"], "Heat from a bulb that was on gives a third piece of information."),
  ],

  riddles: [
    m("What has to be broken before you can use it?", ["An egg", "A promise", "A glass", "A record"], "An egg must be cracked open to use it."),
    m("What is full of holes but still holds water?", ["A sponge", "A net", "A bucket", "A sieve"], "A sponge soaks up water through its holes."),
    m("What can you catch but not throw?", ["A cold", "A ball", "A fish", "A bus"], "You 'catch' a cold but cannot throw it."),
    m("What has one eye but cannot see?", ["A needle", "A storm", "A potato", "A camera"], "A needle has an eye for the thread (a storm also has an 'eye')."),
    m("What belongs to you, but other people use it more than you do?", ["Your name", "Your phone", "Your house", "Your car"], "People call you by your name more often than you say it."),
    m("What has legs but does not walk?", ["A table", "A dog", "A spider", "A runner"], "Tables and chairs have legs."),
    m("What runs but never walks, has a mouth but never talks?", ["A river", "A clock", "A car", "A tap"], "A river runs and has a mouth where it meets the sea."),
    m("What can fill a room but takes up no space?", ["Light", "Air", "Water", "Furniture"], "Light fills a room but occupies no space."),
    m("What is always in front of you but cannot be seen?", ["The future", "Your nose", "The sky", "Air"], "The future is ahead but invisible."),
    m("What goes up and down but does not move?", ["A staircase", "A lift", "A ball", "A kite"], "A staircase goes up and down without moving."),
    m2("The person who makes it sells it. The person who buys it never uses it. The person who uses it never knows it. What is it?", ["A coffin", "A gift", "A ticket", "A medicine"], "The user of a coffin cannot know about it."),
    m2("I speak without a mouth and hear without ears. I have no body, but I come alive with the wind. What am I?", ["An echo", "A radio", "A ghost", "A bell"], "An echo repeats sounds."),
  ],
};

export default extra;
