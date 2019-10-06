# Background

This node/express app demonstrates the simplest way of calculating the average of a dataset while keeping all of the underlying data private. The client application opens up your camera and starts taking pictures of your face, obfuscating the image by salting random zero-centered numbers to the pixels, then sending the garbled images to the server. The server then takes the average of all the images. With a [large enough sample size](https://en.wikipedia.org/wiki/Law_of_large_numbers), the added noise cancels out (converges to zero) and you're left with approximately the average of the actual non-obfuscated data.

#### Try it out

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy)

# Getting Started

1. Clone the repo and install dependencies

  `npm install`

2. Check (and if needed change) the UDP_PORT and WEB_SOCKET_PORT values in `app.js`

3. Start the server

  `npm start`
  
  or if you deploy to heroku...
  
  `heroku local`

4. Start the python client which will collect the noisy images.

  ```
  cd python_client
  python client.py
  ```

5. Visit `localhost:3000` and put your face in the circle... It will take pictures, obfuscate the image, and send to the server.

6. Ideally you capture at least 1000 images. It works best and fastest as a heroku server with many (>20) clients!

7. Take the average of all the collected images.

   `python main.py`
   

