#!/usr/local/bin/node

var feedparser = require('feedparser');
var http = require('http');
var config = require('../configuration/config.js');
var request = require('request');
var downloader = require('download');
var monk = require('monk');
var db = monk('127.0.0.1:27017/following');
var anims = db.get('anims');
var sendmail = require('nodemailer');
var mailacct = require('../configuration/mailacct');

//Prepare the notifcation module 

var torrentDir = config.torrentdir;
var count = 0;
anims.find({} , function(err , docs){
  if(err){
    console.log('Failed to find anything from DB ' + err.toString());
  }
  else{
    for (var i in docs){
      count ++;
      console.log('This is the name ' + docs[i].Name + ' ' +  docs[i].Team + ' ' +  docs[i].DownloadedEpisodes[docs[i].DownloadedEpisodes.length - 1]);
      queryFeed(docs[i]);
    }
  }
});

function queryFeed(followAnim){
  console.log('Query data from this link ' + followAnim.RssLink.toString());
  //Set the header so that bt.ktxp.com can accept the call and return valid response
  var req = request(followAnim.RssLink.toString() , {timeout: 100000, pool: false, headers: {'Host': "bt.ktxp.com"}});
  var rssParser = new feedparser();

  req.on('response' , function(res){
	  var stream = this;
	  stream.pipe(rssParser);
	  return;
  });
  req.on('error' , function(err){
    console.log('Failed to request the RSS ' + err.toString());
    process.exit(1);
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
          var tempEp = parseInt(epNo);
          var nextEp = '';
          var destDir = '/Users/sunchang/Movies';
          console.log('This is the item title ' + item.title);
		  if(item.title.match(subTeam) && item.title.match(title) && item.title.match(epNo.toString())){
            nextEp = tempEp + 1;
            console.log('This is the next ep ' + nextEp);
            followAnim.DownloadedEpisodes.push(nextEp); 
            console.log('The next ep no is ' + nextEp);
            var p = anims.update({ _id: followAnim._id }, { $set: { DownloadedEpisodes: followAnim.DownloadedEpisodes } } , function(err){
              if(err){
                console.log('Failed to update the collection');
              }
              else{
                console.log('Successfully update the DB');
              }
            });
			  console.log('This is the information ' + item.title + ' ' + item.enclosures[0].url.toString());
              var savedName = title + epNo + '.torrent';
              console.log('Found the anim. Start downloading...');
              downloader({'url': item.enclosures[0].url , 'name': savedName} , destDir).on('close' , function(){
              if(count == docs.length){
                mailNoti('');
                //return process.exit(1);
              }
              });
		  }
	  }
  });
}

function done(err){
	if(err){
		console.log('Finished parsing the feeds');
		return process.exit(1);
	}
}

function mailNoti(msg){
  var transporter = new sendmail.createTransport({
    service: 'Gmail',
    auth: {
      user: mailacct.user,
      pass: mailacct.pwd
    }
  });
  var mailOptions = {
    from: 'Chang\'s App <changapp@gmail.com>',// sender address
    to: 'goodeffort2003@gmail.com', // list of receivers
    subject: 'Add new torrent', // Subject line
    //text: '', // plaintext body
    html: '<h1>New torrent added. ' + msg + '</h1>' // html body
  };

  transporter.sendMail(mailOptions , function(err , info){
    if(err){
      console.log(err);
    }
    else{
      console.log('Message sent: ' + info.response);
    }
  });
  var err = '';
  done(err);
}


function addOne(oriNo){
  if(1 == oriNo.length){
    return (1 + oriNo);
  }  
  else{
    var tempTest = oriNo.toString().substr(1 , oriNo.toString().length - 1);
    var temRst = addOne(tempTest);
    var firstNo = oriNo.substr(0 , 1);

    if(tempRst.toString().length == oriNo.toString().length){
      return (firstNo + 1).toString() + tempRst.toString().substr(1 , this.length); 
    }
    else{
      return firstNo.toString() + tempRst.toString().substr(1 , this.length); 
    }
  }
}
