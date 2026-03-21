# Use GitHub Projects to support Agile development <!-- omit in toc -->

We'll be using [GitHub Projects](https://docs.github.com/en/issues/planning-and-tracking-with-projects) to augment the standard GitHub issues
system with nifty powers to aid in Agile estimating,
planning, tracking, and development.
Before you actually start _coding_ on any part of the lab, you
should spend some time using issues and GitHub Projects to capture and estimate
issues and do some planning.

## Setting a milestone

- [ ] 1. Go to the `Issues` tab for your repository
- [ ] 2. Near the green `New issue` button, there is a button-like thing that says `Milestones` (click it)
- [ ] 3. Click the green `New milestone` button
- [ ] 4. Create a milestone for the lab that uses the lab's due date
    1. If you'd like to make multiple, smaller milestones, you may do so
    2. You can write in other information if you'd like, but at least include the one milestone for the lab's due date

Once you have created a milestone, you will be ready to create a GitHub Projects board to act as your visual workspace that is connected to your GitHub repository.

> In labs and the project iterations, you'll need to create several epics, one for each major feature; implementing most epics will have at three parts that together "slice the cake":
>
> - Implementing the server-side functionality (e.g., adding support for a new API endpoint
>     to the Javalin server code and writing JUnit tests for that functionality).
>
> - Adding the client-side functionality that allows users to access that new server-side work, (e.g.,
>     adding elements including Angular components to the website that allow a user
> to find todos with certain filters activated and writing Karma tests for the components).
>
> - Creating end-to-end (E2E) tests in Cypress that check the functionality from the client all the way through
> to the database and back (e.g., using automated tests to check that when a user selects the checkmark by the
> category filter, the correct query parameters are set and only todos of the correct category are visible).
>
> It is important for your issues to fully slice the cake. For each epic you should add the issues (tasks) that you think you'll need to complete to provide a full version of this feature.
>
> :warning: One thing you should **not** do is create separate tasks for things like unit tests
> or refactoring. Those activities should be "baked in" to your work flow, and not considered
> separate (and therefore to some degree optional) activities.

## Creating a GitHub Projects board

- [ ] 1. Click the `Projects` tab on your GitHub repository
- [ ] 2. Select the green `+ New Project` button
- [ ] 3. In the popup dialog, choose the `Feature release` template
- [ ] 4. Use the text box at the top of the popup dialog to give your project a reasonable name
- [ ] 5. Click the green `Create` button
- [ ] 6. Create drafts for each lab task in the coding part of the lab
  1. Select the next available text box on the project board
  2. Type the name of your task and press enter
  3. Repeat until all of your tasks have been entered as drafts
  Your screen should look something like this:
  ![Image](https://github.com/user-attachments/assets/2a4e044d-adfb-4842-a35d-0232dab04f80)
- [ ] 7. Now it is time to convert your drafts to issues and link them to your repository
  1. Hover over your next unconverted draft task and click the down arrow on the left of the line (visible near the first issue listed in the image below)
  2. Select `Convert to issue` from the dropdown menu
  3. Search for _your_ repository in the dropdown menu and select it ( :warning: Be careful to choose _your_ repository)
  4. Repeat this for each of your drafts so each of them now has a green circle icon to the left of the title
  Your project board should look something like this:
  ![Image](https://github.com/user-attachments/assets/b4015b48-78fd-40b7-a360-62c08b15fa1f)

## Making sure your project is linked to your repository

GitHub has somewhat inconsistent behavior as far as whether or not linking of the GitHub Project to your specific repository actually happens automatically or not. Since we want to be sure you are having a good experience using GitHub Projects, we are providing some guidance about how to be sure the GitHub Project you made is linked to _your_ team's repository.

- [ ] 1. Navigate back to your repository
- [ ] 2. Click the `Projects` tab on your GitHub repository
- [ ] 3. You should now see the project you just made
- [ ] 4. Select the `Link a Project` button
- [ ] 5. Make sure your project has a checked box in the dropdown
- [ ] 6. Now go to the `Issues` tab in you repository and make sure you have all the issues you added to your project

## Using the project board  

The view that you see will have several views, each focused on a
different way of thinking about the state of your project.

If you haven't already assigned estimates as you went along, now is a good time to think about how difficult you think each task will be and put estimates on each issue.
Once you've created and estimated all the issues, you
should think about which ones you think you can reasonably
do in this lab. This could be all of them, but it doesn't
have to be. You can always add issues to this epic as
things progress, and in general customers would rather see
the set of issues you expect to complete in this epic
_increase_ rather than _decrease_, so being conservative in
your initial planning is probably a Good Thing.

You should move the issues you really expect to do into the `Ready`
track, leaving all the other issues (that you may
or may not do) in the `Backlog` track.

You'll then need to keep an eye on your board throughout the
lab, using it to guide your decisions about what to work on,
updating issues as you make progress, etc. When you start work
on an issue, move it to the "In progress" track.

Whenever you sit down to work on the project, you should be
clearly working on a specific issue. If you feel like there's
something that _needs_ to be done but isn't in an issue, you
should make an issue for that before you start working on it.

When you start work on a new issue, you should create a
feature branch for that issue, and commit your work on that
issue to that branch. Commit messages should refer to that
issue (by number, e.g., `Issue #8`) so GitHub can auto-link
the commits to that issue for you.

When you feel like an issue is complete

- Move that card to the `In review` track
- Issue a Pull Request from your feature branch onto your master branch

Then step away from that issue for a while,
either by working on a different part of the lab, or by
doing something unrelated to Software Design. Then come back
back to that _as a team_ and review the requirements
described in the issue and compare them to the functionality
you implemented. Is the issue _done done_? Are there solid
and complete tests that back up the work? Can you break it?
Have you tried? Would you bet your career (or at least your
next raise) on this working in a customer demo or out in the
field?

If you find bugs, document them, either in the existing issue, or through new issues. Then go back to working in
the feature branch for that issue, and repeat the whole
process.

Once the issue passes review, you should

- Merge the associated feature branch into master by accepting the (perhaps modified) pull request
- Move the issue to the `Done` track (or, fee free to create more tracks as you see fit)
- There are also ways to automate the moves through the tracks based on what's happening in GitHub
