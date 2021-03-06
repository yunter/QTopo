var temp=require("./win.html");
var util=require("../util.js");
module.exports={
    init:init
};
/*
 * 初始化分组的属性操作窗口
 * @param dom  topo对象包裹外壳
 * @param scene topo对象图层
 * @param tools 需要支持的一般窗口组件
 * @returns {*|jQuery|HTMLElement} 返回初始化后的窗口对象,包含open和close函数
 */
function init(dom, scene, tools){
    var win=$(temp);
    var imageSelect=tools.imageSelect;
    //基本窗口属性初始化
    util.initBase(dom,win);
    var select=initSelect(win);
    //注册窗口打开和关闭事件
    initEvent(dom,win,scene,select);
    //劫持表单
    util.initFormSubmit(win.find("form"),function(data){
        doWithForm(win,scene,data);
        win.close();
    });
    //绑定图片选择框
    win.find(".image-select-group button").click(function(){
        imageSelect.open().then(function(data){
            setImageBtn(win,data);
        });
    });
    win.find("button.style-open").click(function(){
        tools.styleSelect
            .open(openStyle(win,scene))
            .then(function(data){
                doWithStyle(win,scene,data);
            });
    });
    return win;
}
function initEvent(dom,win,scene,select){
    win.on("window.open",function(e){
        var todo=win.data("todo");
        if(todo){
            switch (todo.type){
                case "create":
                    win.find(".panel-title").html("创建分组");
                    createWindow(win,todo.targets,scene,select);
                    break;
                case "edit":
                    win.find(".panel-title").html("修改分组");
                    editWindow(win,todo.target,scene,select);
                    break;
                default:
                    QTopo.util.error("invalid type of group,open function need to config like { type:'create' or 'edit'}");
            }
        }else{
            win.find(".panel-title").html("分组非正常打开");
            QTopo.util.error("invalid open groupWindow");
        }
    });
}
function setImageBtn(win,image){
    win.find(".image-select-group input").attr("title",image).val(image);
    win.find(".image-select-group img").attr("src",image);
}
function doWithForm(win, scene, data){
    var todo=win.data("todo");
    if(todo){
        switch (todo.type){
            case "create":
                var container=scene.createContainer({
                    type:QTopo.constant.container.GROUP,
                    position:todo.position,
                    name:data.name,
                    image:data.image,
                    layout:makeLayout(data)
                });
                container.add(todo.targets);
                break;
            case "edit":
                if(todo.target&&todo.target.getUseType()==QTopo.constant.container.GROUP){
                    todo.target.set({
                        name:data.name,
                        layout:makeLayout(data)
                    });
                    todo.target.toggleTo.set({
                        name:data.name,
                        image:data.image
                    });
                }
                break;
        }
    }
}
function doWithStyle(win, scene, data){
    var todo=win.data("todo");
    var style=getStyle(data);
    switch (todo.type){
        case'edit':
            todo.target.set(style);
            break;
        case 'create':
            scene.setDefault(QTopo.constant.container.GROUP,style);
            break;
    }
}
function createWindow(win,targets,scene,select){
    if(!targets){
        QTopo.util.error("invalid open containerWindow,need set targets to create");
    }
    var DEFAULT=scene.getDefault(QTopo.constant.container.GROUP);
    var DEFAULTNODE=scene.getDefault(QTopo.constant.node.IMAGE);
    util.setFormInput(win.find("form"),{
        name:DEFAULT.name,
        namePosition:DEFAULT.namePosition,
        image:DEFAULTNODE.image,
        layout:DEFAULT.layout.type
    });
    win.find("select[name=layout]").attr("disabled",true);
    select();
    setImageBtn(win,DEFAULTNODE.image);
}
function editWindow(win,target,scene,select){
    if(!target){
        QTopo.util.error("invalid open imageNodeWindow,need set target to edit");
    }
    var attr=target.attr;
    util.setFormInput(win.find("form"),{
        name:attr.name,
        namePosition:attr.namePosition,
        image:target.toggleTo.attr.image,
        layout:attr.layout.type,
        row:attr.layout.row,
        column:attr.layout.column,
        rowSpace:attr.layout.row,
        columnSpace:attr.layout.column
    });
    win.find("select[name=layout]").attr("disabled",false);
    select(attr.layout.type);
    setImageBtn(win,target.toggleTo.attr.image);
}
function openStyle(win,scene){
    var todo=win.data("todo");
    var style="";
    switch (todo.type){
        case'edit':
            style=setStyle(todo.target.attr);
            break;
        case 'create':
            style=setStyle(scene.getDefault(QTopo.constant.container.GROUP));
            break;
    }
    return style;
}
function setStyle(attr){
    return {
        namePosition:attr.namePosition,
        width:attr.size[0],
        height:attr.size[1],
        fontColor:attr.font.color,
        fontSize:attr.font.size,
        borderColor:attr.border.color,
        borderWidth:attr.border.width,
        borderRadius:attr.border.radius,
        color:attr.color
    }
}
function getStyle(data){
    if(data){
        return {
            namePosition:data.namePosition,
            color:data.color,
            size:[data.width,data.height],
            font:{
                color:data.fontColor,
                size:data.fontSize
            },
            border:{
                color:data.borderColor,
                width:data.borderWidth,
                radius:data.borderRadius
            }
        };
    }
    return {};
}
function initSelect(win){
    var rowSpace=win.find("input[name=rowSpace]");
    var rowSpaceGroup=rowSpace.closest(".form-group");
    var columnSpace=win.find("input[name=columnSpace]");
    var columnSpaceGroup=columnSpace.closest(".form-group");
    var row=win.find("input[name=row]");
    var rowGroup=row.closest(".form-group");
    var column=win.find("input[name=column]");
    var columnGroup=column.closest(".form-group");
    win.find("select[name=layout]").change(function(){
        select($(this).val(),true);
    });
    return select;
    function select(type,flag){
        var todo=win.data("todo");
        switch (type){
            case'grid':
                rowGroup.show();
                columnGroup.show();
                rowSpaceGroup.hide();
                columnSpaceGroup.hide();
                if(todo.type=="edit"&&flag){
                    var rows= Math.ceil(Math.sqrt(todo.target.children.length));
                    row.val(rows);
                    column.val(rows);
                }
                break;
            case'flow':
                rowGroup.hide();
                columnGroup.hide();
                rowSpaceGroup.show();
                columnSpaceGroup.show();
                if(todo.type=="edit"){
                    var target=todo.target;
                    rowSpace.attr("max",target.attr.size[1]/4);
                    columnSpace.attr("max",target.attr.size[0]/4);
                }
                break;
            default :
                rowGroup.hide();
                columnGroup.hide();
                rowSpaceGroup.hide();
                columnSpaceGroup.hide();
        }
    }
}
function makeLayout(data){
    var layout={};
    switch (data.layout){
        case'grid':
            layout.row=data.row;
            layout.column=data.column;
            layout.type=data.layout;
            break;
        case'flow':
            layout.row=data.rowSpace;
            layout.column=data.columnSpace;
            layout.type=data.layout;
            break;
        case'fixed':
            layout.type=data.layout;
            break;
        default :layout.type="default";
    }
    return layout;
}