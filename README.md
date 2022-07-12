# ProjectDeflector JsClientGame

Hello and welcome to this repo! This repo holds the code that runs on the mobile app for an Android game called *Hit Bounce*

This code is open source to give an overview of what it takes to make a game like this. I do not expect contributions unless you're particulary excited about something, but I highly encourage you to look around and try to run the code and mess around with it.

You can find the game on the [Play Store](https://play.google.com/store/apps/details?id=com.hitbounce.game)

## What For?

This is a side-project. It's also a complete app that is on the Play Store and has servers backing it, meaning this is a non-trivial side-project. I had the idea for this game in my head for a while and wanted to get it out there. So this project is both a way to practice non-trivial software engineering and a way to materialize my idea.

## Video Walkthrough

For a quick look at the game, this is the video used on the Play Store

[![Hit Bounce Video](/HitBouncePlayer.png)](https://www.youtube.com/watch?v=DpgU16Aww_w "Hit Bounce")

## Project Overview (All Hit Bounce repos)

The whole app consists of several projects, this being one piece of the whole thing. This is an overview of the repos:

- JsClientGame (this repo): the code that runs on the Android app
- [Infra](https://github.com/OsamaElHariri/ProjectDeflector_Infra): handles the deployment, the load balancer, and some utils for local development
- [Game Server](https://github.com/OsamaElHariri/ProjectDeflector_GameServer): handles game states and moves the games forward
- [Match Making Server](https://github.com/OsamaElHariri/ProjectDeflector_MatchMakingServer): handles queueing players and matching them together. Once matched, it sends them off to the Game Server
- [User Server](https://github.com/OsamaElHariri/ProjectDeflector_UserServer): handles user information and basic stats. This game does not store personal info so this server mainly keeps track of UUIDs and which color should the player be
- [Real Time Server](https://github.com/OsamaElHariri/ProjectDeflector_RealTimeServer): a websocket server


## Project Overview (this repo)

This is a React Native project. The state of the game is kept in the file called `GameStateProvider.tsx`. The state is kept in an RxJS BehaviorSubject, and is updated when the state changes. Listeners of this BehaviorSubject then update their own state accordingly (eg. the ScoreBar updates the score by animating and changing the visuals, or the ShuffleButton disables itself).


## Running the App

Before running this app, you'll need to have the backend services up and running. How to do that is explained in the Infra repo.

Once the backend services are up and running, you need to replace `BASE_DOMAIN` in the file `src/network/apiClient.ts` with your internal IP (the value there now is just my internal IP at the time of writing this). This will allow you to run the app on your physical device and interact with the servers.

\* On linux, I get my internal IP using the hostname -I command

Once that is done, first you need to install the dependencies

```
npm i
```

Then you need to run two commands on two different terminals. On one terminal, run the React Native server

```
npm start
```

Keep that running, and on a separate terminal (while having your Android phone plugged in or a virtual device setup), run this command

```
npm run android
```