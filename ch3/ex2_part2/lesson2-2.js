main();

function main() {
    /*========== Create a WebGL Context ==========*/
    const canvas = document.querySelector("#c");
    const gl = canvas.getContext('webgl');
    if (!gl) {
        console.log('WebGL unavailable');
    } else {
        console.log('WebGL is good to go');
    }
      
    /*========== Define and Store the Geometry ==========*/
    const squares = [
        // front face
        -0.3 , -0.3, -0.3,
         0.3, -0.3, -0.3,
         0.3, 0.3, -0.3,  

        -0.3, -0.3, -0.3,
        -0.3, 0.3, -0.3,
         0.3, 0.3, -0.3,                  

         // back face
        -0.2, -0.2, 0.3,
        0.4, -0.2, 0.3,
        0.4, 0.4, 0.3, 

        -0.2, -0.2, 0.3,
        -0.2, 0.4, 0.3,
        0.4, 0.4, 0.3, 
    ];
    
    // buffer
    const origBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, origBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(squares), gl.STATIC_DRAW);

    const squareColors = [
        1.0,  0.0,  1.0,  1.0,     //rot
        0.0,  1.0,  0.0,  1.0,     //grün
        0.0,  0.0,  1.0,  1.0,     //blau
        1.0,  1.0,  0.0,  1.0,     //gelb
        1.0,  0.0,  1.0,  1.0,     //magenta
        0.0,  1.0,  1.0,  1.0,     //cyan

        1.0,  0.5,  0.0,  1.0,     //orange
        0.5,  0.0,  1.0,  1.0,     //lila
        0.2,  1.0,  0.2,  1.0,     //hellgrün
        1.0,  0.2,  0.2,  1.0,     //hellrot
        0.2,  0.2,  1.0,  1.0,     //hellblau
        1.0,  1.0,  1.0,  1.0,     //weiß
    ];
     
      const colorBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(squareColors), gl.STATIC_DRAW);

      /*========== Shaders ==========*/

      const vsSource = `
        attribute vec4 aPosition;
        attribute vec4 aVertexColor;

        varying lowp vec4 vColor;

        void main() {
            gl_Position = aPosition;
            vColor = aVertexColor;
      }
  `;

    const fsSource = `
        varying lowp vec4 vColor;

        void main() {
            gl_FragColor = vColor;
    }
    `;

    //create shaders
    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(vertexShader, vsSource);
    gl.shaderSource(fragmentShader, fsSource);

    // compile shaders
    gl.compileShader(vertexShader);
    if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
        alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(vertexShader));
        gl.deleteShader(vertexShader);
        return null;
      }
    gl.compileShader(fragmentShader);
    if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
        alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(fragmentShader));
        gl.deleteShader(fragmentShader);
        return null;
      }

    // create program
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);

    // link program
    gl.linkProgram(program);
    gl.useProgram(program);
    
    /*========== Connect the attribute with the vertex shader ==========*/        
    const posAttribLocation = gl.getAttribLocation(program, "aPosition");
    gl.bindBuffer(gl.ARRAY_BUFFER, origBuffer);
    gl.vertexAttribPointer(posAttribLocation, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(posAttribLocation);

    // FALSCH (absichtlich)
     //gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    //gl.vertexAttribPointer(posAttribLocation, 3, gl.FLOAT, false, 0, 0);

    const colorAttribLocation = gl.getAttribLocation(program, "aVertexColor");
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.vertexAttribPointer(colorAttribLocation, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(colorAttribLocation);
    
    // FALSCH (absichtlich)
    //gl.bindBuffer(gl.ARRAY_BUFFER, origBuffer);
    //gl.vertexAttribPointer(colorAttribLocation, 4, gl.FLOAT, false, 0, 0);
    
            
    /*========== Drawing ========== */
    gl.clearColor(1, 1, 1, 1);
    
    //gl.enable(gl.DEPTH_TEST); // extra Auskommentiert für Aufgabe 5 d
    //gl.depthFunc(gl.LEQUAL);
    
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    //gl.clear(gl.COLOR_BUFFER_BIT);    
    // Draw the points on the screen
    const mode = gl.TRIANGLES;
    const first = 0;
    const count = 12;
    gl.drawArrays(mode, first, count);   
  }
  