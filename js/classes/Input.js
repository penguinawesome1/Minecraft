class Input {
  constructor({ player, world, gameManager, renderer }) {
    this.player = player;
    this.world = world;
    this.gameManager = gameManager;
    this.renderer = renderer;
    window.addEventListener("mousemove", (e) => {
      this.renderer.updateMouse(e.clientX, e.clientY);
    });
    window.addEventListener("contextmenu", (e) => {
      if (e.button === 2) {
        e.preventDefault();
      }
    });
    window.addEventListener("mousedown", (e) => {
      switch (e.button) {
        case 0:
          for (const enemy of this.world.enemyList) {
            if (enemy.tryToHit()) return;
          }
          this.world.deleteBlock("hover");
          break;
        case 1:
          for (let i = 0; i < this.player.hotbar.length; i++) {
            const hasItem =
              this.player.hotbar[i].blockNum === this.world.hoverBlock.blockNum;
            if (!hasItem) continue;

            hotbar.children[this.gameManager.hotbarIndex].id = "";
            this.gameManager.hotbarIndex = i;
            hotbar.children[this.gameManager.hotbarIndex].id = "selected";
            break;
          }
          break;
        case 2:
          const blockNum =
            this.player.hotbar[this.gameManager.hotbarIndex].blockNum;
          if (blockNum) this.world.addBlock(blockNum);
          break;
      }
    });
    document.addEventListener("keydown", (e) => {
      switch (e.key.toUpperCase()) {
        case "D":
          this.player.keys.right = true;
          break;
        case "A":
          this.player.keys.left = true;
          break;
        case "S":
          this.player.keys.down = true;
          break;
        case "W":
          this.player.keys.up = true;
          break;
        case " ":
          this.player.jump();
          break;
        case "ESCAPE":
          this.gameManager.togglePause();
          break;
        case "1":
          this.gameManager.dev = !this.gameManager.dev;
          break;
      }
    });
    document.addEventListener("keyup", (e) => {
      switch (e.key.toUpperCase()) {
        case "D":
          this.player.keys.right = false;
          break;
        case "A":
          this.player.keys.left = false;
          break;
        case "S":
          this.player.keys.down = false;
          break;
        case "W":
          this.player.keys.up = false;
          break;
      }
    });
    window.addEventListener("wheel", (e) => this.handleWheel(e));
  }

  handleWheel(e) {
    const delta = Math.sign(e.deltaY);

    if (!e.shiftKey) {
      this.gameManager.handleHotbarSelection(delta);
      return;
    }

    this.renderer.handleZoom(delta);
  }
}
