# NFA2RE
## Vijayraj Shanmugaraj (https://github.com/VijayrajS), Zubair Abid (https://github.com/zubairabid/)
A visualisation of the conversion of a Non-Deterministic Finite Automaton to a Regular expression using d3js


# How to run the systems

A server needs to be setup to demo the experiments using d3.js. We have used Python's SimpleHTTPServer, which should be present in any system with python installed.

In the project root, run

```bash
python -m http.server
```

Assuming nothing else is running on port `8000`, this should start up the server. From hereon, the experiments can be accessed at:

- NFA to RE: [http://localhost:8000/JS-NFA2RE/](http://localhost:8000/JS-NFA2RE/)
