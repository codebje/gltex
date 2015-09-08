(function() { window.onload = function() {
    'use strict';

    var loadProgram = function(gl, v, s, a0, then) {
        var loader = new Worker('loader.js');
        var compile = function(src, type) {
            var shader = gl.createShader(type);
            gl.shaderSource(shader, src);
            gl.compileShader(shader);
            if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
                console.log(gl.getShaderInfoLog(shader));
                throw "shader failure";
            };
            return shader;
        };

        loader.onmessage = function(e) {
            var vertexShader    = compile(e.data[0], gl.VERTEX_SHADER),
                fragmentShader  = compile(e.data[1], gl.FRAGMENT_SHADER),
                program         = gl.createProgram();

            gl.attachShader(program, vertexShader);
            gl.attachShader(program, fragmentShader);
            if (a0 !== undefined) {
                gl.bindAttribLocation(program, 0, a0);
            }
            gl.linkProgram(program);
            then(program);
        };
        loader.postMessage([v, s]);
    };

    var canvas = document.getElementById('canvas'),
        gl     = WebGLUtils.setupWebGL(canvas),
        shapes = [makeSphere(0.2), makeSphere(0.2), makeSphere(0.2)];

    /* Textures */
    textures.checkers(gl, gl.TEXTURE0);
    textures.mars(gl, gl.TEXTURE1);
    textures.marsNormal(gl, gl.TEXTURE2);
    textures.earth(gl, gl.TEXTURE3);
    textures.earthNorm(gl, gl.TEXTURE4);
    textures.earthSpecs(gl, gl.TEXTURE5);
    textures.earthCloud(gl, gl.TEXTURE6);

    shapes[0].position( 0.3,  0.3, -3);
    shapes[1].position(-0.3,  0.3, -3);
    shapes[2].position(-0.3, -0.3, -3);

    shapes[0].texture     = 0;  // Checkerboard
    shapes[0].normalMap   = -1;
    shapes[1].texture     = 1;  // Mars
    shapes[1].normalMap   = 2;
    shapes[1].shine       = 10;
    shapes[1].specular    = vec4(0.1, 0.1, 0.1, 1.0);
    shapes[2].texture     = 3;  // Earth
    shapes[2].normalMap   = 4;
    shapes[2].specularMap = 5;
    shapes[2].cloudMap    = 6;
    shapes[2].specular    = vec4(0.1, 0.1, 0.1, 1.0);

    /* Set up canvas */
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);

    var prog;

    /* Attributes & Uniforms */
    var attributes = ['aPosition', 'aNormal', 'aTexture'];
    var uniforms   = [
        'uPerspective', 'uTransform', 'uAmbient', 'uDiffuse', 'uSpecular',
        'uShine', 'uLightOn', 'uGlobalAmbient', 'uLight', 'uBasic', 'uIsBasic',
        'uTextureId', 'uIsSpecMapped'
    ];

    var mapAttributes = function(p, a, u) {
        a.forEach(function(_a) {
            p[_a] = gl.getAttribLocation(p, _a);
        });
        u.forEach(function(_u) {
            p[_u] = gl.getUniformLocation(p, _u);
        });
    };

    // Phong shader program alternative
    var phong;
    loadProgram(gl, 'vertex.glsl', 'fragment.glsl', 'aPosition', function(p) {
        phong = p;
        mapAttributes(phong, attributes, uniforms);
        prog = phong;
        gl.useProgram(phong);
        requestAnimationFrame(render);
    });

    /* Lighting */
    var lights = [
        {
            ambient:    vec4(0.1, 0.1, 0.1, 1.0),
            diffuse:    vec4(0.2, 0.2, 0.2, 1.0),
            specular:   vec4(0.85, 0.85, 0.836, 1.0),
            parameters: vec4(2.0, 1.0, 3.0, 0.0),
            center:     vec4(0.0, 0.0, -4.0),
            deltaU:     0.2,
            deltaV:     0.4,
            on:         true
        },
        {
            ambient:    vec4(0.1, 0.1, 0.1, 1.0),
            diffuse:    vec4(0.5, 0.5, 0.5, 1.0),
            specular:   vec4(0.63, 0.63, 0.62, 1.0),
            parameters: vec4(0.3, 0.3, 0.7, 0.0),
            center:     vec4(0.0, 0.0, -1.0),
            deltaU:     0.1,
            deltaV:     0.2,
            on:         true
        }
    ];

    var lightsBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, lightsBuffer);
    gl.bufferData(gl.ARRAY_BUFFER,
            flatten([
                vec3(-0.01, -0.005, 0),
                vec3( 0.01, -0.005, 0),
                vec3( 0.0 ,  0.01 , 0),
                vec3(-0.01,  0.005, 0),
                vec3( 0.01,  0.005, 0),
                vec3( 0.0 , -0.01 , 0)
            ]), gl.STATIC_DRAW);

    var render = function(ts) {
        var width  = canvas.clientWidth,
            height = canvas.clientHeight;
        canvas.width = width;
        canvas.height = height;
        gl.viewport(0, 0, canvas.width, canvas.height);

        /* Perspective */
        var persp = perspective(20, (width / height), 0.1, 100.0);
        gl.uniformMatrix4fv(prog.uPerspective, false, flatten(persp));

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        var _light = [];
        lights.forEach(function(light) {
            var du = light.deltaU / 1000,
                dv = light.deltaV / 1000,
                params = light.parameters,
                offset = light.center;
            _light = _light.concat([
                params[0] * Math.cos(ts * du) * Math.cos(ts * dv) + offset[0],
                params[1] * Math.cos(ts * du) * Math.sin(ts * dv) + offset[1],
                params[2] * Math.sin(ts * du) + offset[2],
                0.0
            ]);
        });

        gl.uniform4fv(prog.uLight, flatten(_light));
        gl.uniform1i(prog.uIsBasic, 0);

        shapes.forEach(function(shape) {
            var _ambient = [],
                _diffuse = [],
                _specular = [],
                _enabled = [];
            lights.forEach(function(light) {
                _enabled.push(light.on);
                _ambient = _ambient.concat(mult(light.ambient, shape.ambient));
                _diffuse = _diffuse.concat(mult(light.diffuse, shape.diffuse));
                _specular = _specular.concat(mult(light.specular, shape.specular));
            });

            gl.uniform4fv(prog.uGlobalAmbient,
                    flatten(mult([0.2, 0.2, 0.2, 1.0], shape.ambient)));

            gl.uniform1i(prog.uTextureId, shape.texture);
            gl.uniform1iv(prog.uLightOn, new Int32Array(_enabled));
            gl.uniform4fv(prog.uAmbient, flatten(_ambient));
            gl.uniform4fv(prog.uDiffuse, flatten(_diffuse));
            gl.uniform4fv(prog.uSpecular, flatten(_specular));

            gl.uniform1f(prog.uShine, shape.shine);
            gl.uniformMatrix4fv(prog.uTransform, false, flatten(shape.transform));

            shape.sections.forEach(function(section) {
                if (section.vbuffer === undefined) {
                    section.vbuffer = gl.createBuffer();
                    gl.bindBuffer(gl.ARRAY_BUFFER, section.vbuffer);
                    gl.bufferData(gl.ARRAY_BUFFER, flatten(section.vertices),
                            gl.STATIC_DRAW);
                    section.nbuffer = gl.createBuffer();
                    gl.bindBuffer(gl.ARRAY_BUFFER, section.nbuffer);
                    gl.bufferData(gl.ARRAY_BUFFER, flatten(section.normals),
                            gl.STATIC_DRAW);
                    section.tbuffer = gl.createBuffer();
                    gl.bindBuffer(gl.ARRAY_BUFFER, section.tbuffer);
                    gl.bufferData(gl.ARRAY_BUFFER, flatten(section.texcoords),
                            gl.STATIC_DRAW);
                }
                gl.bindBuffer(gl.ARRAY_BUFFER, section.vbuffer);
                gl.vertexAttribPointer(prog.aPosition, 3, gl.FLOAT, false, 0, 0);
                gl.enableVertexAttribArray(prog.aPosition);
                gl.bindBuffer(gl.ARRAY_BUFFER, section.nbuffer);
                gl.vertexAttribPointer(prog.aNormal, 3, gl.FLOAT, false, 0, 0);
                gl.enableVertexAttribArray(prog.aNormal);
                gl.bindBuffer(gl.ARRAY_BUFFER, section.tbuffer);
                gl.vertexAttribPointer(prog.aTexture, 2, gl.FLOAT, false, 0, 0);
                gl.enableVertexAttribArray(prog.aTexture);
                gl.drawArrays(section.method, 0, section.vertices.length);
            });
        });

        /* Draw the lights */
        gl.uniform1i(prog.uIsBasic, 1);
        gl.bindBuffer(gl.ARRAY_BUFFER, lightsBuffer);
        lights.forEach(function(light, i) {
            if (light.on) {
                gl.uniform4fv(prog.uBasic, flatten(light.specular));
                var x = _light[i*4+0], y = _light[i*4+1], z = _light[i*4+2];
                gl.uniformMatrix4fv(prog.uTransform, false,
                        flatten(mult(translate(x, y, z), rotate(ts/2, 0, 0, 1))));
                gl.vertexAttribPointer(prog.aPosition, 3, gl.FLOAT, false, 0, 0);
                gl.enableVertexAttribArray(prog.aPosition);
                gl.drawArrays(gl.TRIANGLES, 0, 6);
            }
        });


        requestAnimationFrame(render);
    }

    UI(shapes, lights);
}} ());
