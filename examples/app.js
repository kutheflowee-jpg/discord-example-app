import 'dotenv/config';
import express from 'express';
import { InteractionType, InteractionResponseType, verifyKeyMiddleware } from 'discord-interactions';
import { DiscordRequest } from '../utils.js';

// Create and configure express app
const app = express();

app.post('/interactions', verifyKeyMiddleware(process.env.PUBLIC_KEY), async function (req, res) {
  // Interaction type and data
  const { type, data } = req.body;

  /**
   * Handle slash command requests
   */
  if (type === InteractionType.APPLICATION_COMMAND) {
    // Robust parsing setup to safely extract parameters
    const interactionData = data || req.body.data;
    if (!interactionData) {
      console.error("❌ Dropped Interaction: No structural data payload found.");
      return res.status(400).send('Bad Request');
    }

    const { name } = interactionData;
    console.log(`📡 Intercepted system command execution call: /${name}`);

    // 1. Your original test command logic
    if (name === 'test') {
      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: { content: 'A wild message appeared' },
      });
    }

        // 2. Custom Roblox /severed command logic (Streamlined: Fields Array Removed)
    if (name === 'severed') {
      const optionsArray = interactionData.options || [];
      const userIdOption = optionsArray.find(opt => opt.name === 'userid');
      let targetInput = userIdOption ? userIdOption.value : 'Unknown User';
      let resolvedUsername = targetInput;

      // Checks if the user input text is a pure number
      if (/^\d+\$/.test(targetInput)) {
        try {
          const robloxResponse = await fetch(`https://roblox.com{targetInput}`);
          if (robloxResponse.ok) {
            const robloxData = await robloxResponse.json();
            if (robloxData && robloxData.name) {
              resolvedUsername = robloxData.name;
            }
          }
        } catch (apiError) {
          console.error("❌ Failed to communicate with Roblox verification endpoint: ", apiError);
        }
      }

      // Grab the active command text channel origin location context ID
      const currentChannelId = req.body.channel_id;

      // Broadcast the beautiful sever layout block silently into the chat channel
      try {
        await DiscordRequest(`channels/${currentChannelId}/messages`, {
          method: 'POST',
          body: {
            embeds: [
              {
                title: "SEVER",
                description: `**${resolvedUsername}**   HAS   BEEN   SEVERED   FROM   REALITY`,
                color: 3447003, // Clean Discord Blue decimal border code
                timestamp: new Date().toISOString()
              }
            ]
          }
        });
      } catch (postError) {
        console.error("❌ Failed to post standalone sever embed: ", postError);
      }

      // Respond privately using flags: 64 so the "(user) used /severed" header text stays hidden
      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: `THE   JOB   HAS   BEEN   DONE.   ${resolvedUsername}   IS   NO   MORE.`,
          flags: 64 
        }
      });
    }


    // 3. Custom /announce command logic (Streamlined: posts right into the local execution channel)
    if (name === 'announce') {
      const optionsArray = interactionData.options || [];
      const messageOption = optionsArray.find(opt => opt.name === 'message');
      const announcementText = messageOption ? messageOption.value : 'No message provided.';

      // Grab the active command text channel origin location context ID
      const currentChannelId = req.body.channel_id;

      // Broadcast the announcement block layout directly down the wire
      try {
        await DiscordRequest(`channels/${currentChannelId}/messages`, {
          method: 'POST',
          body: {
            embeds: [
              {
                title: "EON   SAYS:",
                description: announcementText,
                color: 3447003,
                timestamp: new Date().toISOString()
              }
            ]
          }
        });
      } catch (postError) {
        console.error("❌ Failed to post standalone announcement embed: ", postError);
      }

      // Respond privately using flags: 64 so the "(user) used /announce" header text stays hidden
      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: `✅ Your announcement has been successfully broadcasted here!`,
          flags: 64
        }
      });
    }
  }
});

app.listen(3000, () => {
  console.log('Listening on port 3000');
});
