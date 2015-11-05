
var fs = require('fs');
var path = require('path');

function SlackArchive(path) {
  try {
    this.stat = fs.statSync(path);
    if (!this.stat.isDirectory())
      return null;
    this.path = path;
    var self = this;
    fs.readFile(path+'/users.json',function(err,json){
      if (err) {
        throw path+"/users.json cannot be read";
      }
      //console.log(json.length);
      self.usersArray = JSON.parse(json);
      self.usersByName = {};
      self.usersById = {};
      self.usersArray.forEach(function(user){
        self.usersByName[user.name]=user;
        self.usersById[user.id]=user;
      })
    });

    fs.readFile(path+'/channels.json', function(err,json){
      if (err) {
        throw path+"/channels.json cannot be read";
      }
      self.channelsArray = JSON.parse(json);
      self.channelsByUserId = {};
      self.channelsArray.forEach(function(channel){
        channel.members.forEach(function(userId){
          if (!self.channelsByUserId[userId])
            self.channelsByUserId[userId] = [];
          self.channelsByUserId[userId].push(channel);
        })
      })
    })
  } catch (err) {
    return null;
  }
}

function dateToFilename(dateStr) {
  var date = new Date(dateStr),
      yyyy = date.getFullYear(),
      mm = date.getMonth()+1,
      dd = date.getDay()+1;
  return yyyy+'-'+mm+'-'+dd+'.json';
}



SlackArchive.prototype.search = function(params,cb) {
  console.log('searching for '+params.username);
  var username = params.username;
  //var startDateStr = params.start;
  if (!username) {
    return cb([]);
  }
  //console.log(this.usersByName[username]);
  var userId = this.usersByName[username].id;
  var userRexp = new RegExp('@'+userId);
  console.log(userId);
  var channels = this.channelsByUserId[userId];
  var channelNames = channels.map(function(ch) {return ch.name});
  var self = this;
  var awaiting = 0;
  var posts = [];
  var mentions = [];

  function scanDayLog(filename,path) {
    var filepath = path+'/'+filename;
    console.log(filepath);
    fs.readFile(filepath,function(err,json){
      awaiting--;
      var data = JSON.parse(json);
      data.forEach(function(post){
        //var hit='';
        if (post.user === userId) {
          posts.push(post.ts);
        } else if (post.text.match(userRexp)){
          //console.log(hit);
          mentions.push(post.ts);
        }
      })
      if (awaiting<=0) {
        cb(posts,mentions);
      }
    })
  }

  channelNames.forEach(function(chName){
    var path = self.path+'/'+chName;
    fs.readdir(path,function(err,files){
      awaiting += files.length;
      files.forEach(function(file){
        scanDayLog(file,path);
      })
    })
  })
}

module.exports = SlackArchive;
