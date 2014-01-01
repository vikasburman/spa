spa - Simple Passwords App
===

A simple, smart, secure, and sufficient portable app to store all your passwords.


This one is a single page app, literally. There is only one file "spa.html" that has it all and it runs locally on any new age browser (Google Chrome, FireFox, Safari, IE 10). Read-only mode should even work on mobile browsers (though I am yet to vouch for it).  


The sole purpose of this app is to store access information to various digital assets that everyone of us has in abundance nowadays. Along with storing passwords (and history of it) it also has provision to store all associated information that comes with it. E.g., account, access url, security questions (and answers), and dated notes to name a few. Check out the given demo file to get ideas.


You can organize your information in various categories and sub-categories and when that does not seem to working, add multiple tags that help you find it later. A fast and efficient free-text search (on any field) can still find any information irrespective of categories and tags associated with it. 


If you want you can even cross-link information pieces to feed "See Also" feature. 


All this information is stored in a plain text file that you can choose to store wherever you want. You can either use the "default" file which gets stored as "/data/default.pjs" wherever you have kept "spa.html" or you can have your own named file that you can keep anywhere (e.g., on a flash drive).

By default, all your information is stored in plain text without any encryption, so anyone can see it if they get access to your file. BUT, you have an option to use standard and secure [AES algorithm](http://en.wikipedia.org/wiki/Advanced_Encryption_Standard) to encrypt all this information using your password itself. So only you who will know the password will be able to see decrypted information. 


This app does not require Internet for its basic functioning. However, if Internet is available, it can use it to show the icon of the website and you can navigate to the website from within. Additionally having Internet, you can check for any available updates of this app. 

**No information from your data file is *ever* transferred to any website whatsoever. This can be verified in the app code.**

This app when opened directly in a browser (using spa.html), works in read-only mode, that means you cannot edit anything. This is because browsers do not allow writing to the local file system for all security reasons. 

To enable editing, this app uses [node-webkit](https://github.com/rogerwang/node-webkit) app shells for Windows, Mac and Linux platforms. Each of these are available in respective folders and can be opened using given startup program, e.g., 'spa.exe' under Windows folder. When app is opened using any of these provided shell, it enables all the editing features.


To start using, download all the content locally, copy in any local folder or flash drive and start using right away.
Do not delete local 'data' folder, even if you are not using it. It contains demo.pjs, which you may want to use to show off to your friends. :)

Have more queries? Send me a mail at [me@vikasburman.com](mailto:me@vikasburman.com).
 
