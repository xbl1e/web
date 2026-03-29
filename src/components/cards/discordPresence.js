import { PALETTE } from '../../utils/colors.js';
import { formatDuration } from '../../utils/format.js';

export async function initDiscordPresence() {
  const ID = '1265980041813164149';
  const nameEl = document.querySelector('.discord-name');
  const handleEl = document.querySelector('.discord-username');
  const statusEl = document.querySelector('.discord-status');
  const avatarEl = document.querySelector('.discord-avatar');
  const presenceBody = document.getElementById('discord-presence');
  const presenceHeader = document.querySelector('.presence-header');
  const presenceLabel = document.getElementById('presence-label');
  const activityIcon = document.getElementById('activity-icon');
  const activitySmallIcon = document.getElementById('activity-small-icon');
  const activityName = document.getElementById('activity-name');
  const activityDetails = document.getElementById('activity-details');
  const activityState = document.getElementById('activity-state');
  const activityTime = document.getElementById('activity-time');
  const activityTimeContainer = document.querySelector('.activity-time-row');
  const activityAsset = document.querySelector('.activity-asset');

  let timeInterval;

  function updateTimer(start) {
    if (timeInterval) clearInterval(timeInterval);
    if (!start) {
      activityTimeContainer.style.display = 'none';
      return;
    }

    function set() {
      const now = Date.now();
      const diff = now - start;
      activityTime.textContent = formatDuration(diff);
      activityTimeContainer.style.display = 'flex';
    }
    set();
    timeInterval = setInterval(set, 1000);
  }

  function resolveImg(appId, assetId) {
    if (!assetId) return null;
    if (assetId.startsWith('mp:')) return assetId.replace('mp:', 'https://media.discordapp.net/');
    if (assetId.startsWith('external/')) return `https://media.discordapp.net/external/${assetId.split('external/')[1]}`;
    if (assetId.includes('spotify')) return `https://i.scdn.co/image/${assetId.split('spotify:')[1]}`;
    return `https://cdn.discordapp.com/app-assets/${appId}/${assetId}.png?size=160`;
  }

  async function update() {
    try {
      const res = await fetch(`https://api.lanyard.rest/v1/users/${ID}`);
      const { data } = await res.json();
      if (!data) return;

      statusEl.style.backgroundColor = PALETTE.discord[data.discord_status] || PALETTE.discord.offline;
      nameEl.textContent = data.discord_user.global_name || data.discord_user.username;
      handleEl.textContent = data.discord_user.username;

      if (data.discord_user.avatar) {
        avatarEl.style.backgroundImage = `url(https://cdn.discordapp.com/avatars/${ID}/${data.discord_user.avatar}.png?size=128)`;
      }

      const activity = data.activities.find(a => a.type !== 4);

      if (data.discord_status === 'offline') {
        presenceHeader.style.display = 'none';
        activityName.textContent = '';
        activityDetails.textContent = '';
        activityState.textContent = 'offline / resting';
        activityState.style.fontStyle = 'italic';
        activityTimeContainer.style.display = 'none';
        activityAsset.style.display = 'none';
        presenceBody.style.display = 'block';
      } else if (activity) {
        presenceHeader.style.display = 'block';
        presenceLabel.textContent = activity.type === 2 ? 'Listening' : 'Playing';
        activityName.textContent = activity.name || '';
        activityDetails.textContent = activity.details || '';
        activityState.textContent = activity.state || '';
        activityState.style.fontStyle = 'normal';

        const largeImg = resolveImg(activity.application_id, activity.assets?.large_image);
        if (largeImg) {
          activityIcon.src = largeImg;
          activityIcon.style.display = 'block';
          activityAsset.style.display = 'block';
        } else {
          activityAsset.style.display = 'none';
        }

        const smallImg = resolveImg(activity.application_id, activity.assets?.small_image);
        if (smallImg) {
          activitySmallIcon.style.backgroundImage = `url(${smallImg})`;
          activitySmallIcon.style.display = 'block';
        } else {
          activitySmallIcon.style.display = 'none';
        }

        if (activity.timestamps && activity.timestamps.start) {
          updateTimer(activity.timestamps.start);
          activityTimeContainer.style.display = 'flex';
        } else {
          activityTimeContainer.style.display = 'none';
        }

        presenceBody.style.display = 'block';
      } else {
        presenceBody.style.display = 'none';
      }
    } catch (err) { }
  }

  update();
  setInterval(update, 15000);
}
