# Jams MVP

A simplest possible music player with highest possible coolness factor.

## Functionality

* Upload music files
* Play music files
* Share your collection
* Browse/play other people's collections

### Screens / modules

```
header/address:
    screen select
        home (logged user)
        followed users
    back
    enter user link
        "visit" link
    upload

screens
    first run
        username
        account address
    user profile + list
        user link + copy to clipboard
        follow button
    followed users
        list of recently added tracks (1 per user)
        sorted by most recent additions

footer
    status msg
        errors
    nanos/attos

player
    artist, title, album, release date
```

### Design

[mvp image concepts](https://github.com/JAMSplayer/jams-app/issues/1)

## Technology

### Backend

* Autonomi
* Tauri
* Warp server (for serving audio files to frontend)

#### Data model

Everything is stored in single structure (JSON), account/profile data, songs list and followed users/friends.

Data is synchronized on:

* song upload
* follow another user
* edit user profile

Shareable **links** to user profiles will be just XOR addresses.

**Albums** can be constructed only in the frontend, if multiple songs have same `album` field.

### Frontend

* React
* Tailwind
