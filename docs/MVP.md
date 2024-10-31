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
	create account
		(info message)
		username
		password
		repeat password
		→ show pk
	
	show pk
		for importing to MetaMask or backing it up
	
	log in (when account has already been created)
		ask for password
		→ user profile
	
	settings (when logged in)
		export private key
			→ show pk
	
	sign out button
		→ log in

    user profile
        user link + copy to clipboard
        follow button
        list of songs

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

We don't integrate MetaMask. Instead, **private keys** are kept encrypted by password in application data store. They are created on application launc, and can be exported to use in external wallet, so that funds can be moved to another place. Users should be informed, that this account is meant only for Jams, and it's better not to use it for storing and managing massive funds. If there is a PK in app's data folder, then we ask for password, decrypt the PK and load profile from Autonomi. And if not, then we create one.

### Frontend

* React
* Tailwind
