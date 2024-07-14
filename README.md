
# WanderLust

WanderLust is a full-featured web application designed to replicate the core functionalities of Airbnb, allowing users to list, discover, and book unique accommodations around the world. Built using the Tech stacks Like EJS, MongoDB, Express.js, and Node.js, WanderLust aims to provide a smooth and engaging experience for both hosts and guests.



## Features

- User Authentication: Secure sign-up and log-in functionality using JWT for session management.
- Host Management:
    - Hosts can create, update, and delete property listings.
    - Listings include detailed descriptions, pricing, and photo uploads.
- Reviews and Ratings: Guests can leave reviews and ratings for    properties they have stayed at, enhancing the credibility and reliability of listings.
- User Profiles: Users can manage their profile information and view their activity history.


## Installation

Clone the repository:

```bash
  git clone https://github.com/RishiTirpude19/mybnb.git
  cd WanderLust
```

Install dependencies:

```bash
  npm Install
```   
## Run Locally

Start the application:

```bash
  node app.js
```


## Usage

Register and Login:

- Registration: New users can sign up with an email and password. The application validates the email address and ensures password security.

- Login: Returning users can log in with their registered email and password. JWT tokens manage session validity.

Host Features:

- Create Listings: Hosts can create new property listings by providing essential details such as title, description, location, price, and photos.

- Manage Listings: Hosts can edit details of their existing listings or remove them from the platform if no longer available.

Guest Features:

- Review and Rate: Guests can leave reviews and ratings, providing feedback to hosts and helping future guests make informed decisions.
