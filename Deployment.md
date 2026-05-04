# Deployment

## Prerequisites

You will need to have installed:

- [Git](<https://git-scm.com/downloads>)
- [NodeJS](https://nodejs.org/)
- [JavaJDK](https://www.oracle.com/java/technologies/downloads/)
- [Gradle](https://gradle.org/)
- [Cypress](https://cypress.io)
- [Jasmine](https://jasmine.github.io/)
- You will need to have a [DigitalOcean](https://www.digitalocean.com/) account.

## Project Setup

To get started, clone the repository and then navigate to the database directory and run `./mongoseed.sh` then navigate to the client directory and run `npm install` to install the necessary dependencies.

## Running the Project
To run your server you will need to run `./gradlew run`
To run the client, run `ng serve` in the client directory. This will start hosting the site on `localhost:4200` and automatically rebuild and refresh the site when it detects changes.

## Testing

To run the server side tests run `./gradlew test`
To run the unit tests for the project, run `ng test` in the client directory.
To run the end to end tests for the project, run `ng e2e` in the client directory.


## Deploying the Project

This project can be deployed on any web server. We are using [DigitalOcean](https://www.digitalocean.com/).

### Step 1: Creating an account

- Go to [Digital Ocean](https://www.digitalocean.com).
- You _can_ create an account without adding billing information.
- You _cannot_ create any droplets without "activating" your account (by adding billing info).
- it may say that you are being charged with a fee of 10$ but no transaction will actually go through here

### Step 2: Creating a droplet

- Go to
  [this link](https://cloud.digitalocean.com/droplets/new?image=docker-20-04&app=docker&size=s-1vcpu-1gb&options=install_agent).
  It should bring you to the Create Droplets page with the Docker
  marketplace image selected and the $6/month basic plan selected.
  If those marketplace image is not selected, please select it.
  - You then need to upgrade to the ($12/month) as it provides better performance,
  and provides the ammount of space needed to deploy
- Stick with the default datacenter / region (probably one of the U.S. options).
- Scroll down and choose "Password" under Authentication. Enter a password here,
  this will be the password for the `root` user.
  - This should be a good, secure password since it gives access to everything on
    your droplet and anyone can attempt to `ssh` into it. You may wish to use a random
    password generator for this.
  - You can change this password later with the `passwd` command.
- You don't need to add block storage or backups.
- Finally, only make one droplet and choose a name for it.
- It will take a couple seconds to make the droplet.
- You will then be able to see it on your
  [Droplets](https://cloud.digitalocean.com/droplets) page and get the IP for it.

### Step 3: Setting up your droplet and running your project

- SSH to your droplet by running ``ssh root@[droplet ip here]`` (using the IP of your droplet) and enter the password you set.
- When you first log in it'll tell you if there are any updates available. Don't feel
  like you have to do these updates; they should start you off with a pretty up-to-date
  system. If if you want to upgrade your system, you can run `apt update` and then
  `apt upgrade` to apply the updates. There could be some odd questions along the
  way, though, so be prepared to have to do some homework to figure out what
  reasonable responses might be.
- Install `docker-compose` with the command `apt install docker-compose`.
- `git clone` your repository
- `cd` into the newly created directory
- run `./setupdroplet.sh` to go through the initial setup steps
  - It will ask for your email address, which will be used for any relevant alerts about your HTTPS certificate (you probably won't get any emails from them). Entering your email signifies agreement to the [Let's Encrypt Subscriber Agreement](https://letsencrypt.org/documents/2017.11.15-LE-SA-v1.2.pdf) and the [ZeroSSL Terms of Service](https://zerossl.com/terms/) (either one of those providers may be used to setup your certificate).
  - We are using a service called [nip.io](https://nip.io/) to give us the valid domains we need for HTTPS. The script will tell you the `nip.io` address your app will be hosted on. Copy this down for later.
- To build and start your server, run `docker-compose up -d`
  - The `-d` means detached and you can then run `docker-compose logs` to see the output at any time.
  - To stop the containers, run `docker-compose stop`
  - This is going to take a while. You're downloading 3/8ths of the Internet, and
    building everything on a fairly lightweight machine. You shouldn't have to do
    this all that often, but using a higher tier (i.e., more expensive) droplet
    will speed the process up.

## Common tasks

Do all of these from within the base directory of the repo.

### Resetting the database

To clear the current database and have it seeded again:

- `docker-compose down -v` to stop and remove containers and volumes.
- `docker-compose up -d` to build and start the containers again.

### Updating the server or client code

If you have made changes and wish to update what is running on the server:

- `docker-compose down` to stop and remove containers (if you want to also reset the database, use `docker-compose down -v`).
- `git pull` to update the code.
- `docker-compose up --build -d` to rebuild anything that has changed and start the containers.
