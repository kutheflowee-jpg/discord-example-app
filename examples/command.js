import 'dotenv/config';
import { DiscordRequest } from '../utils.js';

async function installCommand(commandBody) {
  const appId = process.env.APP_ID;
  const globalEndpoint = `applications/${appId}/commands`;

  try {
    const res = await DiscordRequest(globalEndpoint, {
      method: 'POST',
      body: commandBody,
    });
    const resultJson = await res.json();
    console.log(`Successfully registered GLOBAL command: /${commandBody.name}`);
  } catch (err) {
    console.error(`Error installing command /${commandBody.name}: `, err);
  }
}

async function registerAll() {
  console.log('Registering global application commands across Discord database hubs...');

  await installCommand({
    name: 'test',
    description: 'Just your average command',
    type: 1,
  });

  await installCommand({
    name: 'severed',
    description: 'Log a Roblox moderation action layout',
    type: 1,
    default_member_permissions: "8", // FIXED: Blocks anyone who isn't a server Admin!
    options: [
      {
        type: 3,
        name: 'userid',
        description: 'The target Roblox Username or User ID',
        required: true,
      }
    ]
  });

  await installCommand({
    name: 'announce',
    description: 'Send a clean block embed announcement message',
    type: 1,
    default_member_permissions: "8", // FIXED: Blocks anyone who isn't a server Admin!
    options: [
      {
        type: 3,
        name: 'message',
        description: 'The content string to embed and broadcast',
        required: true,
      }
    ]
  });
}

registerAll();
