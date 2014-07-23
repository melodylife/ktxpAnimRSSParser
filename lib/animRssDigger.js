var feedparser = require('feedparser');
var http = require('http');
var config = require('../configuration/config.js');
var request = require('request');
var downloader = require('download');
var monk = require('monk');
var db = monk('127.0.0.1:27017/following');
var anims = db.get('anims');

var torrentDir = config.torrentdir;

anims.find({} , function(err , docs){
  if(err){
    console.log('Failed to find anything from DB ' + err.toString());
  }
  else{
    for (var i in docs){
      console.log('This is the name ' + docs[i].Name);
      queryFeed(docs[i]);
    }
  }
});

function queryFeed(followAnim){
  console.log('Query data from this link ' + followAnim.RssLink.toString());
  var req = request(followAnim.RssLink.toString() , {timeout: 100000, pool: false});
  var rssParser = new feedparser();

  req.on('response' , function(res){
	  var stream = this;
	  stream.pipe(rssParser);
	  return;
  });

  rssParser.on('end', done);

  rssParser.on('readable' , function(){
	  var stream = this;
	  var item;

      //console.log('We are looking for ' + followAnim.Name + followAnim.Team + followAnim.DownloadedEpisodes[followAnim.DownloadedEpisodes.length - 1]);
	  while(item = stream.read()){
		//var obj = new Object();
          var title = followAnim.Name;
          var subTeam = followAnim.Team;
          var epNo = followAnim.DownloadedEpisodes[followAnim.DownloadedEpisodes.length - 1];
          var destDir = '/Users/sunchang/Movies';
          //console.log('Processing the RSS ' + item.title);
		  if(item.title.match(subTeam) && item.title.match(title) && item.title.match(epNo)){
			  console.log('This is the information ' + item.title + ' ' + item.enclosures[0].url.toString());
              var savedName = title + epNo + '.torrent';
              console.log('Found the anim. Start downloading...');
              downloader({'url': item.enclosures[0].url , 'name': savedName} , destDir).on('close' , function(){
                return process.exit(1);
              });
		  }
		/*for(var temp in item){
			console.log("This is the element " + temp + '!!!!!   ' + item[temp]);
		}*/
	  }
  });
}

function done(err){
	if(err){
		console.log('Finished parsing the feeds');
		return process.process.exit(1);
	}
}
