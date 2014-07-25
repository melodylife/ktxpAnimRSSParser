#!/usr/local/bin/node

var conf = require('../configuration/config.js');
var moment = require('moment');
var monk = require('monk');
var db = monk('127.0.0.1:27017/following');

var anims = db.get('anims');


var arguments = process.argv.splice(2);

//console.log('Here are the arugments ' + arguments[0]);
if(arguments.length < 1){
  console.log('Please specify what to do next.\n');
}
else if('add' == arguments[0]){
  console.log(arguments.length);
  insertMovie(arguments);
}

function insertMovie(args){
  if(args.length < 6){
    console.log('The length is ' + args.length + '\nPlease input the arugments accordingt to regularity.\n Usage:\nadd Team Name DownloadedEpisodes Following RssLink');
  }
  else{
    console.log('Start store the Series into DB\n');
    var objTemp = new Object();
    objTemp.Team = args[1];
    objTemp.Name = args[2];
    var epArr = new Array();
    epArr.push(args[3]);
    objTemp.DownloadedEpisodes = epArr;
    objTemp.Following = (args[4] == 0) ? false : true;
    objTemp.RssLink = args[5];
    var promise = anims.insert(objTemp);
    promise.on('error' , function(err){
      console.log('Failed to save the data into DB ' + err.toString());
    });
    promise.on('success' , function(){
      console.log('The movie is saved into DB now.');
    });
  }
}
