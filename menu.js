var menu={
    update:function(){
        //DRAW
        jt.draw.bg("black");
        jt.draw.font("Arial",24);
        jt.draw.text("Press space to start",jt.canvas.w/2,jt.canvas.h/2,"white","center")
        
        //CODE
        if(jt.keyboard.check(32)){
            game.start();
            app.state="game";
        }
    }
}