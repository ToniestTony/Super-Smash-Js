var entities=[];

function Entity(x,y,w,h,c){
    this.x=x;
    this.y=y;

    this.w=w;
    this.h=h;

    this.c=c;
    if(this.c==undefined){
        this.c="black";
    }
}

Entity.prototype.update=function(){
    //CODE
    
    //DRAW
    this.draw();
}

Entity.prototype.draw=function(){
    jt.draw.rect(this.x,this.y,this.w,this.h,this.c);
}


function Wall(x,y,w,h,down){
    Entity.call(this,x,y,w,h,"#000");
    this.down=down;
}

Wall.prototype=Object.create(Entity.prototype)
Wall.prototype.constructor=Wall;


function Player(x,y){
    Entity.call(this,x,y,20,40,"#22B");
    this.inputs=[0,0,0,0,0];
    
    //attributes for movements
    
    this.friction=0.8;
    this.airfriction=0.85;
    this.speed=3.5;
    this.airspeed=2;
    this.maxspeed=10;
    this.dashdance=6;
    
    this.jumpSquat=4;
    this.jump=12;
    this.maxJumps=2;
    this.hop=8;
    
    this.gravitySpeed=1;
    this.maxGravitySpeed=15;
    this.fastfallSpeed=5;
    this.maxFastfallSpeed=35;
    
    this.wavedashDuration=12;
    this.wavedashSpeed=8;
    
    this.lag=0;
    
    //static attributes
    this.onground=false;
    this.vel=new jt.Vector(0,0)
    this.accel=new jt.Vector(0,0)
    
    this.dash=0;
    this.jumpState=0;
    this.jumps=this.maxJumps;
    
    this.fallState=0;
    this.down=0;
    this.fallThrough=0;
    
    this.wavedashState=0;
    this.wavedash=0;
    this.wavedashDir=0;
    
    //visual attributes
    this.visualW=this.w;
    this.visualH=this.h;
    this.visualX=this.x;
    this.visualY=this.y;
    
    this.phantom=undefined;
}

Player.prototype=Object.create(Entity.prototype)
Player.prototype.constructor=Player;

Player.prototype.update=function(){
    //CODE
    this.input();
    this.movement();
    this.action();
    //DRAW
    this.draw()
}

Player.prototype.input=function(){
    var hold=[0,0,0,0,0];
    for(var i=0;i<this.inputs.length;i++){
        if(this.inputs[i]==1 || this.inputs[i]==2){
            hold[i]=1;
        }
    }
    
    //release
    for(var i=0;i<this.inputs.length;i++){
        if(i==4){
            if(jt.keyboard.check(32)==false){
                this.inputs[i]=0;
            }
        }else if(jt.keyboard.check(i+37)==false){
            this.inputs[i]=0;
        }
    }
    
    //press
    for(var i=0;i<this.inputs.length;i++){
        if(i==4){
            if(jt.keyboard.check(32)==true){
                this.inputs[i]=1;
            }
        }else if(jt.keyboard.check(i+37)==true){
            this.inputs[i]=1;
        }
    }
    
    //hold
    for(var i=0;i<this.inputs.length;i++){
        if(i==4){
            if(jt.keyboard.check(32)==true && hold[i]==1){
                this.inputs[i]=2;
            }
        }else if(jt.keyboard.check(i+37)==true && hold[i]==1){
            this.inputs[i]=2;
        }
    }
    if(jt.keyboard.check(65)){
    this.lag=10;
    jt.keyboard.release(65);
}
}



Player.prototype.movement=function(){
        jt.draw.text(this.lag,10,10,"green")
    
        //loop every entities to check if onground
        //this.onground=false;
        //down platform
    
        var isOnGround=false;
        for(var i=0;i<entities.length;i++){

            var entity=entities[i];
            //wall
            if(entity.constructor.name=="Wall"){
                var posGround={x:this.x,y:this.y+1,w:this.w,h:this.h}
                var posBelow={x:this.x,y:this.y-10,w:this.w,h:this.h}
                //if below down platform and velocity going down, stop fallthrough
                if(entity.down==true && this.wavedashState==0 && jt.collision.rect(posBelow, entity) && this.y>=entity.y+entity.h){
                    this.fallThrough=0;
                }
                if(jt.collision.rect(posGround,entity)){
                    if(this.wavedashState==0 && ((this.inputs[3]==1 || (this.inputs[3]==2 && this.vel.y>0) ) || this.fallThrough==1) && entity.down==true){
                        isOnGround=false;
                        this.fallThrough=1;
                    }else{
                        var feetPoint={x:this.x+this.w/2,y:this.y+this.h,w:1,h:1}
                        if(entity.down==true && !jt.collision.rect(feetPoint,entity)){
                            //fallthrough
                        }else if(this.vel.y>=0){
                            isOnGround=true;
                            this.y=entity.y-this.h
                        }
                        
                    }
                }
            }
        }
    console.log(this.fallThrough)
    var lastOnGround=this.onground;
        

        //onground confirmation
        if(isOnGround==false){
            this.onground=false;
        }else{
            this.onground=true;
            this.fallThrough=0;
            this.fallState=0;
            if(this.jumpState==0){
                this.jumps=this.maxJumps;
            }
            
            if(this.wavedashState==1 || this.wavedashState==-1){
                if(this.wavedashState==1){
                    var dir=this.wavedashDir;
                    if(dir==7){this.accel.add({x:-this.wavedashSpeed,y:0})}
                    if(dir==5){this.accel.add({x:this.wavedashSpeed,y:0})}
                }
                this.jumpState=0;
                this.wavedashState=0;
                this.wavedash=0;
                this.fallThrough=0;
                
            }
            
        }
    
    
    
    
    if(this.onground==false && lastOnGround==true){
        this.jumps=this.maxJumps-1;
    }
    
    if(this.lag==0){
    
    if(this.wavedashState<=0){



        //inputs
        //left and right
        var lastDash=this.dash
        if(this.inputs[0]>0){
            if(this.dash>0){
                this.dash=0;
            }
            this.dash--;
            if(lastDash>0 && lastDash<=this.dashdance && this.onground==true){
                this.vel.x=-1;
                this.accel.add({x:-this.speed,y:0})
            }else if(this.onground==true){
                this.accel.add({x:-this.speed,y:0})
            }else if(this.onground==false){
                this.accel.add({x:-this.airspeed,y:0})
            }
            if(this.vel.x<-this.maxspeed){this.vel.x=-this.maxspeed}
        }
        if(this.inputs[2]>0){
            if(this.dash<0){
                this.dash=0;
            }
            this.dash++;
            if(lastDash<0 && lastDash>=-this.dashdance && this.onground==true){
                this.vel.x=1;
                this.accel.add({x:this.speed,y:0})
            }else if(this.onground==true){
                this.accel.add({x:this.speed,y:0})
            }else if(this.onground==false){
                this.accel.add({x:this.airspeed,y:0})
            }
            if(this.vel.x>this.maxspeed){this.vel.x=this.maxspeed}

        }
        if(this.inputs[0]==0 && this.inputs[2]==0){
            this.dash=0;
        }


        //jump
        if(this.wavedashState!=-1 && (this.onground==true || this.jumps>0) && this.inputs[1]==1 && this.jumpState==0){
            this.jumpState=1;
            this.jumps--;
            this.fallState=0;
            this.fallThrough=0;
        }
        

        

    }
    
    //dash
        var inp=this.inputs;
        if(this.inputs[4]==1 && this.wavedashState==0 && (this.onground==false || (this.jumpState>=1 && inp[3]>0))){
            
            
            this.wavedashState=1
            if(inp[0]>0){
                if(inp[1]>0){this.wavedashDir=1}
                else if(inp[3]>0){this.wavedashDir=7}
                else{this.wavedashDir=0}
            }
            if(inp[1]>0){
                if(inp[0]>0){this.wavedashDir=1}
                else if(inp[2]>0){this.wavedashDir=3}
                else{this.wavedashDir=2}
            }
            if(inp[2]>0){
                if(inp[1]>0){this.wavedashDir=3}
                else if(inp[3]>0){this.wavedashDir=5}
                else{this.wavedashDir=4}
            }
            if(inp[3]>0){
                if(inp[0]>0){this.wavedashDir=7}
                else if(inp[2]>0){this.wavedashDir=5}
                else{this.wavedashDir=6}
            }
            if(inp[0]==0 && inp[1]==0 && inp[2]==0 && inp[3]==0){
                this.wavedashDir=8
            }
        }
    
    
    //WAVEDASH
    
    if(this.wavedashState==1){
        this.vel.x=0;
        this.vel.y=0;
        this.accel.y=0;
        this.accel.y=0;
        if(this.wavedashDir==0){this.vel.x=-this.wavedashSpeed;}
        if(this.wavedashDir==1){this.vel.x=-this.wavedashSpeed;this.vel.y=-this.wavedashSpeed;}
        if(this.wavedashDir==2){this.vel.y=-this.wavedashSpeed;}
        if(this.wavedashDir==3){this.vel.x=this.wavedashSpeed;this.vel.y=-this.wavedashSpeed;}
        if(this.wavedashDir==4){this.vel.x=this.wavedashSpeed;}
        if(this.wavedashDir==5){this.vel.x=this.wavedashSpeed;this.vel.y=this.wavedashSpeed;}
        if(this.wavedashDir==6){this.vel.y=this.wavedashSpeed;}
        if(this.wavedashDir==7){this.vel.x=-this.wavedashSpeed;this.vel.y=this.wavedashSpeed;}
        
        this.wavedash++;
        if(this.wavedash>=this.wavedashDuration){
            this.jumpState=0;
            this.wavedashState=-1;
            this.wavedash=0;
            this.vel.x=0
            this.vel.y=0
            this.fallState=0;
        }
    }
    if(this.wavedashState<=0){

        //down
        if(this.inputs[3]==1){
            if(this.onground==false && this.vel.y>0 && this.fallState==0){
                this.fallState=1;
            }
        }
    }
    }
        
        
    if(this.wavedashState<=0){


        //falling
        if(this.onground==false){
            if(this.fallState==0){
                this.accel.y+=this.gravitySpeed;
            }else{
                this.accel.y+=this.fastfallSpeed;
            }

        }
    }


        //automatic inputs
        if(this.jumpState>=1){
            this.jumpState++;
            this.visualH=20;
            if(this.jumpState>=this.jumpSquat || this.onground==false){
                if(this.onground==true){
                    if(this.inputs[1]==2){
                        this.accel.add({x:0,y:-this.jump});
                    }else{
                        this.accel.add({x:0,y:-this.hop});
                    }
                }else{
                    this.vel.y=0;
                    this.accel.add({x:0,y:-this.jump});
                }
                this.jumpState=0;
                this.visualH=this.h
            }
        }else{
            this.visualH=this.h
        }

        //add accel to velocity
        this.vel.add(this.accel)

        //max fall speed
        if(this.vel.y>0){
            if(this.fallState==0 && this.vel.y>this.maxGravitySpeed){
                this.vel.y=this.maxGravitySpeed
            }
            if(this.fallState==1 && this.vel.y>this.maxFastfallSpeed){
                this.vel.y=this.maxFastfallSpeed
            }
        }
    
    
    //check ground before moving Y
    for(var i=0;i<entities.length;i++){
        var entity=entities[i];
        if(entity.constructor.name=="Wall"){
            var futurePos={x:this.x,y:this.y+this.vel.y,w:this.w,h:this.h};
            if(jt.collision.rect(futurePos,entity)){
                if(this.wavedashState==1 && entity.down==true && (this.wavedashDir==5 || this.wavedashDir==6 || this.wavedashDir==7) && this.y+this.h<=entity.y){
                    this.jumpState=0;
                    this.wavedashState=0;
                    this.wavedash=0;
                    this.fallThrough=0;
                    this.y=entity.y-this.h
                    this.vel.y=0;
                }else
                if(((this.lag==0 && this.inputs[3]==1 || (this.inputs[3]==2 && this.vel.y>0) ) || this.fallThrough==1) && entity.down==true){
                    //this.fallThrough=1;
                    
                    //fallthrough
                }else{
                    if(this.y+this.h>entity.y && entity.down==true){
                        //fallthrough
                    }else{
                        if(futurePos.y+futurePos.h/2>=entity.y+entity.h/2){
                            this.y=entity.y+entity.h
                            this.fallThrough=0;
                        }else{
                            this.y=entity.y-this.h
                            
                        }

                        this.vel.y=0;
                    }
                    
                }
            }
        }
    }
    
    //check ground before moving X
    for(var i=0;i<entities.length;i++){
        var entity=entities[i];
        if(entity.constructor.name=="Wall"){
            var futurePos={x:this.x+this.vel.x,y:this.y,w:this.w,h:this.h};
            if(jt.collision.rect(futurePos,entity)){
                if((this.lag==0 && this.inputs[3]>=1 || this.fallThrough==1) && entity.down==true){
                    //this.fallThrough=1;
                    //fallthrough
                }else{
                    if(this.onground==false && entity.down==true){
                     //fallthrough  
                    }else{
                        if(futurePos.x+futurePos.w>=entity.x && this.vel.x>0 && futurePos.x+futurePos.w<entity.x+futurePos.w/2){
                            this.x=entity.x-this.w
                        }else if(futurePos.x<=entity.x+entity.w && this.vel.x<0 && futurePos.x>entity.x+entity.w-futurePos.w/2){
                            this.x=entity.x+entity.w
                        }

                        this.vel.x=0;
                    }
                    
                }
                
            }
        }
    }
    
    this.y=Math.round(this.y)
    
    if(this.onground==true){
        
    }
    
    
    
    
    //update position
    this.x+=this.vel.x;
    this.y+=this.vel.y;
    
    //debug
    if(this.y>jt.canvas.h){
        this.y=0;
    }
    
    //friction
    if(this.onground==true){
        this.vel.mult({x:this.friction,y:1})
    }else{
        this.vel.mult({x:this.airfriction,y:1})
    }
    
    
    
    this.accel.mult({x:0,y:0})
    
    //lag
    if(this.lag>0){
        this.lag--;
    }
    
    this.visualX=this.x;
    this.visualY=this.y;
    if(this.jumpState>=1){
        this.visualY=this.y+20;
    }
    /*if(jt.keyboard.check(65)){
        this.knockback(-25,-2);
    }
    if(jt.keyboard.check(68)){
        this.phantom={x:this.visualX,y:this.visualY,w:this.visualW,h:this.visualH}
    }*/
}

Player.prototype.action=function(){
    
}

Player.prototype.draw=function(){
    if(this.phantom!=undefined){
        var p=this.phantom
        jt.draw.rect(p.x,p.y,p.w,p.h,"lightgreen")
    }
    if(this.wavedash>0){
        if(jt.loop.frames%2==0){
            jt.draw.rect(this.visualX,this.visualY,this.visualW,this.visualH,this.c);
        }
    }else{
        jt.draw.rect(this.visualX,this.visualY,this.visualW,this.visualH,this.c);
    }
    
    
}

Player.prototype.knockback=function(x,y){
    this.accel.add({x:x,y:y})
}