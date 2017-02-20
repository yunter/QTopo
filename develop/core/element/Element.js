/**
 * Created by qiyc on 2017/2/7.
 */
module.exports = Element;
function Element(jtopo) {
    if(jtopo){
        this.jtopo=jtopo;
        jtopo.qtopo=this;
    }
}
Element.prototype.show = function () {
    switch (this.getType()) {
        case QTopo.constant.NODE:
            toggleNode.call(this, true);
            break;
        case QTopo.constant.CONTAINER:
            toggleContainer.call(this, true);
            break;
        case QTopo.constant.LINK:
            toggleLink.call(this, true);
    }
};
Element.prototype.hide = function () {
    switch (this.getType()) {
        case QTopo.constant.NODE:
            toggleNode.call(this, false);
            break;
        case QTopo.constant.CONTAINER:
            toggleContainer.call(this, false);
            break;
        case QTopo.constant.LINK:
            toggleLink.call(this, false);
    }
};
Element.prototype.setUseType=function(type){
    this.attr.useType=type;
};
Element.prototype.getUseType=function(){
    return this.attr.useType;
};
Element.prototype.setText = function (text) {
    if (text) {
        this.jtopo.text = text;
    }
    this.attr.text = this.jtopo.text;
};
Element.prototype.on = function (name, fn) {
    this.jtopo.addEventListener(name, function (e) {
        if (e.target && e.target.qtopo) {
            fn(e, e.target.qtopo);
        } else {
            fn(e);
        }
    });
};
Element.prototype.off = function (name, fn) {
    this.jtopo.removeEventListener(name);
};
Element.prototype.setZIndex = function (zIndex) {
    if ($.isNumeric(zIndex)) {
        this.jtopo.zIndex = parseInt(zIndex);
    }
    this.attr.zIndex = this.jtopo.zIndex;
};
Element.prototype.setFont = function (font) {
    var type = this.attr.font.type;
    var size = this.attr.font.size;
    if (font) {
        if ($.isNumeric(font.size)) {
            size = font.size;
        }
        if (font.type) {
            type = font.type;
        }
        this.jtopo.font = size + "px " + type;
        if (font.color) {
            this.jtopo.fontColor = QTopo.util.transHex(font.color.toLowerCase());
        }
    }
    this.attr.font.type = font.type;
    this.attr.font.size = font.size;
    this.attr.font.color = this.jtopo.fontColor;
};
Element.prototype.setAlpha = function (alpha) {
    if ($.isNumeric(alpha) && alpha <= 1 && alpha > 0) {
        this.jtopo.alpha = alpha;
    } else {
        this.jtopo.alpha = 1;
    }
    this.attr.alpha = this.jtopo.alpha;
};
Element.prototype.setTextOffset = function (arr) {
    if ($.isArray(arr) && arr.length >= 2) {
        this.jtopo.textOffsetX = arr[0];
        this.jtopo.textOffsetY = arr[1];
    }
    this.attr.textOffset = [this.jtopo.textOffsetX, this.jtopo.textOffsetY];
};
Element.prototype.setPosition = function (position) {
    if ($.isArray(position) && position.length >= 2) {
        if ($.isNumeric(position[0]) && $.isNumeric(position[1])) {
            this.jtopo.setLocation(parseInt(position[0]), parseInt(position[1]));
        }
    }
    this.attr.position = [this.jtopo.x, this.jtopo.y];
};
Element.prototype.setSize = function (size) {
    if ($.isArray(size) && size.length >= 2) {
        this.jtopo.setSize(size[0], size[1]);
    }
    this.attr.size = [this.jtopo.width, this.jtopo.height];
};
Element.prototype.setDragable = function (dragable) {
    if (typeof dragable == 'boolean') {
        this.jtopo.dragable = dragable;
    }
    this.attr.dragable = this.jtopo.dragable;
};
Element.prototype.setTextPosition = function (textPosition) {
    var jtopo = this.jtopo;
    jtopo.text = this.attr.name || "";
    switch (textPosition) {
        case 'hide':
            jtopo.text = '';
            this.attr.textPosition = "hide";
            break;
        case 'bottom':
            jtopo.textOffsetX = 0;
            jtopo.textOffsetY = 0;
            jtopo.textPosition = "Bottom_Center";
            this.attr.textPosition = "bottom";
            break;
        case 'top':
            jtopo.textOffsetX = 0;
            jtopo.textOffsetY = 0;
            jtopo.textPosition = "Top_Center";
            this.attr.textPosition = "top";
            break;
        case 'left':
            jtopo.textOffsetX = -5;
            jtopo.textOffsetY = 0;
            jtopo.textPosition = "Middle_Left";
            this.attr.textPosition = "left";
            break;
        case 'right':
            jtopo.textOffsetX = 5;
            jtopo.textOffsetY = 0;
            jtopo.textPosition = "Middle_Right";
            this.attr.textPosition = "right";
            break;
        default:
            jtopo.textOffsetX = 0;
            jtopo.textOffsetY = 0;
            jtopo.textPosition = 'Bottom_Center';
            this.attr.textPosition = "bottom";
            console.error(this, "set wrong textPosition,default is bottom");
            break;
    }
};
//只要对应属性有方法则修改
Element.prototype._setAttr = function (config) {
    var self = this;
    $.each(config, function (k, v) {
        try {
            var fn = self['set' + QTopo.util.upFirst(k)];
            if (fn) {
                //v=QTopo.util.merge(self.attr[k],v);
                fn.call(self, v);
            }
        } catch (e) {
            console.error(self, "Element _setAttr error :" + k, e);
        }
    });
};
/**对象links属性内的所有线进行切换
 *@links node/container的links属性
 * @fn 'show'/'hide'方法名
 */
function toggle(links, fn) {
    try{
        $.each(links,function(name,arr){
            for (var i = 0; i < arr.length; i++) {
                arr[i][fn]();
            }
        })
    }catch (e){
        console.error("切换隐藏/显示时错误",e);
    }
}
//线的显示只有当其两端节点都显示时才显示
function toggleLink(flag) {
    if(flag){
        if (this.path.start.jtopo && this.path.end.jtopo) {
            if (this.path.start.jtopo.visible && this.path.end.jtopo.visible) {
                this.jtopo.visible = true;
                this.attr.show = this.jtopo.visible;
            }
        }
    }else{
        this.jtopo.visible = false;
        this.attr.show = this.jtopo.visible;
    }
}
function toggleNode(flag) {
    this.jtopo.visible = flag;
    this.attr.show = this.jtopo.visible;
    var string=flag?"show":"hide";
    toggle(this.links, string);
}
function toggleContainer(flag) {
    this.jtopo.visible = flag;
    this.attr.show = this.jtopo.visible;
    var string=flag?"show":"hide";
    //切换子类显示隐藏
    for (var i = 0; i < this.children.length; i++) {
        this.children[i][string]();
    }
    toggle(this.links, string);
}

