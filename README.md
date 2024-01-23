![meu copiloto](./logo.jpg)

# Meu Copiloto

Welcome to the Meu Copiloto Project, a cutting-edge voice copilot application designed to provide an intuitive and private voice interaction experience. Built with the power of Picovoice technology, this application runs entirely on-device, ensuring your data remains secure and your interactions are swift and reliable.

## Description

Meu Copiloto is a voice-enabled application that allows users to interact with their devices in a natural and hands-free manner. Leveraging the Picovoice platform, it offers a seamless voice experience akin to popular services like Alexa and Google Assistant, but with the added benefit of complete privacy and offline functionality.

## Features

- **Multilingual Support:** Currently available in Portuguese for a tailored experience.
- **Email Interaction:** Read out loud Gmail messages to stay updated without looking at the screen.
- **Calendar Management:** Keep track of your appointments by asking for your schedule.
- **Task Handling:** Manage your tasks by voice commands.
- **Music Playback:** Play your favorite music hands-free.
- **Voice Recording:** Make recordings on the go with simple voice commands.
- **Time Announcements:** Ask for the time and get a vocal response.

## Usage


### API Keys

To get started with Meu Copiloto, you'll need a valid Picovoice `AccessKey`, which serves as your credentials when using the SDKs. Obtain your `AccessKey` for free by signing up or logging in to the [Picovoice Console](https://console.picovoice.ai/).

To use the copilot with your Gmail, Calendar, and Tasks, you must first create Google API keys. Follow [these](https://developers.google.com/docs/api/quickstart/nodejs) steps to set up your API keys, test users, and redirect url for authentication. In case the Google documentation isn't clear try also following [this guide](https://dev.to/yksolanki9/noobs-guide-to-using-any-google-api-in-nodejs-1j8g).

To get daily news head over to [NewsAPI](https://newsapi.org/) to get a an API key, and set your favorite sources in the `.env` file.

Once you have created your API keys, copy them and paste them into the `.env` file of the project.


### Installation

Install the Meu Copiloto React application using `yarn` or `npm`: `npm i`

To set up the Meu Copiloto environment for all three applications (server, NodeJS, and React), you can use the provided setup script. Simply run the following command in your terminal:

```
npm run setup
```

To run the NodeJS and server applications in development mode, use the following command:
```
npm run dev
```

To run the React web application, you first need to copy the .env file inside the React directory and add the `PICOVOICE_KEY` key there. Then to run the server and web web app run:

```
npm run dev:web
```

### Audio manipulation

These tools are currently being used for playing music and manipulating audio files, make sure you have them installed:

- **[playerctl](https://github.com/altdesktop/playerctl):** A command-line utility for controlling media playback on Linux. Essential for managing music playback through voice commands.
- **[ffmpeg](https://ffmpeg.org/):** A powerful multimedia framework capable of recording, converting, and streaming audio and video. It is used for various audio manipulation tasks within the application.

### Speech-to-text

**[whisper-ctranslate2](https://github.com/Softcatala/whisper-ctranslate2)** is used for STT. It's an efficient implementation of OpenAI's Whisper model for speech-to-text, using the CTranslate2 inference engine. To install and use whisper-ctranslate2 for transcribing audio to text, please refer to the instructions on the linked GitHub repository. Download models from [huggingface](https://huggingface.co/models?search=faster-whisper) and add location to `.env`.

### Text-to-speech

We're using [piper](https://github.com/rhasspy/piper) for TTS services. Make sure to install it and have it available as `piper-tts` on the command-line.

You'll also need the model files, which can be automatically downloaded using the `./scripts/download_tts_models.sh` or you can manually download them from [here](https://huggingface.co/rhasspy/piper-voices/tree/v1.0.0) into the `resources/lang/tts` folder.

### Interaction
**Note:** Interactions are currently available only in Portuguese.

- **Wake Word:** The application is activated by the wake word "computador".
- **Intents:**
  - **List Emails:** Say "computador, veja meus emails" to have your emails read out loud.
  - **List Calendar Events:** To hear your upcoming events, say "computador, veja meu calendário".
  - **List Tasks:** Ask "computador, veja minhas tarefas" to get a rundown of your tasks.
  - **Time Announcements:** To find out the current time, say "computador, que horas são agora?".
  - **Voice Recording:** Start a voice recording by saying "computador, faça uma gravação".
  - **Music Playback:** To play music, say "computador, toque uma música".

## Roadmap

- [ ] Web application: Integrate skills to the React web app.
- [ ] Reading news: Integrate news API to fetch and read the latest news.
- [ ] Responding to emails: Develop functionality for summarizing and responding to emails via voice.
- [ ] Adding and completing tasks: Implement task management features to add and complete tasks through voice commands.
- [ ] Reading websites: Create a feature for reading website content out loud.
- [ ] Chatting with AI: Build a conversational AI feature for casual chatting or information queries.
- [ ] Interacting with the command line: Enable voice control for command line operations.
- [ ] Running git commands: Facilitate the execution of git commands via voice.
- [ ] Interacting with code: Allow voice-assisted coding features, such as reading out code snippets or documentation.


## Extras

### Customizing intent models

To customize the intent models for your application, you can use the [Picovoice Console](https://console.picovoice.ai/). This platform allows you to create and manage your voice models with ease.

1. Sign up for the Picovoice Console if you haven't already, and log in.
2. Retrieve your AccessKey from the Picovoice Console, which is required for authentication and authorization when using the Picovoice SDKs.
3. Create a new context for your application by navigating to the Rhino Speech-to-Intent console and selecting the 'Create a new Rhino Context' option.
4. Upload the yml template in this project's resource's folder and modify according to your needs on the dashboard or directly on the file.
5. Once satisfied train your model by clicking the 'Train' button.
6. After training, download your custom Rhino context model and include it in your project's `resources` directory.

By following these steps, you can easily tailor the intent models to better fit the specific requirements and interactions of your application.

### Using Bluetooth headsets efficiently

In order to have full remote control by just using a Bluetooth headset, we need to customize the controls of the headset's buttons, to switch between different Bluetooth profiles.

To switch between Bluetooth (BT) headphone profiles and control music playback on your device, you can use `xev` to discover the keys of your BT headphones and configure `sxhkd` to handle the profile switching and media control.

#### Discovering BT Headphones Keys

1. Ensure your BT headphones are connected to your device.
2. Open a terminal and run `xev`. This program will track all the input events; just focus on the window it opens.
3. Press the buttons on your headphones. `xev` will output the key codes and other details for each button press in the terminal.
4. Note down the key codes corresponding to the buttons you want to use for controlling your device.

#### Configuring sxhkd

1. Install `sxhkd` if it's not already installed on your system.
2. Create or edit the `sxhkdrc` configuration file in your home directory:
   ```
   nano ~/.config/sxhkd/sxhkdrc
   ```
3. Add the following lines to the `sxhkdrc` file, replacing `<key_code>` with the actual key codes from your headphones, and `<command>` with the desired action (e.g., switching BT profiles or controlling music playback):
   ```
   XF86AudioPause
        /home/user/meu-copiloto/scripts/bt_headset_control.sh
   ```
4. Save the file and restart `sxhkd` to apply the changes.

With `xev` and `sxhkd`, you can now seamlessly switch between your BT headphone profiles and control your music without needing to access your device directly.
