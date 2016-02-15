var dubMail = {
	started: false,
	version: "0.000000000000000000019",
  queue: false,
  queueActual: []
};

dubMail.go = function(){

	$('head').append('<style type="text/css">#Scontainer{display:flex;flex-direction:column;font-family:geomanist,Helmet,Freesans,sans-serif;font-size:1rem;background-color:#fff}.s_header{flex:0 0 4rem;background-color:#eee;height:4rem;padding:.75rem calc( 16% - 1rem )}.s_header-logo{display:inline-block;font-size:1.5rem;line-height:2.5rem;font-weight:100;letter-spacing:.25em;text-transform:uppercase;height:2.5rem;color:#de586f}.s_header-search{margin-left:2rem;width:50vw;height:1.5rem;line-height:2.5rem;padding:0;font-size:1rem;color:#bbb;background-color:transparent;border-bottom:1px solid rgba(0,0,0,0.33)}.s_sidebar_meta{display:none}.s_sidebar-compose_button{display:block;height:2.5em;line-height:2.5em;font-size:.75rem;text-transform:uppercase;letter-spacing:.125em;background-color:rgba(222,88,111);border:0;border-radius:.33em}</style>');

	$('html').append('<div id="Scontainer"><header class="s_header"><div class="s_header-logo">EveMail</div><input class="s_header-search" id="sneakySearch" type="text" placeholder="start here..."></header><aside class="s_sidebar"><button class="s_sidebar-compose_button" onclick="dubMail.kill()">Compose</button><br><div class="s_sidebar_meta"><h2 class="s_sidebar_meta-title">Folders</h2><ul class="meta_list meta_list-folders"><li class="meta_list-item"><a onclick="dubMail.toggleInbox()" style="background-position: 0px -18px" href="#">Inbox</a></li><li class="meta_list-item"><a style="background-position: 0px -73px" href="#">Spam (13)</a></li><li class="meta_list-item"><a style="background-position: 0px -91px" href="#">Deleted</a></li><li class="meta_list-item"><a id="sneakyDJ">DJ Name</a></li><li class="meta_list-item"><a id="sneakyArtist" href="#">Artist</a></li><li class="meta_list-item"><a id="sneakyTrack" href="#">Track</a></li><li class="meta_list-item"><a id="sneakyFav" onclick="dubMail.toggleQueue()" href="#">Favorites</a></li></ul><h2 class="s_sidebar_meta-title">Contacts</h2><ul class="meta_list meta_list-contacts" id="peopleHere"></ul></div></aside><section class="s_main"><div class="sneakyMail"><div class="sneakyName">FROM</div><div class="sneakySubject">SUBJECT</div></div><div id="sneakyInbox"></div><div id="sneakyQueue"></div></section> </div>');

    $(".player_header").append("<span id=\"buttonThingThanks\" onclick=\"dubMail.unhide()\">EMAIL</span>");


    Dubtrack.Events.bind("realtime:chat-message", dubMail.newChat);
    Dubtrack.Events.bind("realtime:room_playlist-update", dubMail.newSong);
    Dubtrack.Events.bind("realtime:chat-skip", dubMail.songSkip);
    Dubtrack.Events.bind("realtime:user-leave", dubMail.userLeave);
  Dubtrack.Events.bind("realtime:user-join", dubMail.userJoin);

  $("#Scontainer").show();
  $("body").hide();
 var pos = $(".queue-position").text();
    var txt = "Favorites";
    if (pos != ""){
      txt += " ("+pos+"/"+$(".queue-total").text()+")";
    }
    $("#sneakyFav").text(txt);
  $('.queue-position').bind("DOMSubtreeModified", function(){
    var pos = $(".queue-position").text();
    var txt = "Favorites";
    if (pos != ""){
      txt += " ("+pos+"/"+$(".queue-total").text()+")";
    }
    $("#sneakyFav").text(txt);
  });

    $('#sneakySearch').keypress(function (e) {
 var key = e.which;
 if(key == 13)  // the enter key code
  {
  	console.log(e);
  	var stuff = $("#sneakySearch").val();
  	if (stuff != ""){
  		dubMail.speak(stuff);
  		$("#sneakySearch").val("");
  	}
  }

}); 
  var djpic = $(".imgEl").find("img").attr("alt");
  $("#sneakyDJ").text(djpic);

        $.ajax({
      dataType: "json",
      type: "GET",
      url: "https://api.dubtrack.fm/room/55f82ef944809b0300f88695/playlist/active", //TODO: make bot get roomid of current room and use that
      success: function(things) {
        var data = things.data;
        var songName = data.songInfo.name;
        var foo = songName.split(" - ");
        var artist = foo[0];
        var title = foo[1];
 if (!title){
 	title = artist;
 	artist = "Unknown";
 }

 $("#sneakyArtist").text(artist);
 $("#sneakyTrack").text(title);
      }
    });

      $.ajax({
       dataType: "json",
       type : "GET",
       url: "https://api.dubtrack.fm/room/55f82ef944809b0300f88695/users", 
            success:  function (formatted){
				 for (var i = 0; i<formatted.data.length; i++){
				 	var id = formatted.data[i]._user._id;
				 	var name = formatted.data[i]._user.username;
				 	$('#peopleHere').prepend('<li onclick="dubMail.sneakyMention(\''+name+'\')" id="yoits'+id+'">'+name+'</li>');
 				}
            }
     });
        dubMail.started = true;
  console.log("OK THIS IS DUBMAIL VERSION "+dubMail.version);
};;

dubMail.userJoin = function(data){
	var id = data.user._id;
  var name = data.user.username;
  console.log(data);
	if (!$("#yoits"+id).length){
		$('#peopleHere').prepend('<li class="meta_list-item" onclick="dubMail.sneakyMention(\''+name+'\')" id="yoits'+id+'">'+name+'</li>');
	}
};


dubMail.hide = function(){
  $("body").show();
  $("#Scontainer").hide();
};

dubMail.unhide = function(){
  $("body").hide();
  $("#Scontainer").show();
};

dubMail.toggleQueue = function(){

    $("#sneakyQueue").html("");
         $.ajax({
       dataType: "json",
       type : "GET",
       url: "https://api.dubtrack.fm/user/session/room/55f82ef944809b0300f88695/queue", 
            success:  function (formatted){
              dubMail.queueActual = [];
         for (var i = 0; i<formatted.data.length; i++){
          dubMail.queueActual.push(formatted.data[i]._id);
          var songName = formatted.data[i]._song.name;
         var foo = songName.split(" - ");
 var artist = foo[0];
 var title = foo[1];
 if (!title){
  title = artist;
  artist = "Unknown";
 }
 var id = formatted.data[i]._id;
  $('#sneakyQueue').append('<div id="sneak'+id+'" class="sneakyMail"><div title="'+artist+'" class="sneakyName">'+artist+'</div><div title="'+title+'" class="sneakySubject">'+title+'</div><div class="sneakyTime"><span onclick="dubMail.boostTrack(\''+id+'\')" class="sneakyBoost">^</span> <span onclick="dubMail.deleteTrack(\''+id+'\')" class="sneakyDelete">X</span></div></div>');
        }
            $("#sneakyInbox").hide();
    $("#sneakyQueue").show();
    dubMail.queue = true;
            }
     });

  
};

dubMail.toggleInbox = function(){
    $("#sneakyInbox").show();
    $("#sneakyQueue").hide();
    $("#sneakyQueue").html("");
    dubMail.queue = false;
};

dubMail.deleteTrack = function(id){
 $.ajax({
       dataType: "json",
       type : "DELETE",
       url: "https://api.dubtrack.fm/room/55f82ef944809b0300f88695/playlist/"+id,
       success: function(data){
        console.log(data);
        $("#sneak"+id).remove();
        for (var i=0; i<dubMail.queueActual.length; i++){
          if (dubMail.queueActual[i] == id){
            dubMail.queueActual.splice(i, 1);
          }
        }
       }
     });

};

dubMail.boostTrack = function(id){
  var dataActual = "order%5B%5D="+id+"";
  for(var i=0; i<dubMail.queueActual.length;i++){
    if (dubMail.queueActual[i] !== id){
    dataActual += "&";
      dataActual += "order%5B%5D=";
    dataActual += dubMail.queueActual[i];
    }
  }
        $.ajax({
        url: "https://api.dubtrack.fm/user/session/room/55f82ef944809b0300f88695/queue/order",
        type: "POST",
        dataType: "json",
        contentType: "application/x-www-form-urlencoded; charset=UTF-8",
        data: dataActual,
        success: function(data){
          console.log(data);
          var newThing = $("#sneak"+id).html();

          $("#sneak"+id).remove();

  $('#sneakyQueue').prepend('<div id="sneak'+id+'" class="sneakyMail">'+newThing+'</div>');

   for (var i=0; i<dubMail.queueActual.length; i++){
          if (dubMail.queueActual[i] == id){
            dubMail.queueActual.splice(i, 1);
          }
        }
        dubMail.queueActual.unshift(id);

        }
    });

};

dubMail.sneakyMention = function(name){
  var input = $("#sneakySearch").val();
  if (input == ""){
    $("#sneakySearch").val("@"+name+" ");
  } else {
    $("#sneakySearch").val(input+" @"+name+" ");
  }
};

    dubMail.format_time = function(d) {
   
        var date = new Date(d);
        
        var hours1 = date.getHours();
        var ampm = "am";
        var hours = hours1;
        if (hours1 > 12) {
            ampm = "pm";
            hours = hours1 - 12;
        }
        if (hours == 0) hours = 12;
        var minutes = date.getMinutes();
        var min = "";
        if (minutes > 9) {
            min += minutes;
        } else {
            min += "0" + minutes;
        }
        return hours + ":" + min;
    }

dubMail.userLeave = function(data){
	var id = data.user._id;
  	var name = data.user.username;

	if ($("#yoits"+id).length){
		$('#yoits'+id).remove();
	}
};

dubMail.newSong = function(data){
 var songName = data.songInfo.name;
 var foo = songName.split(" - ");
 var artist = foo[0];
 var title = foo[1];
 var djid = data.song._user;
 if (!title){
 	title = artist;
 	artist = "Unknown";
 }
setTimeout(function() {
  var djpic = $(".imgEl").find("img").attr("alt");
  $("#sneakyDJ").text(djpic);
 }, 2000);

if (djid == Dubtrack.session.id){
  if (dubMail.queue){
    dubMail.toggleQueue();
  }
}

 $("#sneakyArtist").text(artist);
 $("#sneakyTrack").text(title);

};

dubMail.kill = function(){
	$("#sneakyStyles").remove();
	$("#Scontainer").remove();
  $("body").show();
  $("#buttonThingThanks").remove();
	$("#dubmail1").remove();
	Dubtrack.Events.unbind("realtime:chat-message", dubMail.newChat);
    Dubtrack.Events.unbind("realtime:room_playlist-update", dubMail.newSong);
    Dubtrack.Events.unbind("realtime:chat-skip", dubMail.songSkip);
    Dubtrack.Events.unbind("realtime:user-leave", dubMail.userLeave);
  	Dubtrack.Events.unbind("realtime:user-join", dubMail.userJoin);
	$("#sneakySearch").unbind("keypress");
    $(".queue-position").unbind("DOMSubtreeModified");
	dubMail = null;
};

dubMail.newChat = function(data){
	var name = data.user.username;
	var msg = data.message;
	$('#sneakyInbox').prepend('<div class="sneakyMail"><div title="'+name+'" class="sneakyName">'+name+'@dubtrack.fm</div><div title="'+msg+'" class="sneakySubject">'+msg+'</div><div class="sneakyTime">'+dubMail.format_time(Date.now())+'</div></div>');
};

dubMail.songSkip = function(data){
  var name = data.username;
  $('#sneakyInbox').prepend('<div class="sneakyMail" style="font-weight:700;"><div class="sneakyName">noreply@dubtrack.fm</div><div class="sneakySubject">'+name+' skipped the song.</div><div class="sneakyTime">'+dubMail.format_time(Date.now())+'</div></div>');
};

dubMail.speak = function(txt){
  Dubtrack.room.chat._messageInputEl.val(txt);
  Dubtrack.room.chat.sendMessage();
};

if (!dubMail.started) dubMail.go();