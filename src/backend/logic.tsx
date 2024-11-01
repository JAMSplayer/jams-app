import { receive, clientAddress, balance } from '@/backend/autonomi';
import { readRegister, createRegister, writeRegister } from '@/backend/autonomi';
import { fetch } from '@tauri-apps/plugin-http';
import { User } from '@/interfaces/user';

export async function fundsFromFaucet() {
  const addressHex = await clientAddress();
  console.log(addressHex);
  const url = 'http://127.0.0.1:8000/' + addressHex;
  console.log(url);

  const response = await fetch(url, {responseType: 2})
  console.log(response);
  const transfer = await (await response.blob()).text()
  console.log(transfer);

  console.log(await balance());
  
  var ret = await receive(transfer).catch(e => {
    console.log(e);
  });
  console.log("received.");

  console.log(await balance());
}

export async function loadUser(): Promise<User> {
  console.log("getting user...");

  var user = await readRegister(['user']);
  if (user !== undefined) {
    console.log("user: ", user);
    return user;
  }

  console.error("error getting user.");

  var user = {
    nickname: '',
    description: '',
    songs: [],
    date_created: new Date(),
    date_updated: new Date(),
  }

  console.log("creating new user: ", user);
  if (await createRegister(['user'], user)) {
    return user;
  }
}

export async function saveUser(user: User) {
  console.log("saving user: ", user);
  await writeRegister(['user'], user);
}
