/* Jo Jo's Milestone 2

Comment 1) I'm not sure what happened... but the site was able to automatically display
both before and after pictures after pressing the link displayed after uploading.
Now, the picture will only display if I press refresh. I thought it might be 
because of async but i haven't changed the code other than fix spacing and adding ;

Please press refresh to display the before and after grayscale image after pressing the link.

Comment 2) In hindsight, I should have used promises to make things easier. However I didn't realize
it was a problem until I was basically finished.

Comment 3) After successfully linking my CSS, something else decided to break. As a result, I decided 
to just take out the CSS altogether. 
*/

const http = require('http');
const fs = require('fs');
const formidable = require('formidable');
const path = require('path');
const IOhandler = require("./IOhandler");
const port = 3000;

// I tried to have a readdir to check if folder already exists, but i think it's again 
// because of sync issues, it wouldn't work out..

// Prerequisite for site; must have grayImages and upload folder
fs.mkdir("./grayImages", (err) => {
    if (err) {
        console.log(err);
    }
})
fs.mkdir("./upload", (err) => {
    if (err) {
        console.log(err);
    }
})

const handleRequest = (req, res) => {

    // Handles PNG images
    if (req.url.includes(".png")){
        let filename = "." + req.url;
        fs.readFile(filename, function(err, data) {
            if (err) {
                res.writeHead(404, {'Content-Type': 'text/html'}); 
                res.end();
            } 
            res.writeHead(200, {'Content-Type': 'image/png'}); 
            res.write(data);
            res.end();
        })
    }

    // Handles the main html page
    else if (req.url == '/' || req.url == '/index.html') {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/html');

        // Checks if grayImages folder has files
        fs.readdir ("grayImages", (err, files) => {
            if (err) {
                console.log(err);
            }
            if (files.length == 0) {
                fs.readFile('index.html', (err, data) => {
                    if (err) {
                        res.writeHead(404);
                    } else {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'text/html');
                        res.end(data);
                    }
                })

            // If has files, display the before and after pictures
            } else {
                let image = files.pop();
                let album_images = `
                <div class="album-image" style="width: 300px; display: inline-block; vertical-align: top;">        
                    <img src="/upload/previous.png" style="border: 1px solid blue" alt="Previous" width="300px">
                    <p>Before</p>
                </div>
                <div class="album-image" style="width: 300px;display: inline-block; vertical-align: top;">
                    <img src="/grayImages/${image}" style="border: 1px solid blue"  alt="grayscaled image!" width="300px">
                    <p>After</p>
                </div>
                `
                res.end(
                    `<!DOCTYPE html>
                    <html lang="en">
                    <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <title>Milestone 2</title>
                        <link rel = "stylesheet" href = "css/style.css">
                    </head>
                    <body>
                        <header>MY PHOTO ALBUM</header>
                        <h1> Grayscaling pictures! </h1>
                        <div id="album">
                            ${album_images}
                        </div>
                        <form action="fileupload" method="post" enctype="multipart/form-data">
                            <label for="fileupload">Image Upload </label>
                            <br>
                            <input accept=".png" type="file" name="fileupload"><br> 
                            <br> 
                            <input type="submit">
                        </form>
                    </body>
                    </html>`
                );
            }
        })        
    }
    
    // Handles the upload requests
    else if (req.url == '/fileupload' && req.method.toLowerCase() === 'post') {
        let form = new formidable.IncomingForm();
        form.parse(req, (err, fields, files) => {
            if (err) {
                console.log(err);
                res.statusCode = 500;
                res.setHeader('Content-Type', 'text/html');
                res.write("An error occured" + err);
                res.end();
            }

            // Rename and move uploaded file, and pass file to grayscale function 
            if (files) {
                let tempPath = files.fileupload.path;
                let newPath = path.join(__dirname, "upload", "previous.png");
                let uploadPath = path.join(__dirname, "upload");
                let grayPath = path.join(__dirname, "grayImages");
                fs.rename(tempPath, newPath, (err) => {
                    if (err) {
                        console.log(err);
                    } else {
                        IOhandler.readDir(uploadPath)
                            .then ((imgArr) => (IOhandler.grayScale(imgArr, grayPath)))
                            .then (() => {
                                res.statusCode = 200;
                                res.setHeader('Content-Type', 'text/html');
                                res.write(`<a href = "javascript:history.back()">Upload successful! Back to previous page<a/>`);
                                res.end();
                            });
                    };
                })
            } else {
                console.log("We got no files!");
                res.statusCode = 500;
                res.setHeader('Content-Type', 'text/html');
                res.write("Please submit the form with a file");
                res.end();
            }
        })
    }

    // Handles everything else
    else {
        res.writeHead(404, {'Content-Type': 'text/html'});
        res.write("Oops!");
        res.end();
    }
}
    
http.createServer(handleRequest).listen(port);