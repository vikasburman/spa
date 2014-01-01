spa - Simple Passwords App
===

A simple, smart, secure, and sufficient portable app to store all your passwords.

This one is a single page app, literally. There is only one file "spa.html" that has it all and it runs locally on any new age browser (Google Chrome, FireFox, Safari, IE 10). 

__What I can do with this?__
The sole purpose of this app is to store access information to various digital assets that everyone of us has in abundance nowadays. Along with storing passwords (and history of it) it also has provision to store all associated information that comes with it. E.g., account, access url, security questions (and answers), and dated notes to name a few. Check out the given demo file to get ideas.

You can organize your information in various categories and sub-categories and when that does not seem to working, add multiple tags that help you find it later. A fast and efficient free-text search (on any field) can still find any information irrespective of categories and tags associated with it. 

If you want you can even cross-link information pieces to feed "See Also" feature. 

__Where this information is stored?__
All this information is stored in a plain text file that you can choose to store wherever you want. You can either use the "default" file which gets stored as "/data/spa.pjs" wherever you have kept "spa.html" or you can have your own named file that you can keep anywhere (e.g., on a flash drive).

__Does it encrypt it?__
By default, all your information is stored in plain text without any encryption, so anyone can see it if they get access to your file. BUT, you have an option to use standard and secure [AES algorithm](http://en.wikipedia.org/wiki/Advanced_Encryption_Standard) to encrypt all this information using your password itself. So only you who will know the password will be able to see decrypted information. 

__Does it need Internet?__
This app does not require Internet for its basic functioning. However, if Internet is available, it can use it to show the icon of the website and you can navigate to the website from within. Additionally having Internet, you can check for any available updates of this app. 

**No information from your data file is *ever* transferred to any website whatsoever. This can be verified in the app code.**

__How can I run it?__
This app when opened directly in a browser (double-click on spa.html file), works in read-only mode, that means you cannot edit anything. This is because browsers do not allow writing to the local file system for all security reasons. 

To enable editing, this app uses [node-webkit](https://github.com/rogerwang/node-webkit) app shells for Windows, Mac and Linux platforms. Depending upon the platform you are, you can use required command-line shell script. E.g, spa-win.bat for Windows OS.  When app is opened using any of these provided shell, it enables all the editing features.

**Notes:** 

1. When running first time, you must run it using given startup program, so that it can create your default data file. 

2. A new default file's password is always set to be 1234, irrespective of whatever you define. This can later be changed using Settings.

__How do I install it?__
To start using, [download the latest release](https://github.com/vikasburman/spa/releases/tag/v0.9.0), unzip it in any local folder or flash drive and start using right away by opening the app using OS specific startup shell script (e.g., spa-win.bat on Windows OS).


Have more queries? Send me a mail at [me@vikasburman.com](mailto:me@vikasburman.com).


Release Notes
===
__27-Jul-2013: Release 0.0.1 (Initial release)__

1. Initial release for over the shoulder alpha testing.
2. Was not on github then.


__07-Sep-2013: Release 0.4.9 (Closed Beta)__

1. Initial release for closed beta among hand-picked folks.
2. Was not on github then.


__01-Jan-2014: [Release 0.9.0 (Public Beta)](https://github.com/vikasburman/spa/releases/tag/v0.9.0)__

1. Initial public release. 
2. Windows environment is configured and functioning.
3. Linux and Mac platforms are not configured as yet; although read-only mode is tested for Mac OS.
4. Mobile browsers are not tested yet.
5. Latest version of Internet Explorer, FireFox, Google Chrome and Safari are tested.


