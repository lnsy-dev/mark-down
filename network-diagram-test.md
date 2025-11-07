
```network
---
created: 2025-10-22T12:46
updated: 2025-10-22T13:20
scale: 0.3
---
JavaScript:
  # EcmaScript (aka JavaScript)
  The single most used programming language on earth. Loved by billions, hated by thousands. I have watched this language grow over the decades, and it has only gotten better.
CSS:
  # Cascading Style Sheets (CSS)
  CSS is as complex as it is beautiful. I am often hired specifically to work on CSS for projects. More than JavaScript, TypeScript or any other framework, CSS determines the feel of your website more than anything. 
HTML:
  # HTML
  HTML has become extensible with Custom HTML Elements. It is styleable using XSL Stylesheets. Utilizing HTML to its full potential allows us to build websites that load faster, function better and stay online and error free longer.
The Web:
  # The Web
  The collection of technologies that make up the world wide web. From DNS to ES6, I can advise you on how to properly utilize the single most powerful mass communication platform humanity has ever devised.
Node.js: 
  # Node.js
  A trusty JavaScript Run Time. From servers that scale to billions to those script that run on your laptop that saves you hundreds of hours of your time, Node.js is that trusty helper. 
Bun.sh:
  # Bun.sh
  Node.js's younger, cooler brother. With built in PostGres Database and a well thought out file API Bun.sh is perfect for local application that run internally for your organization. 
QuickJS:
  # QuickJS
  A tiny runtime designed to run across multiple chip architectures. Can compile JS code into runtime code for speed. Can import C libraries and use them immediately.
SQL:
  # SQL
  One of the most installed pieces of software on earth. I can help you design, visualize and optimize your databases, from SQL to Neo4J. 
Databases:
  # Databases
  I have decades of experience working with Databases in many forms. I can help you choose the correct technology for your company.
PostGres:
  # PostGres
  A younger, faster and more extensible variant of SQL.  
N8N:
  # N8N
  A visual programming language for orchestrating your AI workflow. From custom chatbots that know your entire organization and document indexing, N8N is my favorite paradigm.
Node-Red:
  # Node Red
  AI Orchestration tool. While N8N has the hype, it is the older, sturdier version with a better license. 
Linux: 
  # Linux
  I have decades of experience setting up, maintaining linux servers form servers to desktops. I hear it's the year of the Linux Desktop, also.
Framework Du Jour: 
  # Framework Du Jour
  React, Vue, HTMLx, Next.js, whatever. I can pick the right size technology for your company.  I don't engage in upsells or resume-driven-development, and I can give you an honest assessment of the strengths and weaknesses of each choice. 
Mapping:
  Another technology I've had decades in experience in. From ArcGIS to OpenStreetMaps, I can help your company pick the right size mapping solution.
ArcGIS:
  # ArcGIS 
  I have decades of ArcGIS experience at this point, though I prefer
ESRI:
  # ESRI
  Mapping System
MapBox: 
  # MapBox
  I built my own mapping framework on this code.
OpenStreetMap:
  # Open Street Map:
Leaflet
  # Leaflet
Google Earth Engine:
  # Google Earth Engine
Visual Programming Languages:
  # Visual Programming Languages
  Different from the standard text on the page, visual programming languages allow for clearer representation of Queu based workflows and event driven applications.
Software:
  # Software
  The greatest human art since painting. Applying logic and language to generate the first global mass-culture. 
Obsidian.md:
  # Obsidian.md
  My favorite note taking software. I have extensively customized my notes, and can set up your notes to success.

---
(JavaScript|wireframe:true;shape:torus) --> (HTML|wireframe:true;shape:cube)
(CSS|wireframe:true) --> (HTML|wireframe:true)
(JavaScript) --> (The Web|shape:sphere;wireframe:true)
(CSS) --> (The Web)
(HTML) --> (The Web)
(Node.js|wireframe:true;shape:cube) --> (JavaScript)
(Node.js) --> (Bun.sh|wireframe:true;shape:cube)
(Bun.sh) --> (JavaScript)
(QuickJS|wireframe:true;shape:cube) --> (JavaScript)
(Databases|wireframe:true;shape:cube) --> (SQL|wireframe:true;shape:cube)
(Bun.sh|wireframe:true;shape:cube) --> (PostGres|wireframe:true;shape:cube)
(PostGres|wireframe:true;shape:cube) --> (SQL|wireframe:true;shape:cube)
(PostGres) --> (Databases)
(ESRI|wireframe:true;shape:cube) --> (Mapping|wireframe:true;shape:cube)
(MapBox|wireframe:true;shape:cube) --> (Mapping)
(ArcGIS|wireframe:true;shape:cube) --> (Mapping)
(OpenStreetMap|wireframe:true;shape:cube) --> (Mapping)
(Leaflet|wireframe:true;shape:cube) --> (Mapping)
(Google Earth Engine|wireframe:true;shape:cube) --> (Mapping)
(MapBox) --> (JavaScript)
(Framework Du Jour|wireframe:true;shape:sphere) --> (JavaScript)
(Visual Programming Languages|wireframe:true;shape:sphere) --> (Node-Red|wireframe:true;shape:sphere)
(Visual Programming Languages) --> (N8N|wireframe:true;shape:sphere)
(Software|wireframe:true,shape:torus) -> (JavaScript)
(Software) --> (Visual Programming Languages)
(Software) --> (The Web)
(Linux|wireframe:true) --> (Software)
(Linux) --> (The Web)
```
