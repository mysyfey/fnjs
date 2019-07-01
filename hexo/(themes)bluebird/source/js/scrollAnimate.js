;
(function($, win) { //立即执行函数

    'use strict';

    var vwTOpx = function (value) {
            var w = window,
                d = document,
                e = d.documentElement,
                g = d.getElementsByTagName('body')[0],
                x = w.innerWidth || e.clientWidth || g.clientWidth,
                y = w.innerHeight || e.clientHeight || g.clientHeight;

            var result = (x * value) / 100;
            return result;
        },

        vhTOpx = function (value) {
            var w = window,
                d = document,
                e = d.documentElement,
                g = d.getElementsByTagName('body')[0],
                x = w.innerWidth || e.clientWidth || g.clientWidth,
                y = w.innerHeight || e.clientHeight || g.clientHeight;

            var result = (y * value) / 100;
            return result;
        },

        pxTOvw = function (value) {
            var w = window,
                d = document,
                e = d.documentElement,
                g = d.getElementsByTagName('body')[0],
                x = w.innerWidth || e.clientWidth || g.clientWidth,
                y = w.innerHeight || e.clientHeight || g.clientHeight;

            var result = (100 * value) / x;
            return result;
        },

        pxTOvh = function (value) {
            var w = window,
                d = document,
                e = d.documentElement,
                g = d.getElementsByTagName('body')[0],
                x = w.innerWidth || e.clientWidth || g.clientWidth,
                y = w.innerHeight || e.clientHeight || g.clientHeight;

            var result = (100 * value) / y;
            return result;
        },

        toDecimal = function (x) {
            var f = parseFloat(x);
            if (isNaN(f)) {
                return;
            }
            f = Math.round(x * 100) / 100;
            return f;
        };
        

    /*
        "startVal":"默认值",
        "endVal":"目标值",
        "cssAttr":"执行动画的属性",
        "attrUnit" : "属性值的单位（默认px，vh，vw, em元素身高比例）",
        "beforeAttr" : "属性值后要加的字符",
        "afterAttr" : "属性值后要加的字符",
        "willChange":"加速属性", 

        "topSpacing":"滚动起始偏移量",
        "scrollLength":"滚动长度",
        "startWhenEl" : "前提是当元素滚动到视窗之后（bool）"，
        "scrollUnit" : "指定topSpacing和scrollLength的单位（默认px，vh，em元素身高比例）",
    */

    $.scrollAnimate = function(options) {


        var animElements = [],
            //outputEl = $("#aimengxiang"),
            $window = $(win),
            $document = $(document),

            scroller = function() {

                var scrollTop = $window.scrollTop(),
                    documentHeight = $document.height(),
                    dwh = documentHeight - $window.height();

                for (var i = 0, l = animElements.length; i < l; i++) {

                    var animEl = animElements[i]

                    for (var ai = 0; ai < animEl.animations.length; ai++) {

                        var anim = animEl.animations[ai],
                            $el = animEl.element,
                            scrollStart = anim.topSpacing,
                            scrollEnd = anim.scrollLength,
                            btm = scrollStart + scrollEnd;

                        /*if(window.screen.width < 576) {
                          scrollStart -= 50;
                          scrollEnd -= 50;
                        }*/

                        if (scrollTop >= scrollStart && scrollTop <= btm) {

                            if (anim.willChange && $el.css("will-change") == "auto")
                                $el.css("will-change", anim.willChange);

                            var scrollPercent = toDecimal((scrollTop - scrollStart) / scrollEnd),
                                offset = toDecimal((anim.endVal - anim.startVal) * scrollPercent),
                                value = anim.value = (anim.startVal + offset);

                            $el.css(anim.cssAttr, (anim.beforeAttr ? anim.beforeAttr : "") + value + (anim.afterAttr ? anim.afterAttr : ""));


                        } else if (scrollTop < scrollStart) {

                            if (anim.value != anim.startVal)
                                $el.css(anim.cssAttr, (anim.beforeAttr ? anim.beforeAttr : "") + anim.startVal + (anim.afterAttr ? anim.afterAttr : ""));

                            //if($el.css(animEl.cssAttr) != value) {

                            /*if (animEl.firstTime) {
                                animEl.firstTime = false;
                                $el.css(animEl.cssAttr, value);
                            } else*/
                            if (anim.willChange) {

                                if (scrollStart > 0) {
                                    if (scrollTop < scrollStart - 100) {
                                        if ($el.css("will-change") != "auto")
                                            $el.css("will-change", "");
                                    } else if ($el.css("will-change") == "auto")
                                        $el.css("will-change", anim.willChange);
                                }
                            }

                        } else if (scrollTop > btm) {

                            if (anim.value != anim.endVal)
                                $el.css(anim.cssAttr, (anim.beforeAttr ? anim.beforeAttr : "") + anim.endVal + (anim.afterAttr ? anim.afterAttr : ""));

                            if (anim.willChange) {

                                if (scrollTop > $el.offset().top + $el.height()) {

                                    if ($el.css("will-change") != "auto")
                                        $el.css("will-change", "");

                                } else if ($el.css("will-change") == "auto")
                                    $el.css("will-change", anim.willChange);
                            }
                        }
                    }
                }

            },

            calcUnit = function(anim, element) {

                if (anim.attrUnit) {

                    if (anim.startVal != 0) {
                        if (anim.attrUnit == "vh")
                            anim.startVal = vhTOpx(anim.startVal);
                        else if (anim.attrUnit == "vw")
                            anim.startVal = vwTOpx(anim.startVal);
                        else if (anim.attrUnit == "em") {
                            anim.startVal = element.height() * anim.startVal;
                        }
                    }

                    if (anim.endVal != 0) {
                        if (anim.attrUnit == "vh")
                            anim.endVal = vhTOpx(anim.endVal);
                        else if (anim.attrUnit == "vw")
                            anim.endVal = vwTOpx(anim.endVal);
                        else if (anim.attrUnit == "em") {
                            anim.endVal = element.height() * anim.endVal;
                        }
                    }

                    if (anim.endVal != 0)
                        anim.endVal = anim.attrUnit == "vh" ? vhTOpx(anim.endVal) : vwTOpx(anim.endVal);
                }

                if (anim.scrollUnit == "vh") {

                    if (anim.topSpacing != 0)
                        anim.topSpacing = vhTOpx(anim.topSpacing);

                    if (anim.scrollLength != 0)
                        anim.scrollLength = vhTOpx(anim.scrollLength);

                } else if (anim.scrollUnit == "em") {

                    var height = element.height(),
                        e = height * anim.scrollLength;
                    anim.scrollLength = e > 60 ? e : 60;
                    anim.topSpacing = height * anim.topSpacing;
                }

                if (anim.startWhenEl) {
                    anim.topSpacing += (element.offset().top - document.documentElement.clientHeight);
                }



            };

        $(".scroll-anim").each(function(index, el) {

            if (el.dataset.scrollAnimation) {

                var animEl = new Object();
                animEl.animations = [];
                animEl.element = $(el);

                var loadAttr = function(attr) {
                    var anim = eval('(' + attr + ')');
                    calcUnit(anim, animEl.element);
                    animEl.animations.push(anim);
                };

                loadAttr(el.dataset.scrollAnimation);
                if (el.dataset.scrollAnimation1)
                    loadAttr(el.dataset.scrollAnimation1);

                animElements.push(animEl);
            }
        });

        if (animElements.length > 0) {
            $(window).scroll(function(event) {
                scroller();
            });

            /*$(window).resize(function() {

            });*/

            scroller();
        }

    };


/*
        var a;
        var beforeScrollTop = document.documentElement.scrollTop,
            fn = fn || function() {};
        window.addEventListener("scroll", function() {
            var afterScrollTop = document.documentElement.scrollTop,
                delta = afterScrollTop - beforeScrollTop;
            if( delta === 0 ) return false;
            fn( delta > 0 ? "down" : "up" );
            beforeScrollTop = afterScrollTop;
        }, false);
        var nav = document.getElementById("nav");
        function fn(direction) { 
            // console.log(direction);
   

                nav.className=(direction==="down")?"down":"";        
    
        };
        
        
  */  

})(jQuery, window);