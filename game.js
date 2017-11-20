var game={
    tile:{
        w:10,
        h:10,
    },
    map:{
        h:0,
        w:0,
    },
    loadMap:function(map,number){
        var players=number;
        
        map.load();
        
        
        this.map.w=jt.canvas.w;
        this.map.h=jt.canvas.h;
        
        //jt.draw.cam.w=this.map.w;    
        //jt.draw.cam.h=this.map.h;    
            
        for(var i=0;i<number;i++){
            var sX=map.spawns[i].x;
            var sY=map.spawns[i].y;
            entities.push(new Player(sX,sY))
        }
    },
    start:function(){
        this.loadMap(maps[0],1);
    },
    update:function(){
        //DRAW
        jt.draw.bg("#DDD");
        
        for(var i=0;i<entities.length;i++){
            var entity=entities[i];
            entity.update();
        }
        
    }
}