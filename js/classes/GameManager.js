class GameManager {
  constructor({
    player,
    worldMode,
    hotbarID,
    healthbarID,
    pauseMenuID,
    deathMenuID,
    instantRespawn,
  }) {
    this.player = player;
    this.worldMode = worldMode;
    this.instantRespawn = instantRespawn;
    this.pause = false;
    this.dev = false;

    this.setupGameMenus(pauseMenuID, deathMenuID);
    this.setupUI(hotbarID, healthbarID);
  }

  setObjects({ world }) {
    this.world = world;
  }

  setupGameMenus(pauseMenuID, deathMenuID) {
    this.pauseMenu = document.getElementById(pauseMenuID);
    this.deathMenu = document.getElementById(deathMenuID);
    this.pauseMenu.classList.add(this.worldMode);
    this.deathMenu.classList.add(this.worldMode);
  }

  setupUI(hotbarID, healthbarID) {
    this.hotbar = document.getElementById(hotbarID);
    this.hotbarIndex = 0;
    this.healthbar = document.getElementById(healthbarID);

    if (this.player.gamemode === "creative") {
      this.healthbar.classList.add("hidden");
    }

    this.updateHotbar();
    this.updateHealthbar();
  }

  saveGame() {
    localStorage.setItem(
      `${this.world.worldMode}Chunks`,
      JSON.stringify(this.world.persistantChunks)
    );
  }

  togglePause() {
    if (!this.deathMenu.classList.contains("hidden")) return;
    this.pause = !this.pause;
    this.pauseMenu.classList.toggle("hidden");
  }

  toggleDeath() {
    if (this.dev || this.instantRespawn) return;
    this.pause = !this.pause;
    this.deathMenu.classList.toggle("hidden");
  }

  updateHotbar() {
    for (let i = 0; i < this.player.hotbar.length; i++) {
      const itemImage = this.player.hotbar[i].imageSrc;
      if (this.hotbar.children[i] && this.hotbar.children[i].children[0]) {
        this.hotbar.children[i].children[0].src = itemImage ?? "";
      }
    }
  }

  updateHealthbar() {
    const healthbarLength = this.healthbar.children.length;
    for (let i = 0; i < healthbarLength; i++) {
      const heart = this.healthbar.children[i];
      if (i <= this.player.health) heart.classList.remove("hurt");
      else heart.classList.add("hurt");
    }
  }

  respawnPlayer(player) {
    player.position = { ...player.spawn };
    player.velocity = { x: 0, y: 0, z: 0 };
    player.health = player.maxHealth;
    this.updateHealthbar();
  }

  handleHotbarSelection(delta) {
    this.hotbar.children[this.hotbarIndex].id = "";
    const hotBarLen = this.hotbar.children.length;
    this.hotbarIndex = (this.hotbarIndex + delta + hotBarLen) % hotBarLen;
    this.hotbar.children[this.hotbarIndex].id = "selected";
  }
}
