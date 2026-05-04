
## Table of Contents
- [Table of Contents](#table-of-contents)
- [Getting Started](#getting-started)
- [What is Ready4Supplies](#what-is-ready4supplies)
- [Features](#features)
- [Using Ready4Supplies](#using-ready4supplies)
- [Documentation](#documentation)
- [Testing and Continuous Integration](#testing-and-continuous-integration)
- [Browser Support](#browser-support)
- [Authors](#authors)
- [Built With](#built-with)

## Getting Started

Start planning for the next supply drive now at [Ready4Supplies](https://147.182.184.162.nip.io)!

## What is Ready4Supplies

<!-- EDIT THIS -->
Ready4Supplies is an inventory and management assistant website designed to  streamline efficiency of school supply drives through inventory management. By using this software, organizers can work to help families receive needed supplies quicker.
For organizers and volunteers it can be used to help organize the drive, get families set up, and ultimately deliver items to students in need.

## Features

- **Dashboard**:
The Dashboard page displays total families, how many students per school, and how many students per grade currently enrolled
to participate in the school supply drive.
- **Checklists:**
The Checklists page allows users to view all student checklists and filter for those checklists, using name, school, and grade inputs. The ability to export those checklists via pdf individually, collectively, or based on filters is also provided.
- **Families:**
The Families page lets organizers add families to the drive as well as view existing ones, and edit existing families.
- **Inventory:**
The Inventory page allows organizer to view current items in inventory, as well as add, edit, and delete items. From here, you can filter for items based on item name, brand, color, size, type, style, material, and bin. Items can also be re-ordered based on characteristics, and the number displayed limited.
- **Purchase List:**
The Purchase List page lets organizers generate a list of all inventory items and how many items are needed to complete all current checklists for the students meaning that there are enough supplies for everybody. Organizers can also edit the priority of an item in the purchase list (low, medium, high). There are 2 filters at the top of the page that lets people search by priority or item.
- **Supply Lists:**
The Supply Lists page allows organizers to see the supply lists for each school and grade. These supply lists can be filtered based on school, grade, item, and item attributes (like brand, color, size, type, material, and style). Items for a given supply list can also be added, edited, and deleted. You can also manually add items to individual supply lists.
- **Settings:**
The Settings page allows organizers to edit schools enrolled in the school drive program, time availability windows, and item order to rearrange checklist order to correspond to the supply drive.

## Using Ready4Supplies

- **Checklists**:
Checklists are based on provided supply lists and family information. To generate checklists, click the "Generate Checklists" button. In order to see applied filters to checklists, the user must click generate checklists after providing inputs to update displayed checklists. To reset filter, click the clear button. To export checklists, "Export Filtered Checklists" and "Export All Checklists" buttons are located at the bottom right-hand side of the screen. To export checklists individually, interact with the "Export Checklist" button provided for each student underneath their corresponding information.Starting at the top of checklist
- **Families:**
To create a new family, click the "+" button in the lower right-hand side corner. From here, the form will require inputs for at least one guardian figure, email, address, time availability, and students enrolled. Student information will include corresponding school, grade, and requested items. Although this action can be cancelled at any time via the "Cancel" button, after filling out the required inputs, the "Add Family" button becomes available. By clicking on the pencil in the top right corner of any given family card, users can edit family information when needed.
- **Inventory:**
To add a new inventory item, click the red "+" button in the lower right-hand side. After filling in necessary inputs (like item name and count) and clicking the three dots under the actions column, a save option appears. Items and attributes can be edited by clicking the three dots under the actions column and saved in the same manner. To delete an item, click the action icon again, and confirm this action to do so. By providing inputs to any of the given filter intakes, the inventory grid, will adjust to display corresponding items. Filters can be cleared or reset by clicking the "Clear" button. Items can also be reordered by interacting with the arrow that appears beside the column header when the header is hovered over. Lastly, at the bottom of the page, the number of items displayed can be limited based on preference.
- **Purchase List:**
Purchase List is generated based on student checklists. To generate the purchase list, click the "Generate Purchase List" button. In order to see applied filters, simply provide input for item or click an dropdown option for priority. Item priority can be assigned by clicking one of the dropdown options (low, medium, and high) for a given item. Please note that when the purchase list is regenerated, the item priority is also reset.
- **Supply List:**
Supply lists are organized based on schools and then grade. By clicking a corresponding grade under a provided school, a window will expand to show item provided in that given supply list. To add an item to a given supply list, click the "+ Add Item" button and fill in the required information. This action can be cancelled with the "Cancel" button, reset with the "Clear" button, and saved with the "Add Item" button. There is also an autofill feature, that allows user to paste or type in an item and its description, and the code will predict the values of defined item characteristics. To edit an item, click the pencil next to it, and confirm or cancel these changes by clicking the checkmark or "x" symbol. To delete an item from a supply list, click the red trash icon and confirm this action. By providing input for a given filter, supply lists will be displayed accordingly. These filtered can be reset and cleared bu clicking the "Clear" button. The "Expand All" button expands all supply lists tabs while the "Collapse All" button collapses all supply list tabs.
- **Settings:**
Schools included in the supply drive program, can be adjusted on the settings page under the "Schools" tab. After providing the school name, users can click the "add School" button to include that school in the database. This allows family forums to include the added school as one of the dropdown school options provided for students. Under the "Time Availability" tab, organizer can adjust time slots for "Early Morning," "Late Morning," "Early Afternoon," and "Late Afternoon," after providing a new timeslot (with the required format eg. 12:00-1:00 PM) and clicking the "Save Time Availability" button. Under the "Drive Order" tab, organizer can rearrange the order of items on checklists so that it matches the order of the school supply drive in person. To adjust the checklist order, users can drag items between "Staged," "Unstaged," and "Not Given" sections. The "Staged" items are applied on checklists in the exact order provided, while unstaged items are appended after staged items. Items that are listed in the "Not Given" section will be excluded from checklists. To save supply order changes, click the "Save Drive Order." The "Save & Generate Checklists" button will save the supply order of checklists and redirect users to the checklists page, initiating the "Generate Checklists" button.

## Documentation

- [Development and Deployment Instructions](Deployment.md)
- [Road Map](RoadMap.md)
- [Brochure](https://drive.google.com/file/d/1CH7MrlmHGA-FHaOAuLMN-sCTBMYdRtaj/view?usp=sharing) this will open in your web browser

## Testing and Continuous Integration

Ready4Supplies uses Jasmine and Karma for unit testing through the Angular CLI.

## Browser Support

Ready4Supplies is seemingly compatible in recent versions of Chrome, Edge, Safari, and Firefox. However it works best in Chrome browsers.

## Authors

Ready4Supplies was build by a team of students for CSCI 3601: Software Design and Development, a college course at the University of Minnesota Morris. See the GitHub [contributors page](https://github.com/UMM-CSci-3601-S26/it-3-it-3-feawsted/graphs/contributors).


## Built With

Ready4Supplies is powered by:
- [Angular](https://angular.io/)
- [Angular Material](https://material.angular.io/)

Tools:
- [Angular CLI](https://cli.angular.io/)
- [TypeScript](https://www.typescriptlang.org/)
- [Karma](https://karma-runner.github.io/1.0/index.html)
- [Jasmine](https://jasmine.github.io/)
