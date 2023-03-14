class Blob {
  // constructs obstacle object by setting size, position, and sprite
  constructor(image){
    this.size = 50;
    this.x = width;
    this.y = height - this.size - 50;
    this.speed = 8;
    this.sprite = createSprite(this.x, this.y, width, height);
    this.sprite.addImage(image);
    this.sprite.scale = 0.3;
  }

  setSpeed(speed){
    this.speed = speed; // sets speed of obstacle
  }

  getX(){
    return this.x; // returns x position
  }

  move(){
    this.x -= this.speed; // sets speed of obstacle
  }

  show(){
    // shows the obstacle sprite
    this.sprite.position.x = this.x;
    drawSprites();
  }
}