// **global variables**
// define keys variable that requires info from the keys.js file
var keys = require('./keys.js');

// define fs and require the use of the file system
var fs = require('fs');

// define variables for the first and second user inputs
var inputOne = process.argv[2];
var inputTwo = process.argv[3];

// define logArray as an empty array to be filled with data gotten from search query results
var logArray = [];

// if/else statements that trigger specific functions when a specific user input occurs
// trigger 1 - if inputOne is my-tweets, run callTwitter function
if (inputOne === 'my-tweets') {
    callTwitter();
}

// trigger 2 - if inputOne is spotify-this-song, run callSpotify function
else if (inputOne === 'spotify-this-song') {
    callSpotify();
}

// trigger 3 - if inputOne is movie-this, run callOMDB function
else if (inputOne === 'movie-this') {
    callOMDB();
}

// trigger 4 - if inputOne is do-what-it-says, read data from random.txt and
// run the callSpotify funtion on it
else if (inputOne === 'do-what-it-says'){
    fs.readFile('./random.txt', function(err, data) {
        
    	// if there is an error, console.log what it is
        if(err) {
            return console.log(err)
        }

        // define file variable to change the data to a string and splits the data on the commas
        var file = data.toString().split(",");

        // inputOne becomes the first data point in the random.txt file
        inputOne = file[0];

        // inputTwo becomes the second
        inputTwo = file[1];

        // then the callSpotify function is run
        callSpotify();
    });

};

// callTwitter constructor
function callTwitter() {

	// Twitter variable is defined and requires the twitter module
	var Twitter = require('twitter');

	// define a variable that retrieves Twitter access keys from the keys.js file
    var client = new Twitter(keys.twitterKeys);

    // define a variable that is made up of the parameters needed to access what is requested from Twitter
    var params = { screen_name: 'mike_bagman', count: "20" };
    
    // get information requested using the defined parameters
    client.get('statuses/user_timeline', params, function(error, tweets, response) {
        
    	// if there is no error, display the information requested and append it to the log.txt file
        if (!error) {
            for (var key in tweets) {
                var twitterObj = tweets[key].text
                console.log("================================================\n" + twitterObj);
                logArray.push(twitterObj);                
            }
            fs.appendFile('log.txt', logArray, function(err) {
                
            	// if error, display the error
                if(err) {
                    return console.log(err);
                }

            }); 
        }
    });
};

// callSpotify constructor
function callSpotify() {

	// Spotify variable is defined and requires the node-spotify-api module
	var Spotify = require('node-spotify-api');

	// define a variable that retrieves Spotify access keys from the keys.js file
    var spotify = new Spotify(keys.spotifyKeys);

    if (!inputTwo) {
    	inputTwo = "Brown Eyed Girl";
	}
    // begin Spotify track search using the user input
    spotify.search({ type: 'track', query: `${inputTwo}`, limit: '1' }, function(err, data) {
        
    	// if there's an error, display the error
        if (err) {
            return console.log('Error occurred: ' + err);
        }

        // otherwise, define dataObj to set the album name and logObj to set what info is added to the log.txt file
        var dataObj = data.tracks.items[0].album;
        var logObj = {
            artists: dataObj.artists[0].name,
            songName: data.tracks.items[0].name,
            spotifyLink: dataObj.external_urls.spotify,
            album: dataObj.name
        };

        // display the search results
        console.log(`
            Artist(s)= ${dataObj.artists[0].name}
            Song Name = ${data.tracks.items[0].name}
            Spotify Link = ${dataObj.external_urls.spotify}
            Album = ${dataObj.name}
            `);

        	// append log.txt with search query info
        	fs.appendFile('log.txt', JSON.stringify(logObj,null, 4), function(err) {
                
        		// if error, display error
                if(err) {
                    return console.log(err);
                }

            });
    });
};

// callOMDB constructor
function callOMDB() {

	// request variable is defined and requires the request module
    var request = require('request');

    if (!inputTwo) {
    	inputTwo = "iron+monkey";
	}
    // use request and the user's second input to begin the OMDB query
    

    request(`http://www.omdbapi.com/?t=${inputTwo}&tomatoes=true&${keys.movieKey}`, function(error, response, body) {
   
    	// display error, if error
    	if (error) {
    		console.log('error:', error);
    	}
        // display status code
        console.log('statusCode:', response && response.statusCode);

        // define bodyObj variable as a JSON object, parsing the body
        var bodyObj = JSON.parse(body);

        // define the logObj variable as the information returned from a query
        var logObj = {
            title: bodyObj.Title, 
            year: bodyObj.Year,
            rating: bodyObj.Ratings[0].Value,
            country: bodyObj.Country,
            language: bodyObj.Language,
            plot: bodyObj.Plot,
            actors: bodyObj.Actors,
            rottenTom: bodyObj.Ratings[1].Value
        }

        // define the stringifyObj variable as the logObj info turned into a string
        var stringifyObj = JSON.stringify(logObj);

        	// add stringifyObj info to the log.txt file
            fs.appendFile('log.txt', stringifyObj, function(err) {
                
            	// if error, display error
                if(err) {

                    return console.log(err);
                }

            });

        // display search query information
        console.log(`
        	Title = ${bodyObj.Title}
        	Year = ${bodyObj.Year}
        	Rating = ${bodyObj.Ratings[0].Value}
        	Country = ${bodyObj.Country}
        	Language = ${bodyObj.Language}
        	Plot = ${bodyObj.Plot}
        	Actors = ${bodyObj.Actors} 
        	Rotten Tomatoes Rating = ${bodyObj.Ratings[1].Value} 
        	`);       
    });
};