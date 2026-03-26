# Notes Continuing with This Repo

## General

### Family

- First and last name seprate?
- Add secondary guardian
  - Add relationship tab?
- Drop down for Student Grade
- Drop down for Student School
  - Make it dynamic (based off supply list inputs)?
  - Ability to assign variables on "control page"
- Drop down selection for Time Slot
- Add a boolean for something like `helpedCurrentYear` on the students or something to allow filtering for the families that have students that have yet been helped (couldn't make it to drive or still need supplies)
  - Resets after a year
- etc

## Client-Side

### Add Family (Form)

- `Add Student` back to a row format and not a column
- Add error text at the bottom of inputs when outline is red. User can't tell why its mad.
- Descriptions to form inputs

### Family Card

- Add more spec tests!
- Maybe create better format? (updated it a bit, mostly just student list)

### Add Inventory (Form)

- Make add inventory an array like student to allow operator to input multiple inventory items at a time?
- Add error text at the bottom of inputs when outline is red. User can't tell why its mad.
- Descriptions to form inputs
- Add more validators to component! (its was just quickly added in)

### Home page

Possible things to add to the home page:

- A welcome message
- A brief description of the application and its purpose
- Links to important sections of the application (e.g., dashboard, family management, etc.)
- A call-to-action encouraging users to explore the application further
- Any relevant news or updates about the application
- Contact information for support or feedback

## Server Side

###

## Extra (Thoughts I had While Working)

### Inventory Description Automation

What if we had a database for every possible input for each inventory field? Here me out:

We would allow adding inventory much simplier. Keeping it to text just like `description` and when its entered we created a system that picked apart the word and filed them away into the correct field. Its no tell we wont be able to create every input so when submited their can be a confirmation show of what the computer automated with the ability for the user to update and thus the database will update to include the input as well.
