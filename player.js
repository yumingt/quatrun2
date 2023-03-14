class Player {
  // constructs player object by setting size, position, and sprite
  constructor(x, y, width, height, image){
    this.size = 50;
    this.x = 50;
    this.y = height - this.size;
    this.vy = 0;
    this.gravity = 1.5;
    this.sprite = createSprite(x, y, width, height);
    this.sprite.addImage(image);
    this.sprite.scale = 0.3;
  }

  jump(){
    // makes the player jump
    if (this.sprite.overlap(ground)) {
      this.vy = -23;
    }
  }

  move(){
    // moves the character
    this.y += this.vy;
    this.vy += this.gravity;
    this.y = constrain(this.y, 0, height - this.size);
    this.sprite.position.y = this.y;
  }

  show(){
    // shows the player sprite
    drawSprites();
  }

  hits(blob){
    // collides with obstacle
    return collideLineRect(blob.x, height, blob.x + blob.size / 2, blob.y, this.x + 79, this.y, this.size, this.size);
  }
}