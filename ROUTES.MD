This file shows this project's api/server routes.

The below information is structured thus:

```
Prefix
HTTP Verb    URI Pattern    serverController#action
HTTP Verb    URI Pattern    serverController#action
etc.
```

## Backend routes:

```
auth routes
NOTE: No /api/ , no controllers.  All in server.js and config/

POST  /login
POST  /signup
GET   /logout
GET   /auth/google
GET   /auth/google/callback
GET   /auth/facebook
GET   /auth/facebook/callback

"Index"
GET  /api/       indexController#getIndex
GET  /api/check  indexController#isLoggedIn
GET  /api/info   indexController#getInfo

dest
GET  /api/dest/            destController#getDestinations
GET  /api/dest/venues      destController#getVenues
GET  /api/dest/venues/info destController#getDetailedInfo

group
GET     /api/group/       groupController#getUserGroups
GET     /api/group/users  groupController#getMembers
GET     /api/group/all    groupController#getInfo
POST    /api/group/       groupController#createGroup
POST    /api/group/set    groupController#setDestination
POST    /api/group/add    groupController#addMember
DELETE  /api/group/user   groupController#removeMember

rating
GET   /api/rating/         ratingController#getRatings
POST  /api/rating/         ratingController#addOrUpdateRating
```

## Front-end routes:

### Some of the following API calls are seen on the [coggle](https://coggle.it/diagram/VnER1WcWk3oeczUt)

## DEST
GET  /api/dest/        destController#getDestinations
  Get basic city info
  @query {int} Max num destinations to return
  /* @response {object} has:
      @prop {object} meta. Has:
        @prop {int} code.  HTTP response code.
      @prop {object} response. Is the object of interest, having:
        @prop {int} total_records. Number of destinations on TripExpert.
        @prop {array} destinations. The destination objects.
  */

GET  /api/dest/venues  destController#getVenues
  Get all venues at a specific destination
  @query {int} destinationId
  @response {array} Venue objects

GET  /api/dest/venues/info  destController#getDetailedInfo
  Get specific information of a specific venue
  @query {int} venueId
  @response {object} venue information


## GROUP
GET  /api/group  groupController#
  Get all groups to select groups from dropdown
  query: user object
  response: array of group objects

POST  /api/group  groupController#createGroup
  Create group
  @data
    @prop {str} groupName.  Group title.
    @prop {int} destinationId.
    @prop {int} userId.
  @response {object} new group

POST  /api/group
  Add participant (tentative)
  data: group object, user object, participant email


## ITIN
GET  /api/itin
  Get all itinerary
  query: groupId, userId
  response: array of venue objects

POST  /api/itin
  Add to itinerary
  data: groupId, userId

POST  /api/itin
  Add dates to itinerary
  data: groupId, userId, fromDate, toDate


## RATINGS
GET  /api/rating
  Get all ratings in current group
  query: userId, groupId
  response: array of venue objects.
    each venue has an array like:
      [{ user: userId, rating: rating }, { user: userId, rating: rating }]

POST  /api/rating
  Creates a rating. Adds to user and group ratings
  ALSO modifies ratings
  data: userId, groupId, rating, venueInfo
