var canvasW=800;
var canvasH=600;

var maps=[
    {
        load:function(){
            entities.push(new Wall(150,canvasH-200,canvasW-300,30,false));
            entities.push(new Wall(250,canvasH-275,canvasW-500,30,false));
            entities.push(new Wall(400,canvasH-350,200,10,true));
            entities.push(new Wall(400,canvasH-420,200,10,true));
        },
        spawns:[
            {
                x:160,
                y:canvasH-250
            },
            {
                x:canvasW-320,
                y:canvasH-250
            }
        ]
    }
]