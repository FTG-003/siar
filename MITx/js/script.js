var site_title = "#MIT Design and Development of Educational Technology";
var page_title = ".about";

function loadPage(link){

    if ($(window).width() > 980){var delay = 600;}
    else {var delay = 0}

    $(".page .container").clearQueue();
    $(".page .wrapper").removeClass("active");
    
    $(".page .container").stop().delay(delay).queue(function() {

        $.ajax({
            url: link,
            dataType : "html",
            beforeSend: function(){
                $(".page .loader").addClass("active");
            },
            success: function (data) {
                $(".page .container").empty();
                $(".page .container").html(data);
                $(".page .container .portfolio .group:first").addClass("active");
                $(".page .loader").removeClass("active");
            },
            complete: function(){
                Activate_content();

                $('#portfolio img:last').on('load', function() {
                    Resizer();
                    Portfolio_create();
                });

                
            }
        });
    });  
   
}

function setPosition(item, angle, fulldiameter){
    var itemDistance = 0.35 * fulldiameter;
    var px = Math.cos(angle)*itemDistance + fulldiameter/2;
    var py = Math.sin(angle)*itemDistance + fulldiameter/2;
    item.css("top", py+"px");
    item.css("left", px+"px");

}

function Regulation(count){
    var num = 0;
    $(".mainmenu .menuitem").each(function(){
        var item = $(this);
        var angle = 360*Math.PI/180/count*num;
        var fulldiameter = $(".mainmenu").width(); //width(height) of menu circle

        setPosition(item, angle, 440);
        num++;
    });
}

function Rotate(item, angle){
    var angledeg = 'rotate(' + angle + 'deg)';
    item.css({
        "-webkit-transform": angledeg,
        "-moz-transform": angledeg,
        "-o-transform": angledeg,
        "-ms-transform": angledeg,
        "transform": angledeg
    });
}

function MakeMenu(itemsCount){
    Regulation(itemsCount);
    Rotate($(".mainmenu #linecontainer .overwrapper"), Math.floor(180 - 360/itemsCount));
}

function Resizer(){
    $('#background').css("zoom", $(window).width() / screen.width);
    $('#texture').css("zoom", $(window).width() / screen.width);

    if ($(window).width() > 980){
    $(".page .wrapper").height($(window).height()); //Fix for FireFox
    }

    if($(".page .container .portfolio .group.active").height() > 100){
        $(".page .container .portfolio .all-items").css("min-height", $(".page .container .portfolio .group.active").outerHeight()+"px");
    }
}

function Activate_content() {
    $(".page .wrapper").stop().delay(0).queue(function(){ $(this).addClass("active") });

    $("title").text(page_title + " | " + site_title);
}

function Portfolio_create() {

    $('#portfolio').masonry({
        columnWidth: 1,
        itemSelector: '.portfolio-item'
    });

    $("a.filter").on("click", function(){

        if ($(this).hasClass('filter-all')){
            $('#portfolio .item').each(function(){
                $(this).removeClass('portfolio-item');
                $(this).addClass('portfolio-item');
            });
        } else {
            var filterValue = $(this).text().toLowerCase().replace(' ','-');
            $('#portfolio .item').each(function(){
                $(this).removeClass('portfolio-item');
                if ($(this).hasClass(filterValue)) {
                    $(this).addClass('portfolio-item');
                }
            });
        }

        $('.filter').each(function(){
            $(this).removeClass('filter-active');
        });

        $(this).addClass('filter-active');
        $('#portfolio').masonry();

        return false;
    });

}

function GotoLink(hashlink){
	if(hashlink != ""){
        if($('a.menuitem').is($('[href*="' + hashlink + '"]'))){
            $('a[href*="' + hashlink + '"]').click();
        }
        else {
            if (~hashlink.indexOf('/')){
                parentlink = hashlink.slice(0, hashlink.indexOf('/'));;
                sublink = hashlink.substring(hashlink.indexOf('/')+1);

                while(sublink){
                    if ($('a.menuitem').is($('[href*="' + parentlink + '.html"]'))){
                        $('a.menuitem[href*="' + parentlink + '.html"]').click();
                        break;
                    } else {
                        parentlink = parentlink + '/' + sublink.slice(0, sublink.indexOf('/'));
                        sublink = sublink.substring(sublink.indexOf('/')+1);
                        sublink.replace(sublink.substring(sublink.indexOf('/')), '');

                        if (!sublink.indexOf('/')){
                        	sublink = "";
                        }
                    }
                }
            }

            loadPage(hashlink);
            window.location.hash = hashlink;
        }
        
    }
    else {$(".mainmenu .menu-items .menuitem:first").click();}
}

$(window).load(function(){
    $("a[href*='/']").on("click", function(e){
        if(!$(this).hasClass("external")){
        var anchor = $(this);
        var locate =  $.attr(this, 'href');
        window.location.hash = locate;
        }
    });

    $(".mainmenu .menu-items").on("click", ".menuitem", function(){
        if($(this).hasClass("external")){
            return true;
        }
        if(!$(this).hasClass("active")){
            if(!$(this).hasClass("bigpage")){
                $(".fullcontent").removeClass("bigpage");
                Rotate($(".mainmenu #linecontainer"), (360/$(".mainmenu .menu-items > .menuitem").length/2)+(360/$(".mainmenu .menu-items > .menuitem").length*$(this).index()));
            } else {
                $(".fullcontent").addClass("bigpage");
            }

            page_title = $(this).text();
            $(".mainmenu .menu-items .active").removeClass("active");
            $(this).addClass("active");
            loadPage($(this).attr("href"));
            return false;
        }         
        else{
        	return false;
        } 
    });

    $(".page .container").on("click", "a.innerlink", function(){
        if(!$(this).hasClass("bigpage")){
                $(".fullcontent").removeClass("bigpage");
            } else {
                $(".fullcontent").addClass("bigpage");
            }

        loadPage($(this).attr("href"));

        var anchor = $(this);
        var locate =  $.attr(this, 'href');
        window.location.hash = locate;

        return false;
    });

    $(".page .container").on("focusin", ".contacts input", function(){
        $(this).siblings("i").addClass("active");
    });
    $(".page .container").on("focusout", ".contacts input", function(){
        $(this).siblings("i").removeClass("active");
    });

    MakeMenu($(".mainmenu .menu-items > .menuitem").length);

    var hashlink = window.location.hash.substr(1);
    GotoLink(hashlink);

    if (!site_title){
    	site_title = $("title").text();
    }

        var Nmenu = 0;
    $(".additem").on("click", function(){

        if (Nmenu <= 8) {
        $(".mainmenu .menu-items").append("<a href='pages/demo.html' class='menuitem'><i class='icon-coffee'></i> <div class='menu-title'>Other</div></a>");
        var iCount = $(".mainmenu .menu-items > .menuitem").length;
        MakeMenu(iCount);

        $(".mainmenu .menu-items .menuitem:first").click();

        Nmenu++;
        }
        return false;
    });

    Resizer();
});

$(window).resize(function(){
    Resizer();
});