$.bbNav = function(options){	
//http://cdl23.convert2mp3.net/download.php?id=youtube_U_yxtaeFuEQ&key=LtxYgHebBmQk&d=y
	var $window = $(window), 
			scrollPrev = 0, 
			hidden = false, 
			$header =options.header,
			hHeight = $header.height(),
			//safeSpace = hHeight + 30,
			scrolling = false,
			scrollStart = -1, 
			cssOffset = 0, 
			slideToScrollRatio= options.slideToScrollRatio ? options.slideToScrollRatio : 0.5,
			$navBg = options.navBg,
			navBgBottomLine = options.navBgBottomLine, 
			navBgTopLine = options.navBgTopLine ? options.navBgTopLine : navBgBottomLine * 0.15,
			navBgOpacity =0,
			navBgChanging = false;


	var scroller = function() {

		var scrollTop = $window.scrollTop();
		
		if(!$header.hasClass("disableScroll")){

				if(scrollTop >= navBgBottomLine){
					if(navBgOpacity < 1){
						navBgOpacity = 1;
						$navBg.css("opacity",navBgOpacity);
						if(navBgChanging){
							navBgChanging = false;
							$navBg.css("will-change", "");
						}
					}
				} else if(navBgOpacity > 0){

					if(scrollTop >= navBgTopLine){
					
						if(!navBgChanging){
							navBgChanging = true;
							$navBg.css("will-change", "opacity");
						}

						var top = scrollTop - navBgTopLine;
						var val = top / (navBgBottomLine - navBgTopLine);
						//test.text(val + " top : " + top);
						navBgOpacity = val;// < 0.01 ? 0 : val;
						$navBg.css("opacity",navBgOpacity);
					} else if(navBgOpacity > 0){
						navBgOpacity = 0;
						$navBg.css("opacity",navBgOpacity);
					}

					if(navBgOpacity == 0){
						navBgChanging = false;
						$navBg.css("will-change", "");
					}
				} 

				var scrollUporDown = function(down){
					if(scrollStart == -1) {
						$header.css("will-change", "transform");
					}
					scrollStart = scrollPrev;

					var scrollDelta = (scrollStart - scrollTop) * slideToScrollRatio;

					//cssOffset += down ? scrollDelta - cssOffset : scrollDelta;
					cssOffset += scrollDelta;
					var text = cssOffset;
					var finished = false;

					if(cssOffset < hHeight * -1){
						cssOffset = hHeight * -1;
						hidden = true;
						finished = true;					
					} else if(cssOffset > 0){
						cssOffset = 0;
						hidden = false;
						finished = true;
					}

					$header.css("transform", "translateY(" + cssOffset + "px)");
					if(finished){
						scrollStart = -1;
						$header.css("will-change", "");
					}
				}

				if(scrollTop < scrollPrev){
					if(hidden || scrollStart != -1){
						scrollUporDown(false);
					}
				} else if(scrollTop > scrollPrev){	

					if(!hidden || scrollStart != -1	){
							scrollUporDown(true);		
						}			
				}

		} 

					//test.text(scrollStart + "  scrollTop:"+scrollTop+ "  offset:"+cssOffset);
		scrollPrev = scrollTop;

	};

	scroller();

	$window.scroll(function(event) {
		scroller();
  });
}