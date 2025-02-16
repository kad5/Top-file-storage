this is a practice app for the odin project file storage webapp. the practice was about using prisma orma nd passport js. 
i worked on this as a hobby in my free time. the project helped me practice organizing my code better. as usual, by the end of the project i feel it would have been done better in some aspects. 
however there is improvement from the last project, particularly getting more comfortalbe with authentication and testing routes and controllers. 
the new aspect to this project was allowing shares to other users and publicly. one security bug I realized at the end, was that im passing a folder's id into the controller that renders it's 
contents which is fine, however im only establishing securing by checking if a user is logged in or not (a user meaning any user), so technically a user can create an account and if they 
know the folder id of another user, they can still view it by adding it as a param. This is a sercurity issue since the folder id is exposed if a user decides to publicly share it via the public route.
this way the second user would have indifinite access to the folder via manually adding the folder id to the private route rather than using the time limited public route. an easy fix is to add an id check 
on the controller for private routes viewing to make sure the owner id matches the user id. the public route then is the only other access to the folder and it is well protected. i did not fix it because 
i got too tired from managing js code inside ejs which i find extremely retarded to do. next project would be the api one which im very happy to move on to and not have to write js code inside ejs ever again 
.
.
the main page is a ready made html css template that i got somewhere online, i just didnt want to bother with css when it is a backend practice 
