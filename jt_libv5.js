//Documentation at the bottom
var jt = {
    //***** CANVAS *****//
    canvas: {
        src:null,
        ctx:null,
        w:undefined,
        h:undefined,

        init: function(canvas_id,w,h,fps,names) {
            jt.canvas.src = jt.html.id(canvas_id);
            jt.canvas.ctx = jt.canvas.src.getContext("2d");
            
            if(w!=undefined && h!=undefined){
                jt.canvas.resize(w,h);
            }
            
            if(names!=undefined && names.length!=0){
                if(names[0]!=undefined){jt.loop.preloadName=names[0]}
                if(names[1]!=undefined){jt.loop.setupName=names[1]}
                if(names[2]!=undefined){jt.loop.updateName=names[2]}
                if(names[3]!=undefined){jt.loop.obj=names[3]}
            }
            
            jt.loop.preload(fps);
            
            jt.createEventListeners();
        },

        resize: function(w,h) {
            jt.canvas.src.width = w;
            jt.canvas.src.height = h;
            jt.canvas.w=w;
            jt.canvas.h=h;
            jt.draw.cam.w=jt.canvas.src.width;
            jt.draw.cam.h=jt.canvas.src.height;
        },
        
        smoothing:function(bool){
            jt.canvas.ctx.imageSmoothingEnabled=bool;
        },
    },

    






    //***** LOOP *****//
    loop:{
        preloadName:"preload",
        setupName:"setup",
        updateName:"update",
        obj:undefined,
        
        frames:0,
        fps:60,
        sec:0,
        interval:undefined,
        
        pause:false,
        stop:false,
        
        loaded:false,
        setupDone:false,
        loadCounter:0,
        loadCounterMax:0,
        
        shakeObj:undefined,
        normalX:undefined,
        normalY:undefined,
        
        alarms:{},
        
        //Calls the preload function
        preload: function(fps){
            if(jt.loop.obj!=undefined){
                window[jt.loop.obj][jt.loop.preloadName]();
            }else{
                window[jt.loop.preloadName]();
            }
            jt.loop.fps=fps;
            
            jt.loop.startLoop();
        },
        //Calls the setup function
        setup: function(){
            jt.debug.log("loop.setup","Load complete")
            jt.canvas.smoothing(false)
            if(jt.loop.obj!=undefined){
                window[jt.loop.obj][jt.loop.setupName]();
            }else{
                window[jt.loop.setupName]();
            }
            jt.loop.setupDone=true;
            
        },
        startLoop: function(){
              jt.loop.interval=self.setInterval(function(){jt.loop.mainLoop()},1000/jt.loop.fps)
        },
        mainLoop:function(){
            //if tz.stop==true, remove the setInterval
            if(jt.loop.stop){
                window.clearInterval(jt.loop.interval);
                jt.loop.stop=false;
            }
            //main loop
            //if tz.pause==true, pause the function calling
            
            if(jt.loop.loaded==false){
                
                jt.loop.loadCounter=0;
                jt.loop.loadCounterMax=0;
                var load=true;
                    for(var soun in jt.assets.sounds){
                        jt.loop.loadCounterMax++;
                        
                        if(jt.assets.sounds.hasOwnProperty(soun)){
                            var sound=jt.assets.sounds[soun]
                            
                            if(sound!=undefined){
                                if(sound.duration==0){
                                    load=false;
                                    
                                }else{
                                    jt.loop.loadCounter++;
                                }
                            }
                        }
                    }
                
              for (var im in jt.assets.images) {
                  jt.loop.loadCounterMax++;
                  
                        if (jt.assets.images.hasOwnProperty(im)) {
                            var img=jt.assets.images[im].img;
                            
                            if(img!=undefined){
                                if(img.width==0){
                                    load=false;
                                    
                                }else{
                                    jt.loop.loadCounter++;
                                }
                            }

                        }
                    }
                
                for (var ani in jt.assets.anims) {
                  jt.loop.loadCounterMax++;
                    
                        if (jt.assets.anims.hasOwnProperty(ani)) {
                            var anim=jt.assets.anims[ani].img;
                            
                            if(anim!=undefined){
                                if(anim.width==0){
                                    load=false;
                                    
                                }else{
                                    jt.assets.anims[ani].frameW=anim.width/jt.assets.anims[ani].frames
                                    jt.loop.loadCounter++;
                                }
                            }

                        }
                    }
                
                jt.debug.log("loop.mainLoop","Load progress: "+jt.loop.loadCounter+" / "+jt.loop.loadCounterMax)
                if(load){jt.loop.loaded=true;}
                
            }else
            if(!jt.loop.pause){

                
                
                if(!jt.loop.setupDone){
                    jt.loop.setup();
                }

                if(jt.loop.obj!=undefined){
                  window[jt.loop.obj][jt.loop.updateName]();
                }else{
                  window[jt.loop.updateName]();
                }
                
                jt.loop.updateAnims();
                jt.loop.updateAlarms();
                
                //shake
                if(jt.loop.shakeObj!=undefined){
                    jt.loop.shaking();
                    
                }
                

                //frames++
                if(jt.loop.frames<jt.loop.fps-1){
                    jt.loop.frames++;
                }else{
                    jt.loop.frames=0;
                    jt.loop.sec++;
                }
            }
        },
        updateAnims:function(){
             for(var ani in jt.assets.anims) {
                 var anim=jt.assets.anims[ani];
                 
                 if(!anim.pause){
                     anim.distance+=anim.speed;
                 
                    anim.frame=Math.floor(anim.distance);
                 
                    if(anim.frame>=anim.frames){
                        anim.frame=0;
                        anim.distance=0;
                    }
                }
            }
        },//alarms
        updateAlarms:function(){
            for(var ala in jt.loop.alarms){
                var alarm=jt.loop.alarms[ala];
                if(alarm!=undefined && !alarm.pause){
                    alarm.time--;
                    if(alarm.time<=0){
                        alarm.pause=true;
                    }
                }
            }
        },
        addAlarm:function(name,time){
            if(jt.loop.alarms[name]!=undefined){
                jt.loop.alarms[name]=undefined;
            }
            jt.loop.alarms[name]={};
            jt.loop.alarms[name].time=time;
            jt.loop.alarms[name].pause=false;
        },
        checkAlarm:function(name){
            if(jt.loop.alarms[name]!=undefined && jt.loop.alarms[name].time<=0){
                jt.loop.alarms[name]=undefined;
                return true;
            }else{
                return false;
            }
        },
        
        shake:function(force,duration,reduce){
            if(jt.loop.normalX==undefined){
                jt.loop.normalX=jt.draw.cam.x;
                jt.loop.normalY=jt.draw.cam.y;
            }
            if(jt.loop.shakeObj==undefined){
                jt.loop.shakeObj={};
                jt.loop.shakeObj.force=force;
                jt.loop.shakeObj.duration=duration;
                jt.loop.shakeObj.reduce=reduce;
                
            }else{
                jt.loop.shakeObj.force+=force;
                jt.loop.shakeObj.duration+=duration;
                jt.loop.shakeObj.reduce=reduce;
            }
            jt.loop.shakeObj.lastX=0;
            jt.loop.shakeObj.lastY=0;
        },
        
        shaking:function(){
            if(jt.loop.shakeObj.lastX==0){
                jt.draw.cam.x+=jt.math.random(-jt.loop.shakeObj.force,jt.loop.shakeObj.force)
            }else if(Math.sign(jt.loop.shakeObj.lastX)==1){
                jt.draw.cam.x+=jt.math.random(-jt.loop.shakeObj.force,0)
            }else if(Math.sign(jt.loop.shakeObj.lastX)==-1){
                jt.draw.cam.x+=jt.math.random(0,jt.loop.shakeObj.force)
            }
            jt.loop.shakeObj.lastX=jt.draw.cam.x;


            if(jt.loop.shakeObj.lastY==0){
                jt.draw.cam.y+=jt.math.random(-jt.loop.shakeObj.force,jt.loop.shakeObj.force)
            }else if(Math.sign(jt.loop.shakeObj.lastY)==1){
                jt.draw.cam.y+=jt.math.random(-jt.loop.shakeObj.force,0)
            }else if(Math.sign(jt.loop.shakeObj.lastY)==-1){
                jt.draw.cam.y+=jt.math.random(0,jt.loop.shakeObj.force)
            }
            jt.loop.shakeObj.lastY=jt.draw.cam.y;

            if(jt.loop.shakeObj.duration>0){
                jt.loop.shakeObj.duration--;
                if(jt.loop.shakeObj.reduce!=undefined && jt.loop.shakeObj.reduce>0){
                    if(jt.loop.shakeObj.force>0){
                        jt.loop.shakeObj.force-=jt.loop.shakeObj.reduce;
                    }
                    
                }
            }else{
                jt.draw.cam.x=jt.loop.normalX;
                jt.draw.cam.y=jt.loop.normalY;
                jt.loop.normalX=undefined;
                jt.loop.normalY=undefined;
                jt.loop.shakeObj=undefined;
            }
        }
    },
    
    
    
    
    
    
    
    
    //***** ASSETS *****//
    assets:{
        //images:
        images:{},
        //anims
        anims:{},
        //sounds
        sounds:{},
        
        
        //image constructor
        image:function(name,src,x,y,visible){
            
            jt.assets.images[name]={};
            jt.assets.images[name].img=new Image();
            jt.assets.images[name].img.src=src;
            jt.assets.images[name].x=0;
            jt.assets.images[name].y=0;
            
            if(x!=undefined){jt.assets.images[name].x=x}
            if(y!=undefined){jt.assets.images[name].y=y}
            
            if(visible!=undefined){
                jt.assets.images[name].visible=visible;
            }
            return jt.assets.images[name];
        },
        //create a sound
        sound:function(name,src){
            jt.assets.sounds[name]=new Audio();
            jt.assets.sounds[name].src=src;
            return jt.assets.sounds[name];
        },
        //anim constructor
        anim:function(name,src,frames,speed,x,y,visible){
            jt.assets.anims[name]={};
            jt.assets.anims[name].img=new Image();
            jt.assets.anims[name].img.src=src;
            jt.assets.anims[name].x=0;
            jt.assets.anims[name].y=0;
            
            if(x!=undefined){jt.assets.anims[name].x=x}
            if(y!=undefined){jt.assets.anims[name].y=y}
            
            if(visible!=undefined){
                jt.assets.anims[name].visible=visible;
            }
            
            jt.assets.anims[name].frame=0;
            jt.assets.anims[name].distance=0;
            jt.assets.anims[name].frames=0;
            jt.assets.anims[name].frameW=0;
            jt.assets.anims[name].speed=0;
            jt.assets.anims[name].pause=false;
            
            if(frames!=undefined){jt.assets.anims[name].frames=frames}
            if(speed!=undefined){jt.assets.anims[name].speed=speed}
            
            
            return jt.assets.anims[name];
        },
        //play a sound
        play:function(name){
            jt.assets.sounds[name].play();  
        },
        //pause a sound
        pause:function(name){
            jt.assets.sounds[name].pause();  
        },
        //stop a sound (reset it to 0)
        stop:function(name){
            jt.assets.sounds[name].pause();
            jt.assets.sounds[name].currentTime=0;
        },
        //collision
        collision:function(name1,name2){
            var obj1=undefined;
            //getting obj1 asset
            if(jt.assets.images[name1]!=undefined || jt.assets.anims[name1]!=undefined){
                obj1={};
                var asset=undefined;
                if(jt.assets.anims[name1]==undefined){
                    asset=jt.assets.images[name1];
                    obj1.w=asset.img.width;
                    obj1.h=asset.img.height;
                }else{
                    asset=jt.assets.anims[name1];
                    obj1.w=asset.w;
                    obj1.h=asset.h;
                }
                obj1.x=asset.x;
                obj1.y=asset.y
            }
            
            var obj2=undefined;
            //getting obj2 asset
            if(jt.assets.images[name2]!=undefined || jt.assets.anims[name2]!=undefined){
                obj2={};
                var asset=undefined;
                if(jt.assets.anims[name2]==undefined){
                    asset=jt.assets.images[name2];
                    obj2.w=asset.img.width;
                    obj2.h=asset.img.height;
                }else{
                    asset=jt.assets.anims[name2];
                    obj2.w=asset.w;
                    obj2.h=asset.h;
                }
                obj2.x=asset.x;
                obj2.y=asset.y
            }
            
            var col=false;
            
            if(obj1!=undefined && obj2!=undefined){
                col=jt.collision.rect(obj1,obj2);
            }else{
                jt.debug.error("draw.collision","No assets found")
            }
            
            return col;
        }
    },
    
    
    
    
    
    
    
    
    //***** DRAW *****//
    draw: {
        //virtual camera
        cam:{
            x:0,
            y:0,
            w:undefined,
            h:undefined
        },
        
        //gradients
        gradients:{},
        
        //font
        fontName:"Arial",
        fontSize:18,
        
        //public functions
        
        //Drawing a background
        bg: function(color) {
            jt.canvas.ctx.fillStyle = jt.draw.color(color);
            jt.canvas.ctx.fillRect(0,0,jt.canvas.src.width,jt.canvas.src.height);
        },
        
        //Drawing rectangle
        rect: function(x,y,w,h,color,rotation) {
            jt.canvas.ctx.fillStyle = jt.draw.color(color);
            jt.draw.fill("rect",x,y,w,h,rotation);
        },
        rect_ext: function(x,y,w,h,isFilled,strokeWidth,fillColor,strokeColor) {
            jt.canvas.ctx.beginPath();
            jt.draw.fill("rect",x,y,w,h);
            if(isFilled) {
                jt.canvas.ctx.fillStyle = jt.draw.color(fillColor);
                jt.canvas.ctx.fill();
            }
            if(strokeWidth > 0) {
                jt.canvas.ctx.strokeStyle = jt.draw.color(strokeColor);
                jt.canvas.ctx.lineWidth = strokeWidth;
                jt.canvas.ctx.stroke();
            }
        },
        
        //Drawing circle
        circle: function(x,y,radius,color) {
            jt.canvas.ctx.beginPath();
            jt.draw.fill("arc",x,y,radius);
            jt.canvas.ctx.fillStyle = jt.draw.color(color);
            jt.canvas.ctx.fill();
        },
        circle_ext: function(x,y,radius,isFilled,strokeWidth,fillColor,strokeColor) {
            jt.canvas.ctx.beginPath();
            t.draw.fill("arc",x,y,radius);
            if(isFilled) {
                jt.canvas.ctx.fillStyle = jt.draw.color(fillColor);
                jt.canvas.ctx.fill();
            }
            if(strokeWidth > 0) {
                jt.canvas.ctx.lineWidth = strokeWidth;
                jt.canvas.ctx.strokeStyle = jt.draw.color(strokeColor);
                jt.canvas.ctx.stroke();
            }
        },
        
        //Drawing line
        line: function(x1,y1,x2,y2,width,color,rotation) {
            jt.canvas.ctx.strokeStyle = jt.draw.color(color);
            jt.canvas.ctx.lineWidth=1;
            if(width!=undefined){
                jt.canvas.ctx.lineWidth=width;
            }
            jt.canvas.ctx.beginPath();
            jt.draw.fill("line",x1,y1,x2,y2,rotation)
            jt.canvas.ctx.stroke();
        },
        
        //Drawing text
        text:function(string,x,y,color,textAlign,rotation){
            if(textAlign!=undefined){
                jt.canvas.ctx.textAlign=textAlign
            }
            jt.canvas.ctx.fillStyle= jt.draw.color(color);
            jt.canvas.ctx.font=jt.draw.font;
            jt.draw.fill("text",x,y,string,rotation)
        },
        
        //Setting the font
        font:function(fontName,size){
            jt.draw.fontName=fontName;
            jt.draw.fontSize=size;
            jt.canvas.ctx.font=jt.draw.fontSize+"px "+jt.draw.fontName;
        },
        
        //Draw an image
        image:function(name,newX,newY,w,h,sX,sY,sW,sH,rotate){
            
            var image=jt.assets.images[name];
            
            if(jt.assets.images[name]!=undefined){
                
                if(newX!=undefined){
                    image.x=newX;
                }
                if(newY!=undefined){
                    image.y=newY;
                }

                if(w!=undefined && h!=undefined){
                    image.img.width=w;
                    image.img.height=h;
                }

                var tempW=image.img.width;
                var tempH=image.img.height;
                
                var camW=Math.abs(jt.canvas.src.width/jt.draw.cam.w)
                var camH=Math.abs(jt.canvas.src.height/jt.draw.cam.h)
                var camX=jt.draw.cam.x;
                var camY=jt.draw.cam.y;

                var x=image.x;
                var y=image.y;
                
                jt.canvas.ctx.save();
                //(x*camW)-(camX*camW),(y*camH)-(camY*camH)
                
                if(rotate!=undefined){
                    jt.canvas.ctx.translate(((tempW/2)*camW-camX*camW)+x*camW,((tempH/2)*camH-camY*camH)+y*camH);
                    jt.canvas.ctx.rotate(rotate*Math.PI/180);
                    jt.canvas.ctx.translate(((-tempW/2)*camW+camX*camW)-x*camW,((-tempH/2)*camH+camY*camH)-y*camH);
                }
                
                if(sX!=undefined){
                    //jt.canvas.ctx.drawImage(image.img,sX,sY,sW,sH,camW-camX,camH-camY,tempW*camW,tempH*camH);
                    jt.canvas.ctx.drawImage(image.img,sX,sY,sW,sH,(x*camW)-(camX*camW),(y*camH)-(camY*camH),tempW*camW,tempH*camH);
                }else{
                    //jt.canvas.ctx.drawImage(image.img,camW-camX,camH-camY,tempW*camW,tempH*camH);
                    jt.canvas.ctx.drawImage(image.img,(x*camW)-(camX*camW),(y*camH)-(camY*camH),tempW*camW,tempH*camH);
                }
                jt.canvas.ctx.restore();
            }else{
                jt.debug.error("draw.image","No image found")
            }
          },
        
        //Draw an animation
        anim:function(name,newX,newY,w,h,rotate){
            
            var anim=jt.assets.anims[name];
            
            if(jt.assets.anims[name]!=undefined){
                if(newX!=undefined){
                    anim.x=newX;
                }
                if(newY!=undefined){
                    anim.y=newY;
                }

                anim.w=anim.frameW;
                anim.h=anim.img.height;

                if(w!=undefined && h!=undefined){
                    anim.w=w;
                    anim.h=h;
                }

                var tempW=anim.w;
                var tempH=anim.h;
                
                //vcam
                var camW=jt.canvas.src.width/jt.draw.cam.w
                var camH=jt.canvas.src.height/jt.draw.cam.h
                var camX=jt.draw.cam.x;
                var camY=jt.draw.cam.y;

                var x=anim.x;
                var y=anim.y;
                
                jt.canvas.ctx.save();
                
                if(rotate!=undefined){
                    jt.canvas.ctx.translate(((tempW/2)*camW-camX*camW)+x*camW,((tempH/2)*camH-camY*camH)+y*camH);
                    jt.canvas.ctx.rotate(rotate*Math.PI/180);
                    jt.canvas.ctx.translate(((-tempW/2)*camW+camX*camW)-x*camW,((-tempH/2)*camH+camY*camH)-y*camH);
                }
                
                jt.canvas.ctx.drawImage(anim.img,anim.frame*anim.frameW,0,anim.frameW,anim.img.height,(x*camW)-(camX*camW),(y*camH)-(camY*camH),tempW*camW,tempH*camH);
                
                jt.canvas.ctx.restore();
            }else{
                jt.debug.error("draw.anim","No animation found")
            }
            

          },
        
        //Gradients
        
        //linear gradient
        linear:function(name,x1,y1,x2,y2,stops){
            jt.draw.gradients[name]=jt.canvas.ctx.createLinearGradient(x1,y1,x2,y2)
            
            for(var i=0;i<stops.length;i++){
                jt.draw.gradients[name].addColorStop(i/(stops.length-1),stops[i]);
            }
            
            return jt.draw.gradients[name];
        },
        
        //radial gradient
        radial:function(name,x1,y1,r1,x2,y2,r2,stops){
            jt.draw.gradients[name]=jt.canvas.ctx.createRadialGradient(x1,y1,r1,x2,y2,r2)
            
            for(var i=0;i<stops.length;i++){
                jt.draw.gradients[name].addColorStop(i/(stops.length-1),stops[i]);
            }
            
            return jt.draw.gradients[name];
        },
        
        
        //private functions
        
        //Changes the color
        color: function(col) {
            var converted=col;
            if(col!=undefined){
                if(col.gradient!=undefined){
                    var gradient=undefined
                    if(col.gradient=="linear"){
                        gradient=ctx.createLinearGradient(col.x,col.y,col.w,col.h);
                    }else if(col.gradient=="radiant"){
                        gradient=ctx.createLinearGradient(col.x,col.y,col.w,col.h);
                    }
                }else
                if(Array.isArray(col)){
                    //rgb
                    if(col.length==3){
                        converted="rgb("+col[0]+","+col[1]+","+col[2]+")";
                    }else if(col.length==4){
                        converted="rgba("+col[0]+","+col[1]+","+col[2]+","+col[3]+")";
                    }
                }
            }
            return converted;
        },
        
        //Drawing
        fill:function(type,x,y,w,h,rotation){
            var camW=Math.abs(jt.canvas.w/jt.draw.cam.w)
            var camH=Math.abs(jt.canvas.h/jt.draw.cam.h)
            var camX=jt.draw.cam.x;
            var camY=jt.draw.cam.y;
            jt.canvas.ctx.save();
            if(rotation!=undefined){
                jt.canvas.ctx.translate(((w/2)*camW-camX*camW)+x*camW,((h/2)*camH-camY*camH)+y*camH);
                jt.canvas.ctx.rotate(rotation*Math.PI/180);
                jt.canvas.ctx.translate(((-w/2)*camW+camX*camW)-x*camW,((-h/2)*camH+camY*camH)-y*camH);
            }
            switch(type){
                case "rect":
                    jt.canvas.ctx.fillRect((x*camW)-(camX*camW),(y*camH)-(camY*camH),w*camW,h*camH);
                    break;
                case "arc":
                    jt.canvas.ctx.arc((x*camW)-(camX*camW),(y*camH)-(camY*camH),w*camW,0,2*Math.PI);
                    break;
                case "text":
                    jt.canvas.ctx.fillText(w,(x*camW)-(camX*camW),(y*camH)-(camY*camH))
                    break;
                case "line":
                    jt.canvas.ctx.moveTo((x*camW)-(camX*camW),(y*camH)-(camY*camH));
                    jt.canvas.ctx.lineTo((w*camW)-(camX*camW),(h*camH)-(camY*camH));
                    break;
            }
            jt.canvas.ctx.restore();
            
        }
    },
    
    
    
    
    
    
    
    
    //***** KEYBOARD *****//
    keyboard: {
        keysdown:[],
        check: function(keyCode) {
            var found = false;
            for(var i=0; i<jt.keyboard.keysdown.length; i++) {
                if(jt.keyboard.keysdown[i] == keyCode) {found=true;}
            }
            return found;
        },
        
        release: function(keyCode) {
            var found = undefined;
            for(var i=0; i<jt.keyboard.keysdown.length; i++) {
                if(jt.keyboard.keysdown[i] == keyCode) {found=i;}
            }
            if(found!=undefined){
                jt.keyboard.keysdown.splice(found,1);
            }
        }
    },
    
    
    
    
    
    
    
    
    //***** MOUSE *****//
    mouse: {x:0, y:0, down:false},
    
    
    
    
    
    
    
    
    //***** MATH *****//
    math: {
        random: function(min,max) {return Math.floor(Math.random()*(max-min+1)+min);},
        between: function(num,min,max) {return num>=min && num<=max;},
        choose: function(min,max) {
            var ran=jt.math.random(0,1);
            if(ran==0){
                return min;
            }else{
                return max;
            }
        },
        
        dist: function(obj1,obj2) {return Math.sqrt(Math.pow(obj1.x-obj2.x,2) + Math.pow(obj1.y-obj2.y,2))},
        dist_point: function(x1,y1,x2,y2) {return Math.sqrt(Math.pow(x1-x2,2) + Math.pow(y1-y2,2))},
        
        //Get an angle from 2 points, 0 degrees is at right and goes clockwise
        anglePoint:function(obj1,obj2){
            var deltaX=obj2.x-obj1.x;
            var deltaY=obj2.y-obj1.y;
            var theta=(Math.atan2(deltaY,deltaX))*180/Math.PI
            if(theta<0){
                theta=360+theta;
            }
            return theta;
        },
        
        //Get the horizontal ratio of an angle
        cos:function(angle){
            return Math.cos(angle*Math.PI/180)
        },
        
        //Get the vertical ratio of an angle
        sin:function(angle){
            return Math.sin(angle*Math.PI/180)
        },
        
        //Get the angle from a direction
        angleDir:function(x,y){
            var angle=Math.atan2(x,y)
            var degrees=180*angle/Math.PI
            return degrees;
        },
        
        matrix: function(w,h,value){
            var mat=new Array(h);
            for(var i=0;i<mat.length;i++){
                mat[i]=new Array(w);
                for(var j=0;j<mat[i].length;j++){
                    mat[i][j]=value;
                }
            }
            return mat;
        },
        
        
    },
    
    
    
    
    
    
    
    
    //Test collisions
    collision: {
        
         //between 2 objects with their x,y,width and height
        rect: function(rect1,rect2) {
            // **** should check if the width/height vars are 'h' form or 'height' form
            if (rect1.x < rect2.x + rect2.w &&
                rect1.x + rect1.w > rect2.x &&
                rect1.y < rect2.y + rect2.h &&
                rect1.h + rect1.y > rect2.y) {
                return true;
            }
        },
    },
    
    
    
    
    
    
    
    
    Vector:function(x,y){
        this.x=x;
        this.y=y;
    },
    
    
    
    
    
    
    
    
    //***** HTML *****//
    html:{
        //Get an HTML element with the ID
        id:function(id){return document.getElementById(id);},
        
        //Get an HTML element with the className
        class:function(className){return document.getElementsByClassName(className);}
    },
    
    
    
    
    
    
    
    
    //***** DEBUG *****//
    debug:{
        //public
        show:false,
        
        //private
        
        log:function(from,message){
            if(jt.debug.show){
                console.log("JT log from "+from+" : "+message)
            }
        },
        
        error:function(from,message){
            if(jt.debug.show){
                console.log("JT error from "+from+" : "+message)
            }
        }
    },
    
    
    
    
    
    
    
    
    //***** EVENT LISTENERS *****//         //created by function "createEventListeners" in canvas.init()
    createEventListeners: function() {
        jt.canvas.src.addEventListener("mousemove", function(evt) {
            var rect = jt.canvas.src.getBoundingClientRect();
            jt.mouse.x = Math.round((evt.clientX-rect.left)/(rect.right-rect.left)*jt.canvas.src.width/(jt.canvas.src.width/jt.draw.cam.w));
            jt.mouse.y = Math.round((evt.clientY-rect.top)/(rect.bottom-rect.top)*jt.canvas.src.height/(jt.canvas.src.height/jt.draw.cam.h));
        });
        
        jt.canvas.src.addEventListener("mousedown", function(evt) {
            jt.mouse.down=true;
        });
        
        jt.canvas.src.addEventListener("mouseup", function(evt) {
            jt.mouse.down=false;
        });

        document.addEventListener("keydown", function(){
            var keys = jt.keyboard.keysdown;
            var found = false;
            for(var i=0; i<keys.length; i++) {if(keys[i]==event.keyCode) {found = true;}}
            if(found==false) {jt.keyboard.keysdown.push(event.keyCode);}
        });

        document.addEventListener("keyup", function(){
            var keys = jt.keyboard.keysdown;
            for(var i=0; i<keys.length; i++) {
                if(keys[i]==event.keyCode) {jt.keyboard.keysdown.splice(i,1);}
            }
        });
    }
};








jt.Vector.prototype.add=function(vector){
    this.x+=vector.x;
    this.y+=vector.y;
}

jt.Vector.prototype.mult=function(vector){
    this.x*=vector.x;
    this.y*=vector.y;
}






/*
JTv5:
-added jt.Vector
-added math function choose
-added cam shake
-Cam zoom fixed
-bugfixes

JT library guide

1-Initialize
1.1-Getting started
1.2-Different names and methods

2-Ressources
2.1-Preloading ressources
2.2-Drawing/playing ressources
2.3-Virtual Camera
2.4-Accessing ressources
2.5-Drawing shapes

3-Input
3.1-Keyboard
3.2-Mouse

4-Others
4.1-Alarms
4.2-Random
4.3-Collisions
4.4-Math

5.1-Oject Template





//1-Initialize

1.1:First off, you'll need to create an HTML file that links this library and that has a canvas like so:

<html>
    <head>
        <title>Test</title>
    </head>
    <body>
        <canvas id="can"></canvas>
    </body>
    <script src="jt_libv3.js"></script>
    <script>
        function preload(){}
        function setup(){}
        function update(){}
        
        jt.canvas.init("can",500,500,60);
    </script>
</html>

The three functions are used to preload ressources, setup the app and then update with a loop

The method jt.canvas.init should be called at the end of the script


1.2:You can also change the function names, although you have to specify it to the init like so:

function preload2(){}
function setup2(){}
function update2(){}

jt.canvas.init("can",500,500,60,["preload2","setup2","update2"]);

You can also put the functions as methods inside an object like so:

var object={
    preload:function(){},
    setup:function(){},
    update:function(){}
}

jt.canvas.init("can",500,500,60,["preload","setup","update","object"]);

The first four parameters of the init method are the canvas HTML id, the width, the height and the FPS rate





//2-Ressources

2.1:Preloading ressources is easy in the JT library, just load them inside the preload function

function preload(){
    jt.assets.image("imageName","imageSrc")//loading an image
    jt.assets.sound("soundName","soundSrc")//loading a sound jt.assets.anim("animAnim","animSrc","numberOfFrames","animationSpeed")//loading an animation
}

the animationSpeed is equal to the FPS rate of the canvas, so 1 = the FPS in the canvas, to make it twice as slow, it should be 0.5


2.2:Drawing/playing ressources

function update(){
    jt.draw.image("imageName");
    jt.draw.anim("animName");
    jt.assets.play("soundName");
}


2.3:Virtual Camera
The virtual camera lets you move the view inside the canvas, you can change it's x,y,width and height like so:

jt.draw.cam.x++;

You can also create a camera shake effect like so:

jt.loop.shake(force,duration,reduce);


2.4:Accessing ressources

You can access your assets like so:
jt.assets.images["imageName"]


2.5:Drawing shapes

Drawing a rectangle:
jt.draw.rect(x,y,w,h,color,rotation)

Drawing a circle:
jt.draw.circle(x,y,radius,color)

Drawing a line:
jt.draw.line(x1,y1,x2,y2,width,color,rotation)

Changing the font:
jt.draw.font(fontName,size)

Drawing text:
jt.draw.text(string,x,y,color,textAlign,rotation)





//*3:Inputs are separated into keyboard and mouse

3.1:Keyboard inputs can be checked using the check method:

jt.keyboard.check(keyCode)//will return true or false

You can also deactivate a key with the jt.keyboard.release(keyCode)

Keycodes can be found here : http://keycode.info/

For example, 37 to 40 are the arrow keys, starting from left and going clockwise


3.2:Mouse can be directly checked with jt.mouse.x/jt.mouse.y/jt.mouse.down (if the mouse button is down)





//4:Others are other functions in JT

4.1:Alarms are objects with a time attribute that goes down constantly
They can used to delay actions, you can create one like so:
jt.loop.addAlarm(name,time);

And you can check if the alarm is done with:
jt.loop.checkAlarm(name) which will return a true or false, and it will also destroy the alarm if its time is <=0


4.2:Random

The random method will already round up the numbers
jt.math.random(minimum,maximum)


4.3:collision
To verify collision between 2 rectangles (objects who have a x,y,w and h attributes)

jt.collision.rect(object1,object2)


4.4:Math

Various math method can be found in the jt_lib, check them out at around the 775th line of this html file!





//5-Object template:

<html>
    <head>
        <title>Tony Level Maker</title>
        <style>
            canvas{
                border: 1px solid black;
            }
            button{
                display: inline-block;
            }
        </style>
    </head>
    <body>
        <canvas id="can"></canvas>
    </body>
    <script src="jt_libv5.js"></script>
    <script>
        
        var app={
            preload:function(){
                
            },
            setup:function(){
                
            },
            update:function(){
                
            }
        }
        
        jt.canvas.init("can",800,600,60,["preload","setup","update","app"])
    </script>
</html>

*/
