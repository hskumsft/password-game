<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { ChatService, User } from '@pwdgame/shared';
import appSettings from "../../appsettings.json";

@Component
export default class PhishedComponent extends Vue {
  private chatService: ChatService | null = null;

  @Prop({
    type: Object,
    required: true
  })
  readonly user?: User;

  readonly spamMessages = [
    "I love dogs! Woof! - This message brought to you by 1-800-DOGS",
    "Call 1-800-DOGS for the best dog treats in town!",
    "1-800-DOGS has the best dog treats and bones. Call today!",
    "Does your furry friend like treats? Call 1-800-DOGS to buy them some delicous treats.",
    "LIMITED TIME OFFER: Mention code 'GOOD DOG' for 25% savings at 1-800-DOGS",
    "Dogs rule! Call 1-800-DOGS today!"
  ];

  interval: ReturnType<typeof setInterval> | null = null;

  countdown = 5;

  mounted() {
    this.chatService = new ChatService(appSettings.backendApiBaseUrl);
    this.sendSpamMessage();
    this.interval = setInterval(this.sendSpamMessage, 30000);

    // Redirect user to a different URL after a short delay
    const countdownInterval = setInterval(() => {
      if (this.countdown >= 0)
      {
        this.countdown--;
      }

      if (this.countdown <= 0) {
        setTimeout(() => {
          window.location.href = "https://pwdgame-cat-game-nzzd2o4k.azurewebsites.net";
          clearInterval(countdownInterval);
        }, 1000); // 1 second delay before redirect
      }
    }, 1000);
  }

  unmounted() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    if (this.chatService) {
      this.chatService?.dispose();
      this.chatService = null;
    }
  }

  sendSpamMessage() {
    if(!this.user) return;
    const randomMsgIdx = new Date().valueOf() % this.spamMessages.length;
    this.chatService?.sendMessage({
      username: this.user.username,
      message: this.spamMessages[randomMsgIdx],
      avatarId: this.getRandomDogAvatarId()
    });
  }

  getRandomDogAvatarId() {
    return [
      'dog1',
      'dog2',
      'dog3'
    ][new Date().valueOf() % 3];
  }
}
  </script>

<template>
  <div class="d-flex h-100 justify-content-center align-items-center">
    <div v-if="!redirected" class="alert alert-danger">
      <h4 class="alert-heading">Oh no!</h4>
      <p class="">Sorry, I guess this website isn't working properly.</p>
      <p class="pb-0">Redirecting you back to the chat game in {{countdown}} seconds...</p>
    </div>
  </div>
</template>