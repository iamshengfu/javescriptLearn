var gamebackground = new Array(20).fill(0).map(()=>new Array(20).fill(0));
var scale =20;


var Level = class Level{
    constructor(gamebackground) {
        this.rows = gamebackground;
        this.width = gamebackground[0].length;
        this.height = gamebackground.length;
    }
}

var State = class State{
    constructor(level,snakes,bean,status,time){
        this.level = level;
        this.snakes = snakes;
        this.bean = bean;
        this.status = status;
        this.time = time;
    }

    get actors(){
        return this.snakes.concat(this.bean);
    }

    advance(timestamp){
        if((timestamp-this.time)<200) return this;    
        let tail = this.snakes[this.snakes.length-1].pos;
        let tail2 =  this.snakes[this.snakes.length-2].pos;
        let newpos;
        if(keypressed.equals(new Vec(0,0)) || keypressed.isOpposite(tail.minus(tail2))){
            newpos = tail.add(tail.minus(tail2));
        }else{
            newpos = tail.add(keypressed);
        }
        keypressed = new Vec(0,0);
        if(this.bean.pos.equals(newpos)){
            this.snakes.push(new Snake(newpos));
            return new State(this.level,this.snakes,Bean.create(this),this.status,timestamp);
        }else{
            this.snakes.shift();
            this.snakes.push(new Snake(newpos));  
            console.log(11);   
            return new State(this.level,this.snakes,this.bean,this.status,timestamp);
        }
    }
}

var Vec = class Vec {
    constructor(x,y){
        this.x =x;
        this.y =y;
    }
    add(vec2){
        return new Vec(this.x+vec2.x,this.y+vec2.y)
    }
    minus(vec2){
        return new Vec(this.x-vec2.x,this.y-vec2.y)
    }
    multiply(vec2){
        return new Vec(this.x*vec2.x,this.y*vec2.y)
    }
    equals(vec2){
        if(this.x==vec2.x && this.y==vec2.y){
            return true;
        }
        return false;
    }
    isOpposite(vec2){
        if(this.x==-vec2.x && this.y==-vec2.y) return true;
        return false;
    }
    outOfBound(size){
        if(this.x<0 || this.y<0 || this.y>size || this.x>size) return true;
        return false;
    }
}

var Snake = class Snake{
    constructor(pos =new Vec(1,1)){
        this.pos = pos;
        this.size = new Vec(1,1);
    }
    get type() { return "snake"; }
}

var Bean = class Bean{
    constructor(pos){
        this.pos = pos;
        this.size = new Vec(1,1);
    }

    get type() { return "bean"; }

    static allowedpos(pos,state){
        for(let snake of state.snakes){
            if(snake.pos.equals(pos)){
                return false;
            }
        }
        return true;
    }
    static create(state){
        let a,b,newpos;
        do {
            a = randomIntFromInterval(0,19);
            b = randomIntFromInterval(0,19);
            newpos = new Vec(a,b);
        } while (!Bean.allowedpos(newpos,state));
        return new Bean(newpos);
    }
}

function elt(name, attrs, ...children) {
    let dom = document.createElement(name);
    for (let attr of Object.keys(attrs)) {
        dom.setAttribute(attr, attrs[attr]);
    }
    for (let child of children) {
        dom.appendChild(child);
    }
    return dom;
}

var DOMDisplay = class DOMDisplay {
    constructor(parent, level) {
        this.dom = elt("div", {class: "game"}, drawGrid(level));
        this.actorLayer = null;
        parent.appendChild(this.dom);
    }
    clear() { this.dom.remove(); }

    syncState(state){
        if (this.actorLayer) this.actorLayer.remove();
        this.actorLayer = drawActors(state.actors);
        this.dom.appendChild(this.actorLayer);
        this.dom.className = `game ${state.status}`;
    }
}

function drawGrid(level) {
    return elt("table", {
      class: "background",
      style: `width: ${level.width * scale}px`
    }, ...level.rows.map(row =>
      elt("tr", {style: `height: ${scale}px`},
          ...row.map(type => elt("td", {class: type})))
    ));
}

function drawActors(actors) {
    return elt("div", {}, ...actors.map(actor => {
      let rect = elt("div", {class: `actor ${actor.type}`});
      rect.style.width = `${actor.size.x * scale}px`;
      rect.style.height = `${actor.size.y * scale}px`;
      rect.style.left = `${actor.pos.x * scale}px`;
      rect.style.top = `${actor.pos.y * scale}px`;
      return rect;
    }));
  }


var keypressed = new Vec(0,0);
document.addEventListener('keydown', logKey);
function logKey(e) {
    if (`${e.code}` == "ArrowRight") {
        keypressed = new Vec(1,0);
    }
    if (`${e.code}` == "ArrowLeft") {
        keypressed = new Vec(-1,0);
    }
    if (`${e.code}` == "ArrowDown") {
        keypressed = new Vec(0,1);
    }
    if (`${e.code}` == "ArrowUp") {
        keypressed = new Vec(0,-1);
    }
}

function randomIntFromInterval(min, max) { // min and max included 
    return Math.floor(Math.random() * (max - min + 1) + min);
}

/*var mylevel = new Level(gamebackground);
var snake2 = new Snake(new Vec(0,0));
var snake3 = new Snake(new Vec(0,1));
var snakes = [snake2,snake3];
var Display = new DOMDisplay(document.body,mylevel);
Display.dom.appendChild(drawActors(snakes));*/

var mylevel = new Level(gamebackground);
var snake2 = new Snake(new Vec(0,0));
var snake3 = new Snake(new Vec(0,1));
var snakes = [snake2,snake3];
var newstate = new State(mylevel,snakes,new Bean(new Vec(5,5)));


function runAnimation(frameFunc) {
    function frame(time) {
        if(frameFunc(time)===false) return;
        requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
}
  
function runLevel(level, Display) {
    let display = new Display(document.body, level);
    let state = newstate;
    let ending = 1;
    return new Promise(resolve => {
        runAnimation(time => {
        state = state.advance(time);
        display.syncState(state);
        if(state.snakes[snakes.length-1].pos.outOfBound(19)===true) return false;
        return true;
        });
    });
}


runLevel(mylevel,DOMDisplay);
