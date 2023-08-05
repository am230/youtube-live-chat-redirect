import { useEffect, useRef } from 'react';
import styles from './ShaderToy.module.css';

const ShadertoyShader = `
#define NOISE fbm
#define NUM_NOISE_OCTAVES 10
#define SCALE 0.02
#define BACKGROUND vec4(0.0, 0.0, 0.0, 1.0)
#define COLOR vec4(0.0, 0.0, 0.0, 0.0)

float hash(float p) {
    return fract(p * 0.011) * (fract(p * 0.011) + 7.5) * (fract(p * 0.011) + fract(p * 0.011) + 7.5);
}

float hash(vec2 st)
{
    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 10000.0);
}

float noise(float x) {
    float i = floor(x);
    float f = fract(x);
    float u = f * f * (3.0 - 2.0 * f);
    return mix(hash(i), hash(i + 1.0), u);
}

float noise(vec2 x) {
    vec2 i = floor(x);
    vec2 f = fract(x);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

float noise(vec3 x) {
    const vec3 step = vec3(110.0, 241.0, 171.0);
    vec3 i = floor(x);
    vec3 f = fract(x);
    float n = dot(i, step);
    vec3 u = f * f * (3.0 - 2.0 * f);
    return mix(
        mix(
            mix(hash(n + dot(step, vec3(0.0))), hash(n + dot(step, vec3(1.0, 0.0, 0.0))), u.x),
            mix(hash(n + dot(step, vec3(0.0, 1.0, 0.0))), hash(n + dot(step, vec3(1.0, 1.0, 0.0))), u.x),
            u.y
        ),
        mix(
            mix(hash(n + dot(step, vec3(0.0, 0.0, 1.0))), hash(n + dot(step, vec3(1.0, 0.0, 1.0))), u.x),
            mix(hash(n + dot(step, vec3(0.0, 1.0, 1.0))), hash(n + dot(step, vec3(1.0, 1.0, 1.0))), u.x),
            u.y
        ),
        u.z
    );
}

float fbm(float x) {
    float v = 0.0;
    float a = 0.5;
    float shift = 100.0;
    for (int i = 0; i < NUM_NOISE_OCTAVES; ++i) {
        v += a * noise(x);
        x = x * 2.0 + shift;
        a *= 0.5;
    }
    return v;
}

float fbm(vec2 x) {
    float v = 0.0;
    float a = 0.5;
    vec2 shift = vec2(100.0);
    mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.5));
    for (int i = 0; i < NUM_NOISE_OCTAVES; ++i) {
        v += a * noise(x);
        x = rot * x * 2.0 + shift;
        a *= 0.5;
    }
    return v;
}

float fbm(vec3 x) {
    float v = 0.0;
    float a = 0.5;
    vec3 shift = vec3(100.0);
    for (int i = 0; i < NUM_NOISE_OCTAVES; ++i) {
        v += a * noise(x);
        x = x * 2.0 + shift;
        a *= 0.5;
    }
    return v;
}

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    float time = iTime * 2.0;
    float p = floor(fragCoord.y / 20.0) * 20.0;
    fragCoord = floor(fragCoord / 4.0 + p) * 4.0;
    float b = fragCoord.x / pow(time * 5.0 + 1.0, 3.0) - fbm(fragCoord) * 40.0;
    float a = time / 20.0 + 1.0;
    //b = step(b * a, 1.0) / a;
    
    fragColor = mix(COLOR, BACKGROUND, b);
}
`;

const ShaderToy = () => {
  const canvasRef = useRef(null);
  let gl;

  useEffect(() => {
    const canvas = canvasRef.current;
    const boundingRect = canvas.getBoundingClientRect();
    canvas.width = boundingRect.width;
    canvas.height = boundingRect.height;

    // Initialize WebGL context
    gl = canvasRef.current.getContext('webgl');

    // Create vertex and fragment shaders
    const vertexShaderSource = `
      attribute vec2 position;
      varying vec2 vUV;
      
      void main() {
        gl_Position = vec4(position, 0.0, 1.0);
        vUV = (position + 1.0) * 0.5;
      }
    `;

    const fragmentShaderSource = `
precision mediump float;

uniform float iTime;
${ShadertoyShader}

void main() {
    vec4 fragColor;
    mainImage(fragColor, gl_FragCoord.xy);
    gl_FragColor = fragColor;
}
    `;

    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(
      gl,
      gl.FRAGMENT_SHADER,
      fragmentShaderSource
    );

    // Create shader program
    const program = createProgram(gl, vertexShader, fragmentShader);
    gl.useProgram(program);

    // Create a buffer for the vertex positions
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    const positions = [-1, -1, 1, -1, -1, 1, 1, 1];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    // Get the attribute location
    const positionAttributeLocation = gl.getAttribLocation(program, 'position');

    // Specify how to pull the data out
    gl.enableVertexAttribArray(positionAttributeLocation);

    // Bind the position buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    // Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
    const size = 2; // 2 components per iteration
    const type = gl.FLOAT; // the data is 32bit floats
    const normalize = false; // don't normalize the data
    const stride = 0; // 0 = move forward size * sizeof(type) each iteration to get the next position
    const offset = 0; // start at the beginning of the buffer
    gl.vertexAttribPointer(
      positionAttributeLocation,
      size,
      type,
      normalize,
      stride,
      offset
    );

    // Render loop
    let startTime = 0;
    const render = (time) => {
      if (!startTime) startTime = time;
      const elapsedTime = time - startTime;
      const iTime = elapsedTime * 0.001; // Convert to seconds

      // Update uniform value
      const iTimeLocation = gl.getUniformLocation(program, 'iTime');
      gl.uniform1f(iTimeLocation, iTime);

      // Clear the canvas
      gl.clearColor(0.0, 0.0, 0.0, 1.0);
      gl.clear(gl.COLOR_BUFFER_BIT);

      // Draw the rectangle
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

      requestAnimationFrame(render);
    };

    requestAnimationFrame(render);

    return () => {
      // Clean up
      gl.deleteProgram(program);
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
      gl.deleteBuffer(positionBuffer);
    };
  }, []);

  const createShader = (gl, type, source) => {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error('Error compiling shader:', gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  };

  const createProgram = (gl, vertexShader, fragmentShader) => {
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Error linking program:', gl.getProgramInfoLog(program));
      gl.deleteProgram(program);
      return null;
    }
    return program;
  };

  return <canvas className={styles.canvas} ref={canvasRef} />;
};

export default ShaderToy;
