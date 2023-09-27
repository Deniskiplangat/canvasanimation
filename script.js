const canvas = document.getElementById('canvas')
const ctx = canvas.getContext('2d')


const BALLZ = []
let LEFT,UP,RIGHT,DOWN;
let friction = 0.1


class Vector{
    constructor(x,y){
        this.x = x;
        this.y = y;
    }
    add(v){
        return new Vector(this.x+v.x, this.y+v.y)
    }
    subtr(v){
        return new Vector(this.x-v.x, this.y-v.y)
    }
    mag(){
        return Math.sqrt(this.x**2 + this.y**2)
    }
    mult(n){
        return new Vector(this.x*n, this.y*n)
    }
    normal(){
        return new Vector(-this.y,this.x).unit()
    }
    unit(){
        if (this.mag() === 0) {
            return new Vector(0,0)
        } else {
            return new Vector(this.x/this.mag(), this.y/this.mag())
        }
    }

    static dot(v1,v2){
        return v1.x*v2.x + v1.y*v2.y
    }
    drawVec(start_x,start_y,n,color){
        ctx.beginPath()
        ctx.moveTo(start_x,start_y)
        ctx.lineTo(start_x + this.x*n, start_y + this.y*n)
        ctx.strokeStyle = color
        ctx.stroke()

        
    }
}

//class that we will use to create the ball
class Ball{
    constructor(x,y,r){
        this.pos = new Vector(x,y)
        this.r = r
        this.vel = new Vector(0,0)
        this.acc = new Vector(0,0)
        
        this.acceleration = 1
        this.player = false
        BALLZ.push(this)
    }

    drawBall(){
        ctx.beginPath();
        ctx.arc(this.pos.x,this.pos.y,this.r,0, 2*Math.PI);
        ctx.strokeStyle = "black";
        ctx.stroke()
        ctx.fillStyle = "red"
        ctx.fill()
    
    }
    display(){
        this.vel.drawVec(250,110,10,"green")
        this.acc.unit().drawVec(250,110,100,"blue")
        this.acc.normal().drawVec(250,110,100,"black")
        ctx.beginPath();
        ctx.arc(250,110,30,0, 2*Math.PI);
        ctx.strokeStyle = "black";
        ctx.stroke()
        
    }

    reposition(){
        this.acc = this.acc.unit().mult(this.acceleration)
        this.vel = this.vel.add(this.acc)
        this.vel = this.vel.mult(1-friction)
        this.pos = this.pos.add(this.vel)
    }
}





function keyControl(b){
    canvas.addEventListener('keydown',(e)=>{
        if(e.keyCode ===37){
            LEFT = true
        }
        if(e.keyCode ===38){
            UP = true
        }
        if(e.keyCode ===39){
            RIGHT = true
        }
        if(e.keyCode ===40){
            DOWN = true
        }
    })
    canvas.addEventListener('keyup',(e)=>{
        if(e.keyCode ===37){
            LEFT = false
        }
        if(e.keyCode ===38){
            UP = false
        }
        if(e.keyCode ===39){
            RIGHT = false
        }
        if(e.keyCode ===40){
            DOWN = false
        }
    })
    
    
    
        if(LEFT){
            b.acc.x = -b.acceleration
        }
        if(UP){
            b.acc.y = -b.acceleration
        }
        if(RIGHT){
            b.acc.x = b.acceleration
        }
        if(DOWN){
            b.acc.y = b.acceleration
        }
        if(!UP && !DOWN){
            b.acc.y = 0
        }

        if(!RIGHT && !LEFT){
            b.acc.x = 0
        }

        // b.acc = b.acc.unit()
        // b.vel = b.vel.add(b.acc)
        // b.vel = b.vel.mult(1-friction) 
        // b.pos = b.pos.add(b.vel)
    
}

let distanceVec = new Vector(0,0)

function round(number,precision){
    let factor = 10**precision;
    return Math.round(number*factor)/factor 
}

function coll_det_bb(b1,b2){
    if(b1.r + b2.r >=b2.pos.subtr(b1.pos).mag()){
        return true
    }else{
        return false
    }
}

function pen_res_bb(b1,b2){
    let dist = b1.pos.subtr(b2.pos)
    let pen_depth = b1.r + b2.r - dist.mag()
    let pen_res = dist.unit().mult(pen_depth/2)
    b1.pos = b1.pos.add(pen_res)
    b2.pos = b2.pos.add(pen_res.mult(-1))
}

function coll_res_bb(b1,b2){
    let normal = b1.pos.subtr(b2.pos).unit()
    let relVel = b1.vel.subtr(b2.vel)
    let sepVel = Vector.dot(relVel,normal)
    let new_sepVel = -sepVel
    let sepVelVec = normal.mult(new_sepVel)

    b1.vel = b1.vel.add(sepVelVec)
    b2.vel = b2.vel.add(sepVelVec.mult(-1))

}

function momentum_display(){
    let momentum = Ball1.vel.add(Ball2.vel).mag()
    ctx.fillText("Momentum: "+round(momentum,4), 200,20)
}

function mainLoop(){
    ctx.clearRect(0,0,canvas.clientWidth,canvas.clientHeight)
    
    BALLZ.forEach((b, index)=>{
        b.drawBall()
        if(b.player){
            keyControl(b)
        }
        for(let i = index+1;i<BALLZ.length;i++){
            if(coll_det_bb(BALLZ[index],BALLZ[i])){
        
                pen_res_bb(BALLZ[index],BALLZ[i])
                coll_res_bb(BALLZ[index],BALLZ[i])
                
            }
        }
       
        b.display()
        b.reposition()
    });
    momentum_display()

    
//    distanceVec = Ball2.pos.subtr(Ball1.pos)
//    ctx.fillText("Distance: "+distanceVec.mag(),155,20)
    requestAnimationFrame(mainLoop)
}


/////trying to record canvas

// function record(mainLoop, time) {
//     var recordedChunks = [];
//     return new Promise(function (res, rej) {
//         var stream = canvas.captureStream(25 /*fps*/);
//         mediaRecorder = new MediaRecorder(stream, {
//             mimeType: "video/webm; codecs=vp9"
//         });
        
//         //ondataavailable will fire in interval of `time || 4000 ms`
//         mediaRecorder.start(time || 4000);

//         mediaRecorder.ondataavailable = function (event) {
//             recordedChunks.push(event.data);
//              // after stop `dataavilable` event run one more time
//             if (mediaRecorder.state === 'recording') {
//                 mediaRecorder.stop();
//             }

//         }

//         mediaRecorder.onstop = function (event) {
//             var blob = new Blob(recordedChunks, {type: "video/mp4" });
//             var url = URL.createObjectURL(blob);
//             res(url);
//         }
//     })
// }

// const recording = record(mainLoop, 10000)
// // play it on another video element
// var video$ = document.createElement('video')
// document.body.appendChild(video$)
// recording.then(url => video$.setAttribute('src', url) )

// download it
// var link$ = document.createElement('a')
// link$.setAttribute('download','recordingVideo') 
// recording.then(url => {
//  link$.setAttribute('href', url) 
//  link$.click()
// })

//end of recording canvas

let Ball1 = new Ball(40,80,10)
let Ball2 = new Ball(90,50,10)
let Ball3 = new Ball(90,100,10)



Ball1.player = true



requestAnimationFrame(mainLoop)



