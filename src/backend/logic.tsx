import autonomi from '@/backend/autonomi';
import { User } from '@/interfaces/user';


export async function loadUser(): Promise<User> {
  console.log("getting user...");

  var user = await autonomi.readRegister(['user']);
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
  if (await autonomi.createRegister(['user'], user)) {
    return user;
  }
}

export async function saveUser(user: User) {
  console.log("saving user: ", user);
  await autonomi.writeRegister(['user'], user);
}
