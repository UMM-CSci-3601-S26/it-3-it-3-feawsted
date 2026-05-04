
## Table of Contents
- [Table of Contents](#table-of-contents)
- [Getting Started](#getting-started)
- [What is Ready4Supplies](#what-is-ready4supplies)
- [Features](#features)
- [Using Ready4Supplies](#using-ready4supplies)
  - [As an Organizer/Volunteer](#as-an-organizervolunteer)
  - [As a Parent/Guardian](#as-a-parentguardian)
- [Documentation](#documentation)
- [Testing and Continuous Integration](#testing-and-continuous-integration)
- [Browser Support](#browser-support)
- [Authors](#authors)
- [Built With](#built-with)

## Getting Started

Start playing now at [Ready4Supplies](https://147.182.184.162.nip.io)!

## What is Ready4Supplies

<!-- EDIT THIS -->
Ready4Supplies is an inventory and management assistant website. It is used to streamline efficiency with inventory, and helping families find their supplies quicker.
For organizers and volunteers it can be used to help organize the drive, get families set up, and edit the database.

## Features
- **Dashboard**
The Dashboard page displays total families, how many students per school, and how many students per grade currently enrolled
to participate in the school supply drive.
- **Checklists**
The Checklists page allows users to view all student checklists and filter for those checklists, using name, school, and grade inputs. The ability to export those checklists via pdf individually, collectively, or based on filters is also provided.
- **Families**
The Families page lets organizers add families to the drive as well as view existing ones, and edit existing families
- **Inventory**
The Inventory organizers a 
- **Purchase List**
Words here...
- **Supply List**
Words here...
- **Settings**
Words here...

## Using Ready4Supplies
- **Checklists**
Words here...
- **Families**
Words here...
- **Inventory**
Words here...
- **Purchase List**
Words here...
- **Supply List**
Words here...
- **Settings**
Words here...

### As an Organizer/Volunteer

<!--(Have screenshot of sidebar menu, and another with the 'Add New Class' window open, or probably just a gif of you making a class, starting from the home screen without the sidebar open)-->
The first thing a teacher will want to do is make a classroom. The way to do this is to open the sidebar and click the plus symbol next to 'Classes'. Then, all they have to do is type their desired class name, click 'Add Class', and it will appear in the sidebar menu. 


<!--(Have screenshot of newly made classroom)-->
From here, the 'Sharing' section includes everything a teacher will need to bring students into their classroom. Either the students can use their phones to scan the QR code, or the teacher can send students the Join Code for them to copy into their browser. A teacher can also kick any students in their class, or make any student a teacher.

<!--(Have gif of adding a deck in a classroom)-->
To make a deck, click the circular plus button in the bottom-right corner of the screen. Then, simply type the deck name and click 'Add Deck' and then deck will appear under the class title.

<!--(Have gif of making a card in said deck)-->
From within this deck, click the same plus button to add cards to this deck.
<!--(Have screenshot of menu)-->
It is from here that the teacher can also choose to delete the deck, move the deck to another class, or enable students the ability to add cards.

<!--(Have screenshot of play buttons)-->
Either from within the deck, or viewing it from the deck list, the teacher can begin a game. They can click 'Invite to Game', which gives a join code that students can use. From here the game has begun. To give players a hint they can click the 'Hint?' button which will highlight a random hint for them, and send that hint to the players. If the players guess the word correctly, the teacher can click 'Got It!', which will increment the points, as well as slide to the next card.

At any point in the game, teachers can flip through any cards in the deck, as well as go back to others, and the amount of hints and points remaining for any given card will remain the same. 

### As a Parent/Guardian

The first thing a student will want to do is log-in with their Google account. This will allow them to create and manage their own decks on the 'My Decks' page.

After they have logged-in, a student can join a classroom by scanning a QR-code or by receiving a join link from a teacher. Once they have joined a class, students will only be able to see the deck list and the list of other students. From here they can either look at the decks in the deck list, play with a deck, or choose to remove themselves from the class.

<!--(Have screenshot of player view of a sage game, or probably just a markdown table of two gifs side by side; one of the host, one of the player)-->
If a teacher is running a game of SAGE, a student can join by either scanning the QR-code or entering the join code on the 'Join Game' page. Once they are in the game, a student will see just the word of the given card. A student can either guess the meaning of the word displayed or ask for a hint from the teacher.

## Documentation

- [Development and Deployment Instructions](docs/dev-and-deploy.md)
- [Teacher Guide](docs/teachers-guide.pdf)
- [Brochure](docs/sage-brochure/sage-brochure.pdf)


## Testing and Continuous Integration

Ready4Supplies uses Jasmine and Karma for unit testing through the Angular CLI. TravisCI is configured to run these tests.

## Browser Support

SAGE works great in recent versions of Chrome and Edge.
There are some issues with Safari and Firefox at the moment.

## Authors

SAGE was build by a team of students for a software design class at the University of Minnesota Morris. See the GitHub [contributors page](https://github.com/UMM-CSci-3601-F17/sage-team-cheezit/graphs/contributors).


## Built With

SAGE is powered by:
- [Angular](https://angular.io/)
- [Angular Material](https://material.angular.io/)
- [Teradata Covalent](https://teradata.github.io/covalent/)
- [Firebase](https://firebase.google.com/)
    - [Cloud Firestore](https://firebase.google.com/products/firestore/)
    - [Realtime Database](https://firebase.google.com/products/realtime-database/)
    - [Authentication](https://firebase.google.com/products/auth/)
    - [Hosting](https://firebase.google.com/products/hosting/)
- [AngularFire](https://github.com/angular/angularfire2)

Other libraries used:
- [ng2-page-slider](https://github.com/KeatonTech/Angular-2-Page-Slider)
- [ng2-rx-componentdestroyed](https://github.com/w11k/ng2-rx-componentdestroyed)
- [ngx-qrcode2](https://github.com/techiediaries/ngx-qrcode)
- [ngx-pipes](https://github.com/danrevah/ngx-pipes)
- [ngx-clipboard](https://github.com/maxisam/ngx-clipboard)
- [time-ago-pipe](https://github.com/AndrewPoyntz/time-ago-pipe)

Tools:
- [Angular CLI](https://cli.angular.io/)
- [Yarn](https://yarnpkg.com/)
- [TypeScript](https://www.typescriptlang.org/)
- [Karma](https://karma-runner.github.io/1.0/index.html)
- [Jasmine](https://jasmine.github.io/)
