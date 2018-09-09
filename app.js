const fs = require('fs');
const dotenv = require('dotenv').config();
const Spotify = require('node-spotify-api');
const Twitter = require('twitter');
const yargs = require('yargs');
const axios = require('axios');
const keys = require('./keys');
const commandList = ['my-tweets', 'spotify-this-song', 'movie-this', 'do-what-it-says'];
const spotify = new Spotify({
  id: keys.spotify.id,
  secret: keys.spotify.secret
});

const saveLog = (info) => {
  fs.appendFile('./log.txt', info, (err) => {
    if (err) throw new Error(err);
    console.log('Log file was updated!');
  });
}

const doSpotify = (searchItem = 'The Sign Ace of Base') => {
  spotify
    .search({ type: 'track', query: searchItem })
    .then((res) => {
      if (res.tracks.items.length === 0) throw new Error('Can not find song like this');
      const message = `
      Artist: ${res.tracks.items[0].artists[0].name}
      Name: ${res.tracks.items[0].name}
      Album: ${res.tracks.items[0].album.name}
      Date: ${res.tracks.items[0].album.release_date}
      `;
      console.log(message)
    })
    .then((res) => saveLog(res))
    .catch((err) => console.log(err.message));
}

const searchForMovie = (searchItem = 'Mr. Nobody') => {
  axios
    .get(`http://www.omdbapi.com/?t=${searchItem}&apikey=${keys.omdb.key}`)
    .then((res) => {
      if (res.data.Error) throw new Error(res.data.Error);
      const message = `
        Title: ${res.data.Title}
        Date: ${res.data.Released}
        Imdb Rating: ${res.data.imdbRating}
        Rotten Tomatoes Rating: ${res.data.Ratings[1].Value}
        Country: ${res.data.Country}
        Plot: ${res.data.Plot}
        Actors: ${res.data.Actors}
      `;
      console.log(message);
      return message;
    })
    .then((res) => saveLog(res))
    .catch((error) => console.log(error.message));
}

const randomChoiceFromFile = (func) => {
  return new Promise((resolve, reject) => {
    fs.readFile('./random.txt', 'utf8', (err, data) => {
      if (err) reject(err);
      resolve(data);
    });
  })
  .then((res) => func(res))
  .catch((err) => console.log(err.message));
}

const argv = yargs
  .options({
    command: {
      demand: true,
      alias: 'c',
      describe: 'What do you want me to do?',
      choices: commandList,
      string: true,
    }
  })
  .alias('help', 'h')
  .help()
  .argv;

const choice = commandList.indexOf(argv.command); //set user's choice of command

switch (choice) { //run function based on user's choice

  case 0:
    console.log('Sorry, no tweeter API!');
    break;

  case 1:
    doSpotify(argv._[0]);
    break;

  case 2:
    searchForMovie(argv._[0]);
    break;

  case 3:
    randomChoiceFromFile(doSpotify);
    break;

  default:
    console.log(`I don't know what to do!`);
    break;
}